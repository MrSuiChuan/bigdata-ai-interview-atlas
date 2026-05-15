---
kb_id: bigdata/flink/custom-sink-writer-committer-and-flush-boundaries
title: Flink 自定义 Sink、SinkWriter 与提交边界
description: 解释 Flink Sink API、SinkWriter、flush 和提交边界，说明自定义 sink 的一致性约束。
domain: bigdata
component: flink
topic: custom-sink-writer-committer-flush-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 24
version_scope: Flink 2.2 stable docs as verified on 2026-05-07
last_verified_at: '2026-05-07'
source_ids:
  - flink-data-sinks
  - flink-docs-home
claim_ids:
  - flink-claim-0134
tags:
  - flink
  - sink
  - sinkwriter
  - committer
  - flush
  - knowledge-base
---

## Sink 的问题不只是“写出去”
自定义 sink 最关键的，不是能不能把数据发出去，而是“发出去”和 checkpoint / 结束输入之间到底是什么关系。

这正是 Sink API 把 `Sink`、`SinkWriter`、状态和 committer 逻辑拆开的原因。

## SinkWriter 在做什么
`SinkWriter` 是写出执行面。它负责接收元素、缓存、批量写、以及在 checkpoint 或输入结束时 flush。

这意味着 sink 的一致性边界，往往不是在 `write()` 那一刻，而是在 flush / commit 那一刻。

## flush 为什么重要
官方文档里 `flush(endOfInput)` 的意义非常关键：  
checkpoint 到来时 flush，能让 at-least-once 边界对齐；输入结束时 flush，则决定批输入或 bounded 输入是否真正写完。

如果自定义 sink 只会“平时写”，不会在 checkpoint 边界正确 flush，那么运行时看起来也许能跑，但一致性语义会不稳。

## 真正要分清的边界
- `write()`：接收一条记录。
- `flush()`：把待写数据推进到外部系统边界。
- `commit()`：让外部系统把这批写入视为已完成。

这三步不是一回事。很多 sink 设计出问题，就是把它们混成一个动作。

## 自定义 sink 最容易出错的地方
- 把 flush 当成最终提交。
- checkpoint 到来时没有把待写数据推进到正确边界。
- 外部系统支持能力和 Flink 侧语义不匹配。

### 来源

`flink-data-sinks`、`flink-docs-home`

### 事实声明

`flink-claim-0134`
