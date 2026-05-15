---
kb_id: bigdata/flink/window-types-tumbling-sliding-session-global-count
title: Flink 窗口类型总览
description: 解释 Flink Tumbling、Sliding、Session、Global 和 Count-based 窗口的语义边界与适用场景。
domain: bigdata
component: flink
topic: window-types-overview
difficulty: intermediate
status: reviewed
sidebar_position: 9
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-windows
  - flink-docs-home
claim_ids:
  - flink-claim-0053
  - flink-claim-0054
  - flink-claim-0055
  - flink-claim-0056
  - flink-claim-0057
  - flink-claim-0058
  - flink-claim-0060
  - flink-claim-0061
tags:
  - flink
  - window
  - tumbling
  - sliding
  - session
  - global
  - count
  - knowledge-base
---

## 先把窗口想成“分桶规则”
窗口类型决定的是数据怎么被切成桶，不是“什么时候计算”这件事本身。真正的计算时机，还要看 trigger、watermark 和 allowed lateness。

## 五类窗口先分清
| 类型 | 桶的形状 | 核心语义 |
| --- | --- | --- |
| Tumbling | 不重叠固定长度 | 一段时间只进一个桶 |
| Sliding | 固定长度，允许重叠 | 同一条数据可以属于多个桶 |
| Session | 按空闲间隔分段 | 有活动就延续，长时间空闲就断开 |
| Global | 只有一个桶 | 什么时候出结果完全靠 trigger |
| Count-based | 按数量而不是时间 | 条数到齐再处理 |

## 这五类窗口在解决什么差异
Tumbling 适合固定周期的统计。Sliding 适合需要连续观察最近区间的统计。Session 适合按用户活跃段聚合。Global 适合你自己完全掌控触发条件的场景。Count-based 更适合按条数触发的批次统计。

## 哪些窗口更依赖时间，哪些更依赖数据
- Tumbling / Sliding / Session / Global 都是窗口语义，但它们对触发的依赖不一样。
- Count-based 更像“数据量边界”，而不是时间边界。
- Session 的关键不是时间点，而是“活动间隔是否还连续”。

## 不能混的边界
- Tumbling 不是 Sliding。
- Session 不是固定桶。
- Global 不是“什么都不做”。
- Count-based 不是事件时间窗口。

## 最容易出错的理解
如果你只关心“最后出一个值”，那会忽略窗口类型对状态规模、迟到处理和下游更新方式的影响。窗口类型不是 SQL 语法细节，而是业务切分方式。

### 来源

`flink-windows`、`flink-docs-home`

### 事实声明

`flink-claim-0053`、`flink-claim-0054`、`flink-claim-0055`、`flink-claim-0056`、`flink-claim-0057`、`flink-claim-0058`、`flink-claim-0060`、`flink-claim-0061`
