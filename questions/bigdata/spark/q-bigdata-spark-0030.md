---
id: q-bigdata-spark-0030
title: 为什么 Structured Streaming 的 watermark 题不能只答“允许晚到 10 分钟”，而必须继续讲状态清理条件和结果何时 final
domain: bigdata
component: spark
topic: watermark-late-data-state-cleanup-output-finalization
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-structured-streaming-apis
claim_ids:
  - spark-claim-0059
  - spark-claim-0060
  - spark-claim-0061
  - spark-claim-0063
  - spark-claim-0130
  - spark-claim-0131
  - spark-claim-0132
related_docs:
  - bigdata/spark/watermark-late-data-state-cleanup-and-output-finalization
estimated_minutes: 12
---

# 题目

为什么 Structured Streaming 的 watermark 题不能只答“允许晚到 10 分钟”，而必须继续讲状态清理条件和结果何时 final？

# 一句话结论

因为 watermark 真正定义的是系统对迟到数据的保证边界、旧状态何时可以忘记，以及结果何时足够稳定到可以最终输出，而不是一个简单的晚到开关。

# 核心机制

1. watermark 先定义“低于阈值一定不丢，高于阈值不再保证”的语义边界
2. 聚合状态只有在满足特定条件时才能被 watermark 清理
3. output mode 决定输出什么，watermark 决定结果何时能最终定稿

# 标准答案

如果只回答“watermark 允许晚到 10 分钟”，这题还是停在表面。Spark 官方文档说明，假设 watermark delay 是 2 小时，那么系统保证不会丢掉小于 2 小时迟到的数据；但更晚的数据只是“不再保证处理”，并不是一过线就机械丢弃。所以 watermark 首先是一条保证边界，而不是纯删除规则。更进一步，watermark 真正解决的是旧状态什么时候还能继续等未来事件修正、什么时候终于可以安全清理。官方还明确给出了 watermark 真正清聚合状态的前提：output mode 必须是 `Append` 或 `Update`，聚合必须基于 event-time 列或其 window，`withWatermark` 要定义在同一时间列上，而且必须出现在 aggregation 之前；`Complete mode` 因为要保留整张结果表，不能利用 watermark 丢中间状态。再结合 output mode 的定义，就能看出二者的配合关系：output mode 回答“每轮输出什么结果视图”，watermark 回答“这条结果是否已经稳定到可以最终输出”，所以很多窗口聚合在 `Append` 模式下要等 watermark 越过后才会真正输出。多输入流时，Spark 还会生成全局 watermark，默认按最慢输入推进；而在 stream-stream outer join 和 semi join 中，watermark 与 event-time constraints 更是 correctness 的必要条件，因为系统必须知道某条记录未来不会再匹配，才能合法地产生 NULL side 或 unmatched 结果。这样回答，才真正进入 watermark 的语义层。

# 必答点

1. 说明 watermark 是“保证边界”而不是纯丢弃规则
2. 说明 watermark 清聚合状态有明确前提条件
3. 说明 output mode 和 watermark 分别解决不同问题
4. 说明 outer/semi join 中 watermark 还是 correctness 条件

# 常见误答

1. 认为 watermark 超线必丢
2. 不知道 `Complete mode` 不能借 watermark 丢状态
3. 把 output mode 和 watermark 混成一回事
4. 不知道 outer join 的 watermark 约束更硬
