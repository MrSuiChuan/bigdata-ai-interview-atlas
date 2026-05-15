---
kb_id: bigdata/spark/rdd-dataframe-dataset
title: Spark RDD、DataFrame 与 Dataset
description: 解释 Spark RDD、DataFrame 与 Dataset的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: rdd-dataframe-dataset
difficulty: intermediate
status: reviewed
sidebar_position: 3
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-overview-doc
  - spark-rdd-guide
  - spark-sql-guide
  - spark-dataset-javadoc
  - spark-docs-home
  - spark-rdd-scaladoc
  - spark-job-scheduling
  - spark-tuning-guide
claim_ids:
  - spark-claim-0003
  - spark-claim-0004
  - spark-claim-0005
  - spark-claim-0007
  - spark-claim-0008
  - spark-claim-0009
  - spark-claim-0010
  - spark-claim-0011
  - spark-claim-0020
  - spark-claim-0040
tags:
  - spark
  - rdd
  - dataframe
  - dataset
  - knowledge-base
  - production
---
## RDD、DataFrame、Dataset 表达的是三种计算抽象
RDD、DataFrame 和 Dataset 是 Spark 的三层常见编程抽象。RDD 更接近底层执行抽象，直接暴露分区、依赖、计算函数和存储级别；DataFrame 是带命名列的 Dataset，面向结构化数据和 SQL 优化；Dataset 在 Scala 和 Java 中提供强类型 API，同时承载逻辑计划。

这三者不是简单的新旧替代关系。RDD 适合需要直接控制分区、依赖或对象级函数的场景；DataFrame/Dataset 适合大多数结构化 ETL、SQL 分析和湖仓查询，因为 Catalyst 能利用 schema、表达式和统计信息做优化。Python 用户主要使用 DataFrame，不能照搬 Scala/Java typed Dataset 的能力。

## RDD、Row、Schema、Encoder 与 Logical Plan
| 抽象 | 内部关键点 | 适合场景 | 风险 |
| --- | --- | --- | --- |
| RDD | partitions、dependencies、compute function、partitioner、preferred locations | 自定义分区、底层转换、需要直接控制 lineage 的计算 | 优化器信息少，黑盒函数多 |
| DataFrame | Dataset[Row]，带 schema 和逻辑计划 | SQL、ETL、聚合、join、湖仓表读写 | 统计信息缺失或 UDF 会降低计划质量 |
| Dataset | typed logical plan，Scala/Java 强类型接口 | JVM 项目中结合类型安全和结构化优化 | Python 不支持 typed Dataset API |
| Encoder/Row | 结构化数据和 JVM 对象之间的表示 | Dataset 类型转换和执行计划生成 | 类型转换和 UDF 会增加运行时成本 |

## Lineage 和 Logical Plan 的触发方式不同
RDD transformation 记录的是 lineage，例如 map、filter、flatMap 会生成新的 RDD 依赖关系，直到 action 触发时才按依赖提交 job。Dataset/DataFrame transformation 记录的是逻辑计划，action 触发时先经过分析、优化和物理计划生成，然后才进入 task 执行。

这一区别决定了诊断方法。RDD 程序重点看 lineage、partitioner、persist、shuffle dependency 和 task locality；DataFrame/Dataset 程序要先看 explain 输出、SQL UI、统计信息、filter/project 是否下推、join 策略和 AQE 是否改变运行时计划。

## Lineage 恢复与结构化计划恢复
RDD 的容错核心是 lineage：分区丢失时可以根据依赖重算。persist/cache 可以把中间结果保留在内存或磁盘中以减少重复计算，但缓存不是永久存储，丢失后仍可能重算。DataFrame/Dataset 的 cache 默认使用结构化数据的默认存储级别，逻辑计划仍是恢复和重新执行的重要依据。

## 优化器能看懂什么，运行时就能优化什么
RDD 性能重点关注分区数量、序列化、窄/宽依赖、缓存级别和函数执行成本。DataFrame/Dataset 性能重点关注扫描裁剪、统计信息、join 策略、shuffle partition、AQE、codegen、列式读写和 UDF 边界。不要把“DataFrame 一定比 RDD 快”当成绝对结论，核心差异是结构化表达能让优化器看见计算意图。

## 示例：同一逻辑的两种表达
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("rdd-vs-dataframe-demo").getOrCreate()
rows = [("a", 1), ("a", 2), ("b", 3)]
rdd_result = spark.sparkContext.parallelize(rows).reduceByKey(lambda a, b: a + b)
print(rdd_result.collect())

df = spark.createDataFrame(rows, ["k", "v"])
df_result = df.groupBy("k").agg(F.sum("v").alias("sum_v"))
df_result.explain("formatted")
print(df_result.orderBy("k").collect())
spark.stop()
~~~

## 新流程优先结构化 API，底层控制再用 RDD
新项目优先用 SQL/DataFrame 表达主流程，把复杂逻辑尽量拆成可优化的列运算；少用 Python UDF 或无法下推的黑盒函数。需要底层控制时再使用 RDD，并明确缓存、checkpoint、partitioner 和序列化策略。

## 依据与版本边界
本页依据 Spark Overview、RDD Guide、Spark SQL Guide 和 Dataset API 文档。语言差异、Dataset typed API 可用性、默认存储级别和优化规则应以当前 Spark 版本为准。
