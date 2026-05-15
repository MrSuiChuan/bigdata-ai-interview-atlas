---
kb_id: bigdata/spark/unified-memory-execution-storage-spill-and-eviction
title: Spark 统一内存、Spill 与驱逐
description: 解释 Spark 统一内存、Spill 与驱逐的性能瓶颈来源、关键指标、调优顺序和验证方法，避免只靠参数猜测。
domain: bigdata
component: spark
topic: unified-memory-execution-storage-spill-eviction
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-tuning-guide
  - spark-release-1-6-0
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-dataset-javadoc
claim_ids:
  - spark-claim-0034
  - spark-claim-0036
  - spark-claim-0038
  - spark-claim-0082
  - spark-claim-0083
  - spark-claim-0084
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
  - spark-claim-0004
tags:
  - spark
  - memory
  - spill
  - cache
  - eviction
  - knowledge-base
  - production
---
## 统一内存把执行内存和存储内存放在同一竞争池里
Spark 统一内存模型把执行内存和存储内存放在同一可调区域中协调使用。执行内存服务于 shuffle、join、sort、aggregation 等运行时算子；存储内存服务于 cache/persist 和广播块。统一内存解决的是资源共享问题，不是让内存无限可用。

## Execution Memory、Storage Memory、Spill 与 Eviction
| 对象 | 作用 | 关键风险 |
| --- | --- | --- |
| Execution Memory | join、sort、aggregation、shuffle 等执行算子使用 | 不足会 spill 或 OOM |
| Storage Memory | cache、persist、broadcast 使用 | 过多缓存会挤压执行空间 |
| M 区域 | Spark 统一管理的内存区域 | 由 spark.memory.fraction 控制 |
| R 阈值 | storage 不能被 execution 驱逐的保护区域 | storageFraction 设置过高可能影响执行 |
| Spill | 内存不足时把中间数据落盘 | 避免 OOM，但显著增加磁盘 I/O |

## 聚合、Join、排序和缓存如何竞争内存
在统一内存模型中，execution 和 storage 共享同一大区域。execution 可以把 storage 驱逐到一定阈值以下，storage 不能驱逐正在使用的 execution。这样做的目的是提高资源利用率：没有缓存时，执行可以用更多内存；缓存较多时，仍保留一部分执行空间。

## Spill 是降级机制，不是容量规划方案
缓存能减少重算，但缓存过多会导致执行内存紧张、spill 增加和 GC 变重。Spark 会按 LRU 驱逐旧缓存分区，但驱逐本身意味着后续 action 可能重算。Reduce 侧 OOM 常见根因是单 task 输入太大，提升并行度可以降低每个 task 的输入规模。

## 从 Spill、GC 和缓存驱逐判断内存瓶颈
第一步看 Spark UI Stages 中的 spill 指标、task duration 和输入大小。第二步看 Executors 页面中的 storage memory、executor memory、GC time 和 failed tasks。第三步看 SQL plan，确认是否存在大 shuffle、sort merge join、hash aggregate 或广播过大。最后再决定调整并行度、缓存级别、join 策略、序列化或 executor 规格。

## 示例：观察 cache 与聚合
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("memory-spill-demo").getOrCreate()
df = spark.range(0, 50000).select((F.col("id") % 100).alias("k"), F.col("id").alias("v"))
cached = df.repartition(8, "k").cache()
print(cached.count())
agg = cached.groupBy("k").agg(F.count("*").alias("cnt"), F.sum("v").alias("sum_v"))
agg.explain("formatted")
print(agg.orderBy("k").take(5))
cached.unpersist()
spark.stop()
~~~

## 缓存命中率和执行稳定性的取舍
吞吐优先时，可以接受适量 spill 和较高并行度；低延迟优先时，要减少 shuffle、避免大状态聚合和频繁缓存驱逐；成本优先时，要避免把所有中间数据都缓存。统一内存不是调参题，而是执行、缓存、GC、磁盘和并行度之间的资源分配题。

## 依据与版本边界
本页依据 Spark Tuning Guide 和 Spark 1.6 Unified Memory 相关发布说明。默认值和 JVM 行为需要结合当前 Spark、JDK、部署模式和 executor 配置确认。
