---
kb_id: bigdata/clickhouse/partition-layout
title: ClickHouse 分区、排序键与物理布局模型
description: 解释 PARTITION BY、ORDER BY、稀疏主键索引、类型压缩与数据建模之间的真实关系。
domain: bigdata
component: clickhouse
topic: partition-layout
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-mergetree-docs
  - clickhouse-partitioning-key-doc
  - clickhouse-sparse-primary-indexes-guide
  - clickhouse-schema-design-doc
  - clickhouse-denormalization-doc
claim_ids:
  - clickhouse-claim-0002
  - clickhouse-claim-0003
  - clickhouse-claim-0004
  - clickhouse-claim-0020
  - clickhouse-claim-0049
tags:
  - bigdata
  - clickhouse
  - partition-layout
  - schema-design
  - knowledge-base
---
## 分区键和排序键不是一回事，职责必须拆开理解
ClickHouse 的布局设计里，最容易混淆的是 `PARTITION BY`、`ORDER BY` 和所谓“主键”。更稳的答法是：分区键主要定义数据管理边界，排序键决定 part 内部数据的物理顺序和主索引效果，而稀疏主键索引本身则建立在这种有序布局之上。

因此官方才会反复提醒，分区不应该切得过细，而且多数情况下分区主要服务于管理、TTL、冷热迁移、批量删除、备份恢复，而不是主要的查询加速来源。真正长期决定读放大上限的，往往是 `ORDER BY`。

## 排序键设计是 ClickHouse 表建模的第一性问题
排序键决定三件事：
- 哪些过滤条件最容易形成 granule 级裁剪。
- 哪些列会在同值或近值聚集后获得更好的压缩率。
- 后续 merge 是否会把相似数据逐渐整理到更有利于查询的局部性布局中。

所以排序键不是“把查询里出现最多的列按顺序堆上去”那么简单，而是要综合过滤模式、数据增长方式、常见 `GROUP BY`、TopN 和压缩收益来设计。很多 ClickHouse 表的长期性能差异，根本原因都在这里。

## Schema design 官方给出的重点不只是一行 ORDER BY
Schema design 文档把类型优化、Nullable 使用、LowCardinality、Enum、日期精度、codec 选择和压缩一起讨论，核心意思很清楚：ClickHouse 的压缩和读取效率强依赖 schema。排序键、数据类型和 codec 是同一个问题的三个面，不应该分开孤立调。

例如：
- 只在语义确实需要时使用 Nullable。
- 尽量使用足够但不过大的整数和时间精度。
- 低基数字符串考虑 `LowCardinality`。
- 对高频过滤列，排序位置和类型选择要一起看。

## Denormalization 不是银弹，但经常是 ClickHouse 的现实设计选择
官方单独提供了 denormalization 指南，说明在查询频繁、Join 成本高、维度更新相对不频繁时，预先做宽表或预聚合经常是更稳的选择。原因不是 ClickHouse 不能 Join，而是大量 Join 会把查询时 CPU、内存和网络成本推高，而列式布局的优势恰恰在于对已经组织好的数据做快速扫描和聚合。

但也不能走到另一个极端，把所有东西都一次性打成超宽表。更合理的边界通常是：高频查询链路尽量少做运行时 Join；维度更新极少且 lookup 简单时考虑 dictionary；复杂重建类视图则考虑 refreshable materialized view。

## 一个更实用的设计顺序
1. 先选主分析表和最重要的时间或业务过滤模式。
2. 再定 `ORDER BY`，让最常用过滤前缀尽量形成强裁剪。
3. 再定 `PARTITION BY`，让生命周期治理、回灌和删除操作足够自然。
4. 再定类型、LowCardinality、Nullable、codec 和是否需要 projection。
5. 最后才考虑参数和缓存。

### 设计失误为什么会变成长期债务
布局设计一旦上线，就会持续影响后续所有写入、merge、查询和回灌。排序键不匹配，会让读放大长期存在；分区过细，会把补数、TTL 和清理都做得很痛苦；类型和编码选得不合适，又会不断放大存储和扫描成本。ClickHouse 的表并不是“先随便建，后面再慢慢调”最舒服的系统，很多代价是在长期运行中被放大的。

也正因为如此，布局设计更像架构决策，而不是局部调优项。真正稳妥的做法，通常是在建表前就拿代表性查询和代表性写入模式做一次最小验证，而不是等线上变慢后再倒推为什么最初这么设计。

## 最小样例：为什么这个布局比“按时间单列排序”更合理
~~~sql
CREATE TABLE orders_local
(
    order_time DateTime,
    dt Date,
    shop_id UInt32,
    user_id UInt64,
    status LowCardinality(String),
    amount Decimal(18, 2)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(dt)
ORDER BY (shop_id, dt, status, order_time, user_id);
~~~

如果核心查询大多围绕 `shop_id + 日期范围 + 状态`，这个排序键就比简单按 `order_time` 排序更容易形成读取局部性。真正要验证它是否有效，不能只看 SQL 好不好写，而要看 `EXPLAIN indexes = 1` 后裁掉了多少 granule，以及 `read_rows` 与结果行数的差距是否持续可控。
