---
id: q-bigdata-kafka-0038
title: read_committed 消费者突然读不到新数据，如何从开放事务和 LSO 定位
domain: bigdata
component: kafka
topic: read-committed-lso-stall
question_type: failure
difficulty: expert
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-consumer-configs
  - kafka-producer-javadoc
claim_ids:
  - kafka-claim-0103
  - kafka-claim-0104
  - kafka-claim-0105
  - kafka-claim-0069
  - kafka-claim-0063
related_docs:
  - bigdata/kafka/high-watermark-last-stable-offset-and-visibility-boundaries
  - bigdata/kafka/transaction-coordinator-pid-epoch-lso
  - bigdata/kafka/idempotence-transactions
estimated_minutes: 8
---

# 题目

事务 topic 中 broker 明明持续有写入，但 `read_committed` 消费者突然长时间读不到新数据，你会如何解释和排查？

# 一句话结论

read_committed 消费者最多读到 LSO，开放事务会阻塞 LSO；要检查事务生产者是否长事务、卡住、被 fencing 或提交/中止失败。

# 核心机制

1. read_committed poll 只返回已提交事务消息。
2. 可见边界是 LSO，不是 high watermark。
3. 开放事务会让 LSO 停在第一个开放事务之前。
4. commit/abort marker 占 offset 但不返回应用，offset gap 正常。
5. 事务生产者不可恢复异常需要关闭 producer。

# 标准答案

这是典型的事务可见性问题。对于 `isolation.level=read_committed`，consumer 的可见边界不是物理日志尾部，也不是简单 high watermark，而是 Last Stable Offset。只要某个较早 offset 处存在开放事务，LSO 就不能越过它，后面即使有已写入日志的数据，read_committed 消费者也读不到。排查时要看事务生产者是否有长事务、是否卡在 commitTransaction、是否出现 ProducerFencedException 或 OutOfOrderSequenceException 等异常，是否有未 abort 的事务。还要提醒 offset gap 不一定是丢消息，事务控制标记和 aborted transaction 都可能占用 offset 但不返回应用。

# 必答点

1. 说明 read_committed 和 LSO
2. 说明开放事务阻塞可见性
3. 说明 high watermark 不是该模式末尾
4. 说明事务生产者异常
5. 说明 offset gap 正常

# 加分点

1. 能提 seekToEnd 在 read_committed 下返回 LSO
2. 能说明 abort/commit marker

# 常见误答

1. 认为 broker 没写入
2. 直接重置 offset
3. 把 offset gap 当消息丢失

# 追问

1. 如何定位哪个事务卡住？
2. read_uncommitted 会看到什么不同？
3. 长事务对 lag 指标有什么影响？
