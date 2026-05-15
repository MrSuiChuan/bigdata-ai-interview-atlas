---
kb_id: bigdata/kafka/capacity-planning-partition-disk-network
title: Kafka 容量规划：分区、磁盘、网络、保留时间与复制成本
description: 给出 Kafka 容量规划的估算框架，覆盖吞吐、分区、复制、保留、压缩和消费者并行度。
domain: bigdata
component: kafka
topic: capacity-planning
difficulty: advanced
status: reviewed
sidebar_position: 36
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-docs-home
  - kafka-design-doc
  - kafka-consumer-javadoc
  - kafka-basic-operations
  - kafka-topic-configs
  - kafka-producer-javadoc
claim_ids:
  - kafka-claim-0001
  - kafka-claim-0014
  - kafka-claim-0033
  - kafka-claim-0034
  - kafka-claim-0008
  - kafka-claim-0007
tags:
  - kafka
  - capacity-planning
  - partition
  - disk
  - network
  - retention
  - knowledge-base
---
## 容量规划：分区、磁盘、网络、保留时间与复制成本

Kafka 容量规划要同时算数据量、吞吐、保留、复制和消费者并行度。最基本的公式是：原始写入量乘以保留时间、复制因子和压缩/膨胀系数，得到磁盘需求；峰值吞吐乘以复制和消费 fan-out，得到网络需求；分区数决定同组消费并行上限。

容量规划不是套一个固定分区数。单分区吞吐取决于硬件、batch、压缩、消息大小、acks、消费者和 broker 负载。分区数也不能随意减少，扩分区会影响 key 映射，因此必须留增长余量但避免过度分区。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Ingress Throughput | 生产者写入 records/s 和 MB/s | 决定 broker 写入压力 |
| Replication Factor | 每条数据的副本数量 | 决定磁盘和复制网络倍数 |
| Retention Window | 数据保留时间或大小 | 决定可回放窗口和磁盘容量 |
| Compression Ratio | 压缩后磁盘和网络成本 | 与 batch 和数据类型强相关 |
| Consumer Fan-out | 消费组数量和读取速率 | 决定出站网络和 broker fetch 压力 |
| Partition Count | 并行度、文件数量和恢复成本 | 是容量和语义共同决策 |

## 容量估算的推荐顺序

1. 统计当前和未来峰值写入 MB/s、records/s、消息大小。
2. 确认 retention、replication factor 和压缩率。
3. 估算磁盘：写入量 x retention x replica x 安全余量。
4. 估算网络：生产写入 + 副本复制 + 消费 fan-out。
5. 估算分区：按消费并行度、单分区吞吐和未来扩展留余量。
6. 压测验证并记录基线，不把估算当最终事实。

## 核心机制拆解

- 同组消费者并行度受分区数上限限制。
- 增加分区不改变旧数据，也不能减少分区，因此是提前设计项。
- replication factor 提高容灾能力，同时线性增加存储和复制带宽需求。

## 性能和容量观察

- 磁盘容量至少要考虑峰值、压缩失败、retention 清理滞后和故障恢复余量。
- 网络要同时算 producer ingress、replica traffic 和 consumer egress。
- 分区太少限制并行，太多增加元数据、文件和恢复成本。

## 生产排障入口

- 磁盘增长超预期时检查 retention、compaction、压缩率和副本数。
- 网络打满时区分 producer、replication 和 consumer fan-out。
- 消费者扩容无效时检查分区数是否成为并行上限。

## 生产观察指标

- 每个 topic 的 bytes in、bytes out、message rate、平均消息大小和压缩率。
- 每个 broker 的磁盘使用率、log dir 分布、leader 数、partition 数和网络进出带宽。
- consumer group 数量和读取 fan-out，因为同一份数据被多个 group 读取会放大出站网络。
- retention 清理是否及时，compaction topic 的 cleaner 是否长期落后。

## 常见误区

- 只用日增数据量估磁盘，忘记 replication factor 和 retention。
- 把分区数当成可随时回退的参数，忽略 Kafka 不能减少 topic 分区。
- 忽略未来消费组增加后出站网络的放大效应。
- 没有压测单分区能力，却直接用经验值规划全局分区数。

## 可执行观察示例

```text
容量估算示例：
写入 100 MB/s，保留 7 天，replication.factor=3，压缩后 0.5。
磁盘粗估 = 100 * 86400 * 7 * 3 * 0.5 MB，再加操作系统、segment、索引和安全余量。
```

## 设计取舍和边界

- 更长 retention 提升回放能力，但成本上升。
- 更高 replication factor 提升容灾，但吞吐和磁盘成本上升。
- 更多分区提升并行潜力，但降低治理和恢复简单性。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-docs-home`、`kafka-design-doc`、`kafka-consumer-javadoc`、`kafka-basic-operations`、`kafka-topic-configs`、`kafka-producer-javadoc`

### 事实声明

`kafka-claim-0001`、`kafka-claim-0014`、`kafka-claim-0033`、`kafka-claim-0034`、`kafka-claim-0008`、`kafka-claim-0007`
