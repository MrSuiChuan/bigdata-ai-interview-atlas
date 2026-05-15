---
id: q-bigdata-flink-0005
title: 为什么说 keyBy 在 Flink 里不是普通分区，而是状态放置规则
domain: bigdata
component: flink
topic: keyed-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - flink-stateful-stream-processing
  - flink-working-with-state
claim_ids:
  - flink-claim-0003
  - flink-claim-0004
  - flink-claim-0005
  - flink-claim-0018
  - flink-claim-0019
related_docs:
  - bigdata/flink/keyed-state-and-key-groups
estimated_minutes: 10
---

# 题目

为什么说 `keyBy` 在 Flink 里不是普通分区，而是状态放置规则？

# 一句话结论

因为 `keyBy` 之后不只是数据被按 key 划到不同并行子任务，状态也会跟着 key 一起分布；这让状态访问变成当前 key 作用域内的本地操作，同时决定了 rescale 时状态如何按 `Key Groups` 迁移。

# 为什么会有这个问题

很多人把 `keyBy` 理解成和 Kafka partition 或 Hash 分桶类似的东西，但 Flink 的原理层重点远不止并行切分。

# 核心机制

1. keyed stream 和 keyed state 一起分布
2. keyed state 只能用于 `KeyedStream`
3. 当前 key 的状态只在负责这个 key 的并行子任务内可见
4. `Key Groups` 是重分配 keyed state 的原子单位

# 关键对象与状态

1. key
2. keyed state
3. Key Group
4. max parallelism

# 完整链路

调用 `keyBy` 后，Flink 不只是对数据做哈希分发，还同时决定了状态跟谁绑定；因此状态访问会落到本地 key/value store，而 rescale 时又会按 Key Group 为单位重新分配状态。

# 边界与不保证项

1. 普通 DataStream 不能直接访问 keyed state
2. Keyed state 不是全局共享状态
3. `max parallelism` 会影响状态迁移粒度

# 故障场景

如果候选人只会说“keyBy 就是分区”，后面一追问为什么 Flink 很多状态更新能是本地操作、为什么 rescale 会跟 Key Group 相关，答案就容易断。

# 代价与权衡

把状态和 key 对齐，换来了高效本地访问和清晰的一致性边界，但也要求开发者认真设计 key 和 `max parallelism`。

# 标准答案

`keyBy` 在 Flink 里不是普通分区，而是状态放置规则。官方明确说 keyed stream 和 keyed state 会一起分布，因此 `keyBy` 后当前 key 的状态只由负责该 key 的并行子任务访问，这让很多状态更新都能在本地完成，而不是依赖远程事务协调。进一步，Flink 不是按单个 key 随意搬状态，而是按 `Key Groups` 作为重分配原子单位，而 Key Group 数量又等于 `max parallelism`。所以 `keyBy` 同时决定了状态可见性、本地访问路径和 rescale 的迁移边界。

# 必答点

1. 状态跟 key 一起分布
2. keyed state 只能在 `KeyedStream` 上访问
3. `Key Groups` 和 `max parallelism`

# 加分点

1. 能说出“很多更新是本地操作”
2. 能把 rescale 和状态迁移一起讲出来

# 常见误答

1. 只说“就是哈希分区”
2. 不提状态放置
3. 不知道 Key Group 的作用

# 追问

1. 为什么 `max parallelism` 不是纯粹的“并行度上限”？
2. Keyed State 和 Operator State 的适用边界怎么区分？

