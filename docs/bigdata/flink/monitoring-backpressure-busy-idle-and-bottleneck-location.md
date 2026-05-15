---
kb_id: bigdata/flink/monitoring-backpressure-busy-idle-and-bottleneck-location
title: Flink 反压、Busy/Idle 与瓶颈定位
description: 解释 Flink 反压、Busy/Idle 与瓶颈定位的性能信号、关键指标、排障顺序和验证方法，避免只凭参数猜测。
domain: bigdata
component: flink
topic: monitoring-backpressure-busy-idle-bottlenecks
difficulty: advanced
status: reviewed
sidebar_position: 17
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-monitoring-backpressure
  - flink-docs-home
  - flink-architecture-doc
  - flink-checkpointing
  - flink-working-with-state
claim_ids:
  - flink-claim-0107
  - flink-claim-0108
  - flink-claim-0109
  - flink-claim-0110
  - flink-claim-0111
  - flink-claim-0022
  - flink-claim-0006
tags:
  - flink
  - backpressure
  - metrics
  - monitoring
  - webui
  - knowledge-base
  - production
---

## 这页的目标很窄
它只做一件事：告诉你当 Flink 任务变慢时，应该先看什么指标，再判断是上游忙、下游堵、还是某个中间算子本身变成瓶颈。

## 三个状态信号各自代表什么
| 信号 | 代表什么 | 常见误解 |
| --- | --- | --- |
| Busy | task 正在做计算 | 不是“busy 越高越好”，可能只是一直被算子压着算 |
| Idle | 没有输入可处理 | 不是“系统没问题”，可能是上游没数据或分流不均 |
| Backpressured | 输出 buffer 不够，发不出去 | 不是单纯 CPU 高，而是下游消费跟不上 |

这三个信号必须合起来看。只看 busy，容易把下游堵塞误判为算子计算重；只看 idle，容易把上游分区空闲误判为资源浪费；只看 backpressured，又可能忽略根因其实在 sink 或外部系统。

## 反压是怎样传播的
```mermaid
flowchart LR
  A["上游 Source"] --> B["Operator A"]
  B --> C["Operator B"]
  C --> D["Sink / 下游系统"]
  D -. 消费慢 .-> C
  C -. 反压向上游传播 .-> B
  B -. 记录流反向受阻 .-> A
```

反压的方向和数据流相反。下游越慢，上游越容易在输出 buffer 上等待；因此只看上游 task 的 CPU 其实很容易误判。

## Web UI 里的颜色和阈值是什么意思
- 蓝色通常表示 idle。
- 黑色表示 fully back pressured。
- 红色表示 fully busy。
- Back pressure status 的分级是 OK、LOW、HIGH，对应背压时间占比区间。

这些颜色不是“美观设计”，而是给你快速判断瓶颈位置用的。

## 先看哪几个指标
1. `backPressuredTimeMsPerSecond`
2. `busyTimeMsPerSecond`
3. `idleTimeMsPerSecond`
4. `checkpoint duration`
5. `alignment time`
6. `watermark lag`
7. `state size`

这三类时间指标加起来大约是 1000ms，所以它们不是互相独立的三个“随便看看的数”，而是同一个 subtask 的时间分布切面。

## 几种典型组合
| 指标组合 | 可能含义 |
| --- | --- |
| busy 高，backpressured 低 | 当前算子自己计算重 |
| busy 低，backpressured 高 | 下游或 sink 更可能是瓶颈 |
| idle 高，输入速率低 | 上游没有数据或 source 分配不均 |
| checkpoint duration 高，backpressure 高 | checkpoint barrier 被堵塞链路拖慢 |
| watermark lag 高，idle 分区存在 | 事件时间被某些分区卡住 |

## 诊断顺序
1. 先判断是全局问题还是单个 subtask 问题。
2. 再看最近有没有版本、配置、数据量、schema、权限或依赖变化。
3. 再收集日志、UI、执行计划和队列/文件状态。
4. 最后才决定是限流、扩容、改链路、拆分负载还是修下游。

## 常见误区
- 把 backpressure 等同于 CPU 飙高。
- 把 idle 等同于系统空闲。
- 只看一个子任务的值，不看整个 jobGraph 的聚合结果。
- 看到 checkpoint 变慢就直接改 checkpoint interval，而不先找根因。

## 一个实战判断
如果 `busy` 很高、`backpressured` 也高，通常说明计算和输出都很重。
如果 `idle` 很高，但业务又说有流量，通常是数据没有均匀到达，或者某些 source split / partition 没有被正确喂到。
如果 `backpressured` 很高但 `busy` 不高，常常意味着下游或外部 sink 是瓶颈。

## 生产排障时保留什么证据
- Flink Web UI 截图或导出结果。
- task 日志和异常栈。
- 最近一次配置变更。
- source / sink 的吞吐和延迟。
- checkpoint、state、watermark 和 queue 的变化曲线。

## 处理动作要有顺序
先定位瓶颈，再处理瓶颈。常见顺序是：确认最慢 operator，沿反压反方向追到下游，检查 sink 或外部服务，再看是否需要扩容、拆链路、调整并行度、改 key、限流或降级。不要一上来就调 checkpoint 参数，因为 checkpoint 慢常常只是背压的结果。

## 来源与事实边界
本页只依赖当前知识库登记的官方 source 和 claim。Web UI 配色、阈值和指标名应以当前 Flink 版本的官方文档为准，不要把旧版本页面上的描述直接搬过来。

### 来源

`flink-monitoring-backpressure`、`flink-docs-home`、`flink-architecture-doc`、`flink-checkpointing`、`flink-working-with-state`

### 事实声明

`flink-claim-0107`、`flink-claim-0108`、`flink-claim-0109`、`flink-claim-0110`、`flink-claim-0111`、`flink-claim-0022`、`flink-claim-0006`
