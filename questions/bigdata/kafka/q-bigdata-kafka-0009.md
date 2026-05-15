---
id: q-bigdata-kafka-0009
title: Kafka Consumer 的 position 和 committed position 有什么区别，为什么这在面试里很关键
domain: bigdata
component: kafka
topic: consumer-position-vs-commit
question_type: short_answer
difficulty: intermediate
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-22"
last_verified_at: "2026-04-22"
source_ids:
  - kafka-consumer-javadoc
  - kafka-implementation-distribution
claim_ids:
  - kafka-claim-0021
  - kafka-claim-0022
related_docs:
  - bigdata/kafka/write-read-path
  - bigdata/kafka/offset-delivery-semantics
estimated_minutes: 6
---

# 题目

Kafka Consumer 的 `position` 和 `committed position` 有什么区别，为什么这在面试里很关键？

# 标准答案

`position` 表示 consumer 下一条将返回给应用的 offset，也就是运行时读取位置；`committed position` 表示安全存储、供重启恢复使用的位置。KafkaConsumer javadoc 明确区分了这两个概念。它们之所以关键，是因为应用在 poll 到消息后，position 可能已经推进，但 committed position 还没有更新，所以系统重启后依然可能重读刚才处理过的消息。这正是为什么 offset commit 只能表示消费进度，而不等于业务处理完成，也不等于业务层面的 exactly-once。

# 必答点

1. 说明 position 是当前读取位置
2. 说明 committed position 是持久化恢复位置
3. 说明两者不一致会带来重复消费或恢复差异

# 加分点

1. 能补充 offset commit 会写入 `__consumer_offsets`
2. 能把这个问题继续连到 at-least-once 和 exactly-once 讨论

# 常见误答

1. 把两者当成同一个东西
2. 认为 position 推进了就等于消息已经安全提交

# 追问

1. 为什么 offset commit 不等于业务完成？
2. 手动提交 offset 为什么更适合严肃业务场景？
