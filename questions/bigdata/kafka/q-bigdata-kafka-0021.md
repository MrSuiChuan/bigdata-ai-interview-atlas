---
id: q-bigdata-kafka-0021
title: 为什么 read_committed consumer 可能读不到 High Watermark，而且 seekToEnd 也会受影响
domain: bigdata
component: kafka
topic: visibility-boundaries
question_type: principle
difficulty: expert
status: reviewed
version_scope: "Kafka 4.2 consumer configs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-consumer-configs
claim_ids:
  - kafka-claim-0103
  - kafka-claim-0104
  - kafka-claim-0105
related_docs:
  - bigdata/kafka/high-watermark-last-stable-offset-and-visibility-boundaries
estimated_minutes: 7
---

# 题目

为什么 `read_committed` consumer 可能读不到 High Watermark，而且 `seekToEnd()` 也会受影响？

# 一句话结论

因为 `read_committed` 受 LSO 约束，不是受 HW 约束；在这个模式下，`seekToEnd()` 返回的也是 LSO。

# 标准答案

Kafka 官方配置文档明确给出两个事实：`read_committed` consumer 可能读不到 HW；并且在这个模式下 `seekToEnd()` 返回 LSO。两者背后是同一个原因，即事务可见性必须停在第一个 open transaction 之前的位置。所以只要 topic 前方存在未结束事务，复制层虽然已经更靠后，`read_committed` 也不能继续暴露后面的记录。这个问题的本质是“末尾”不再是物理复制末尾，而是事务可见末尾。

# 常见误答

1. 认为 `seekToEnd()` 永远跳到日志最末尾
2. 认为事务只影响是否过滤 aborted records，不影响尾部位置