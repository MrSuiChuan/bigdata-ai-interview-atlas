---
kb_id: bigdata/spark/logical-plan-physical-plan-explain-and-runtime-diagnosis
title: Spark 逻辑计划、物理计划与诊断
description: 解释 Spark 逻辑计划、物理计划与诊断如何定位数据、裁剪扫描、并行执行和返回结果，并说明可见性、性能证据与排障入口。
domain: bigdata
component: spark
topic: logical-plan-physical-plan-explain-runtime-diagnosis
difficulty: advanced
status: reviewed
sidebar_position: 21
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-dataset-javadoc
  - spark-sql-performance-tuning
  - spark-configuration-doc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
claim_ids:
  - spark-claim-0011
  - spark-claim-0040
  - spark-claim-0115
  - spark-claim-0116
  - spark-claim-0117
  - spark-claim-0118
  - spark-claim-0128
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
tags:
  - spark
  - logical-plan
  - physical-plan
  - explain
  - diagnosis
  - knowledge-base
  - production
---
## Explain 是理解 Spark SQL 的入口，不是格式化输出
Spark SQL/DataFrame/Dataset 的执行不是直接按用户代码逐行运行，而是先形成逻辑计划，再经过分析、优化和物理规划，最终生成分布式执行计划。EXPLAIN 是理解这条链路的核心入口。本页关注 unresolved logical plan、analyzed plan、optimized logical plan、physical plan、runtime statistics 和 SQL UI 之间的关系。

## Parsed、Analyzed、Optimized 与 Physical Plan
| 对象 | 作用 | 观察方式 |
| --- | --- | --- |
| Unresolved Logical Plan | 尚未绑定表、列、函数的计划 | extended explain 中可见 |
| Analyzed Logical Plan | 完成表、列、类型解析 | explain("extended") |
| Optimized Logical Plan | 应用规则优化后的逻辑计划 | explain("extended") |
| Physical Plan | 可执行算子、exchange、scan、join 策略 | explain("formatted") |
| Runtime Statistics | AQE 和 SQL UI 中的运行时统计 | SQL UI Details |

## 从未解析逻辑计划到可执行算子树
用户提交 SQL 或 DataFrame 操作后，Spark 先构造逻辑计划。Analyzer 根据 catalog、schema、函数和类型信息解析计划。Optimizer 应用规则做谓词下推、列裁剪、常量折叠等优化。Planner 再选择物理算子、join 策略和 exchange 边界。只有 action 触发时，Spark 才会优化并执行这些计划。

## 计划展示与真实运行统计的边界
explain("simple") 只打印物理计划；extended 打印逻辑和物理计划；codegen 打印可用的生成代码；cost 打印逻辑计划和统计信息；formatted 把物理计划 outline 和节点详情拆开。计划字符串过长时，spark.sql.maxPlanStringLength 可用于限制 UI 和 Driver 上的计划文本大小。

## EXPLAIN FORMATTED、COST 与 SQL UI 怎么配合
先看 physical plan：FileScan 是否裁剪列和分区，Filter 是否下推，Exchange 是否过多，Join 类型是否符合预期，Broadcast 是否出现，Sort 是否必要。再看 SQL UI：operator 耗时、runtime statistics、shuffle read/write、spill、skew 和 task 分布。没有计划证据，不应直接调参。

## 示例：多模式 explain
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("explain-demo").getOrCreate()
orders = spark.range(0, 1000).select((F.col("id") % 10).alias("shop_id"), F.col("id").alias("order_id"))
shops = spark.range(0, 10).select(F.col("id").alias("shop_id"))
query = orders.join(shops, "shop_id").groupBy("shop_id").count()
query.explain("formatted")
query.explain("cost")
print(query.orderBy("shop_id").collect())
spark.stop()
~~~

## 先改表达式，再考虑调参
生产 SQL 应尽量让过滤、投影、join key 和聚合表达式对优化器可见。避免把关键逻辑藏进 UDF；维护表统计；对复杂计划控制计划字符串和 UI 开销；对重要作业保存 explain 和 event log，形成可回放证据。

## 依据与版本边界
本页依据 Dataset API、Spark SQL Performance Tuning 和 Configuration 文档。不同版本 explain 输出格式和 AQE 节点名称可能变化，应以当前版本实际计划为准。
