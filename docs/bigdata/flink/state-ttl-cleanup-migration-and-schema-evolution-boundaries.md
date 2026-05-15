---
kb_id: bigdata/flink/state-ttl-cleanup-migration-and-schema-evolution-boundaries
title: Flink State TTL、清理与 Schema 演进
description: 解释 Flink State TTL、清理与 Schema 演进中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: flink
topic: state-ttl-cleanup-migration-schema-evolution
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-working-with-state
  - flink-state-ttl-migration
  - flink-state-schema-evolution
  - flink-docs-home
claim_ids:
  - flink-claim-0080
  - flink-claim-0081
  - flink-claim-0082
  - flink-claim-0083
  - flink-claim-0084
  - flink-claim-0085
  - flink-claim-0086
  - flink-claim-0087
  - flink-claim-0088
  - flink-claim-0089
  - flink-claim-0090
  - flink-claim-0091
tags:
  - flink
  - ttl
  - schema-evolution
  - savepoint
  - state
  - knowledge-base
  - production
---

## TTL 不是定时删除任务
State TTL 解决的是状态生命周期问题，但它不保证到期那一刻立刻物理删除。过期状态通常在读取或后台清理时被移除。

## TTL 真正在控制什么
TTL 控制的是“业务上多久以后不再把这份状态当成有效结果”，不是“底层存储何时立刻擦除字节”。

所以 TTL 更像一种逻辑保鲜期。它直接影响的是读取语义、状态体积和清理节奏，而不是给你一个精确到毫秒的物理删除承诺。

## TTL 的三层边界
| 边界 | 说明 |
| --- | --- |
| 语义边界 | 过期后是否还能被读取 |
| 物理边界 | 什么时候真正清理底层状态 |
| 迁移边界 | 开关 TTL 或升级 schema 后是否还能恢复 |

这三层边界经常被混在一起。业务上“过期不可见”不等于底层已经物理删除；底层没有立即删除也不一定违反业务语义；开启 TTL 也不代表历史非 TTL 状态会立刻按旧写入时间过期。

## 状态生命周期
```mermaid
flowchart LR
  Write["写入状态"] --> TTL["记录 TTL 元信息"]
  TTL --> Access["读 / 写访问"]
  Access --> Expire["超过 TTL"]
  Expire --> Cleanup["读取清理或后台清理"]
```

## 读缓存和性能
TTL 刷新策略会影响性能。某些配置组合会关闭 state read cache，从而带来明显开销，尤其在 PyFlink 场景下更要谨慎。

选择 `OnCreateAndWrite` 还是 `OnReadAndWrite`，本质是在“读访问是否延长寿命”和“性能成本”之间取舍。如果业务语义是“只要用户持续活跃就保留状态”，读刷新可能合理；如果语义是“从写入开始固定保留 N 天”，读刷新反而会让状态存活过久。

## schema 演进的安全范围
- POJO 可以增加或删除字段，但不能改字段类型、类名或 namespace。
- Avro 只要符合 Avro schema resolution 规则，通常更适合演进。
- Kryo 不适合做可验证的 state schema evolution。
- key 的结构不支持随意演进，因为会影响 key group 分配和状态合并。

## 为什么 key 不能乱改
key 不只是业务字段，它还是状态分区规则。只要 key 的结构变了，原来的状态分片方式就可能失效。

换句话说，key 演进不是“字段升级”，而是“状态分区方式升级”。Flink 不能自动把两个过去不同的 key 合并成一个新 key，也不能假设旧 key 和新 key 在语义上等价。

key schema 不能随便演进，是因为 key 不只是业务字段，它还参与状态分区。如果两个旧 key 在新 schema 下变成同一个 key，Flink 无法自动判断旧状态该如何合并。

## 迁移前的检查
1. serializer 是否属于 Flink 支持演进的类型。
2. 是否从非 TTL 状态恢复到 TTL 状态。
3. 是否依赖立即物理删除满足合规要求。
4. savepoint 恢复后是否能读到旧状态。

## 生产验证方式
1. 用小规模 savepoint 做恢复演练。
2. 验证新增字段、删除字段和旧状态读取。
3. 观察 TTL 开启前后的 state size 变化。
4. 验证过期状态是否在读取或后台清理中逐步消失。
5. 对合规删除场景，不要只依赖 best-effort cleanup。

## 最容易误判的地方
- 看见状态还在，就以为 TTL 没生效。
- 看见状态变小，就以为已经物理删除完成。
- 看到恢复成功，就以为 schema 演进对所有路径都安全。
- 把 TTL 迁移和 key 演进混成一件事。

## TTL 设计建议
- 业务过期时间和技术 TTL 不要混成一个字段。
- TTL 不应替代明确的删除事件。
- 对用户隐私、合规删除等强语义场景，需要额外校验物理删除或下游清理。
- TTL 开启后要观察状态大小，而不是假设状态一定会立刻下降。

## schema 演进建议
优先使用可演进、可验证的序列化类型。上线前通过 savepoint 恢复验证新旧代码是否兼容，避免在生产失败后才发现 serializer 无法读取旧状态。

## 来源与事实边界
本页只依赖当前知识库登记的官方 source 和 claim。关于 TTL 迁移支持版本、schema evolution 支持范围和 serializer 限制，应以当前 Flink 版本官方文档为准。

### 来源

`flink-working-with-state`、`flink-state-ttl-migration`、`flink-state-schema-evolution`、`flink-docs-home`

### 事实声明

`flink-claim-0080`、`flink-claim-0081`、`flink-claim-0082`、`flink-claim-0083`、`flink-claim-0084`、`flink-claim-0085`、`flink-claim-0086`、`flink-claim-0087`、`flink-claim-0088`、`flink-claim-0089`、`flink-claim-0090`、`flink-claim-0091`
