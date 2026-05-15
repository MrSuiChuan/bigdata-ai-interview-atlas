---
kb_id: bigdata/kafka/security-acl-quota-multitenancy
title: Kafka 认证、ACL、Quota 与多租户治理
description: 解释 Kafka 安全认证、授权、KRaft ACL 存储、配额和多租户命名空间治理。
domain: bigdata
component: kafka
topic: security-acl-quota-multitenancy
difficulty: advanced
status: reviewed
sidebar_position: 20
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-security-overview
  - kafka-authorization-acls
  - kafka-multi-tenancy
claim_ids:
  - kafka-claim-0075
  - kafka-claim-0076
  - kafka-claim-0077
  - kafka-claim-0078
  - kafka-claim-0079
  - kafka-claim-0080
  - kafka-claim-0081
tags:
  - kafka
  - security
  - acl
  - quota
  - multi-tenancy
  - knowledge-base
  - production
---
## 认证、ACL、Quota 与多租户治理

Kafka 多租户治理要同时解决“谁能连接”“谁能访问什么资源”“谁不能把共享 broker 打爆”。认证解决身份，ACL 解决授权，quota 解决资源边界，命名规范解决长期治理和审计。

Kafka ACL 不是业务权限系统，也不理解消息内容里的字段权限。它控制 topic、group、cluster、transactionalId 等 Kafka 资源访问。quota 也不是下游限流器，它保护 broker 网络、CPU、连接和控制面 mutation 能力。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Authentication | SSL 或 SASL 认证连接身份 | 身份是后续 ACL 和 quota 的基础 |
| Authorizer | Kafka 授权框架 | KRaft 下默认 StandardAuthorizer 将 ACL 存入 metadata log |
| ACL | 针对资源、操作、principal 和 host 的访问规则 | 默认无匹配 ACL 时只有 super users 可访问，除非修改危险开关 |
| Prefixed ACL | 按 topic 前缀授权 | 适合租户命名空间治理 |
| Client Quota | 按 principal 等维度限制资源使用 | 保护 broker CPU、网络和 mutation 能力 |
| Envelope Request | KRaft 中 broker 转发 admin 请求到 controller 的机制 | 自定义 principal builder 需要支持序列化 |

## 一次客户端请求的安全和配额判断路径

1. 客户端通过 SSL/SASL 建立连接并完成身份认证。
2. broker 根据 principal、资源、操作和 ACL 判断是否授权。
3. 如果是 KRaft admin 请求，broker 可能通过 Envelope 转发到 active controller。
4. quota 统计该 principal 或连接的资源使用。
5. 超限后 broker 通过限流保护共享资源。
6. 审计和告警记录异常访问、授权失败和 quota 命中。

## 核心机制拆解

- 认证、授权和配额是三层不同边界，不能用 ACL 代替 quota，也不能用 quota 代替权限。
- 多租户推荐结合层级 topic 命名和 prefixed ACL，降低 ACL 数量和误授权风险。
- client quota 按用户 principal 生效，和访问哪个 topic 没有简单一一绑定。

## 性能和容量观察

- 缺少 quota 的共享集群容易被单个租户的高吞吐或大量 topic 操作拖慢。
- ACL 设计过碎会增加管理复杂度，过粗会扩大权限风险。
- 控制面 mutation quota 能保护 topic 创建、配置变更等管理请求能力。

## 生产排障入口

- 授权失败先看 principal、资源类型、operation 和 host 是否匹配。
- 多租户互相影响时查看 quota 命中、BytesIn/Out、request rate 和 controller mutation rate。
- KRaft 集群 admin 请求异常时检查 broker 到 controller listener 和 principal 序列化边界。

## 可执行观察示例

```bash
kafka-acls.sh --bootstrap-server broker:9092 --add --allow-principal User:team-a --operation Read --topic team-a. --resource-pattern-type prefixed
kafka-configs.sh --bootstrap-server broker:9092 --alter --add-config producer_byte_rate=10485760 --entity-type users --entity-name team-a
```

## 设计取舍和边界

- 按租户前缀授权降低 ACL 数量，但要求 topic 命名强规范。
- 严格默认拒绝更安全，但上线流程需要完善权限申请。
- quota 保护共享集群稳定性，但配置过低会让正常峰值业务受限。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-security-overview`、`kafka-authorization-acls`、`kafka-multi-tenancy`

### 事实声明

`kafka-claim-0075`、`kafka-claim-0076`、`kafka-claim-0077`、`kafka-claim-0078`、`kafka-claim-0079`、`kafka-claim-0080`、`kafka-claim-0081`
