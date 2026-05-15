---
kb_id: bigdata/flink/cep-pattern-matching-contiguity-skip-strategy-and-timeout
title: Flink CEP 模式匹配、连贯性与跳过策略
description: 解释 Flink CEP 的模式匹配语义、contiguity、After Match Skip Strategy 和超时边界。
domain: bigdata
component: flink
topic: cep-pattern-matching-contiguity-skip-strategy-timeout
difficulty: advanced
status: reviewed
sidebar_position: 20
version_scope: Flink 2.2 stable docs as verified on 2026-05-07
last_verified_at: '2026-05-07'
source_ids:
  - flink-cep
  - flink-docs-home
claim_ids:
  - flink-claim-0125
  - flink-claim-0126
  - flink-claim-0127
tags:
  - flink
  - cep
  - pattern
  - nfa
  - contiguity
  - skip-strategy
  - knowledge-base
---

## CEP 解决的不是普通过滤
CEP 不是“把多条 if/else 写复杂一点”，而是把一串事件之间的顺序关系、是否允许插入无关事件、是否允许重叠匹配，交给一个专门的模式匹配引擎来维护。

这类问题常见在风控、欺诈检测、操作序列识别、告警关联和复杂业务流程监控里。难点不在单条记录，而在“这一组事件合在一起是否构成某种模式”。

## 它和低层状态机的差别
不用 CEP，也可以自己用 `KeyedProcessFunction + state + timer` 手写状态机。但一旦模式里出现：
- 多步顺序。
- 可选分支。
- 重叠匹配。
- 超时输出。

业务代码会迅速变成一个难以验证的隐式状态机。CEP 的价值，就是把这些匹配语义显式化。

## 模式匹配真正关心什么
| 维度 | 核心问题 |
| --- | --- |
| 顺序 | 事件出现顺序是否满足模式 |
| 连贯性 | 中间能不能插入无关事件 |
| 重叠 | 一个事件能否参与多个匹配 |
| 超时 | 半成品匹配何时放弃 |

## contiguity 为什么重要
官方 CEP 文档里最容易被忽略、但最决定结果的，就是 contiguity。

- strict contiguity：中间不能有无关事件。
- relaxed contiguity：允许有无关事件，但仍按顺序推进。
- non-deterministic relaxed contiguity：允许更宽松的组合，可能从同一批候选事件里产生多个匹配。

这不是语法花样，而是匹配空间大小的根本差异。越宽松，匹配覆盖更全，但状态和结果组合也更容易膨胀。

## After Match Skip Strategy 决定“匹配完之后怎么办”
```mermaid
flowchart LR
  Events["事件序列"] --> Match["发现一个匹配"]
  Match --> Skip["After Match Skip Strategy"]
  Skip --> Next["继续找下一个匹配"]
```

匹配发出之后，系统不会天然知道该丢掉哪些候选状态。Skip Strategy 决定的是：是尽量避免重叠，还是允许尽可能多的重叠组合继续存在。

这直接影响两件事：
- 会不会重复命中大量相似模式。
- 状态会不会快速膨胀。

## 超时不是“失败”，而是边界
在 CEP 里，超时常常代表“某个模式前半段已经出现，但后半段在规定时间内没有完成”。这不是算子报错，而是一种业务语义。

例如：
- 登录失败多次后，规定时间内没有成功登录。
- 下单后，在规定时间内没有支付。
- 先出现告警 A，后续没有等到确认事件 B。

这些都属于“超时本身就是有价值结果”的场景。

## CEP 最容易踩的坑
- 模式过宽松，导致匹配组合爆炸。
- skip strategy 不合适，结果重叠太多。
- 只写模式，不估算每个 key 的候选状态规模。
- 用 CEP 解决其实更适合普通窗口聚合的问题。

## 什么时候优先用 CEP
如果你关心的是“序列模式”，优先考虑 CEP。  
如果你关心的是“时间桶内聚合”，优先考虑窗口。  
如果你关心的是“单个事件到达时的低层控制”，优先考虑 ProcessFunction。

### 来源

`flink-cep`、`flink-docs-home`

### 事实声明

`flink-claim-0125`、`flink-claim-0126`、`flink-claim-0127`
