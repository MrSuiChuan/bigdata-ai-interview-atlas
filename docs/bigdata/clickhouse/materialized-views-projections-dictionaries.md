---
kb_id: bigdata/clickhouse/materialized-views-projections-dictionaries
title: ClickHouse 物化视图、投影与字典
description: 对齐官方文档，系统讲清增量物化视图、可刷新物化视图、Projection 与 Dictionary 的机制差异和选型边界。
domain: bigdata
component: clickhouse
topic: materialized-views-projections-dictionaries
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-incremental-materialized-view-doc
  - clickhouse-refreshable-materialized-view-doc
  - clickhouse-projections-doc
  - clickhouse-dictionary-doc
  - clickhouse-joins-guide
claim_ids:
  - clickhouse-claim-0027
  - clickhouse-claim-0028
  - clickhouse-claim-0029
  - clickhouse-claim-0030
  - clickhouse-claim-0031
  - clickhouse-claim-0032
  - clickhouse-claim-0033
  - clickhouse-claim-0034
tags:
  - bigdata
  - clickhouse
  - materialized-view
  - projection
  - dictionary
  - knowledge-base
---
## 这三类能力都在“让查询少做事”，但工作时点完全不同
ClickHouse 官网把物化视图、投影和字典都单独展开，原因就在于它们解决的是同一个大问题的不同侧面：怎样让查询阶段少读数据、少算数据、少做 Join。但它们把成本放在的时点不同，维护方式也不同。

- Incremental Materialized View：把计算放到 insert 时触发，并把结果写到目标表。
- Refreshable Materialized View：按计划重跑整个查询，周期性刷新结果表。
- Projection：把另一种物理读法维护在同一张基表内部，由优化器自动选择。
- Dictionary：把某些维表或映射变成内存 key-value 结构，优化低延迟 lookup。

### 先判断要把成本放在写时、读时还是刷新时
这几类能力真正的差异，不是语法是否都像“预处理”，而是把代价压在哪个时点。增量物化视图把成本前移到 insert；projection 把成本放在同表多布局维护；refreshable MV 把成本放在周期性重算；dictionary 则把成本放在独立装载、刷新和内存占用上。只要这一层判断错了，即使功能本身可用，也很容易在生产里造成延迟抖动或维护负担失控。

## Incremental Materialized View 的本质是“对插入 block 触发计算”
官方文档明确说明，增量物化视图是在数据插入源表时，对“新插入的 block”执行 SELECT，并把结果写入目标表。这意味着它非常适合 rollup、过滤投递、预聚合、宽表派生等“新数据一到就立刻处理”的场景。

但它的核心边界也必须说清：当视图定义里带有 Join 时，只有最左侧源表的插入会触发视图执行，右侧 Join 表发生变化并不会自动重算历史结果。这是很多业务最容易忽略的正确性边界。

## Refreshable Materialized View 的本质是“定时重算整个结果”
与增量视图不同，refreshable MV 不是对每次 insert 触发，而是按设定周期重新执行整个查询，并把结果写入目标表。它适合那些依赖多表、复杂 Join、窗口重算、周期性快照或外部数据变化的场景。

因此它更像一个被 ClickHouse 托管的轻量调度式重算作业。你获得的是更自然的重建能力，代价则是每次刷新都可能读取大量历史数据，所以必须单独监控刷新成本与节奏。

## Projection 是“同表内另一种物理表示”，不是另一张汇总表
Projection 的关键点是：它和基表一起维护、一起落在同一张表之下，并且由优化器自动选择是否使用。对读请求来说，这就像系统额外提供了一种更适合当前查询的布局或预聚合结果，但应用层不需要改 SQL 去显式访问另一张 summary 表。

官方当前文档还强调了一个新细节：从 25.5 开始，projection 不只可以完整存储列，也可以只存排序键加 `_part_offset`，因此能在更低存储开销下提供类似索引式的读加速。这让 projection 在“完全复制一份数据太贵”的场景里更有设计空间。

## Dictionary 不是“所有 Join 的通用替代品”
Dictionary 的强项是内存键值查找。它很适合维表相对小、更新可控、查询大量执行同类 key lookup 的场景。官方 Join 指南也指出，Direct Join 这类最快 Join 路径依赖右表是能直接 key-value 查找的数据结构，例如 dictionary。

但字典的边界同样明显：
- 它更适合一对一或一对少的 key-value enrichment，不适合复杂多条件关系 Join。
- 它引入独立的刷新和缓存生命周期，需要治理内存和来源稳定性。
- 一旦 lookup 维度频繁变化且刷新策略不匹配，就可能让结果延迟或维护成本失控。

### 设计时还要判断“派生状态由谁负责”
projection 仍然属于同一张基表内部的物理表示，因此查询是否命中 projection 主要影响性能，不应改变语义。物化视图则会把结果写到另一张目标表，目标表的保留策略、回填方式和消费方契约都要单独治理。dictionary 更像一个额外的 lookup 子系统，它的刷新延迟和来源稳定性会直接影响查询看到的维度值。

也就是说，这几类能力不只是性能优化手段，同时还会改变系统里“哪一层持有派生状态”。只要派生状态被引入，就必须补上对应的生命周期、刷新和校验机制。

## 如何选
- 只需要新数据实时派生和预聚合：优先增量物化视图。
- 需要周期性全量重算、依赖多表或复杂时间窗：优先 refreshable MV。
- 同一张大表要兼顾不同查询模式：优先考虑 projection。
- 只是做高频维表 lookup：优先考虑 dictionary。

## 最小样例：四类加速结构各自的姿势
~~~sql
CREATE MATERIALIZED VIEW mv_events_hourly
TO events_hourly
AS
SELECT toStartOfHour(event_time) AS hour, event_type, count() AS cnt
FROM events_local
GROUP BY hour, event_type;

CREATE MATERIALIZED VIEW mv_daily_snapshot
REFRESH EVERY 1 HOUR
TO events_daily_snapshot
AS
SELECT toDate(event_time) AS dt, event_type, count() AS cnt
FROM events_local
GROUP BY dt, event_type;

ALTER TABLE events_local
ADD PROJECTION p_by_type
(
    SELECT event_type, event_time, amount
    ORDER BY (event_type, event_time)
);
~~~

这些语句看起来都像“预处理”，但运行时边界完全不同。真正设计时，要先决定是在 insert 时付成本、在计划任务时付成本，还是在同一张表内部增加另一种物理表示，再决定是否值得引入额外维护面。
