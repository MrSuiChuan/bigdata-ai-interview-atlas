---
kb_id: bigdata/flink/metrics-monitoring-webui-and-diagnostics
title: Flink 指标、监控与 Web UI 诊断
description: 解释 Flink 反压、忙闲状态、Web UI 颜色和关键指标的诊断方法，帮助从现象回到瓶颈。
domain: bigdata
component: flink
topic: metrics-monitoring-webui-diagnostics
difficulty: intermediate
status: reviewed
sidebar_position: 7
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-monitoring-backpressure
  - flink-docs-home
  - flink-checkpointing
  - flink-working-with-state
claim_ids:
  - flink-claim-0107
  - flink-claim-0108
  - flink-claim-0109
  - flink-claim-0110
  - flink-claim-0111
tags:
  - flink
  - metrics
  - monitoring
  - webui
  - backpressure
  - knowledge-base
---

## 这页的作用
它回答的是：当作业变慢时，怎么从指标和 UI 里判断问题到底在计算、输入、输出，还是状态和 checkpoint。

## 三个核心指标
| 指标 | 代表什么 | 误读风险 |
| --- | --- | --- |
| busyTimeMsPerSecond | subtask 正在处理数据 | 高不一定是坏，可能只是计算重 |
| idleTimeMsPerSecond | 没有输入可处理 | 高不一定是好，可能是上游没喂数据 |
| backPressuredTimeMsPerSecond | 输出阻塞，发不出去 | 高通常说明下游或 sink 跟不上 |

这三个值在时间上加起来大约是 1000ms，所以它们不是三个互不相干的单独指标，而是同一个 subtask 的时间切面。

## 反压看的是哪一层
```mermaid
flowchart LR
  Up["上游算子"] --> Mid["当前算子"]
  Mid --> Down["下游算子 / Sink"]
  Down -. 更慢 .-> Mid
  Mid -. 反压向上游传播 .-> Up
```

反压的根因通常出现在下游，但症状会出现在上游。只看一个 task 的 CPU 很容易误判。

## Web UI 的颜色
- 蓝色表示 idle。
- 黑色表示 fully back pressured。
- 红色表示 fully busy。

这些颜色只是快速定位入口，不能代替对日志、checkpoint 和状态大小的检查。

## 先看什么，再看什么
1. 先看是单个 subtask 还是全局都慢。
2. 再看 busy、idle、backpressured 的组合。
3. 再看 checkpoint duration、alignment time、watermark lag、state size。
4. 最后才决定是扩容、拆链路、改 key、调 sink，还是重构算子。

## 典型组合怎么读
| 组合 | 更可能的含义 |
| --- | --- |
| busy 高，backpressured 低 | 计算本身重 |
| busy 低，backpressured 高 | 下游或 sink 更可能是瓶颈 |
| idle 高，业务有流量 | source 分区不均或上游没有把数据喂进来 |
| checkpoint 变慢且 backpressured 高 | 背压正在拖慢 checkpoint |
| watermark lag 高且有 idle 分区 | 事件时间被慢分区卡住 |

## 生产里不要犯的错
- 把 backpressure 当成 CPU 高。
- 把 idle 当成系统空闲。
- 只看单个 subtask，不看整个 jobGraph。
- 看到 checkpoint 慢就直接调 checkpoint 参数。

## 最后保留什么证据
- Web UI 截图。
- task 日志。
- 最近的配置变更。
- source / sink 吞吐。
- checkpoint、state 和 watermark 的变化曲线。

## 一句话检查点
如果你能用指标说出“慢在哪里、为什么慢、先改哪一层”，这页就算真正看懂了。

### 来源

`flink-monitoring-backpressure`、`flink-docs-home`、`flink-checkpointing`、`flink-working-with-state`

### 事实声明

`flink-claim-0107`、`flink-claim-0108`、`flink-claim-0109`、`flink-claim-0110`、`flink-claim-0111`
