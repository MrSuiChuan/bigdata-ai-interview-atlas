---
kb_id: bigdata/spark/statistics-cbo-cardinality-estimation-and-plan-misfire
title: Spark 统计信息、CBO 与 EXPLAIN
description: 解释 Spark 统计信息、CBO 与 EXPLAIN的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: statistics-cbo-cardinality-estimation-plan-misfire
difficulty: advanced
status: reviewed
sidebar_position: 22
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-sql-performance-tuning
  - spark-configuration-doc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-dataset-javadoc
claim_ids:
  - spark-claim-0053
  - spark-claim-0116
  - spark-claim-0118
  - spark-claim-0119
  - spark-claim-0120
  - spark-claim-0121
  - spark-claim-0122
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
tags:
  - spark
  - cbo
  - statistics
  - cardinality
  - optimizer
  - knowledge-base
  - production
---
## 统计信息决定优化器对数据规模的判断
统计信息和 CBO 决定 Spark SQL 对数据规模、基数和代价的估计。优化器不能凭空知道表有多大、列有多稀疏、过滤后剩多少行。缺失或过期统计会让 join 策略、join 顺序、广播选择和分区估计失准。CBO 不是万能优化器，它依赖 catalog、数据源和运行时统计。

## Table Statistics、Column Statistics、Cardinality 与 Cost
| 对象/配置 | 作用 | 默认或边界 |
| --- | --- | --- |
| Table Statistics | 表大小、行数等基础统计 | 影响 sizeInBytes 和广播判断 |
| Column Statistics | 列基数、空值、最大最小值等 | 影响过滤和 join 估算 |
| Histogram | 更细粒度的列分布信息 | 生成成本更高，会增加扫描 |
| spark.sql.cbo.enabled | 启用 CBO | 默认 false |
| Runtime Statistics | AQE 执行过程中收集的实际统计 | 只能在运行时 exchange 边界后发挥作用 |

## CBO 如何影响 Join 顺序和物理策略
Spark 计划生成时会读取数据源、catalog 和配置提供的统计信息。对于表和列统计，可以通过 ANALYZE TABLE 维护，通过 DESCRIBE EXTENDED 检查。EXPLAIN COST 或 explain("cost") 可以观察估算计划。没有可靠统计时，Spark 会使用默认估算或保守策略。

## 统计信息过期不会报错，但会误导计划
CBO 在编译期用统计信息估算代价；AQE 在运行期利用已经执行完的 shuffle map output statistics 改写后续计划。两者不是替代关系。没有统计信息时，初始计划可能已经很差；没有 exchange 边界或运行时统计时，AQE 也没有足够信息改写。

## 估算行数和真实行数偏差要怎么找
常见误判包括：小表统计过期导致未广播；大表被低估导致错误广播；过滤选择率估算错误导致 join 顺序差；列基数不准导致聚合和 shuffle 分区失衡。先看 explain("cost")，再看 SQL UI runtime statistics，最后检查表和列统计是否存在、更新时间是否合理。

## 示例：观察 cost plan
~~~python
from pyspark.sql import SparkSession

spark = SparkSession.builder.master("local[2]").appName("cbo-cost-demo").getOrCreate()
spark.sql("CREATE OR REPLACE TEMP VIEW orders AS SELECT id, id % 10 AS shop_id FROM range(1000)")
plan = spark.sql("SELECT shop_id, count(*) AS cnt FROM orders GROUP BY shop_id")
plan.explain("cost")
print(plan.orderBy("shop_id").collect())
spark.stop()
~~~

## 维护统计信息还是用运行时自适应补救
重要湖仓表应建立统计维护策略：哪些表分析、哪些列分析、何时更新、是否开启直方图、是否接受额外扫描成本。对高频写入表，自动更新统计可能影响写入；对关键查询表，缺失统计可能导致更大的查询成本。

## 依据与版本边界
本页依据 Spark SQL Performance Tuning 和 Configuration 文档。CBO 默认值、统计字段和直方图行为以当前 Spark 版本为准。
