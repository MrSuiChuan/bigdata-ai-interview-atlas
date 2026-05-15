---
kb_id: bigdata/spark/performance-tuning
title: Spark 性能模型与瓶颈定位
description: 用 Spark UI、SQL 计划、运行时统计、shuffle、spill、GC 和数据倾斜证据定位性能瓶颈。
domain: bigdata
component: spark
topic: performance-tuning
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-tuning-guide
  - spark-sql-performance-tuning
  - spark-dataset-javadoc
  - spark-job-scheduling
  - spark-configuration-doc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
claim_ids:
  - spark-claim-0015
  - spark-claim-0033
  - spark-claim-0034
  - spark-claim-0035
  - spark-claim-0036
  - spark-claim-0037
  - spark-claim-0038
  - spark-claim-0039
  - spark-claim-0116
  - spark-claim-0118
tags:
  - spark
  - performance
  - spark-ui
  - shuffle
  - spill
  - skew
  - knowledge-base
  - production
---
## 定位与边界

Spark 调优不是参数清单，而是证据驱动的瓶颈定位。一个作业慢，可能来自扫描文件过多、分区过小或过大、join 策略错误、shuffle 数据量大、数据倾斜、内存 spill、GC、executor 丢失、外部存储慢、sink 提交慢或 driver 结果面过大。

因此，调优顺序应从观察开始，而不是从 executor memory、executor cores、shuffle partitions 这些参数开始。没有基线指标和物理计划，直接调参只是在扩大试错空间。

## 证据地图

### Spark UI

Jobs 页面用于定位 action 与 job；Stages 页面用于看 task 分布、duration 分位数、失败重试、shuffle read/write、spill 和 locality；SQL 页面用于看物理计划节点、operator 耗时、runtime statistics；Executors 页面用于看 GC、内存、磁盘、输入输出和 executor 丢失。

### Event Log 与 History Server

线上排障不能只依赖正在运行的 UI。应开启 event log，并通过 History Server 回放已完成或失败的应用。长期治理时，要把 event log、driver/executor 日志、集群资源指标和数据源指标关联起来，否则只能看到 Spark 内部局部现象。

### EXPLAIN 与运行时统计

`EXPLAIN FORMATTED` 负责看计划形状，`EXPLAIN COST` 或 `explain("cost")` 负责看估算，SQL UI 的 runtime statistics 负责看运行时真实数据。估算和运行时差距很大时，要优先怀疑统计信息、数据倾斜、过滤选择率或数据源裁剪能力。

## 常见瓶颈链路

### 扫描与小文件

扫描慢不一定是 CPU 问题。小文件会增加 listing、open cost 和 task 调度开销；过少 split 会导致并行度不足；过多 split 会制造大量短 task。需要结合 input bytes、files count、scan operator、task 数量和文件布局判断。

### Shuffle 与倾斜

Shuffle 是网络、磁盘、序列化和内存压力汇合点。shuffle write 大说明上游重分布成本高，shuffle read 大说明下游拉取成本高，spill 大说明内存不足或单 task 数据过大，少数 task 极慢通常指向数据倾斜、远程读取异常或 executor 资源不均。

### 内存、序列化与 GC

Spark 统一内存把 execution 和 storage 放在共享区域内竞争。cache 占用过多可能挤压 execution，导致排序、聚合和 join spill；execution 压力也可能驱逐 storage。Kryo、列式缓存、off-heap、serializer buffer 和对象结构都会影响内存足迹，但每个调整都要用 GC 时间、spill、storage memory 和 executor lost 证据验证。

### Driver 结果面

collect、toPandas、show 大结果、长 plan string 和过大的 broadcast 都可能把压力集中到 Driver。Driver OOM 不是 executor memory 不够，而是结果面或控制面状态过大。排查时要看 result size、broadcast size、driver log、SQL plan string 和 UI/History Server 是否也受影响。

## 调优决策顺序

1. 看 SQL/Stage 是否存在明显 shuffle 边界和倾斜。
2. 看 scan 是否裁剪有效，文件数量和 split 数是否合理。
3. 看 task 分布，确认是全局慢还是少数 task 拖尾。
4. 看 spill、GC、executor lost，判断内存与稳定性。
5. 看 AQE runtime statistics，确认是否已经合并分区、处理倾斜或改写 join。
6. 最后才选择更新统计、改 SQL、改分区、改文件布局、改资源规格或调配置。

## 示例：本地构造倾斜观察

```python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-skew-observation-demo").getOrCreate()

left = spark.range(0, 10000).select(
    F.when(F.col("id") < 9000, F.lit(0)).otherwise(F.col("id")).alias("k"),
    F.col("id").alias("v"),
)
right = spark.range(0, 100).select(F.col("id").alias("k"))

joined = left.join(right, "k").groupBy("k").count()
joined.explain("formatted")
print(joined.orderBy(F.desc("count")).take(5))

spark.stop()
```

## 来源与事实边界

本页依据 Spark Tuning、SQL Performance Tuning、Configuration、Dataset API 和 Job Scheduling 文档。具体默认值会随版本变化，生产结论应以当前 Spark 版本、应用配置、SQL UI 和 event log 为准。
