---
id: q-bigdata-flink-0026
title: 为什么 bounded job 在 STREAMING 和 BATCH 下 final result 可以一样，但你仍然不能把两者当成同一种运行方式
domain: bigdata
component: flink
topic: execution-mode-batch-streaming-boundedness
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-execution-mode
claim_ids:
  - flink-claim-0114
  - flink-claim-0115
  - flink-claim-0117
  - flink-claim-0118
related_docs:
  - bigdata/flink/execution-mode-batch-streaming-and-boundedness
estimated_minutes: 9
---

# 题目

为什么 bounded job 在 `STREAMING` 和 `BATCH` 下 `final result` 可以一样，但你仍然不能把两者当成同一种运行方式？

# 一句话结论

因为相同的是最终语义，不同的是中间更新方式、shuffle 行为、调度方式和恢复路径。

# 核心机制

1. streaming 可能持续发增量更新
2. batch 往往只出最终结果
3. streaming 全链路持续在线且 pipelined shuffle
4. batch 可以拆 stage 顺序执行

# 标准答案

官方文档明确说，bounded input 下同一个 DataStream 程序在 streaming 和 batch 模式下的 final result 可以一致，但这不代表它们是同一种运行方式。区别在于：streaming 模式可能持续输出 incremental updates，而 batch 通常只在最后给出 final result；streaming 需要所有 task 持续在线并采用 pipelined shuffle，而 batch 因为输入有界，可以拆成阶段顺序执行，并使用更适合 bounded input 的 join、aggregation 与 shuffle 优化。因此真正成熟的回答不会只盯 final result，而会把输出过程、调度拓扑和优化路径一起讲清。

# 必答点

1. final result 一致的语义前提
2. 增量更新 vs 最终结果
3. pipelined vs stage-based 执行

# 常见误答

1. 把 final result 一样理解成运行时完全一样
2. 忽略中间结果和调度差异
