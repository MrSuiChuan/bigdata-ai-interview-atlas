---
kb_id: bigdata/spark/trigger-micro-batch-continuous-available-now-and-foreach-batch-boundaries
title: Spark Trigger 与 Micro-batch 边界
description: 解释 Spark Trigger 与 Micro-batch 边界的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: trigger-micro-batch-continuous-available-now-foreach-batch
difficulty: advanced
status: reviewed
sidebar_position: 24
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-structured-streaming-guide
  - spark-structured-streaming-apis
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-dataset-javadoc
claim_ids:
  - spark-claim-0043
  - spark-claim-0044
  - spark-claim-0065
  - spark-claim-0133
  - spark-claim-0134
  - spark-claim-0135
  - spark-claim-0136
  - spark-claim-0137
  - spark-claim-0138
  - spark-claim-0001
tags:
  - spark
  - structured-streaming
  - trigger
  - micro-batch
  - foreachBatch
  - knowledge-base
  - production
---
## Trigger 决定流查询推进节奏，不决定端到端语义
Structured Streaming 的 trigger 决定查询如何被驱动执行：默认 micro-batch、processing time micro-batch、available-now、one-time batch 或 continuous processing。Trigger 不只影响延迟，也影响 foreachBatch 是否可用、watermark 推进、sink 提交和故障语义。

## Micro-batch、Continuous、AvailableNow 与 foreachBatch
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Micro-batch | 把流拆成连续小批执行 | 默认模式，可实现较低延迟和 exactly-once fault-tolerance 语义 |
| ProcessingTime Trigger | 按处理时间间隔触发 batch | 上一批没完成时不会无限并发新批次 |
| AvailableNow | 处理启动时可用数据后停止 | 可拆成多批，并推进 watermark |
| Continuous Processing | 低延迟连续模式 | 延迟可更低，但语义和支持算子有限，通常 at-least-once |
| foreachBatch | 每个 micro-batch 调用用户函数 | 默认 at-least-once，需用 batchId 做幂等去重 |

## Trigger 如何驱动 Batch 生成和提交
默认模式下，Spark 每次发现新数据，就计算一个 offset range，执行一次增量计划，更新状态和 sink，然后提交 checkpoint。AvailableNow 用于把当前可用数据处理完就停止的场景，它可以把可用数据拆成多个 micro-batch，并按 batch 推进 watermark。Continuous Processing 目标是更低延迟，但支持范围和容错语义不同。

## foreachBatch 默认 at-least-once，需要调用方幂等
foreachBatch 给用户每个 batch 的 DataFrame 和 batchId。默认写出是 at-least-once；如果要实现应用层 exactly-once，需要用 batchId 或业务主键在外部系统做去重或幂等提交。对 stateful query，在 foreachBatch 中对同一个 batch DataFrame 做多个 action，会导致该 batch 被多次计算并可能重复加载状态。

## 批次堆积、提交慢和重复计算怎么判断
看 query progress 中 batch duration、triggerExecution、getOffset、queryPlanning、addBatch、commitOffsets、stateOperators 和 sink 指标。若 batch 堆积，判断是 source 读取慢、状态膨胀、foreachBatch 多 action、sink 慢还是 checkpoint 慢。若输出重复，检查 batchId 幂等表和外部提交逻辑。

## 示例：foreachBatch 幂等入口
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("foreachbatch-trigger-demo").getOrCreate()
def write_batch(batch_df, batch_id):
    batch_df.persist()
    print("batch", batch_id, "rows", batch_df.count())
    batch_df.groupBy("bucket").count().show(truncate=False)
    batch_df.unpersist()

stream = spark.readStream.format("rate").option("rowsPerSecond", 5).load().select((F.col("value") % 3).alias("bucket"))
query = stream.writeStream.foreachBatch(write_batch).option("checkpointLocation", "/tmp/foreachbatch-trigger-demo").trigger(processingTime="5 seconds").start()
query.awaitTermination(15)
query.stop()
spark.stop()
~~~

## 低延迟、可恢复性和外部写入语义的取舍
不要把所有流任务都理解成每隔几秒跑一次批处理，也不要把 foreachBatch 当成自动 exactly-once 输出。选择 continuous 前，要确认 source、sink、算子和语义都支持，否则默认 micro-batch 往往更稳。

## 依据与版本边界
本页依据 Structured Streaming Guide 和 API 文档。Trigger 支持情况、continuous 限制和 sink 语义以当前 Spark 版本和具体 source/sink 为准。
