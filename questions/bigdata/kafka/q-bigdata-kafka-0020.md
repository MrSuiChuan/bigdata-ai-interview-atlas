---
id: q-bigdata-kafka-0020
title: Kafka 的 High Watermark 和 Last Stable Offset 到底分别回答什么问题
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
related_docs:
  - bigdata/kafka/high-watermark-last-stable-offset-and-visibility-boundaries
estimated_minutes: 8
---

# 题目

Kafka 的 High Watermark 和 Last Stable Offset 到底分别回答什么问题？

# 一句话结论

HW 更偏复制提交边界，LSO 更偏事务可见性边界；两者相关，但不是一条线。

# 标准答案

High Watermark 更接近“在复制层面哪些日志已经足够安全”；Last Stable Offset 则是 `read_committed` consumer 的事务可见性边界。Kafka 官方配置文档说明，LSO 定义为第一个 open transaction 之前的位置，所以一旦前面挂着未完成事务，`read_committed` consumer 就必须停在这里，哪怕 HW 已经更靠后。这个问题的重点不是背术语，而是说明 Kafka 至少存在复制安全线和事务可见线两套边界。

# 常见误答

1. 认为 HW 和 LSO 只是两个名字，本质一样
2. 认为 `read_committed` consumer 总能读到 HW