---
id: q-bigdata-spark-0036
title: 为什么 DStreams 迁移到 Structured Streaming 不是简单改 API 名称
domain: bigdata
component: spark
topic: dstreams-legacy-structured-streaming-migration
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-streaming-dstreams-guide
  - spark-structured-streaming-guide
  - spark-structured-streaming-apis
claim_ids:
  - spark-claim-0170
  - spark-claim-0171
  - spark-claim-0173
related_docs:
  - bigdata/spark/dstreams-legacy-and-structured-streaming-migration
estimated_minutes: 10
---

# 题目

为什么 DStreams 迁移到 Structured Streaming 不是简单改 API 名称？

# 一句话结论

DStreams 是上一代流引擎，抽象是按 batch interval 生成的一系列 RDD；Structured Streaming 抽象是基于 Spark SQL 的流式 DataFrame/Dataset 增量执行。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

DStreams 是上一代流引擎，抽象是按 batch interval 生成的一系列 RDD；Structured Streaming 抽象是基于 Spark SQL 的流式 DataFrame/Dataset 增量执行。二者在 source、状态、checkpoint、输出、watermark 和恢复语义上不同。迁移时要重建 offset、状态、输出模式、sink 幂等和 checkpoint，而不是把 foreachRDD 机械替换成 foreachBatch。

# 必答点

1. 说明 DStreams legacy 状态
2. 区分 RDD 批次和 SQL 增量执行
3. 说明 checkpoint 和状态不兼容
4. 说明迁移要重验 source/sink 语义

# 常见误答

1. 把 DStreams 和 Structured Streaming 都叫微批就混为一谈
2. 复用旧 checkpoint
3. 忽略 foreachBatch 幂等

# 延伸追问

1. DStreams 的 StreamingContext 有哪些生命周期限制？
2. 迁移时如何验证窗口结果一致？

