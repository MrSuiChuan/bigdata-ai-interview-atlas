---
kb_id: bigdata/flink/window-assigner-trigger-evictor-and-window-functions
title: Flink WindowAssigner、Trigger、Evictor 与窗口函数
description: 解释 Flink 窗口实现中的 WindowAssigner、Trigger、Evictor 与窗口函数之间的职责分工和性能边界。
domain: bigdata
component: flink
topic: window-assigner-trigger-evictor-window-functions
difficulty: advanced
status: reviewed
sidebar_position: 12
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-windows
  - flink-docs-home
  - flink-working-with-state
claim_ids:
  - flink-claim-0053
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
  - trigger
  - evictor
  - processwindowfunction
  - aggregatefunction
  - knowledge-base
---

## 先分清四个角色
窗口机制不是一个类完成全部事情，而是四个角色协作：

| 角色 | 回答什么问题 |
| --- | --- |
| WindowAssigner | 这条记录应该进哪个窗口 |
| Trigger | 这个窗口什么时候该出结果 |
| Evictor | 出结果前后要不要移除部分元素 |
| Window Function | 真正如何计算窗口结果 |

很多人学窗口时把这四件事混成“窗口 API”。这会导致一旦结果不对，就不知道到底是分桶错了、触发错了、清理错了，还是聚合函数选错了。

## 一条记录进入窗口后发生什么
```mermaid
flowchart LR
  In["记录到达"] --> Assign["WindowAssigner"]
  Assign --> State["窗口状态"]
  State --> Trigger["Trigger 判断"]
  Trigger --> Func["Window Function"]
  Func --> Evict["Evictor 可选处理"]
  Evict --> Out["输出"]
```

## WindowAssigner 决定的是“桶”
WindowAssigner 只负责把元素放进窗口，不负责决定何时产出结果。Tumbling、Sliding、Session、Global 的区别，本质上都先落在 assigner 的分桶规则上。

Session 之所以特殊，是因为它不是只做静态分桶，还可能因为后来的元素把两个原本分开的会话窗口重新连起来。所以 session window 的复杂性，比固定时间桶明显更高。

## Trigger 决定的是“何时可见”
Trigger 不是“计算函数”，而是窗口结果何时对外可见的控制器。

- `CONTINUE`：继续等。
- `FIRE`：发结果，但不一定清理窗口内容。
- `PURGE`：清理窗口内容。
- `FIRE_AND_PURGE`：先发结果，再清理窗口内容。

这也是为什么“触发了一次结果”不等于“这个窗口已经结束”。如果只是 `FIRE`，窗口状态可能还留着，后面还能继续补发或再次触发。

## GlobalWindow 为什么特别容易误解
GlobalWindow 的关键不是“它很大”，而是“它默认不会自动出结果”。官方语义里，GlobalWindow 的默认 trigger 不会触发，所以如果没有自定义 trigger，结果通常根本不会输出。

因此 GlobalWindow 适合的是“我自己非常清楚何时该触发”的场景，而不是“不知道选什么窗口时的兜底方案”。

## Evictor 为什么常常不推荐
Evictor 会让窗口难以预聚合。因为它要求在真正计算前看到更完整的窗口元素集合，所以 Flink 不能像增量聚合那样边来边压缩状态。

这直接带来两个代价：
- 状态更大。
- 计算更晚发生。

所以 Evictor 不是“更灵活就更好”，而是“确实必须按元素级别进出窗口时才值得用”。

## 窗口函数的性能分水岭
| 函数 | 更像什么 | 代价 |
| --- | --- | --- |
| ReduceFunction | 边来边归约 | 状态小、效率高 |
| AggregateFunction | 边来边聚合并转结果 | 状态小、灵活度高 |
| ProcessWindowFunction | 拿到完整窗口上下文 | 需要更多状态，单独使用更重 |

如果你只需要求和、计数、最大值这类增量聚合，优先考虑 `ReduceFunction` 或 `AggregateFunction`。如果你还需要窗口起止时间、watermark、上下文信息，再考虑配合 `ProcessWindowFunction`。

## 为什么“增量聚合 + ProcessWindowFunction”很常见
这是因为它兼顾了两件事：
- 前面先用增量聚合把状态压小。
- 最后再把窗口元信息交给 `ProcessWindowFunction` 补充输出。

这种组合通常比单独缓存所有元素再交给 `ProcessWindowFunction` 更稳。

## 一个最容易被忽视的边界
窗口结果输出，不代表窗口立刻物理清空。时间窗口通常只有在窗口结束时间再加 allowed lateness 之后，才算真正到了清理边界；GlobalWindow 则更不能靠时间自动推断。

## 选型建议
1. 先确定窗口分桶规则。
2. 再确定结果何时可见。
3. 再判断是否真的需要 Evictor。
4. 最后根据状态规模决定用增量聚合还是完整窗口函数。

### 来源

`flink-windows`、`flink-docs-home`、`flink-working-with-state`

### 事实声明

`flink-claim-0053`、`flink-claim-0055`、`flink-claim-0056`、`flink-claim-0057`、`flink-claim-0058`、`flink-claim-0059`、`flink-claim-0060`、`flink-claim-0061`
