---
kb_id: bigdata/clickhouse/read-path
title: ClickHouse 读取路径与执行计划
description: 从 analyzer、裁剪链路、并行 lane、分布式汇总和 EXPLAIN 证据面理解 ClickHouse 查询执行。
domain: bigdata
component: clickhouse
topic: read-path
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-analyzer-guide-doc
  - clickhouse-explain-doc
  - clickhouse-prewhere-doc
  - clickhouse-sparse-primary-indexes-guide
  - clickhouse-data-skipping-indexes-doc
  - clickhouse-lazy-materialization-doc
  - clickhouse-query-parallelism-doc
  - clickhouse-query-condition-cache-doc
  - clickhouse-distributed-engine-doc
claim_ids:
  - clickhouse-claim-0003
  - clickhouse-claim-0017
  - clickhouse-claim-0018
  - clickhouse-claim-0043
  - clickhouse-claim-0044
  - clickhouse-claim-0045
  - clickhouse-claim-0047
tags:
  - bigdata
  - clickhouse
  - read-path
  - explain
  - knowledge-base
---
## 一条 SELECT 的关键问题始终是：到底少读了多少数据
ClickHouse 的读路径不应该先从 SQL 语法背起，而要先从“读放大是怎么被压缩的”来理解。官方优化文档强调，最有效的优化通常是减少数据处理量。把这句话落到执行机制，就是一条查询能否在足够前面的阶段裁掉分区、granule、列、行和远端结果量。

## parser、analyzer、planner、pipeline 是四个不同阶段
官方 analyzer 文档把查询执行明确拆成四个主要阶段：
- parser 把查询文本转成 AST。
- analyzer 把 AST 解析成 query tree，并完成别名、类型、表来源等语义解析。
- planner 把 query tree 变成 query plan，决定大体怎么执行。
- pipeline 把 plan 变成真正的并行处理图，体现 lane 数量、交换与聚合流程。

这就是为什么 `EXPLAIN AST`、`EXPLAIN QUERY TREE`、`EXPLAIN PLAN`、`EXPLAIN PIPELINE` 不能混着看。它们回答的是不同层次的问题。

## 裁剪链路通常按五层发生
第一层是 partition pruning，先按分区管理边界排除整批数据。

第二层是 sparse primary index pruning，用排序键前缀和 mark 判断哪些 granule 可能相关。

第三层是 secondary data-skipping indexes。它不是替代主键索引，而是在更多列上进一步辅助 granule 级别裁剪。

第四层是 PREWHERE。官方把它描述成先读少量过滤列，再决定剩余列是否需要继续加载，这一步对宽表查询尤其关键。

第五层是 lazy materialization。即便通过了 WHERE 过滤，某些大列也可以延后到排序或 LIMIT 之后再读取，尤其适合 TopN 场景。

## Query condition cache 与 Query cache 不要混为一谈
条件缓存不是结果缓存。它记住的是“某个过滤条件在某个 granule 上是否完全不命中”，本质上是一个按过滤条件和 granule 建的 bitset 加速层，并且要求 analyzer 开启。

结果缓存则是另一回事，它缓存的是整条 `SELECT` 的结果，允许一定时间内的陈旧性。两者一个优化过滤重算，一个优化结果重用，适用场景和风险边界完全不同。

## 并行执行靠 processing lanes，不只是“多线程”三个字
官方 query parallelism 文档说明，ClickHouse 会把选中的 granule 动态分配到多个 processing lanes 中，`max_threads` 决定本地并行 lane 数，默认大致贴近可用 CPU 线程数。分布式表场景下，每个 shard 先做本地并行处理，初始接收查询的节点再负责汇总远端部分结果。

这里真正需要回答的是：并行度受哪些因素限制。不是简单说“线程越多越快”，而是要看可读 granule 数量、数据倾斜、远端 shard 分布、最终聚合是否会被协调节点拖住，以及每个 lane 的内存消耗是否已经成为瓶颈。

### 读路径分析为什么不能只看 SQL 文本
同样一条 `SELECT`，在不同布局、不同 part 形态、不同缓存状态下，执行体验可能差别很大。真正进入机制层的分析，必须同时回答三件事：前面几层裁剪有没有生效，pipeline 是不是把工作均匀分到了足够多的 lane，上层汇总有没有把尾部延迟重新集中到协调节点。只看 SQL 本身，很容易把“执行环境不健康”误判成“语句写错了”。

## 最小样例：用 EXPLAIN 顺着整条路径看
~~~sql
EXPLAIN indexes = 1
SELECT event_type, sum(amount)
FROM events_local
WHERE event_type = 'pay'
  AND event_time >= toDateTime('2026-05-01 00:00:00')
GROUP BY event_type;

EXPLAIN PIPELINE
SELECT event_type, sum(amount)
FROM events_local
WHERE event_type = 'pay'
GROUP BY event_type;
~~~

第一条更适合回答“裁掉了多少 part 和 granule”；第二条更适合回答“用了多少 lane、哪些算子在 pipeline 里出现、瓶颈大概落在读、聚合还是汇总”。如果排障时只看执行时长，不看这两类证据，通常很难把问题定位到真正的机制层。
