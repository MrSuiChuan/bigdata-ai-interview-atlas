---
id: q-bigdata-kafka-0029
title: 线上 Kafka 消费组 lag 持续升高，你如何分层定位根因
domain: bigdata
component: kafka
topic: lag-troubleshooting
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-consumer-javadoc
  - kafka-monitoring
  - kafka-basic-operations
  - kafka-consumer-configs
claim_ids:
  - kafka-claim-0021
  - kafka-claim-0031
  - kafka-claim-0045
  - kafka-claim-0103
  - kafka-claim-0107
  - kafka-claim-0108
related_docs:
  - bigdata/kafka/consumer-lag-monitoring-troubleshooting
  - bigdata/kafka/fetch-session-and-consumer-poll-loop
  - bigdata/kafka/production-troubleshooting-casebook
estimated_minutes: 10
---

# 题目

线上 `order-service` 消费组 lag 持续升高，但 broker 没有明显宕机。你会按什么顺序定位根因？

# 一句话结论

先确认 lag 口径和影响面，再按生产速率、分区热点、rebalance、poll 超时、下游处理、事务 LSO 和 broker 复制健康逐层排查。

# 核心机制

1. 区分 client 侧 records-lag-max 和 group 工具里的 CURRENT-OFFSET/LAG。
2. 先看是否全组、单 topic、单 partition 或单 consumer。
3. 比较生产速率和消费速率，判断是输入突增还是消费能力下降。
4. 检查 rebalance 日志、max.poll.interval.ms、下游耗时和 read_committed 的 LSO。
5. 同时看 ISR 指标，避免把复制问题误判为消费者问题。

# 标准答案

Kafka lag 不能直接等同于一个统一的积压条数。排查时先用 consumer group 工具确认 CURRENT-OFFSET、LOG-END-OFFSET 和每个 partition 的 LAG，再结合 consumer client 指标 records-lag-max 看运行时读取进度。如果 lag 集中在少数 partition，优先怀疑 key 倾斜、热点分区或单分区处理慢；如果所有 partition 都涨，继续比较生产速率和消费速率，并查看下游数据库、HTTP 服务或搜索写入是否变慢。随后检查 consumer 是否频繁 rebalance，是否超过 max.poll.interval.ms，以及是否使用 read_committed 导致 LSO 停滞。最后把 broker 侧 UnderReplicatedPartitions、UnderMinIsrPartitionCount 一起看，确认不是副本复制或 broker 压力导致可见边界推进变慢。

# 必答点

1. 说明先分清 lag 口径
2. 说明按影响面分层
3. 说明检查生产速率和消费速率
4. 说明检查 rebalance、poll 超时和下游
5. 说明 read_committed 下 LSO 会影响可见进度

# 加分点

1. 能把 ISR 指标纳入判断
2. 能说明单分区热点不能靠无限加 consumer 解决

# 常见误答

1. 看到 lag 就直接加消费者
2. 不区分 current offset 和 committed offset
3. 忽略事务 LSO 和下游处理耗时

# 追问

1. 如果 lag 只集中在一个 partition 怎么处理？
2. 如果 records-lag-max 不高但 group LAG 很高说明什么？
3. 如果 read_committed 消费停滞应该查什么？
