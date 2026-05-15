---
id: q-bigdata-kafka-0011
title: 为什么 read_committed 下 Kafka 看到的“末尾”可能不是 high watermark，而是 LSO
domain: bigdata
component: kafka
topic: lso-vs-high-watermark
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-22"
last_verified_at: "2026-04-22"
source_ids:
  - kafka-consumer-javadoc
claim_ids:
  - kafka-claim-0029
  - kafka-claim-0047
related_docs:
  - bigdata/kafka/consumer-lag-monitoring-troubleshooting
  - bigdata/kafka/idempotence-transactions
estimated_minutes: 7
---

# 题目

为什么 `read_committed` 下 Kafka 看到的“末尾”可能不是 high watermark，而是 `LSO`？这会如何影响 `seekToEnd`、`endOffsets` 和 lag 判断？

# 一句话结论

`read_committed` 下消费者看到的“末尾”不是简单的 high watermark，而是 `Last Stable Offset`。因为 Kafka 在这个模式下不仅要隐藏 aborted records，还要把尚未完成事务之后的数据排除在 committed consumer 的可见边界之外。

# 为什么会有这个机制

Kafka 事务的目标不只是“别读到一条脏消息”，而是给 committed consumer 一个稳定的可见性边界。

如果仍让 `read_committed` consumer 直接追到 high watermark 甚至物理日志尾部，就会把尚未决定提交还是回滚的事务数据暴露出去。

# 核心机制

在 `read_committed` 模式下：

1. KafkaConsumer 只能返回已提交事务中的消息
2. end offset 不再直接使用 high watermark
3. Kafka 改为使用 `LSO`

因此下面这些操作都会跟着改：

1. `seekToEnd()`
2. `endOffsets()`
3. lag 计算

它们都依赖“消费者所见的末尾”定义。

# 关键对象与状态

1. `read_committed`
只允许 consumer 读取已提交事务中的消息，不把开放事务后的记录当成稳定可见数据。

2. `LSO`
`Last Stable Offset`，是 `read_committed` 视角下的稳定末尾边界。

3. high watermark
更接近副本提交语义的边界，但不是 `read_committed` consumer 的最终可见边界。

4. `seekToEnd / endOffsets`
都会跟随消费者视角的末尾定义变化，因此在 `read_committed` 下会受 `LSO` 影响。

5. lag metrics
Kafka 官方 javadoc 明确说明，在 `read_committed` 模式下 fetch lag metrics 也会相对 `LSO` 调整。

# 完整链路

1. 事务生产者写入消息后，在事务未 commit 或 abort 之前，这些记录不会被 `read_committed` consumer 当成稳定可见数据。
2. Kafka 使用 `LSO` 表达当前稳定可见边界，因此 `endOffsets()` 和 `seekToEnd()` 只能停在 `LSO`。
3. 事务一旦提交，`LSO` 才能继续向前推进，对应消息才进入 committed consumer 的可读区间。
4. 如果事务回滚，相关 aborted records 也不会被当成 committed consumer 的正常读取结果。
5. 因此 lag 不是简单相对物理尾部，而是相对“事务可见末尾”。

# 边界与不保证项

1. `read_committed` 不是“只做一次消息过滤”这么简单，它连末尾定义都会改变。
2. `LSO` 不是物理日志尾部，也不是任何场景下都等于 high watermark。
3. 事务尚未结束时，开放事务之后的数据并不会立刻对 committed consumer 可见。

# 故障场景

## 场景 1：开放事务长期不结束

`LSO` 会被卡住，导致 `read_committed` consumer 的可读末尾停在更早位置，看起来像“消费追不上”，但根因可能是事务边界没有推进。

## 场景 2：运维拿物理尾部解释 committed consumer lag

这会高估真实 backlog，因为你把事务未稳定的数据也算进了消费者应追赶的末尾。

## 场景 3：只记得 aborted records，忘了末尾定义变化

面试回答会停在“读不到回滚消息”这一层，却说不清为什么 `seekToEnd()` 和 lag 也会跟着变化。

# 代价与权衡

1. Kafka 通过 `LSO` 换来了事务可见性和更稳的 committed consumer 语义，但代价是“末尾”不再是一个直观统一的概念。
2. 系统语义更强了，但监控、排障和面试表达都必须区分 `read_uncommitted` 和 `read_committed` 两种视角。

# 标准答案

KafkaConsumer javadoc 明确说明，在 `read_committed` 模式下，消费者只能读取已提交事务中的消息，此时 end offset 不是简单使用 high watermark，而是使用 `Last Stable Offset`，也就是最早未完成事务的 offset。于是 `seekToEnd()`、`endOffsets()` 和 lag 计算都会相对 `LSO`，而不是相对物理日志尾部。面试里如果只说 `read_committed` 会过滤 aborted records，却没说它连消费者所见的“末尾”都改了，说明对事务可见性边界的理解还不够深入。

# 必答点

1. 说明 `read_committed` 只返回已提交事务消息
2. 说明 end offset 在该模式下是 `LSO`
3. 说明 `seekToEnd()` 和 `endOffsets()` 都会受 `LSO` 影响
4. 说明 lag 也会相对 `LSO` 调整

# 加分点

1. 能说清 `LSO` 为什么比“高水位”更适合表达事务可见性边界
2. 能把它继续连到 exactly-once、事务消息和 aborted records 过滤

# 常见误答

1. 以为 `read_committed` 只是“多做一次过滤”，不会影响 offset 边界
2. 仍把 end offset 一律讲成 high watermark
3. 说不清为什么 lag 也会跟着变化

# 追问

1. 为什么开放事务会把 `LSO` 卡住？
2. 为什么 `read_uncommitted` 和 `read_committed` 的 end offset 会不同？
3. 这和 Kafka 事务的可见性语义是什么关系？
