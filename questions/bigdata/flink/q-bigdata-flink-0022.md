---
id: q-bigdata-flink-0022
title: 为什么 Flink interval join 题必须讲“只支持 event time”
domain: bigdata
component: flink
topic: window-join-interval-join-time-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-joining
claim_ids:
  - flink-claim-0103
  - flink-claim-0105
  - flink-claim-0106
related_docs:
  - bigdata/flink/window-join-interval-join-and-time-boundaries
estimated_minutes: 8
---

# 题目

为什么 Flink interval join 题必须讲“只支持 event time”？

# 一句话结论

因为 interval join 的语义本来就是建立在事件时间相对边界之上的。

# 核心机制

1. interval join 用相对事件时间区间表达匹配条件
2. 当前只支持 event time
3. 输出结果还会带上两侧元素中较大的 timestamp

# 标准答案

interval join 如果不强调“只支持 event time”，答案通常还不完整。官方文档明确说明，interval join 的正式条件是右侧元素时间戳落在左侧元素时间戳加上下界和上界形成的相对区间中，这本来就是事件时间语义；同时官方又明确给出能力边界：interval join 当前只支持 event time。当匹配结果传给 `ProcessJoinFunction` 时，还会被赋予两条输入元素中较大的 timestamp。因此高质量答案必须把“相对时间条件”和“事件时间专属能力边界”一起讲出来。

# 必答点

1. 相对时间区间条件
2. 只支持 event time
3. 输出 timestamp 规则

# 常见误答

1. 认为 processing time 也可以直接用 interval join
2. 不知道 interval join 结果仍然有时间戳语义
