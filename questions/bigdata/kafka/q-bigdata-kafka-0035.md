---
id: q-bigdata-kafka-0035
title: Kafka Connect sink connector 任务频繁重启，你如何排查 internal topics 和 rebalance
domain: bigdata
component: kafka
topic: connect-task-failure
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-connect-user-guide
  - kafka-connect-administration
claim_ids:
  - kafka-claim-0082
  - kafka-claim-0083
  - kafka-claim-0084
  - kafka-claim-0085
  - kafka-claim-0086
related_docs:
  - bigdata/kafka/connect-distributed-mode
  - bigdata/kafka/production-troubleshooting-casebook
estimated_minutes: 9
---

# 题目

Kafka Connect 分布式集群中一个 sink connector 的 task 频繁重启，数据写入外部系统不稳定，你如何定位？

# 一句话结论

先通过 REST API 看 connector/task 状态，再检查外部系统错误、worker rebalance、内部 topic 配置和 connector 自身 exactly-once/offset 语义。

# 核心机制

1. Connect distributed mode 用 worker group 自动分配 task。
2. 配置、offset、status 存在 Kafka internal topics 中。
3. 生命周期操作应通过 REST API 管理。
4. Connect 默认可使用 incremental cooperative rebalance。
5. exactly-once 支持取决于 connector 和外部系统能力。

# 标准答案

Connect 排查不要只看 worker 进程。第一步通过 REST API 查看 connector 和 task 的状态、trace 和失败原因。若是 sink connector，要检查外部系统写入错误、限流、连接数和幂等能力。第二步看 worker 是否频繁加入离开 group，是否触发 rebalance，以及 scheduled.rebalance.max.delay.ms 是否导致 task 暂时未分配。第三步检查 config.storage.topic、offset.storage.topic、status.storage.topic 的分区、复制和 compaction 是否符合要求。最后确认该 connector 对 exactly-once 或 offset 语义的支持范围，不要把 Connect 运行时能力误认为所有 connector 都保证端到端 exactly-once。

# 必答点

1. 说明 REST API 查看状态
2. 说明 external sink 错误
3. 说明 internal topics
4. 说明 worker rebalance
5. 说明 connector 语义依赖实现

# 加分点

1. 能提 incremental cooperative rebalance
2. 能说明 scheduled.rebalance.max.delay.ms 的影响

# 常见误答

1. 只重启 worker
2. 直接改 tasks.max
3. 认为所有 Connect 都 exactly-once

# 追问

1. config.storage.topic 为什么建议单分区？
2. worker 离开后为什么任务可能延迟重分配？
3. source 和 sink connector 的 exactly-once 边界有什么不同？
