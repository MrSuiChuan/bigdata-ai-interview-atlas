---
kb_id: bigdata/spark/shuffle-persistence-fault-tolerance
title: Spark Shuffle、持久化与容错
description: 解释 Spark Shuffle、持久化与容错如何发现故障、隔离影响、重建状态和恢复服务，并说明生产验证与风险边界。
domain: bigdata
component: spark
topic: shuffle-persistence-fault-tolerance
difficulty: advanced
status: reviewed
sidebar_position: 4
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-rdd-guide
  - spark-dataset-javadoc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-job-scheduling
  - spark-tuning-guide
claim_ids:
  - spark-claim-0014
  - spark-claim-0018
  - spark-claim-0019
  - spark-claim-0020
  - spark-claim-0021
  - spark-claim-0022
  - spark-claim-0023
  - spark-claim-0024
  - spark-claim-0001
  - spark-claim-0002
tags:
  - spark
  - shuffle
  - persist
  - cache
  - fault-tolerance
  - knowledge-base
  - production
---
## Shuffle、Cache 与容错分别解决不同问题
Shuffle 是 Spark 中最重要的高成本边界之一，它把上游分区的数据按 key、partitioner 或分布要求重新组织到下游分区。持久化是为了复用中间结果，容错是为了在 task、executor 或节点失败后恢复计算。三者经常同时出现，但语义不同：shuffle 是数据重分布，persist/cache 是性能优化，容错依赖 lineage、shuffle 中间文件、checkpoint 和外部存储共同完成。

## ShuffleMapStage、ResultStage、BlockManager 与 StorageLevel
| 对象 | 作用 | 风险 |
| --- | --- | --- |
| ShuffleMapStage | 产生 shuffle map output 的上游 stage | 输出丢失会导致下游 fetch failure 和 stage 重提 |
| ResultStage | 产生 action 结果或写出结果的下游 stage | 可能因上游 shuffle block 不可用而失败重试 |
| BlockManager | 管理 executor 上的缓存块和 shuffle 块 | executor 丢失会带走本地块 |
| StorageLevel | 控制缓存数据放在内存、磁盘、是否序列化、是否复制 | 选择不当会导致 GC、磁盘压力或恢复慢 |

## Shuffle Write 和 Shuffle Read 的真实代价
宽依赖算子会触发 shuffle。上游 task 按目标分区写出 shuffle block，下游 task 再通过 shuffle read 拉取对应 block。这个过程涉及序列化、磁盘 I/O、网络传输、内存缓冲、排序和聚合，因此通常比窄依赖昂贵得多。

RDD 默认每次 action 都可能重新计算 transformation 链路。persist/cache 会把分区保留下来，以便后续 action 复用。RDD 的 cache 是 MEMORY_ONLY 的快捷方式；DataFrame/Dataset 的 cache 使用其默认存储级别，通常是 MEMORY_AND_DISK。

## 缓存丢失可重算，外部副作用不自动幂等
Spark 的缓存是容错的：缓存分区丢失后，可以通过 lineage 重算。shuffle 中间结果也会被 Spark 自动保留一部分，以避免节点失败时从最初输入完全重算。fetch failure 出现时，DAGScheduler 可能判断上游 map output 丢失，并重新提交相关 stage。这个恢复保证的是计算可恢复，不保证外部副作用自动幂等。

## Shuffle 大、Spill 多、长尾明显时怎么拆
Shuffle 性能主要由 shuffle 数据量、分区数、key 倾斜、序列化、压缩、磁盘、网络和 reduce 侧聚合内存决定。判断是否该 cache，要看数据是否被重复使用、重算成本是否高、缓存是否会挤占执行内存、缓存丢失后是否可接受。判断 shuffle 是否要优化，要看 exchange 数量、shuffle read/write、spill、task duration 分布和 skewed partition。

## 示例：观察 cache 与 shuffle
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("shuffle-cache-demo").getOrCreate()
base = spark.range(0, 10000).select((F.col("id") % 100).alias("k"), F.col("id").alias("v"))
cached = base.repartition(8, "k").cache()
print("first action materializes cache", cached.count())
agg = cached.groupBy("k").agg(F.count("*").alias("cnt"), F.sum("v").alias("sum_v"))
agg.explain("formatted")
print(agg.orderBy("k").take(5))
cached.unpersist()
spark.stop()
~~~

## 缓存复用、Checkpoint 截断与外部持久化
不要把 cache 当成可靠存储，也不要把 shuffle 自动持久化理解成用户结果已经持久化。Spark 会为了避免整个输入重算而保留部分 shuffle 中间数据，但如果下游还要复用某个 RDD 或 Dataset，仍需要显式 persist/cache，或把结果写入外部可靠存储。

## 依据与版本边界
本页依据 Spark RDD Guide、Dataset API、Job Scheduling 和 Tuning 文档。具体 shuffle 实现、external shuffle service、decommission 和 dynamic allocation 行为会受版本与部署模式影响。
