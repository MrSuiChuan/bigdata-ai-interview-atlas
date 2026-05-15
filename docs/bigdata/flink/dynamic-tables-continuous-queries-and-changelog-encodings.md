---
kb_id: bigdata/flink/dynamic-tables-continuous-queries-and-changelog-encodings
title: Flink Dynamic Table 与 Changelog
description: 解释 Flink Dynamic Table 与 Changelog如何发现故障、隔离影响、重建状态和恢复服务，并说明生产验证与风险边界。
domain: bigdata
component: flink
topic: dynamic-tables-continuous-queries-changelog-encodings
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: Flink 2.2 docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-dynamic-tables
  - flink-docs-home
claim_ids:
  - flink-claim-0075
  - flink-claim-0076
  - flink-claim-0077
  - flink-claim-0078
  - flink-claim-0079
tags:
  - flink
  - table-api
  - sql
  - dynamic-table
  - changelog
  - knowledge-base
  - production
---

## Dynamic Table 的核心直觉
流式 SQL 不是把每条记录单独跑一次 SQL，而是把持续变化的数据看成一张动态表。连续查询不会自然结束，它会持续把输入表的变化转换为输出表的变化。

这和传统批 SQL 最大的不同在于：批 SQL 面对的是某个时刻已经固定的数据快照，而流式 SQL 面对的是一直变化的输入。Flink 的 Dynamic Table 模型把这两者统一起来：你仍然写 SQL，但运行时看到的是不断变化的表和不断产生的 changelog。

## 三段式模型
```mermaid
flowchart LR
  Stream["Stream"] --> DT1["Dynamic Table"]
  DT1 --> Query["Continuous Query"]
  Query --> DT2["Result Dynamic Table"]
  DT2 --> Out["Changelog Stream"]
```

## append、retract、upsert 的差别
| 编码 | 适用语义 | 典型含义 |
| --- | --- | --- |
| append-only | 只新增 | 每条结果只出现一次 |
| retract | 先撤回旧值再增加新值 | 更新表达为两条变化 |
| upsert | 按唯一键覆盖 | 需要唯一键 |

选择哪种 changelog 编码，取决于查询语义和下游 sink 能力。简单过滤、投影通常更容易保持 append-only；聚合、去重、join、排名等查询经常会产生更新；如果结果有唯一键，下游支持 upsert 时可以避免 retract 的两条消息表达。

## 为什么 SQL 结果会“变来变去”
聚合、join、排名等查询的结果不是一次性完成的。只要上游还在变，下游动态表就可能继续更新。

这也是为什么 sink 必须能理解 changelog 语义：有些下游只能接 append，有些能接 upsert，有些必须处理 retract。

例如 `count(*) group by user_id` 在流上不是最终一次输出。某个用户每来一条新事件，对应计数都会更新。下游如果只能追加写，就会看到多个计数版本；下游如果能按主键 upsert，才更接近“当前最新结果表”。

## 和 DataStream 的边界
Dynamic Table 转回 DataStream 时，并不是所有 changelog 编码都能任意转换。当前知识库登记的事实里，只支持 append 和 retract stream。这个边界很重要，因为很多系统设计会把 SQL 结果继续交给 DataStream 逻辑处理，必须提前确认结果更新模式是否能被承接。

## 查询类型和输出形态
| 查询类型 | 常见输出 |
| --- | --- |
| filter / projection | append-only 更常见 |
| group by aggregation | update / retract / upsert 更常见 |
| join | 取决于输入变化和 join 语义 |
| deduplicate / ranking | 通常需要更新旧结果 |

这个表不是语法规则，而是设计时的判断入口。真正上线前要看 planner 生成的 changelog mode，以及 sink connector 支持什么。

## 生产设计检查
1. 查询是否只产生 append。
2. 结果是否有唯一键。
3. sink 是否支持 retract 或 upsert。
4. 下游是否能接受中间更新。
5. 是否把连续查询误当成一次性批 SQL。

## 排障时优先看什么
1. 查询计划是否产生 update / retract。
2. sink 连接器是否支持对应 changelog。
3. 主键定义是否足以表达 upsert。
4. 下游消费方是否把撤回消息当普通新增处理。
5. 业务是否真的需要中间更新，还是只需要最终窗口结果。

## 一个最小 SQL 直觉
```sql
SELECT user_id, COUNT(*) AS cnt
FROM clicks
GROUP BY user_id;
```

在连续查询里，`cnt` 会随着新点击持续变化。这个查询不是等所有数据结束后输出一次，而是不断维护每个 `user_id` 的动态结果。

## 来源与事实边界
本页只依赖当前知识库登记的官方 source 和 claim。关于 DataStream 转换支持的 changelog 编码和 SQL sink 能力，应以当前 Flink 版本官方文档为准。

### 来源

`flink-dynamic-tables`、`flink-docs-home`

### 事实声明

`flink-claim-0075`、`flink-claim-0076`、`flink-claim-0077`、`flink-claim-0078`、`flink-claim-0079`
