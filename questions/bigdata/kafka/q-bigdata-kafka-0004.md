---
id: q-bigdata-kafka-0004
title: Kafka 中 acks=all 和 min.insync.replicas 为什么经常需要一起讨论
domain: bigdata
component: kafka
topic: durability-config
question_type: short_answer
difficulty: intermediate
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-22"
last_verified_at: "2026-04-22"
source_ids:
  - kafka-topic-configs
  - kafka-producer-javadoc
  - kafka-design-doc
claim_ids:
  - kafka-claim-0006
  - kafka-claim-0007
related_docs:
  - bigdata/kafka/replication-durability
estimated_minutes: 6
---

# 题目

Kafka 中 `acks=all` 和 `min.insync.replicas` 为什么经常需要一起讨论？

# 标准答案

因为它们分别控制 producer 侧确认要求和 broker/topic 侧允许写入的同步副本门槛。`acks=all` 表示生产者希望等待最强确认级别，但如果 topic 允许过低的同步副本门槛，那么 durability 仍然可能不够强。相反，如果 `min.insync.replicas` 要求更高，而同步副本不足，则可能拒绝写入，从而用可用性换取更强的持久性边界。所以这两个配置必须一起看，才能真正说明 Kafka 写入可靠性的语义和权衡。

# 必答点

1. 说明 `acks=all` 是 producer 侧确认要求
2. 说明 `min.insync.replicas` 是 broker/topic 侧同步副本门槛
3. 说明它们共同决定 durability 与 availability 的权衡

# 加分点

1. 能补充已提交消息与 ISR 的关系
2. 能说明为什么更强持久性通常会带来更高延迟或更低可用性

# 常见误答

1. 只背配置名，不解释两者分工
2. 把 `acks=all` 说成“永远不丢数据”

# 追问

1. 什么情况下写入会因为同步副本不足而失败？
2. 为什么可靠性题最终会落到 ISR 上？
