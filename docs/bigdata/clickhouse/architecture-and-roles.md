---
kb_id: bigdata/clickhouse/architecture-and-roles
title: ClickHouse 架构分层与角色协作
description: 从 Server、MergeTree、本地表、Distributed 表、Keeper 与后台线程的协作关系理解 ClickHouse 的运行架构。
domain: bigdata
component: clickhouse
topic: architecture-and-roles
difficulty: advanced
status: reviewed
sidebar_position: 3
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-docs
  - clickhouse-architecture-docs
  - clickhouse-mergetree-docs
  - clickhouse-distributed-engine-doc
  - clickhouse-replication-docs
  - clickhouse-analyzer-guide-doc
claim_ids:
  - clickhouse-claim-0005
  - clickhouse-claim-0006
  - clickhouse-claim-0007
  - clickhouse-claim-0045
tags:
  - bigdata
  - clickhouse
  - architecture
  - knowledge-base
---
## 一条请求会同时穿过 SQL 层、执行层、存储层和后台维护层
ClickHouse 的架构不能只背“列式存储 + 分布式查询”这几个词。更实用的方式，是把它拆成四层：
- SQL 与计划层：parser、analyzer、planner、pipeline，负责把查询文本变成可执行计划。
- 执行层：并行 lane、聚合、排序、Join、exchange，负责真正消耗 CPU、内存和网络。
- 存储层：MergeTree part、mark、列文件、compression、mutation、projection，负责数据的物理布局。
- 后台维护层：merge、TTL、复制拉取、异步发送、刷新视图、缓存维护，负责把短期写入形态整理成长期可读形态。

## 本地 MergeTree 表是数据面核心，Distributed 表是访问面核心
很多架构讨论一开始就掉到“集群有几台机器”里，这是不够的。真正先要定的是：数据是否首先落到本地 MergeTree 表；Distributed 表只是统一访问和转发入口，还是还承担一定的写入缓冲职责；读请求最终是在本地表上完成裁剪，还是先在协调节点做大量二次处理。

更准确的说法是：
- 本地表负责保存真实数据和 part。
- Distributed 表负责把请求路由到本地表，不直接长期持有业务数据。
- shard 决定数据分布和并行扩展上限。
- replica 决定同一 shard 的可用性和恢复能力。

## Keeper 管的是复制元数据和顺序协作，不是数据文件本体
对于 ReplicatedMergeTree 来说，Keeper 或 ZooKeeper 维护的是复制相关元数据、队列和协调信息，不是保存数据列文件本身。真正的数据 part 仍然在各节点本地存储或对象存储中。这个边界很重要，因为它决定了“Keeper 正常”不等于“数据完全同步”，也决定了副本恢复时既要看复制元数据，也要看本地 part 状态。

## 查询路径中的角色分工
一条查询进入 server 后，先被 parser 转成 AST，再被 analyzer 转成 query tree，planner 产出 query plan，最后生成 query pipeline。真正与“读多少数据”直接相关的角色，是 `ReadFromMergeTree`、裁剪逻辑、PREWHERE、跳数索引、projection 选择与并行 lane 分发；真正与“如何合并结果”相关的角色，是本地聚合、远端 partial result、协调节点的最终 merge。

## 写入路径中的角色分工
写入同样不是“客户端发 SQL，服务端落磁盘”这么简单。对于本地同步写入，要经历 block 生成、排序、压缩、part 提交。对于异步写入，要先进入按 insert shape 分桶的缓冲区，再由阈值触发 flush。对于 Distributed 表写入，要额外考虑是同步转发还是本地缓存后后台发送。对于复制表，还要区分当前节点提交成功和其他 replica 对齐完成这两个时点。

## 后台线程不是附属能力，而是架构主体
Merge、mutation、TTL、复制 fetch、part 发送、refreshable view 调度，决定了 ClickHouse 是否能长期稳定工作。很多系统上线初期“性能很好”，几天后突然劣化，根因并不是 SQL 变复杂，而是后台维护已经追不上 part 生成速度、删除/更新重写压力或者复制补偿压力。

## 架构设计时最重要的三个先后顺序
第一，先设计本地表模型，再设计访问层。排序键、分区键、数据类型、projection、物化视图决定的是底层可读性，Distributed 层不能弥补底层布局错误。

第二，先设计写入节奏，再设计读查询。只要写入过碎，part 爆炸和 merge 堵塞就会先把系统拖垮，后面所有读优化都会被抵消。

第三，先设计证据面，再设计运行策略。`system.parts`、`system.query_log`、`system.replicas`、`EXPLAIN`、缓存命中与 workload 指标，要在架构阶段就预留可观测性入口，不要等出问题再补。

## 一致性与容错
ClickHouse 的容错边界不能只看“是不是有副本”，还要看角色之间如何配合：

1. 本地表提交成功，不等于所有 replica 都已同步完成。
2. Distributed 层能继续接收查询，不等于某个 shard 内的本地 part 一定健康。
3. Keeper 元数据正常，不等于后台 merge、fetch、mutation 队列没有积压。
4. 读请求能返回结果，不等于结果一定来自预期的副本或预期的新版本数据。

### 为什么角色协作比单个组件健康更重要
因为 ClickHouse 的真实故障经常不是单点挂掉，而是角色之间协作失衡。例如写入层持续制造小 part，后台 merge 跟不上，最终把读取和复制都拖慢。只看某一个点的健康状态，往往解释不了整体劣化。

## 性能模型
架构层面的性能瓶颈主要由四种角色协作模式决定：

1. 读取时，裁剪是否发生在本地表一侧，决定网络和扫描成本。
2. 写入时，part 生成速度与 merge 速度的关系，决定长期稳定性。
3. 分布式查询时，Coordinator 是否承担过多最终聚合，会直接影响延迟。
4. 复制与后台线程是否抢占 IO、CPU 和磁盘带宽，会影响前台查询表现。

### 为什么 ClickHouse 不能只用“单条 SQL 跑得快”来评价架构
因为很多系统在冷启动或短窗口测试里都会很快，但一旦持续写入、复制和 merge 同时发生，前后台竞争才会暴露。真正要看的，是读写与后台维护能否长期共存。

## 生产排障
如果集群出现“刚上线很好，几天后突然变慢”的现象，建议按角色协作顺序排查：

1. 先看本地表是否 part 过碎，merge 是否积压。
2. 再看 Distributed 层是否把过多请求集中到少数 shard 或少数 coordinator。
3. 再看 replica 同步、fetch、mutation、TTL 是否争抢资源。
4. 最后再回到 SQL 本身看是否存在查询级退化。

### 架构诊断样例
```sql
SELECT table, count() AS active_parts
FROM system.parts
WHERE active
GROUP BY table
ORDER BY active_parts DESC;
```

```sql
SELECT database, table, queue_size, inserts_in_queue, merges_in_queue
FROM system.replicas
ORDER BY queue_size DESC;
```

这两个样例说明，架构排障的第一步不是改 SQL，而是先回答数据面和后台维护层是否已经失衡。
