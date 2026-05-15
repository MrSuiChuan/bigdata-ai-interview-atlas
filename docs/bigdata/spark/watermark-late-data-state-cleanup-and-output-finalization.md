---
kb_id: bigdata/spark/watermark-late-data-state-cleanup-and-output-finalization
title: Spark Watermark、迟到数据与状态清理
description: 解释 Spark Watermark、迟到数据与状态清理中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: spark
topic: watermark-late-data-state-cleanup-output-finalization
difficulty: advanced
status: reviewed
sidebar_position: 25
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-structured-streaming-apis
  - spark-docs-home
  - spark-sql-guide
  - spark-tuning-guide
  - spark-structured-streaming-guide
  - spark-configuration-doc
  - spark-overview-doc
  - spark-rdd-guide
claim_ids:
  - spark-claim-0059
  - spark-claim-0060
  - spark-claim-0061
  - spark-claim-0062
  - spark-claim-0063
  - spark-claim-0130
  - spark-claim-0131
  - spark-claim-0132
  - spark-claim-0001
  - spark-claim-0002
tags:
  - spark
  - structured-streaming
  - watermark
  - late-data
  - state-cleanup
  - knowledge-base
  - production
---
## Watermark 管的是事件时间进度和状态清理边界
Watermark 是 Structured Streaming 中管理迟到数据、状态清理和输出最终性的关键机制。它不是超过时间就一定丢弃的简单开关，而是引擎基于事件时间进度判断哪些状态可以安全清理、哪些结果可以最终输出的边界。Watermark 必须和 output mode、事件时间列、聚合窗口、join 条件和多流策略一起理解。

## Event Time、Watermark Delay、Output Mode 与 Global Watermark
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Event Time | 业务事件发生时间 | 与 processing time 不同 |
| Watermark Delay | 允许迟到的时间范围 | 小于 delay 的迟到数据保证不被丢弃，大于 delay 的数据可能处理也可能丢弃 |
| Global Watermark | 多输入流的统一水位线 | 默认取最小，max 策略更激进 |
| Append Mode | 只输出不会再变化的新增行 | 适合 watermark 后结果最终确定的场景 |
| Update Mode | 输出本批更新过的结果行 | 聚合更新可见但不是全表输出 |
| Complete Mode | 每批输出整个结果表 | 支持聚合，成本可能很高 |

## Watermark 如何随 Micro-batch 推进
Spark 跟踪每个输入流看到的最大事件时间，并据此计算该输入的 watermark。多流查询会选择一个全局 watermark；默认使用最小值，以避免慢流数据被过早丢弃。配置为 max 可以让整体进度更快，但慢流迟到数据更容易被丢弃。Watermark 推进通常发生在 batch 边界，与处理时间不同。

## 迟到数据的保证是下界，不是精确定时开关
对带 watermark 的聚合，状态能否清理取决于几个条件：output mode 必须是 Append 或 Update；聚合必须使用事件时间列或基于事件时间的 window；withWatermark 必须作用在同一个 timestamp 列；并且 withWatermark 要在 aggregation 前调用。延迟超过 watermark delay 的数据不保证一定被丢弃，也不保证一定处理。

## 状态不降、迟到数据异常时看哪些指标
看 query progress 中 eventTime watermark、stateOperators、numRowsTotal、numRowsDroppedByWatermark、batch duration 和 inputRows。若状态不降，检查事件时间列是否正确、withWatermark 是否在聚合前、output mode 是否满足条件、多流全局 watermark 是否被慢流拖住。

## 示例：窗口聚合 watermark
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("watermark-demo").getOrCreate()
stream = spark.readStream.format("rate").option("rowsPerSecond", 5).load()
agg = stream.withWatermark("timestamp", "1 minute").groupBy(F.window("timestamp", "30 seconds")).count()
query = agg.writeStream.format("memory").queryName("wm_demo").outputMode("append").option("checkpointLocation", "/tmp/watermark-demo").start()
query.stop()
spark.stop()
~~~

## 结果最终性、迟到容忍和状态成本的取舍
Append mode 只输出新增且未来不会更新的行；Update mode 输出本批更新的结果行；Complete mode 每批输出完整结果表。选择 output mode 时，要同时考虑 sink 是否支持、状态大小、下游是否能处理更新语义和结果何时最终可见。

## 依据与版本边界
本页依据 Structured Streaming API 文档。watermark 策略、输出模式支持和状态指标以当前 Spark 版本和 sink/source 实现为准。
