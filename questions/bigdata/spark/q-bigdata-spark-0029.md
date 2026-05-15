---
id: q-bigdata-spark-0029
title: 为什么 Structured Streaming 的 trigger 题不能只答“每隔几秒跑一次”，而必须继续讲 micro-batch、AvailableNow、continuous 和 foreachBatch
domain: bigdata
component: spark
topic: trigger-micro-batch-continuous-available-now-foreach-batch
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-structured-streaming-guide
  - spark-structured-streaming-apis
claim_ids:
  - spark-claim-0043
  - spark-claim-0044
  - spark-claim-0133
  - spark-claim-0134
  - spark-claim-0135
  - spark-claim-0136
  - spark-claim-0137
  - spark-claim-0138
related_docs:
  - bigdata/spark/trigger-micro-batch-continuous-available-now-and-foreach-batch-boundaries
estimated_minutes: 12
---

# 题目

为什么 Structured Streaming 的 trigger 题不能只答“每隔几秒跑一次”，而必须继续讲 `micro-batch`、`AvailableNow`、`continuous` 和 `foreachBatch`？

# 一句话结论

因为 trigger 决定的是执行模型和状态推进方式，而不仅是批次启动间隔；一旦涉及 `AvailableNow`、`continuous` 和 `foreachBatch`，问题就进入语义边界而不是调度频率边界。

# 核心机制

1. trigger 决定 query 运行在 `micro-batch` 还是 `continuous processing`
2. `AvailableNow` 是渐进处理所有当前可用数据并推进 watermark 的特殊 micro-batch 语义，不等于旧的 `Trigger.Once`
3. `foreachBatch` 深度依赖 micro-batch 边界，默认只有 at-least-once，需要 batchId 去重才能实现 exactly-once

# 标准答案

Structured Streaming 的 trigger 题如果只答“每隔几秒跑一次”，说明还停在调度表面。官方文档明确说，trigger settings 决定的是流数据何时处理，以及 query 到底是以 `micro-batch` 还是 `continuous processing` 执行。默认情况下 query 会在 `micro-batch` 模式下运行，并在上一个 batch 完成后尽快启动下一个 batch；`ProcessingTime` 只是给批次启动节奏，不保证实际端到端延迟一定等于这个间隔。进一步地，`Trigger.Once` 已被官方标成 deprecated，而 `AvailableNow` 之所以更重要，不是名字变了，而是它会把当前可用数据拆成多个 micro-batches 逐步处理，保证执行时刻可见的数据都在终止前被处理完，并且 watermark 会随批次推进，必要时终止前还会执行 no-data batch 来推进状态清理和最终输出；如果某个 source 不支持它，Spark 还会回退到 one-time micro-batch。另一方面，`continuous processing` 不是更小的 micro-batch，而是另一条低延迟执行路径，语义从默认微批的 exactly-once 边界退到 at-least-once。再往 sink 侧看，`foreachBatch` 就更能说明 trigger 不是时间参数：它是对每个 micro-batch 暴露 batchDF 和 batchId 的编程接口，默认只有 at-least-once，但可以基于 batchId 去重做到 exactly-once；它同时又不能和 continuous mode 共用，因为它根本依赖 micro-batch execution。这样回答，才真正进入 Structured Streaming 的执行模型层。

# 必答点

1. 说明 trigger 决定执行模式而不只是节奏
2. 说明 `AvailableNow` 和 `Trigger.Once` 的关键差异
3. 说明 `continuous` 是另一条语义边界，不是更小批次
4. 说明 `foreachBatch` 默认 only at-least-once 且与 micro-batch 绑定

# 常见误答

1. 把 trigger 理解成 cron
2. 把 `AvailableNow` 说成纯语法升级
3. 把 `continuous` 说成 1ms 一批
4. 以为 `foreachBatch` 天生 exactly-once
