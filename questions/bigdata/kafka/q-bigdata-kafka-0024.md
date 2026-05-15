---
id: q-bigdata-kafka-0024
title: 为什么说 committed offset 是 Kafka 的恢复状态，而不是 consumer 本地进度条
domain: bigdata
component: kafka
topic: offset-internals
question_type: principle
difficulty: expert
status: reviewed
version_scope: "Kafka 4.2 implementation distribution docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-implementation-distribution
claim_ids:
  - kafka-claim-0110
  - kafka-claim-0111
  - kafka-claim-0112
related_docs:
  - bigdata/kafka/consumer-offsets-topic-coordinator-cache-and-commit-durability
estimated_minutes: 8
---

# 题目

为什么说 committed offset 是 Kafka 的恢复状态，而不是 consumer 本地进度条？

# 一句话结论

因为它由 group coordinator 写入 `__consumer_offsets` 并走复制持久化，而不是只存在 consumer 内存或本地磁盘里。

# 标准答案

Kafka 的 committed offset 是控制面状态，不是本地变量。group coordinator 接到 offset commit 后，会把它写入内部 compacted topic `__consumer_offsets`；并且只有 offsets topic 的所有副本都收到这条记录后，协调器才返回 commit 成功。与此同时，为了快速服务 offset fetch，coordinator 还会维护内存缓存。也就是说，committed offset 同时具备“复制持久化的恢复点”和“内存缓存的快速查询态”两层属性，所以它远不只是 consumer 自己记一下的进度条。

# 常见误答

1. 认为 committed offset 只在 consumer 本地保存
2. 认为 commit 成功只表示 coordinator 收到请求