---
id: q-bigdata-spark-0009
title: 为什么说 Structured Streaming 不是一套独立流引擎，而是 Spark SQL 体系里的流式增量执行
domain: bigdata
component: spark
topic: structured-streaming-positioning
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-23"
last_verified_at: "2026-04-23"
source_ids:
  - spark-structured-streaming-guide
  - spark-structured-streaming-apis
claim_ids:
  - spark-claim-0041
  - spark-claim-0042
  - spark-claim-0043
  - spark-claim-0044
  - spark-claim-0066
related_docs:
  - bigdata/spark/structured-streaming
estimated_minutes: 9
---

# 题目

为什么说 Structured Streaming 不是一套独立流引擎，而是 Spark SQL 体系里的流式增量执行？

# 一句话结论

因为官方明确把 Structured Streaming 定位成建立在 Spark SQL engine 之上的可扩展、可容错流处理引擎，用户仍然使用和 batch 一样的 DataFrame / Dataset API 表达计算；它只是把这些结构化计划以流式方式持续执行，而不是换了一套完全独立的计算模型。

# 为什么会有这个问题

很多人一听到“流处理”就默认要和 batch 分成两套系统，但 Spark 的官方路线恰恰是在做 API 和执行体系的统一。

# 核心机制

1. Structured Streaming 建立在 Spark SQL engine 上
2. 表达方式和 batch 一样，仍然是 DataFrame / Dataset
3. 默认执行引擎是 micro-batch
4. 也支持 Continuous Processing，但语义边界从默认 exactly-once 退到 at-least-once
5. 结果恢复依赖 checkpoint 和 write-ahead log

# 关键对象与状态

1. streaming DataFrame / Dataset
2. trigger
3. checkpoint
4. output sink
5. micro-batch / continuous mode

# 完整链路

用户先用结构化 API 描述查询，Spark 再把这份计划持续应用到不断到达的新数据上，并通过 checkpoint 记录进度和状态，让流式 query 在失败后能恢复。

# 边界与不保证项

1. Continuous Processing 更低延迟，但不是默认 exactly-once
2. “Structured Streaming 提供 exactly-once”也要落到具体 sink 能力上理解

# 故障场景

如果候选人把 Structured Streaming 讲成“Spark 上的另一个流框架”，通常就会继续答不清 output mode、watermark、checkpoint 这些和 Spark SQL 计划直接相关的概念。

# 代价与权衡

统一模型带来了共享 API 和统一计划优化链路，但也要求开发者理解流式状态、输出语义和恢复边界，而不是只会写 SQL。

# 标准答案

Structured Streaming 不是独立于 Spark SQL 的另一套执行引擎，而是把流式处理放进了 Spark SQL 的结构化计划体系里。官方明确说它 built on the Spark SQL engine，并且用户用的仍然是和 batch 一样的 DataFrame / Dataset API。默认情况下，Spark 用 micro-batch 引擎持续执行这些结构化计划，并结合 checkpoint 和 write-ahead log 提供容错恢复；如果切到 Continuous Processing，可以获得更低延迟，但语义会退到 at-least-once。所以它的核心不是“额外挂了一套流框架”，而是“让结构化计划支持流式增量执行”。

# 必答点

1. built on Spark SQL engine
2. 同一套 DataFrame / Dataset API
3. micro-batch 默认语义和 Continuous Processing 的边界

# 加分点

1. 能顺手提到 checkpoint / WAL
2. 能把 exactly-once 说成和 sink 能力相关的边界，而不是绝对口号

# 常见误答

1. 只说“它就是微批”
2. 只会说能读 Kafka，不会讲计划和语义
3. 把 Continuous Processing 说成只是更快，没有提到 at-least-once

# 追问

1. output mode 和 trigger 的区别是什么？
2. 为什么说 watermark 本质上是在控制状态边界？

