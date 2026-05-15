---
kb_id: bigdata/spark/stream-stream-join-state-store-rocksdb-and-restart-compatibility
title: Spark 流流 Join、State Store 与重启兼容
description: 解释 Spark 流流 Join、State Store 与重启兼容中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: spark
topic: stream-stream-join-state-store-rocksdb-restart-compatibility
difficulty: advanced
status: reviewed
sidebar_position: 26
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
  - spark-claim-0067
  - spark-claim-0068
  - spark-claim-0069
  - spark-claim-0070
  - spark-claim-0071
  - spark-claim-0132
  - spark-claim-0138
  - spark-claim-0139
  - spark-claim-0140
  - spark-claim-0141
tags:
  - spark
  - structured-streaming
  - stream-stream-join
  - state-store
  - rocksdb
  - knowledge-base
  - production
---
## 流流 Join 的核心成本是状态生命周期
流流 Join 是 Structured Streaming 中最容易误判的状态型算子之一。两个输入流都在不断到达，Spark 必须把过去一段时间的输入缓存在 state store 中，等待未来另一侧可能到来的匹配记录。状态大小、watermark、事件时间约束、checkpoint 和重启兼容性共同决定该查询是否能长期运行。

## 两侧输入、Join 条件、Watermark 与 State Store
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| State Store | 版本化 key-value 状态存储 | 保存 join 和聚合状态，依赖 checkpoint 恢复 |
| HDFS-backed Provider | 默认状态存储实现 | 状态管理在 JVM 和 checkpoint 路径中完成 |
| RocksDB Provider | 把状态管理移到 native memory 和本地磁盘 | 降低 JVM 内存压力，但仍要 checkpoint 变更 |
| Watermark | 描述事件时间进度和可清理边界 | 不是处理时间，也不是硬性丢弃所有迟到数据 |
| Event-time Constraint | join 中限定两侧事件时间关系 | outer/semi join 正确输出通常必须依赖它 |

## 每个 Micro-batch 如何更新 Join 状态
stream-static join 不需要维护流式状态，因为静态侧是固定数据集；stream-stream join 必须缓存过去输入，等待未来匹配。每个 micro-batch 会读取一段输入 offset，按 join key 和时间约束读取或更新 state store，然后把状态变更写入 checkpoint。RocksDB provider 可以缓解 JVM GC，但不取消本地磁盘、native memory 和 checkpoint I/O 的成本。

## 重启兼容性受状态 Schema 和查询结构约束
Watermark 基于每个输入流已观察到的最大事件时间计算。对于流流 join，watermark 必须和事件时间约束一起看。从同一 checkpoint 重启时，输入源数量和类型不能随意改变；状态型操作的 grouping key、聚合、去重列、join schema、等值 join 列和 join 类型也不能随意改变。

## 状态膨胀、Watermark 滞后和 RocksDB 压力怎么查
重点看 stateOperators 指标、numRowsTotal、numRowsUpdated、memoryUsedBytes、batch duration、inputRowsPerSecond、processedRowsPerSecond 和 checkpoint I/O。若 batch 越跑越慢，优先判断状态是否无法清理、watermark 是否推进、慢流是否拖住全局 watermark、RocksDB native memory 是否受限。

## 示例：流流 join 结构
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("stream-stream-join-demo").getOrCreate()
left = spark.readStream.format("rate").option("rowsPerSecond", 3).load().select((F.col("value") % 5).alias("id"), F.col("timestamp").alias("left_time")).withWatermark("left_time", "1 minute")
right = spark.readStream.format("rate").option("rowsPerSecond", 3).load().select((F.col("value") % 5).alias("id"), F.col("timestamp").alias("right_time")).withWatermark("right_time", "1 minute")
joined = left.join(right, (left.id == right.id) & (right.right_time.between(left.left_time, left.left_time + F.expr("INTERVAL 30 seconds"))))
query = joined.writeStream.format("memory").queryName("joined_demo").option("checkpointLocation", "/tmp/ss-join-demo").start()
query.stop()
spark.stop()
~~~

## Join 完整性、延迟和状态规模的取舍
结构性变更应使用新 checkpoint 目录、灰度作业或显式状态迁移方案，而不是直接复用旧目录。outer join 和 semi join 需要知道某条记录未来不可能再匹配，才能输出 NULL 或 unmatched 结果并清理状态。

## 依据与版本边界
本页依据 Structured Streaming API 文档和配置说明。具体 state store 指标、RocksDB 参数和 checkpoint 文件结构会随 Spark 版本变化。
