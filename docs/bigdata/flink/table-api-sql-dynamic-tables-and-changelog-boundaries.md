---
kb_id: bigdata/flink/table-api-sql-dynamic-tables-and-changelog-boundaries
title: Flink Table API 与 SQL 边界
description: 解释 Flink Table API、SQL、Dynamic Table 和 Changelog 的语义边界、输出模式与 DataStream 转换限制。
domain: bigdata
component: flink
topic: table-api-sql-dynamic-tables-changelog-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
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
  - changelog
  - dynamic-table
  - knowledge-base
---

## 这页只抓一个核心
Table API 和 SQL 在 Flink 里不是“批 SQL 的一层皮”，而是把持续变化的数据抽象成动态表，再把变化以 changelog 的形式输出。

## 三段链路
```mermaid
flowchart LR
  S["Stream"] --> T1["Dynamic Table"]
  T1 --> Q["Continuous Query"]
  Q --> T2["Result Dynamic Table"]
  T2 --> C["Changelog Stream"]
```

## 为什么连续查询不会结束
因为输入表一直在变。这里没有“等所有数据到齐后一次性算完”的前提，只有“持续维护当前结果”的前提。

所以同一个 SQL，在批处理里可能是一次输出，在流式里却会不断更新。

## 这个模型为什么能统一批和流
Dynamic Table 的关键不是“把流硬伪装成表”，而是让同一条逻辑查询在不同输入边界下都能表达。

- 批处理时，输入是有限快照，结果更像一次性计算。
- 流处理时，输入持续变化，结果更像不断维护。

表面上都是 SQL，底层其实是“快照查询”和“连续查询”两种运行方式。

## 三种变化编码
| 编码 | 含义 | 适用场景 |
| --- | --- | --- |
| append-only | 只有新增，没有修改和撤回 | 简单过滤、投影 |
| retract | 旧值撤回，新值重发 | 更新、聚合、排序 |
| upsert | 按 key 覆盖最新值 | 有唯一键且 sink 支持覆盖 |

## 最容易忽略的边界
- update query 会产生 INSERT 和 UPDATE 变化。
- append query 只产生 INSERT。
- 不是所有动态表都能转换成任意 DataStream。
- 从 dynamic table 转回 DataStream 时，只支持 append 和 retract stream。

## 什么时候需要特别小心
1. 查询结果会不会不断更新。
2. 下游 sink 能不能理解 retract 或 upsert。
3. 是否有唯一键支撑 upsert。
4. 是否把 streaming SQL 当成一次性批 SQL。

## 一个最小直觉
```sql
SELECT user_id, COUNT(*) AS cnt
FROM clicks
GROUP BY user_id;
```

这个查询在流上不会“只算一次”，而是随着每条新记录到来不断调整结果。下游如果只能接受 append，就会把更新误当成重复数据。

## 你该看什么证据
- planner 输出的 changelog mode。
- sink 是否支持对应编码。
- 是否存在唯一键。
- 流转成 DataStream 时的编码边界。

## 最容易把人带偏的地方
- 把 append-only 当成所有 SQL 的默认输出。
- 以为 update 结果一定能直接喂给所有 sink。
- 认为 Dynamic Table 转回 DataStream 没有限制。

### 来源

`flink-dynamic-tables`、`flink-docs-home`

### 事实声明

`flink-claim-0075`、`flink-claim-0076`、`flink-claim-0077`、`flink-claim-0078`、`flink-claim-0079`
