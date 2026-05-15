---
kb_id: bigdata/flink/window-tumbling-sliding-session-global-count
title: Flink Tumbling、Sliding、Session、Global 与 Count 窗口
description: 解释 Flink 各类窗口的语义、适用场景、状态边界和排障重点。
domain: bigdata
component: flink
topic: window-types-detail
difficulty: intermediate
status: reviewed
sidebar_position: 11
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
  - flink-claim-0059
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

## Tumbling Window
Tumbling 窗口是最标准的固定时间桶。每条数据只会进入一个桶，不会重叠。

它适合做“按自然周期切分”的统计，比如每分钟、每小时、每天的汇总。它的优点是边界清晰、下游容易理解，缺点是如果业务变化发生在桶边界之间，结果会显得比较粗。

## Sliding Window
Sliding 窗口是固定长度、固定步长的重叠桶。它常用于“最近一段时间的持续观察”。

和 tumbling 最大的区别是，一条数据可以同时属于多个窗口，所以状态和计算成本都更高。换来的好处是结果更平滑，不会只按离散边界跳变。

## Session Window
Session 窗口是按空闲间隔断开的。只要后续元素没超过 gap，就视为同一个会话；一旦空闲太久，就开新窗口。

这类窗口最像用户行为分析。它的关键不是固定边界，而是活动连续性。late firing 在 session 里尤其容易影响窗口合并，所以比纯时间桶更要小心状态和合并语义。

## Global Window
Global 窗口只有一个大桶，本身不会因为时间自动结束。

这意味着它不是“省事窗口”，而是“把触发责任完全交给 trigger”的窗口。默认 trigger 不会自动发结果，所以如果不用自定义 trigger，global window 往往什么都不会输出。

## Count-based
Count-based 窗口按元素数量切分，不靠时间。

它更适合“每 N 条处理一次”的场景，但要记住它不是事件时间窗口，也不天然解决乱序问题。它解决的是批次数量边界，不是时间语义边界。

## 选型顺序
1. 先问你要按时间切还是按数量切。
2. 再问你要固定桶还是连续观察。
3. 再问你是否允许窗口重叠。
4. 再问你是否需要会话合并。
5. 最后再决定 trigger、allowed lateness 和下游更新方式。

### 来源

`flink-windows`、`flink-docs-home`

### 事实声明

`flink-claim-0053`、`flink-claim-0054`、`flink-claim-0055`、`flink-claim-0056`、`flink-claim-0057`、`flink-claim-0058`、`flink-claim-0059`、`flink-claim-0060`、`flink-claim-0061`
