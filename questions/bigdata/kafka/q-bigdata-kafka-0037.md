---
id: q-bigdata-kafka-0037
title: Kafka 分区迁移后业务仍然热点，如何区分副本均衡和 leader 均衡问题
domain: bigdata
component: kafka
topic: partition-reassignment-hotspot
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-basic-operations
claim_ids:
  - kafka-claim-0033
  - kafka-claim-0034
  - kafka-claim-0036
  - kafka-claim-0035
related_docs:
  - bigdata/kafka/partition-reassignment-and-throttling
  - bigdata/kafka/producer-partitioning
  - bigdata/kafka/performance-tuning
estimated_minutes: 9
---

# 题目

你做完 partition reassignment 后，磁盘分布均衡了，但某几个 broker 的写入和读取仍然很高，可能是什么原因？

# 一句话结论

副本均衡不等于 leader 均衡，也不等于 key 负载均衡；要同时检查 leader 分布、热点 partition、key 倾斜和 preferred leader。

# 核心机制

1. reassignment 迁移 replica 放置，不会重分布历史 record。
2. preferred leader 决定长期读写入口分布。
3. Producer key 倾斜会造成单 partition 热点。
4. 增加 partition 不改变旧数据，也可能改变新 key 映射。
5. 迁移过程和迁移后都要观察 ISR、leader 和 broker 负载。

# 标准答案

partition reassignment 主要调整 replica 放置，可能让磁盘更均衡，但不一定让 leader 读写入口均衡。如果热点 broker 承载了更多 partition leader，produce/fetch 仍会集中，需要检查 leader 分布并考虑 preferred leader election。即使 leader 均衡，某些 partition 仍可能因为 key 倾斜成为热点，这种问题不能靠副本迁移解决，要回到 producer key 设计、拆分热点 key 或重新设计 topic。还要记住增加分区不会重分布旧数据，Kafka 也不支持减少分区。

# 必答点

1. 说明副本均衡和 leader 均衡不同
2. 说明 key/partition 热点
3. 说明 reassignment 不重分布旧数据
4. 说明 preferred leader
5. 说明观察 ISR 和 broker 负载

# 加分点

1. 能提 throttle 对迁移过程的保护
2. 能说明扩分区对 key 映射的影响

# 常见误答

1. 认为磁盘均衡就等于吞吐均衡
2. 只扩 broker 不看 leader
3. 忽略 producer key 倾斜

# 追问

1. preferred leader election 解决什么问题？
2. 如果某个 key 特别热怎么办？
3. 为什么迁移需要 throttle？
