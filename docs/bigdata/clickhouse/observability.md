---
kb_id: bigdata/clickhouse/observability
title: ClickHouse 可观测性与诊断入口
description: 把 system.parts、query_log、query_thread_log、merges、mutations、replicas、metrics、errors 与 EXPLAIN 串成可复核证据链。
domain: bigdata
component: clickhouse
topic: observability
difficulty: advanced
status: reviewed
sidebar_position: 19
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-system-parts-doc
  - clickhouse-system-part-log-doc
  - clickhouse-system-query-log-doc
  - clickhouse-system-query-thread-log-doc
  - clickhouse-system-merges-doc
  - clickhouse-system-mutations-doc
  - clickhouse-system-replicas-doc
  - clickhouse-system-replication-queue-doc
  - clickhouse-system-processes-doc
  - clickhouse-system-metrics-doc
  - clickhouse-system-events-doc
  - clickhouse-system-asynchronous-metrics-doc
  - clickhouse-errors-doc
  - clickhouse-explain-doc
  - clickhouse-query-cache-doc
  - clickhouse-refreshable-materialized-view-doc
claim_ids:
  - clickhouse-claim-0009
  - clickhouse-claim-0010
  - clickhouse-claim-0011
  - clickhouse-claim-0012
  - clickhouse-claim-0013
  - clickhouse-claim-0014
  - clickhouse-claim-0015
  - clickhouse-claim-0016
  - clickhouse-claim-0017
  - clickhouse-claim-0024
  - clickhouse-claim-0025
  - clickhouse-claim-0030
  - clickhouse-claim-0046
tags:
  - bigdata
  - clickhouse
  - observability
  - monitoring
  - knowledge-base
---
## 没有 system.* 证据链，ClickHouse 排障就只能靠猜
ClickHouse 的一个巨大优势，是它把大量运行状态直接暴露在 system 表里。真正成熟的知识库，不应该只列出这些表名，而要说明每类故障应该先看哪几张表、为什么看、看完下一步回到哪个机制层修正。

## 按问题类型分组记忆入口
- 看物理布局：`system.parts`、`system.part_log`。
- 看查询耗时和读放大：`system.query_log`、`system.query_thread_log`、`EXPLAIN`。
- 看正在执行的活跃查询：`system.processes`。
- 看后台 merge 和 mutation：`system.merges`、`system.mutations`。
- 看复制状态：`system.replicas`、`system.replication_queue`。
- 看节点级资源：`system.metrics`、`system.events`、`system.asynchronous_metrics`、`system.errors`。
- 看 refreshable MV 与 query cache：`system.view_refreshes`、query cache 相关 system 表。

## 一个可靠的诊断闭环
第一步先把症状归类：是慢查询、写入抖动、副本落后、删除未回收、视图未刷新还是节点资源打满。

第二步进入最直接的 system 表，不要先调参数。比如慢查询先看 `query_log` 和 `EXPLAIN`，副本落后先看 `system.replicas` 和 `system.replication_queue`。

第三步把证据回落到机制层：是排序键问题、part 过多、merge backlog、mutation 过重、workload 争抢，还是缓存策略不匹配。

第四步才做修复。没有这条闭环，system 表就会变成“看过很多但没结论”。

## 典型场景示例
- 读很慢：看 `read_rows`、`read_bytes`、pipeline 与 part 形态。
- 写入越来越慢：看 part 数量、merge 追赶能力、async flush 和 replication queue。
- 删除后空间不降：看 mutation/merge 是否仍在进行。
- 副本落后：看 queue 类型和 `absolute_delay`。
- refreshable MV 不更新：看 `system.view_refreshes` 的 last/next refresh 与 error 信息。

## 最小证据样例：五个入口一起看
~~~sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 5;
SELECT * FROM system.processes LIMIT 10;
SELECT * FROM system.merges LIMIT 10;
SELECT * FROM system.replicas LIMIT 10;
SELECT * FROM system.errors ORDER BY last_error_time DESC LIMIT 10;
~~~

这些查询本身不复杂，真正关键的是“什么时候看哪张表”。这也是为什么 ClickHouse 的 observability 页面必须写成诊断入口图，而不是简单的 system 表列表。
