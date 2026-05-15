---
kb_id: bigdata/clickhouse/fault-recovery
title: ClickHouse 故障恢复与状态重建
description: 从 part 恢复、副本追平、备份恢复和分布式写入边界解释 ClickHouse 的恢复路径。
domain: bigdata
component: clickhouse
topic: fault-recovery
difficulty: advanced
status: reviewed
sidebar_position: 20
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-replication-docs
  - clickhouse-system-parts-doc
  - clickhouse-system-replicas-doc
  - clickhouse-system-replication-queue-doc
  - clickhouse-backup-doc
claim_ids:
  - clickhouse-claim-0006
  - clickhouse-claim-0015
  - clickhouse-claim-0016
  - clickhouse-claim-0026
tags:
  - bigdata
  - clickhouse
  - recovery
  - knowledge-base
---
## 故障恢复要先判断：你是在恢复 part、恢复副本，还是恢复业务结果
ClickHouse 的恢复问题不能笼统答成“有副本就能恢复”。更准确的说法是：有些问题是单节点 part 损坏或丢失，有些是 replica 落后或只读，有些是误删或历史回退，需要 backup/restore，还有些是分布式写入只有部分 shard 成功，需要业务层重放或核对。

## Part 层恢复：先确认现有物理状态
如果问题出在单表或单节点，先看 `system.parts` 是否仍然有 active part、是否存在异常缺口、磁盘和元数据是否匹配。很多“数据突然少了”的问题，首先要判断是查询条件没命中、part 还未加载、还是 part 确实缺失。

## Replica 层恢复：看副本健康与复制队列
`system.replicas` 能快速回答副本是否只读、延迟多久、会话是否健康；`system.replication_queue` 能回答它还在等什么任务完成。恢复时最重要的不是立刻做动作，而是先分清它卡在 fetch、merge、mutation 还是元数据会话异常。

## Backup/Restore 解决的是“副本自愈以外”的恢复需求
副本机制主要解决同一 shard 内的高可用和追平，不等于通用恢复方案。官方 backup/restore 文档说明，ClickHouse 提供了独立的备份恢复能力，用于表、数据库乃至更大范围的恢复规划。这是“误删、历史回退、跨环境迁移、灾备演练”时更可靠的边界。

## 分布式链路恢复要接受“局部成功”现实
写入 Distributed 表时，本来就不存在天然全局事务。因此超时、网络闪断或中间节点异常后，恢复策略不能只问“这条 SQL 成功没成功”，而要问哪些 shard 已经成功、哪些 replica 还没追平、是否触发了重复重放风险。真正可靠的恢复往往需要结合 dedup token、下游核对和补写策略。

## 建议的恢复顺序
1. 先定层次：part、replica、table、database、distributed chain。
2. 再找证据：`system.parts`、`system.replicas`、`system.replication_queue`、backup 元数据。
3. 再决定动作：等追平、手工恢复、备份回放、补写或回灌。
4. 最后做核对：行数、分区、关键聚合、下游派生表是否同步恢复。

## 恢复后一定要做结果校验

恢复不是把服务拉起来就结束。更稳的做法是按分区、行数、关键聚合结果和下游派生表状态做核对，确认恢复的是“业务可接受的正确状态”，而不只是“节点重新对外提供了查询”。

## 备份恢复与副本追平的职责边界

副本追平更像在线自愈；备份恢复更像受控回放。前者适合单节点异常、短时落后和常规高可用，后者适合误删、历史回退、跨环境迁移和灾备。把这两条路径混成一个概念，恢复方案通常会在真正事故里失灵。

## 一致性与容错
恢复链里最容易被误解的一点，是“副本存在”并不自动等于“恢复一定成功”：

1. part 在本地是否完整，和 replica 是否理论上可追平，是两个问题。
2. shard 内能否自愈，和 distributed 写入是否已经对所有 shard 完整生效，也是两个问题。
3. backup 存在，和是否能恢复到业务可接受时间点，还隔着恢复策略和核对过程。

### 为什么恢复最怕跳过“证据层”
因为很多恢复动作成本都很高。要是没先看 `system.parts`、`system.replicas`、复制队列和 backup 元数据，就贸然回放或补写，很容易把局部异常放大成更大的业务偏差。

## 性能模型
恢复能力同样有成本：

1. 保留更多副本，能提升高可用，但也增加复制和存储压力。
2. 备份频率越高，恢复点越细，但备份与校验成本越高。
3. distributed 链路越复杂，局部成功后的核对和补写成本越高。
4. 恢复后做业务核对会增加时间，但能显著降低“服务恢复了但数据不对”的风险。

### 为什么“拉起服务”不等于恢复完成
因为 ClickHouse 生产恢复关注的最终对象是业务结果，而不仅是节点进程。节点起来只是第一步，版本、分区、行数、派生表和下游状态是否一致才是最后一步。

## 生产排障
当你已经定位到恢复问题时，建议继续按这条顺序推进：

1. part 异常优先看局部物理状态和活跃 part 集合。
2. replica 异常优先看复制队列、只读状态和元数据会话。
3. distributed 异常优先确认哪些 shard 已成功、哪些需要补写。
4. 恢复完成后一定做分区级和关键指标级核对。

### 核对样例
```sql
SELECT dt, count(*) AS rows, sum(amount) AS total_amount
FROM sales
GROUP BY dt
ORDER BY dt DESC;
```

这个样例的意义不是语法，而是提醒恢复后的正确性核对必须回到关键分区和关键业务聚合。
