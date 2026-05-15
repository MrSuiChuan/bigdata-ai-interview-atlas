---
id: q-bigdata-flink-0002
title: 为什么说 keyBy 在 Flink 里不只是分区，而是状态放置和本地更新规则
domain: bigdata
component: flink
topic: keyed-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 docs as verified on 2026-04-23"
last_verified_at: "2026-04-23"
source_ids:
  - flink-stateful-stream-processing
  - flink-working-with-state
claim_ids:
  - flink-claim-0003
  - flink-claim-0004
  - flink-claim-0005
  - flink-claim-0018
related_docs:
  - bigdata/flink/state-checkpoint-exactly-once
estimated_minutes: 8
---

# 题目

为什么说 `keyBy` 在 Flink 里不只是分区，而是状态放置和本地更新规则？

# 一句话结论

因为 `keyBy` 之后，stream 的 key 分布和 keyed state 的存放位置被对齐，很多状态更新因此变成本地操作，而 key groups 又决定了 rescale 时状态迁移的原子单位。

# 核心机制

1. keyed state 和 keyed stream 一起分区
2. keyed state 只能在 KeyedStream 上访问
3. key groups 是重分配原子单位，数量等于 max parallelism

# 标准答案

在 Flink 里，`keyBy` 的作用远不止“把数据按 key 分一下区”。官方文档明确说明，keyed state 是和 keyed stream 一起分布的 embedded key/value state，这样状态更新通常就能在本地完成，不需要额外事务协调。这也是 Flink 状态化处理性能和一致性的核心来源。进一步看，状态在 rescale 时不是一条条 key 随便搬，而是按 key groups 这个原子单位重分配，所以 `keyBy` 同时决定了状态放置规则和未来迁移边界。

# 必答点

1. 状态和 key 对齐
2. 本地更新
3. key groups 和 rescale

# 常见误答

1. 把 keyBy 讲成普通 hash 分区
2. 不知道 keyed state 只能在 KeyedStream 上访问