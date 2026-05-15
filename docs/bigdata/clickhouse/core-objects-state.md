---
kb_id: bigdata/clickhouse/core-objects-state
title: ClickHouse 核心对象与状态归属
description: 系统化梳理 part、partition、granule、稀疏索引、Distributed 表、shard、replica 与后台状态对象的关系。
domain: bigdata
component: clickhouse
topic: core-objects-state
difficulty: beginner
status: reviewed
sidebar_position: 2
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-mergetree-docs
  - clickhouse-distributed-engine-doc
  - clickhouse-replication-docs
  - clickhouse-system-parts-doc
  - clickhouse-system-part-log-doc
  - clickhouse-sparse-primary-indexes-guide
  - clickhouse-projections-doc
  - clickhouse-dictionary-doc
claim_ids:
  - clickhouse-claim-0002
  - clickhouse-claim-0003
  - clickhouse-claim-0004
  - clickhouse-claim-0006
  - clickhouse-claim-0007
  - clickhouse-claim-0009
  - clickhouse-claim-0010
  - clickhouse-claim-0031
  - clickhouse-claim-0033
tags:
  - bigdata
  - clickhouse
  - core-objects
  - knowledge-base
---
## 真正需要抓住的对象不是“表”，而是一组层次化对象
ClickHouse 面试里最常见的误区，是把表、分区、主键、副本、Distributed 表混成一个平面术语列表。更稳的理解方式，是把对象按物理状态、访问入口、分布式拓扑和加速结构拆开。

| 对象 | 本质 | 关键问题 | 证据入口 |
| --- | --- | --- | --- |
| Table | 逻辑表定义 | 引擎、列、排序键、分区键是什么 | `SHOW CREATE TABLE`、`system.tables` |
| Partition | 管理边界 | 生命周期、删分区、冷热分层怎么做 | `system.parts` |
| Part | 物理数据单元 | part 数量、大小、活跃状态、merge 压力 | `system.parts`、`system.part_log` |
| Granule | 稀疏索引最小裁剪粒度 | 过滤时到底能跳过多少数据 | `EXPLAIN indexes = 1` |
| Mark | 指向 granule 的索引锚点 | 索引为什么是“稀疏”的 | 稀疏主键索引文档、`EXPLAIN` |
| Distributed table | 访问与转发层 | 是否本地存储、何时返回、是否后台发送 | `SHOW CREATE TABLE`、引擎设置 |
| Shard | 水平切分单元 | 数据如何分布、聚合在哪里汇总 | 集群配置、Distributed 表定义 |
| Replica | 同一 shard 的副本 | 延迟、只读、复制队列、会话健康 | `system.replicas`、`system.replication_queue` |
| Projection | 基表内部的隐藏数据表示 | 是否自动维护、何时被优化器选中 | `EXPLAIN`、投影元数据 |
| Dictionary | 内存键值映射 | 能否代替特定 Join、刷新策略是什么 | `SHOW CREATE DICTIONARY` |

### part 为什么是所有状态的收敛点
如果把 ClickHouse 想成“列式数据库加一堆后台线程”，理解会非常散。更准确的方式是把它看成“围绕 part 组织状态变化的分析系统”。因为无论是前台 insert、后台 merge、mutation、TTL、复制抓取还是 projection 维护，本质上都在让 active part 集发生变化。很多表面上分属不同功能区的问题，最终都能还原成 part 的形态、数量或可见性问题。

这也是为什么 ClickHouse 运维里经常强调 part 预算。part 太多，merge 跟不上；part 太碎，查询裁剪收益下降；part 生命周期过于复杂，mutation 和复制排队就会拉长。只记住“part 是物理文件单元”还不够，更重要的是知道它是系统状态的最小可治理单元。

## Partition、part、granule、mark 是一条物理链
`PARTITION BY` 决定的是管理边界，`ORDER BY` 决定的是 part 内部数据排序，part 里再切成 granule，稀疏主键索引用 mark 指向 granule 范围。这个链条的意义在于：ClickHouse 不是为每一行建事务型索引，而是尽量用很小的索引代价，在读取时跳过大段不相关数据。

因此官方一再强调稀疏主键索引不是 OLTP 那种逐行唯一索引。它回答的问题是“哪些 granule 可能相关”，不是“某一行精确落在哪个叶子节点上”。如果把它误解成行级定位索引，排序键设计和性能调优都会走偏。

## Distributed 表、shard、replica 解决的是三种不同问题
Distributed 表是访问层，它可以把查询 fan-out 到多个远端节点，也可以把写入转发到多个 shard；它自己不负责长期保存业务数据。真正存数据的是每个节点上的本地 MergeTree 表。

Shard 解决的是横向扩展和数据分布问题。Replica 解决的是同一 shard 的高可用、复制延迟和恢复问题。一个很常见的答错方式，是把副本数误当成吞吐扩展数，或者把 shard 数误当成一致性副本数。两者的目的完全不同。

## Projection、Materialized View、Dictionary 都是“加速结构”，但边界不同
Projection 是基表内部自动维护的隐藏数据表示，优化器可以自动选择。它强调“同一张表、多个可选物理读法”。

Materialized View 强调“插入时触发，把结果写到另一张目标表”。它更像预计算流水线，而不是基表内部索引。

Dictionary 强调“内存中的键值查找结构”。它擅长把特定维表查找从普通 Join 变成低延迟 key-value lookup，尤其适合 `LEFT ANY` 这类 Direct Join 场景，但并不等于“任何 Join 都应该换成字典”。

## 状态归属决定了排障入口
如果症状是“写入成功但越来越慢”，先看 part 和 merge 状态；如果症状是“某个副本明显落后”，先看 replica 和 replication queue；如果症状是“同一个查询忽快忽慢”，再去看 `query_log`、`query_thread_log`、缓存与 pipeline；如果症状是“某个加速结构没生效”，就去看 `EXPLAIN` 是否用了 projection、PREWHERE、skip index 或 dictionary lookup。

### 先按状态面分层，再按对象排查
更稳的排障方法，不是见到某个术语就去查某张 system 表，而是先判断症状属于哪一个状态面。控制面问题通常体现在 Distributed 转发、查询计划或刷新任务调度；数据面问题通常体现在 part、merge、mutation、TTL 和读取放大；复制与高可用问题则体现在 replica、queue 和只读状态。先分层，再定位对象，排障路径会短很多。

这一页真正的价值，也正是在这里。它不是对象名词表，而是在回答：系统里的每个对象各自持有哪类状态、暴露哪类证据、会与哪些相邻对象发生联动。

## 最小证据样例：先把 part 这一层看清
~~~sql
SELECT
    database,
    table,
    partition,
    count() AS active_parts,
    sum(rows) AS rows,
    formatReadableSize(sum(bytes_on_disk)) AS bytes_on_disk
FROM system.parts
WHERE active AND database = 'default' AND table = 'events_local'
GROUP BY database, table, partition
ORDER BY partition;
~~~

这个查询不是“运维命令大全”里的一个例子，而是 ClickHouse 物理状态的第一观察口。只要一个页面提到写入、读取、TTL、删除、复制、merge 或 mutation，它最终都应该能回到这些对象的状态变化上来。
