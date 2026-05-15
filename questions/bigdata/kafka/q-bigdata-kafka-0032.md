---
id: q-bigdata-kafka-0032
title: Kafka topic 磁盘快速增长，你如何判断是 retention、compaction 还是生产流量问题
domain: bigdata
component: kafka
topic: disk-growth-troubleshooting
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-topic-configs
  - kafka-implementation-log
  - kafka-design-doc
claim_ids:
  - kafka-claim-0008
  - kafka-claim-0025
  - kafka-claim-0064
  - kafka-claim-0067
  - kafka-claim-0068
related_docs:
  - bigdata/kafka/retention-log-compaction
  - bigdata/kafka/log-cleaner-compaction-tombstone-deep-dive
  - bigdata/kafka/capacity-planning-partition-disk-network
estimated_minutes: 9
---

# 题目

某个 Kafka 集群磁盘快速增长，topic 没有明显报错。你如何判断是 retention 配置、log cleaner 落后、compaction 语义误用还是生产流量增加？

# 一句话结论

先算写入增长和保留窗口，再看 cleanup.policy、segment、cleaner backlog、tombstone/compaction lag 和副本分布，不能只看 topic 总大小。

# 核心机制

1. 确认写入速率、消息大小、压缩率和 replication factor。
2. 检查 cleanup.policy 是 delete、compact 还是两者。
3. delete retention 以 segment 为单位删除，segment 未 roll 时不会立即释放。
4. compaction 依赖 log cleaner，cleaner 落后会让 dirty segment 堆积。
5. tombstone 和 compaction lag 会影响删除传播和磁盘释放。

# 标准答案

排查磁盘增长先做容量账：当前写入 MB/s、保留时间、replication factor、压缩率和 consumer fan-out 是否变化。如果写入增长正常，再看 topic 的 `cleanup.policy`。如果是 delete，要检查 retention.ms、retention.bytes、segment 大小和 segment 是否已经 roll，因为删除是 segment 级别。若是 compact，要检查 cleaner 是否追不上、dirty ratio 是否持续升高、key 是否为空或过于离散、min/max compaction lag 是否导致长期不能清理。对于 tombstone，还要确认 delete.retention.ms 窗口。最后看副本分布和 log dir 是否不均，避免把单盘热点误认为全局容量不足。

# 必答点

1. 说明先算容量账
2. 说明 delete 和 compact 区别
3. 说明 segment 级删除
4. 说明 cleaner backlog
5. 说明 tombstone 和 compaction lag

# 加分点

1. 能说明 key 为空时 compaction 语义会失效
2. 能把副本分布和 log dir 纳入分析

# 常见误答

1. 直接删除 topic 或改短 retention
2. 认为 compact 会立刻释放磁盘
3. 忽略 replication factor 对磁盘的倍数影响

# 追问

1. 为什么 segment 未 roll 会影响删除及时性？
2. compacted topic 为什么仍可能很大？
3. delete.retention.ms 过短有什么风险？
