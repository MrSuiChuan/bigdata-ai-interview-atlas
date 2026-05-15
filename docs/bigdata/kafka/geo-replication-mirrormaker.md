---
kb_id: bigdata/kafka/geo-replication-mirrormaker
title: Kafka 跨集群复制与 MirrorMaker 2 边界
description: 解释 MirrorMaker 2 基于 Connect 的跨集群复制、topic/config/offset/ACL 同步和故障切换边界。
domain: bigdata
component: kafka
topic: geo-replication-mirrormaker
difficulty: advanced
status: reviewed
sidebar_position: 23
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-geo-replication
  - kafka-connect-user-guide
claim_ids:
  - kafka-claim-0092
  - kafka-claim-0093
  - kafka-claim-0082
  - kafka-claim-0083
tags:
  - kafka
  - mirrormaker
  - geo-replication
  - connect
  - disaster-recovery
  - knowledge-base
---
## 跨集群复制与 MirrorMaker 2 边界

MirrorMaker 2 用于 Kafka 跨集群复制，它基于 Kafka Connect 框架运行，因此继承了 Connect worker、source connector、sink connector、tasks 和内部状态管理的很多特征。它可以复制 topic、topic 配置、consumer group offset 和 ACL，但跨集群一致性和故障切换仍然需要设计。

跨集群复制不是同步双写数据库，也不是自动无损故障转移。网络延迟、带宽、topic 命名、offset 同步、下游幂等、冲突写入和切回流程都必须提前规划。MirrorMaker 能保持分区语义，但不能替业务处理跨地域冲突。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Source Cluster | 被复制的 Kafka 集群 | topic、config、offset、ACL 是复制对象 |
| Target Cluster | 接收复制数据的 Kafka 集群 | 需要容量、权限和 topic 策略匹配 |
| MirrorSourceConnector | 从 source 拉取并写入 target 的核心 connector | 任务数影响复制并行能力 |
| Checkpoint / Offset Sync | 辅助 consumer group offset 迁移 | 用于故障切换时定位消费恢复点 |
| Replication Policy | 控制远端 topic 命名和映射 | 影响双向复制和冲突避免 |
| tasks.max | 控制 connector task 并行上限 | 生产建议至少 2 以便跨进程分摊负载 |

## MirrorMaker 2 的跨集群复制链路

1. Connect worker 集群运行 MirrorMaker connector。
2. source connector 从源集群读取 topic 数据和元数据。
3. connector 将数据写入目标集群，并可同步配置、offset 和 ACL。
4. checkpoint 和 offset sync 辅助消费组在目标集群恢复。
5. 源集群故障时，应用需要切换 producer/consumer bootstrap。
6. 恢复和切回时要处理重复、延迟和双写冲突。

## 核心机制拆解

- MM2 建立在 Connect 之上，所以 Connect 的分布式任务管理、内部 topic 和 rebalance 机制同样重要。
- 跨集群 offset 同步帮助 consumer group 迁移，但应用仍要处理复制延迟和重复处理。
- 保留分区语义有助于同 key 顺序迁移，但不能消除跨地域网络延迟。

## 性能和容量观察

- 复制吞吐受源集群、目标集群、网络带宽、tasks.max 和 connector 配置共同限制。
- 跨地域链路抖动会让目标集群 lag 增大。
- 双向复制要格外防止 topic 命名循环和冲突写入。

## 生产排障入口

- 观察 MirrorMaker connector/task 状态和 lag。
- 对照源目标 topic 分区数、配置和 ACL 是否同步。
- 演练故障切换时确认 consumer group offset 是否可用，以及下游是否幂等。

## 生产观察指标

- MirrorMaker connector 和 task 状态、task 分布、重启次数和错误 trace。
- 源集群读取延迟、目标集群写入延迟、跨地域链路带宽和丢包。
- 目标 topic 的 partition、replication factor、min.insync.replicas、ACL 和 quota。
- checkpoint、offset sync 和故障切换演练结果。

## 常见误区

- 把异步跨集群复制当成同步强一致复制。
- 只复制数据，不验证 group offset、ACL 和 topic 配置。
- 在双向复制里没有设计 topic 命名和循环复制边界。
- 没有演练切换和切回，真正故障时才发现 offset 不能直接使用。

## 可执行观察示例

```properties
clusters = primary, backup
primary.bootstrap.servers = primary:9092
backup.bootstrap.servers = backup:9092
primary->backup.enabled = true
primary->backup.topics = orders.*
tasks.max = 4
```

## 设计取舍和边界

- 异步复制成本较低且吞吐高，但存在 RPO。
- 双活写入可用性更强，但冲突处理和一致性治理更难。
- 复制 ACL 和 offset 提升切换体验，但也增加安全和治理复杂度。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-geo-replication`、`kafka-connect-user-guide`

### 事实声明

`kafka-claim-0092`、`kafka-claim-0093`、`kafka-claim-0082`、`kafka-claim-0083`
