---
id: q-bigdata-flink-0025
title: 为什么 Flink 的 batch/streaming 题不能只说“统一 API 都能跑”
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
  - flink-claim-0112
  - flink-claim-0113
  - flink-claim-0114
  - flink-claim-0115
related_docs:
  - bigdata/flink/execution-mode-batch-streaming-and-boundedness
estimated_minutes: 10
---

# 题目

为什么 Flink 的 batch/streaming 题不能只说“统一 API 都能跑”？

# 一句话结论

因为统一的是编程模型，不是运行时行为。

# 核心机制

1. runtime mode 有 STREAMING / BATCH / AUTOMATIC
2. BATCH 只适用于 bounded job
3. final result 可能一样，但执行过程与优化路径不同

# 标准答案

如果只回答“Flink 统一 API 批流都能跑”，通常还没有讲到运行时差异。官方文档明确说明，DataStream API 存在 `STREAMING`、`BATCH`、`AUTOMATIC` 三种 runtime mode，其中 `BATCH` 只能用于 bounded jobs，而 `STREAMING` 可以跑 bounded 也可以跑 unbounded。对 bounded input，两个模式的 final result 可以一致，但 streaming 过程中可能持续发 incremental updates，batch 则只给最终结果；同时 batch mode 还能利用有界输入做不同的 join/aggregation strategy 与 shuffle/scheduling 优化。因此高质量答案必须把“统一编程模型”和“不同运行时行为”区分开。

# 必答点

1. runtime mode 分类
2. boundedness 是 BATCH 前提
3. final result 相同不代表过程相同

# 常见误答

1. 只会说 Flink 支持批流统一
2. 不知道 batch mode 的前置条件和优化来源
