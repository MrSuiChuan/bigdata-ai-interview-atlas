---
kb_id: bigdata/spark/structured-streaming
title: Spark Structured Streaming
description: 深入解释 Structured Streaming 的增量执行、checkpoint、offset、state store、watermark 和恢复边界。
domain: bigdata
component: spark
topic: structured-streaming
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-structured-streaming-guide
  - spark-structured-streaming-apis
  - spark-release-2-0-0
  - spark-docs-home
  - spark-overview-doc
  - spark-sql-guide
  - spark-configuration-doc
  - spark-tuning-guide
claim_ids:
  - spark-claim-0041
  - spark-claim-0042
  - spark-claim-0043
  - spark-claim-0044
  - spark-claim-0059
  - spark-claim-0060
  - spark-claim-0061
  - spark-claim-0062
  - spark-claim-0063
  - spark-claim-0064
tags:
  - spark
  - structured-streaming
  - watermark
  - checkpoint
  - state-store
  - knowledge-base
  - production
---
## 定位与边界

Structured Streaming 不是独立于 Spark SQL 的另一套流引擎，而是把流式输入表示成持续追加或更新的表，并让查询以增量方式不断执行。默认执行模式是 micro-batch：每个 batch 读取一段输入 offset，运行一次增量计划，提交 sink 结果和 checkpoint 进度。

理解它时要把三条线分开：输入进度由 source offset 描述，计算状态由 state store 和 checkpoint 保存，输出可见性由 sink commit 语义决定。checkpoint 能让查询恢复进度和状态，但不能自动让所有外部 sink 具备 exactly-once 业务语义。

## Micro-batch 执行链路

一次 micro-batch 通常经历这些步骤：Driver 发现 source 最新 offset，决定本批次可处理的 offset range，生成增量执行计划，把 task 分发到 executor 读取数据并更新状态，然后写出结果，最后把 offset log、commit log 和状态变更写入 checkpoint。

这个链路解释了为什么流任务延迟变大不能只看 source 速度。可能是 source 积压，也可能是状态 store 读写慢、shuffle 倾斜、sink 提交慢、checkpoint 存储慢，或者 foreachBatch 里重复 action 导致同一批次被多次计算。

## Checkpoint 与恢复

checkpoint 目录保存查询恢复所需的进度和状态。相同 checkpoint 下，输入 source 数量和类型不能随意改变；stateful operation 的 grouping key、聚合 schema、join key 或 join 类型也不能随意改变，因为恢复时 Spark 假设状态 schema 与之前兼容。

因此，生产变更不能只看代码能不能启动。凡是涉及输入源、state schema、watermark、join 条件、聚合字段、sink 语义的修改，都应使用新 checkpoint 灰度，或者设计离线回放和状态迁移方案。

## Watermark 与状态清理

Watermark 是状态清理和迟到数据语义的边界。对于带 watermark 的聚合，Spark 只有在 watermark 列、聚合事件时间列、output mode 和调用顺序都满足要求时，才可以安全清理旧状态。watermark delay 表示 Spark 不会丢弃小于该延迟范围的数据；超过这个延迟的数据可能被处理，也可能因为状态已经清理而被丢弃。

在 stream-stream join 中，inner join 可以不配置 watermark 和时间约束，但状态可能无限增长；outer join 和 semi join 必须有 watermark 和事件时间约束，因为引擎需要知道一条记录何时不可能再匹配未来输入，才能输出 NULL 或未匹配结果并清理状态。

## State Store 与 RocksDB

状态算子会把中间状态放入 state store。默认状态存储和 RocksDB 状态存储在内存、磁盘、GC 压力和恢复速度上的表现不同。RocksDB 不是“开启后一定更快”，它主要把部分状态压力从 JVM 堆转移到本地状态存储和 checkpoint 交互上，适合状态很大且 JVM GC 成为瓶颈的场景。

排查状态问题时应看 numRowsTotal、numRowsUpdated、memoryUsedBytes、stateOperators、batch duration、commit duration、checkpoint 存储延迟和 executor 本地磁盘。只看 inputRowsPerSecond 和 processedRowsPerSecond 不足以判断状态是否健康。

## Sink 语义与 foreachBatch

内置 sink 和外部系统各自有提交语义。foreachBatch 默认只能提供 at-least-once；如果要做到应用级 exactly-once，需要使用 batchId 或外部事务表进行去重。foreachBatch 依赖 micro-batch，因此不能用于 continuous processing。

如果 foreachBatch 内对同一个 micro-batch DataFrame 执行多个 action，Spark 可能多次计算并多次加载状态，建议在 batch 函数内显式 persist 和 unpersist。这个问题在 stateful query 中尤其明显，会直接放大批次延迟。

## 示例：本地 watermark 聚合

```python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("structured-streaming-local-demo").getOrCreate()

events = (
    spark.readStream.format("rate")
    .option("rowsPerSecond", 5)
    .load()
    .select(F.col("timestamp").alias("event_time"), (F.col("value") % 3).alias("user_id"))
)

windowed = (
    events.withWatermark("event_time", "2 minutes")
    .groupBy(F.window("event_time", "1 minute"), "user_id")
    .count()
)

query = (
    windowed.writeStream.format("console")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/spark-structured-streaming-demo-checkpoint")
    .option("truncate", False)
    .start()
)

query.awaitTermination(30)
query.stop()
spark.stop()
```

## 来源与事实边界

本页依据 Structured Streaming 官方概览和 API 文档。具体 source/sink 是否支持 AvailableNow、exactly-once、metadata log、schema evolution 和恢复兼容，需要查对应 connector 文档和实际 Spark 版本。
