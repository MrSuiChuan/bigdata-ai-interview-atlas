---
id: q-bigdata-flink-0007
title: 背压下 checkpoint 很慢时，什么时候该考虑 unaligned checkpoint，什么时候不该
domain: bigdata
component: flink
topic: checkpoint-under-backpressure
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - flink-checkpointing
  - flink-checkpointing-under-backpressure
claim_ids:
  - flink-claim-0011
  - flink-claim-0012
  - flink-claim-0042
  - flink-claim-0043
  - flink-claim-0045
related_docs:
  - bigdata/flink/checkpointing-under-backpressure
estimated_minutes: 11
---

# 题目

背压下 checkpoint 很慢时，什么时候该考虑 `unaligned checkpoint`，什么时候不该？

# 一句话结论

当 aligned checkpoint 的主要问题已经变成 barrier 对齐被积压拖住时，可以考虑 `unaligned checkpoint`；但它不是无条件更优，因为它只支持 exactly-once、只能有一个并发 checkpoint，还可能把更多 in-flight 数据带进快照和恢复路径。

# 为什么会有这个问题

很多人看到 checkpoint 慢就只会说“加机器”或“缩短 interval”，但背压下的慢往往首先是对齐机制被拖住。

# 核心机制

1. in-flight buffer data 被纳入 checkpoint state
2. barrier 可以越过这些 buffer
3. checkpoint duration 因而更少依赖当前吞吐和积压
4. 但它只适用于 exactly-once，且只能有一个并发 checkpoint

# 关键对象与状态

1. barrier alignment
2. in-flight buffers
3. checkpoint duration
4. concurrent checkpoints

# 完整链路

如果作业在背压下 checkpoint 时间明显被对齐过程拖长，说明一致性边界推进是主要瓶颈；此时 unaligned checkpoint 可以通过把通道里的 in-flight 数据一起纳入快照来缩短时长。但如果你需要多个并发 checkpoint、或者根本问题不在对齐，而在存储或外部依赖，那它就不是第一优先级。

# 边界与不保证项

1. 不是所有 checkpoint 慢都应该切 unaligned
2. 它不支持 at-least-once checkpoint
3. 不能和多并发 checkpoint 同时使用

# 故障场景

典型误用是：看到 checkpoint 慢就机械切 unaligned，结果真正瓶颈其实是 checkpoint 存储太慢，或者恢复体积反而更重。

# 代价与权衡

unaligned checkpoint 用更稳定的 checkpoint 时长，换来了更大的快照和可能更重的恢复负担。

# 标准答案

我会先判断 checkpoint 慢是不是主要慢在 barrier 对齐。如果背压严重、aligned checkpoint 一直被通道积压拖住，这时可以考虑 unaligned checkpoint，因为它会把 in-flight buffer data 一起写进 checkpoint，让 barrier 可以越过这些 buffer，从而降低 checkpoint duration 对当前积压的敏感度。但这不是默认更优的模式，因为官方明确说它只支持 exactly-once，且只能有一个并发 checkpoint；另外它把更多数据带进快照，也意味着恢复负担可能更重。所以它适合“对齐是主瓶颈”的背压场景，不适合所有 checkpoint 慢的问题。

# 必答点

1. 背压下慢在对齐
2. in-flight buffer 进入快照
3. exactly-once + 单并发 checkpoint 的限制

# 加分点

1. 能提到恢复负担可能更重
2. 能把 checkpoint timeout / min pause 一起带出来

# 常见误答

1. 把 unaligned 说成全面替代 aligned
2. 不知道它的并发和语义限制
3. 不先判断慢到底慢在哪

# 追问

1. 如果 checkpoint timeout 很频繁，你会怎么判断是对齐慢还是存储慢？
2. minimum pause between checkpoints 会对这类问题产生什么影响？

