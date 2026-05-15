---
kb_id: bigdata/kafka/upgrade-compatibility-kraft-and-rolling-restart
title: Kafka 升级兼容、KRaft 版本边界与滚动重启
description: 解释 Kafka 升级时如何看协议、客户端、KRaft quorum、consumer group protocol、事务和 Connect/Streams 边界。
domain: bigdata
component: kafka
topic: upgrade-compatibility
difficulty: advanced
status: reviewed
sidebar_position: 40
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-basic-operations
  - kafka-consumer-rebalance-protocol
  - kafka-kraft-operations
  - kafka-streams-config
  - kafka-consumer-configs
  - kafka-transaction-protocol
claim_ids:
  - kafka-claim-0035
  - kafka-claim-0036
  - kafka-claim-0056
  - kafka-claim-0073
  - kafka-claim-0090
  - kafka-claim-0109
  - kafka-claim-0120
tags:
  - kafka
  - upgrade
  - compatibility
  - kraft
  - rolling-restart
  - knowledge-base
---
## 升级兼容、KRaft 版本边界与滚动重启

Kafka 升级不是把 broker jar 换掉。升级会触及 broker 协议、client 兼容、KRaft quorum 版本、consumer group protocol、事务协议、Connect rebalance、Streams processing guarantee 和运维工具。滚动升级的核心是控制影响面，并持续验证元数据、复制、消费和事务。

不要把新版本特性自动套到旧集群。比如 Kafka 4.x 的 consumer rebalance protocol、KRaft dynamic quorum、transaction.version 等都有版本和配置边界。升级计划必须写清当前版本、目标版本、中间步骤、不可逆变更和回滚策略。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Broker Binary | broker 进程版本 | 决定服务端能力 |
| Client Compatibility | producer/consumer/admin/connect/streams 客户端 | 决定协议和配置能否启用 |
| KRaft Version | metadata quorum 能力边界 | 动态 quorum 与 kraft.version 有关 |
| group.protocol | consumer rebalance 协议选择 | consumer 不是默认启用 |
| transaction.version | Kafka 4.x 事务协议服务端防护 | 影响事务生产者语义 |
| Rolling Restart | 逐台重启控制影响面 | 需要观察 ISR 和 leader 迁移 |

## 滚动升级的安全执行链路

1. 阅读源版本到目标版本的 release notes 和 upgrade guide。
2. 在测试环境验证客户端、事务、Connect、Streams 和 KRaft 工具。
3. 逐台 broker/controller 滚动重启，观察 quorum、ISR 和请求延迟。
4. 升级客户端前确认协议默认值和配置变化。
5. 逐步启用新能力，不与版本升级同一窗口混做。
6. 保留回滚和数据补偿方案，记录变更审计。

## 核心机制拆解

- controlled shutdown 有助于计划内重启降低 leader 不可用。
- 新 consumer rebalance protocol 支持但需要显式 group.protocol=consumer。
- Streams exactly_once_v2 和事务协议都要确认 broker 版本和客户端配置。

## 性能和容量观察

- 滚动期间 leader 迁移和客户端 metadata refresh 会增加尾延迟。
- controller quorum 节点滚动需要确保多数派持续可用。
- 大量客户端同时升级可能触发 group rebalance 风暴。

## 生产排障入口

- 升级后 rebalance 异常先检查 group.protocol 和客户端版本。
- KRaft 工具输出异常时确认 kraft.version 和 quorum 配置。
- 事务异常时检查 transaction.version、transactional.id 和 producer fencing 日志。

## 可执行观察示例

```text
升级原则：
1. 版本升级、协议切换、新特性启用分开做。
2. 每一批重启后确认 ISR、URP、controller quorum 和 lag。
3. 客户端升级先灰度低风险 group。
```

## 设计取舍和边界

- 分阶段升级更稳，但周期更长。
- 一次性启用新协议收益快，但回滚复杂。
- 保持兼容模式降低风险，但会推迟新特性收益。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-basic-operations`、`kafka-consumer-rebalance-protocol`、`kafka-kraft-operations`、`kafka-streams-config`、`kafka-consumer-configs`、`kafka-transaction-protocol`

### 事实声明

`kafka-claim-0035`、`kafka-claim-0036`、`kafka-claim-0056`、`kafka-claim-0073`、`kafka-claim-0090`、`kafka-claim-0109`、`kafka-claim-0120`
