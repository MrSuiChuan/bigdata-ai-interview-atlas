---
kb_id: bigdata/spark/tungsten-whole-stage-codegen-off-heap-and-vectorization
title: Spark Tungsten Codegen
description: 解释 Spark Tungsten Codegen的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: tungsten-whole-stage-codegen-off-heap-vectorization
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-sql-site
  - spark-sql-paper
  - spark-release-1-6-0
  - spark-release-2-0-0
  - spark-sql-performance-tuning
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
claim_ids:
  - spark-claim-0049
  - spark-claim-0050
  - spark-claim-0051
  - spark-claim-0052
  - spark-claim-0077
  - spark-claim-0085
  - spark-claim-0086
  - spark-claim-0087
  - spark-claim-0001
  - spark-claim-0002
tags:
  - spark
  - tungsten
  - codegen
  - off-heap
  - vectorization
  - knowledge-base
  - production
---
## Tungsten 优化的是 Spark SQL 的运行时执行效率
Tungsten、whole-stage codegen、off-heap 和 vectorization 都围绕 Spark SQL 执行效率展开。它们不是单一功能，而是一组让结构化查询更接近高效执行引擎的优化：减少虚函数和对象开销，生成更紧凑的执行代码，利用列式格式和批处理降低 CPU 与内存成本。这些能力主要作用于 Spark SQL/DataFrame/Dataset 的结构化执行路径。

## UnsafeRow、Whole-stage Codegen、Off-heap 与 Vectorization
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Catalyst | 对逻辑计划树做分析、优化、物理规划和代码生成支持 | 依赖结构化表达，UDF 会降低可优化性 |
| Whole-stage Codegen | 把多个算子融合生成 Java 代码 | 复杂表达式或不支持算子可能回退 |
| Off-heap Memory | 将部分执行或缓存内存放在堆外 | 需要配置和监控，不消除总内存限制 |
| Vectorized Reader | 批量读取列式数据 | 依赖数据源和格式支持 |
| Columnar Cache | 按列缓存 SQL 数据 | 提升扫描裁剪和压缩效率，但仍占用 storage memory |

## 表达式如何编译成更紧凑的执行路径
Spark SQL 的计算从 SQL 字符串或 DataFrame API 进入，先形成 unresolved logical plan，再经过 analyzer 绑定表、列、函数和类型，optimizer 进行规则优化，planner 生成 physical plan。Whole-stage codegen 会尝试把相邻算子融合为生成代码，减少每行处理的解释和对象开销。

## 运行时优化不改变业务语义和容错边界
Off-heap 可以减少部分 JVM 对象和 GC 压力，但不是免费内存。堆外内存仍需要纳入容器、YARN 或 Kubernetes 的总内存限制。列式读和 vectorized reader 可以一次处理一批值，减少解释开销；Spark SQL 的 in-memory columnar cache 可以只扫描需要列，并根据列统计自动选择压缩方式。

## Codegen 失效、向量化失效和内存压力怎么观察
先用 explain("formatted") 查看是否出现 WholeStageCodegen、ColumnarToRow、BatchScan、FileScan 等节点。再看 SQL UI 中 operator 耗时、runtime statistics、scan bytes、spill、codegen fallback 和 task CPU 时间。不要把 Tungsten 当成需要手动打开的神秘开关，生产中更重要的是写出优化器看得懂的表达式。

## 示例：观察物理计划
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("codegen-plan-demo").getOrCreate()
df = spark.range(0, 10000).select((F.col("id") % 10).alias("k"), (F.col("id") * 2).alias("v"))
result = df.where("v > 100").groupBy("k").agg(F.sum("v").alias("sum_v"))
result.explain("formatted")
print(result.orderBy("k").collect())
spark.stop()
~~~

## 表达式可优化性比盲目调参更重要
优先使用内置 SQL 函数、列式数据格式和结构化表达；减少 Python UDF 和对象级 RDD 转换；对大宽表关注列裁剪和动态分区裁剪；对缓存关注 batch size、压缩和 storage memory。需要 off-heap 时，要把容器总内存和监控一起设计。

## 依据与版本边界
本页依据 Spark SQL 文档、Spark SQL 论文、SQL Performance Tuning 和 Spark 1.6/2.0 发布说明。具体 codegen 回退条件、向量化支持和默认配置以当前版本为准。
