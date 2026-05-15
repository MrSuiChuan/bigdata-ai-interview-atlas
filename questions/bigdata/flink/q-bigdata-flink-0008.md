---
id: q-bigdata-flink-0008
title: Operator State、Broadcast State 和 Keyed State 应该怎么区分，面试里该怎么讲清 rescale
domain: bigdata
component: flink
topic: state-categories
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - flink-working-with-state
  - flink-stateful-stream-processing
claim_ids:
  - flink-claim-0003
  - flink-claim-0020
  - flink-claim-0021
  - flink-claim-0038
  - flink-claim-0039
  - flink-claim-0040
related_docs:
  - bigdata/flink/keyed-state-and-key-groups
  - bigdata/flink/operator-state-and-broadcast-state
estimated_minutes: 11
---

# 题目

`Operator State`、`Broadcast State` 和 `Keyed State` 应该怎么区分，面试里该怎么讲清 rescale？

# 一句话结论

最核心的区分不是 API 名字，而是状态跟谁绑定、谁能访问、rescale 时怎么重新分配：`Keyed State` 跟 key 绑定，`Operator State` 跟并行实例绑定，`Broadcast State` 则把规则流状态复制到所有实例。

# 为什么会有这个问题

很多候选人只会背三种状态名字，但说不清它们的绑定对象和恢复方式，因此一追问 rescale 就容易乱。

# 核心机制

1. `Keyed State` 跟 key 一起分布
2. `Operator State` 绑定到并行 operator instance
3. `Broadcast State` 是特殊的 operator state，服务于广播流 + 普通流双输入拓扑
4. operator state 支持 even-split 和 union 等重分布模式

# 关键对象与状态

1. key
2. parallel subtask
3. operator instance
4. broadcast stream
5. redistribution mode

# 完整链路

按 key 拆的业务状态应该放在 `Keyed State`；属于 source / sink 或无法按 key 切的状态更适合 `Operator State`；需要把规则流复制给所有并行实例时则用 `Broadcast State`。rescale 时，keyed state 按 Key Group 迁移，operator state 则按 even-split 或 union 等模式重分布。

# 边界与不保证项

1. `Broadcast State` 不是通用全局变量
2. union redistribution 不是无代价
3. PyFlink 目前还不支持 operator state

# 故障场景

常见误答是把所有状态都塞进 Keyed State，或者把 Broadcast State 讲成“给大家一份全局变量”却说不清它为什么只适合特定拓扑。

# 代价与权衡

状态类别选错，后果不是“代码不优雅”，而是 rescale、恢复和运行时开销都会跟着出问题。

# 标准答案

区分 Flink 的三类状态，关键要看状态跟谁绑定。`Keyed State` 跟 key 绑定，只能在 `KeyedStream` 上访问，适合业务 key 维度状态；`Operator State` 跟并行实例绑定，常见于 source、sink 或无法按 key 划分的状态；`Broadcast State` 是特殊的 operator state，适合把广播规则流复制到所有下游实例。rescale 时，Keyed State 按 Key Group 迁移，而 Operator State 会按 even-split 或 union 等模式重分布，其中 union 虽然让每个实例都拿到完整列表，但高基数时可能带来 RPC 或 OOM 风险。所以高质量回答一定要把“绑定对象”和“重分布模式”一起讲出来。

# 必答点

1. 三类状态的绑定对象不同
2. rescale 时重分布方式不同
3. `Broadcast State` 适合规则流场景

# 加分点

1. 能提到 union 的高基数风险
2. 能主动提到 PyFlink operator state 边界

# 常见误答

1. 只背名字，不讲绑定对象
2. 把 Broadcast State 当全局共享内存
3. 不会讲 rescale

# 追问

1. 为什么 Broadcast State 总是 `MapState` 形态？
2. 在 source 场景里，什么时候你会优先考虑 Operator State？

