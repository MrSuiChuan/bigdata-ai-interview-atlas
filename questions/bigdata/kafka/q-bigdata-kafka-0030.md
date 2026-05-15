---
id: q-bigdata-kafka-0030
title: 如何设计一个高吞吐且要求同订单有序的 Kafka 订单事件流
domain: bigdata
component: kafka
topic: order-event-stream-design
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-design-doc
  - kafka-topic-configs
  - kafka-basic-operations
  - kafka-multi-tenancy
claim_ids:
  - kafka-claim-0001
  - kafka-claim-0002
  - kafka-claim-0014
  - kafka-claim-0033
  - kafka-claim-0034
  - kafka-claim-0079
  - kafka-claim-0080
related_docs:
  - bigdata/kafka/system-design-scenarios
  - bigdata/kafka/producer-partitioning
  - bigdata/kafka/capacity-planning-partition-disk-network
estimated_minutes: 12
---

# 题目

要设计一个订单事件流，要求同一个订单的事件有序、整体吞吐高、多个下游可以独立消费，你会如何设计 topic、key、partition、retention 和消费组？

# 一句话结论

用订单 ID 作为 key 保证同订单进入同一 partition，按吞吐和消费并行度规划 partition，多个下游用独立 consumer group，retention 和复制策略按回放与容灾目标配置。

# 核心机制

1. Topic 代表订单事件流边界，partition 是并行和顺序基本单位。
2. 同订单有序依赖 orderId 等稳定 key 路由到同一 partition。
3. partition 数要结合峰值吞吐、消费者并行度和未来扩展规划。
4. 不同业务下游使用不同 consumer group，offset 互不影响。
5. retention、replication factor、min.insync.replicas、ACL 和 quota 一起设计。

# 标准答案

可以设计一个 `order-events` topic，消息 key 使用 `orderId`，这样同一订单的创建、支付、发货等事件会按 key 路由到同一 partition，从而获得分区内顺序。partition 数不能随手设，要根据峰值写入 MB/s、records/s、单分区压测能力和同组消费者并行度估算，并留增长余量。风控、索引、实时看板等下游使用独立 consumer group，这样各自维护 offset，不会互相拖慢。retention 按审计和回放窗口设计，复制因子与 min.insync.replicas 按容灾目标设计，多租户环境还要配置 topic 命名、ACL 和 quota。需要提醒的是，扩分区可能改变新数据 key 到 partition 的映射，Kafka 也不支持减少分区，因此 partition 数是前期重要设计。

# 必答点

1. 说明 key 选择和同 key 顺序
2. 说明 partition 是并行上限
3. 说明独立 consumer group
4. 说明 retention 和复制策略
5. 说明扩分区边界

# 加分点

1. 能补充 ACL/quota 和 schema 契约
2. 能说明热点订单或大租户 key 的治理

# 常见误答

1. 用单分区追求全局有序导致吞吐不可扩展
2. 认为增加消费者一定提高吞吐
3. 忽略扩分区对 key 映射的影响

# 追问

1. 如果某些大客户订单形成热点怎么办？
2. 如果需要完整审计历史，cleanup.policy 应该怎么选？
3. 为什么不同下游不要共用同一个 group？
