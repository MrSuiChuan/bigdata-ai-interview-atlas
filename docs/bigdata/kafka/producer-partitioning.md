---
kb_id: bigdata/kafka/producer-partitioning
title: Kafka Producer 分区选择、Key 顺序与热点控制
description: 解释 Producer 如何选择 Partition，以及同 Key 顺序、sticky partition 和扩分区风险。
domain: bigdata
component: kafka
topic: producer-partitioning
difficulty: advanced
status: reviewed
sidebar_position: 5
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-design-doc
  - kafka-basic-operations
  - kafka-producer-configs
claim_ids:
  - kafka-claim-0002
  - kafka-claim-0016
  - kafka-claim-0017
  - kafka-claim-0033
  - kafka-claim-0034
  - kafka-claim-0099
tags:
  - kafka
  - producer
  - partitioner
  - ordering
  - hot-key
  - knowledge-base
---
## Producer 分区选择、Key 顺序与热点控制

Producer 分区策略决定消息进入哪个 Partition，也就决定了同 key 顺序、消费并行度、热点风险和后续扩容成本。Kafka 的顺序保证只在 partition 内成立，因此“如何选 key”和“什么时候扩 partition”是生产设计问题，不是简单配置问题。

分区器不能同时免费满足全局有序、无限并行和绝对均衡。同一个 key 路由到同一个 partition 可以保同 key 顺序，但会制造热点风险；无 key 写入更容易均衡和批量，但丧失业务键顺序；增加分区不能改变历史数据分布，还可能改变新数据的 key 到 partition 映射。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Record Key | 参与默认分区选择的业务键 | 决定同 key 是否落到同一分区 |
| Partitioner | 将 record 映射到 partition 的客户端逻辑 | 默认策略受 key、显式 partition 和 sticky 行为影响 |
| Sticky Partition | 无 key 场景下倾向在一段时间内复用某个分区以形成更大 batch | 提升批量效率，但不是业务顺序保证 |
| Partition Count | topic 的分区数量 | 决定并行上限，也进入 key hash 取模语义 |
| Hot Key | 高频业务键 | 会造成单分区热点，无法靠增加消费者数量突破 |

## Producer 选择目标 Partition 的判断顺序

1. 如果 record 显式指定 partition，Producer 直接使用该 partition。
2. 如果存在 key bytes，默认分区器按 key hash 选择 partition。
3. 如果没有 key 和 partition，Producer 使用 sticky partition 形成更大的 batch。
4. Producer 根据 metadata 找到该 partition 的 leader broker。
5. 发送失败或 leader 变化时，客户端刷新 metadata 并按语义重试。

## 核心机制拆解

- 同 key 顺序的前提是同 key 在同一时间段持续进入同一 partition，并且消费者按该 partition 顺序处理。
- 扩分区会改变 hash(key) 对 partition count 的取模结果，新的同 key 数据可能进入新分区，历史数据不会被自动重分布。
- 无 key sticky partition 的目标是提高 batch 和压缩效率，不是让业务事件有序。

## 性能和容量观察

- key 过于集中会让单分区吞吐成为上限，表现为某些 partition lag 特别高。
- key 太离散但单条很小，会让 batch 难以攒大，吞吐和压缩率下降。
- 扩分区前要评估消费者状态、下游幂等和同 key 顺序是否依赖旧映射。

## 生产排障入口

- 按 partition 查看 bytes in/out 和 lag，确认是否存在热点分区。
- 检查 producer record key 设计，判断是否把租户、用户或订单错误地集中到少数 key。
- 扩分区后如果同 key 乱序，重点检查 key hash 映射变化，而不是先怀疑 broker 复制。

## 生产观察指标

- 每个 partition 的 bytes in、records in、lag 和 leader broker 分布。
- Producer 端 record-send-rate、batch-size-avg、record-error-rate 和 metadata refresh。
- 业务 key 的基数、热 key 占比和是否随版本变更。
- 扩分区前后同 key 新数据是否进入不同 partition。

## 常见误区

- 为了同 key 顺序把所有数据写到一个固定 key。
- 认为 sticky partition 能保证业务顺序。
- 扩分区前不评估 hash(key) % partitionCount 变化。
- 只看 topic 总吞吐，不看单 partition 热点。

## 可执行观察示例

```java
ProducerRecord<String, String> record = new ProducerRecord<>(
    "orders",
    order.getUserId(),
    order.toJson()
);
producer.send(record);
```

## 设计取舍和边界

- 业务 key 越稳定，同 key 顺序越容易保证，但热点风险越高。
- 分区越多，并行潜力越高，但小文件、leader、元数据和恢复成本越大。
- 为了全局有序把 topic 设成单分区通常会牺牲 Kafka 最核心的横向扩展能力。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-design-doc`、`kafka-basic-operations`、`kafka-producer-configs`

### 事实声明

`kafka-claim-0002`、`kafka-claim-0016`、`kafka-claim-0017`、`kafka-claim-0033`、`kafka-claim-0034`、`kafka-claim-0099`
