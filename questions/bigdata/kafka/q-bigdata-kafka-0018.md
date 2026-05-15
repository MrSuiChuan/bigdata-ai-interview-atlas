---
id: q-bigdata-kafka-0018
title: 没有 key 的 Kafka producer 为什么仍然可能打出很大的 batch
domain: bigdata
component: kafka
topic: producer-internals
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 producer configs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-producer-configs
claim_ids:
  - kafka-claim-0099
related_docs:
  - bigdata/kafka/producer-batching-linger-compression-and-inflight-ordering
estimated_minutes: 5
---

# 题目

没有 key 的 Kafka producer 为什么仍然可能打出很大的 batch？

# 一句话结论

因为现代默认 producer 对无 key 记录使用 sticky partition，而不是每条都轮询分区。

# 标准答案

很多人误以为“没有 key 就会 round-robin，所以 batch 一定很碎”。Kafka 官方配置文档给出的实际行为不是这样：无 key、无显式 partition 时，producer 会使用 sticky partition，在某个 partition 上持续写一段数据，至少达到一个 `batch.size` 量级后才切换。这样做的目的就是让无 key 流量也能形成更大的 batch，从而得到更好的压缩和更少的请求数。

# 常见误答

1. 认为无 key 流量天然无法 batching
2. 把 sticky partition 和 key hash 分区混为一谈