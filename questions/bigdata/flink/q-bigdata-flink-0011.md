---
id: q-bigdata-flink-0011
title: 为什么 Flink 的窗口题不能只答“有 tumbling、sliding、session”，而必须继续讲 trigger、allowed lateness 和 late firing
domain: bigdata
component: flink
topic: windows-triggers-allowed-lateness-late-firing
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-windows
claim_ids:
  - flink-claim-0053
  - flink-claim-0055
  - flink-claim-0056
  - flink-claim-0060
  - flink-claim-0061
related_docs:
  - bigdata/flink/windows-triggers-allowed-lateness-and-late-firing
estimated_minutes: 11
---

# 题目

为什么 Flink 的窗口题不能只答“有 tumbling、sliding、session”，而必须继续讲 `trigger`、`allowed lateness` 和 `late firing`？

# 一句话结论

因为窗口题真正难的不是怎么分桶，而是结果什么时候出、状态什么时候删，以及迟到数据来了以后结果会不会再改。

# 核心机制

1. 窗口在首条数据到达时创建，不是预先存在
2. `Trigger` 决定何时处理窗口
3. `allowed lateness` 决定 watermark 越过窗口结束后，状态还能保留多久
4. 迟到但未被丢弃的数据可能触发 `late firing`

# 标准答案

Flink 的窗口题如果只背 tumbling、sliding、session，通常还停在“窗口类型”这一层。官方文档更关键的地方在于：窗口会在第一条属于它的元素到达时创建，在时间越过 `window end + allowed lateness` 后才完全移除；`Trigger` 决定窗口何时 ready for processing，`FIRE` 和 `FIRE_AND_PURGE` 又进一步决定是否保留窗口内容；而 `allowed lateness` 默认是 0，一旦配置为正值，迟到但还未超出宽限期的元素仍会进入窗口，并可能触发额外的 `late firing`。这说明窗口题真正考的是触发与清理语义，而不是只会背三个 assigner 名字。

# 必答点

1. 窗口生命周期
2. `Trigger` 的作用
3. `allowed lateness` 和 `late firing` 的关系

# 常见误答

1. 只会讲窗口类型
2. 不知道为什么同一窗口会多次发结果
3. 不知道 watermark 过了窗口结束时间后状态为什么还在
