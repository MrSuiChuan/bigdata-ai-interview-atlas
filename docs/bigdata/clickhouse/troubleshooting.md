---
kb_id: bigdata/clickhouse/troubleshooting
title: ClickHouse 生产排障路径
description: 把慢查询、写入抖动、副本落后、删除未回收、视图不刷新和权限异常整理成可复核排障顺序。
domain: bigdata
component: clickhouse
topic: troubleshooting
difficulty: advanced
status: reviewed
sidebar_position: 21
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-system-query-log-doc
  - clickhouse-system-query-thread-log-doc
  - clickhouse-system-parts-doc
  - clickhouse-system-merges-doc
  - clickhouse-system-mutations-doc
  - clickhouse-system-replicas-doc
  - clickhouse-system-replication-queue-doc
  - clickhouse-errors-doc
  - clickhouse-explain-doc
claim_ids:
  - clickhouse-claim-0009
  - clickhouse-claim-0011
  - clickhouse-claim-0012
  - clickhouse-claim-0013
  - clickhouse-claim-0014
  - clickhouse-claim-0015
  - clickhouse-claim-0016
  - clickhouse-claim-0017
tags:
  - bigdata
  - clickhouse
  - troubleshooting
  - production
  - knowledge-base
---
## ClickHouse 排障最怕的问题不是复杂，而是顺序乱
如果没有固定顺序，排障很容易变成同时改 SQL、改参数、重启服务、怀疑机器。更稳的方式是把故障拆成固定故障面，然后每类故障都从最直接的证据入口切进去。

## 故障面一：查询慢
顺序通常是：
1. 看 `system.query_log` 的 `read_rows`、`read_bytes`、耗时、内存。
2. 看 `EXPLAIN` 是否裁掉了足够多的分区和 granule。
3. 看 `query_thread_log` 是否出现明显尾部线程或单线程瓶颈。
4. 回到排序键、projection、Join 设计或缓存策略。

## 故障面二：写入越来越慢
先看 part 数量是不是失控，再看 `system.merges` 是否长期追不上。然后判断是同步小批次太碎、async flush 触发过频，还是 mutation/TTL/复制把后台资源吃掉了。

## 故障面三：删除或更新后效果不符合预期
删除后空间没降，先看是不是 lightweight delete 还没等到 merge。更新后查询变慢，先看是不是 patch part 让 projection 或 skipping index 失效。不要一看到“结果变了”就直接怀疑数据损坏。

## 故障面四：副本落后或只读
先看 `system.replicas`，再看 `system.replication_queue`。真正关键的是任务类型和 backlog 原因，而不是笼统地说“复制慢”。

## 故障面五：视图、缓存、权限问题
Refreshable MV 先看 `system.view_refreshes`；Query Cache 先确认是否真的命中以及陈旧性是否可接受；权限异常则回到角色、policy、profile 和 quota 绑定情况看。

## 一个通用起手式
只要问题发生在 ClickHouse 上，先用一句话把它归类成：
- 读路径问题
- 写路径问题
- 后台维护问题
- 复制问题
- 治理问题

归类之后再进对应的 system 表，这样排障会比“什么都查一点”快得多，也更容易形成团队内可复制的经验。

### 为什么排障一定要先归类
很多排障效率低，不是因为证据不够，而是因为同一时间在多个方向上来回跳。把问题先归类成读、写、后台、复制或治理中的一种，本质上是在给证据收缩搜索范围。只要方向先收缩，再去查 `query_log`、`system.parts`、`system.merges` 或 `system.replicas`，判断会明显更快。

## 五分钟起手式查询

~~~sql
SELECT query_duration_ms, read_rows, read_bytes, memory_usage
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY event_time DESC
LIMIT 10;

SELECT partition, count() AS parts, sum(rows) AS rows
FROM system.parts
WHERE active AND database = 'default' AND table = 'events_local'
GROUP BY partition;

SELECT * FROM system.merges LIMIT 10;
SELECT * FROM system.replicas LIMIT 10;
~~~

这组查询的价值不在于“覆盖所有问题”，而在于先把问题快速归类：到底是读放大、part 爆炸、后台 merge 堵塞，还是复制健康异常。只有先把故障面缩小，排障才不会越看越乱。

## 排障结束后必须回到根因修复

真正成熟的排障不以“先恢复服务”结束，而要继续分析：为什么会有这么多小 part、为什么 mutation 会堆这么深、为什么排序键让 read_rows 高出这么多、为什么权限模型会允许高风险操作直接落到生产。只有把结论回到建模和治理层，知识库才算讲到了原理，而不是停留在应急动作。

### 一次排障真正产出的不只是结论，还有后续动作
如果一次事故最后只留下“问题已恢复”，但没有沉淀成建模修正、调度调整、权限收口或容量预警，那同类问题大概率还会再来。ClickHouse 的排障之所以要回到对象、链路和治理层，就是因为很多表面故障其实来自长期设计债务，而不是瞬时偶发异常。
