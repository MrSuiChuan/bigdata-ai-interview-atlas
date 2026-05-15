---
id: q-bigdata-flink-0023
title: 为什么 Flink 的背压题不能只看一个 High 标记，而必须一起看 backPressured、busy、idle
domain: bigdata
component: flink
topic: monitoring-backpressure-busy-idle-bottlenecks
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-monitoring-backpressure
claim_ids:
  - flink-claim-0108
  - flink-claim-0109
  - flink-claim-0110
  - flink-claim-0111
related_docs:
  - bigdata/flink/monitoring-backpressure-busy-idle-and-bottleneck-location
estimated_minutes: 9
---

# 题目

为什么 Flink 的背压题不能只看一个 `High` 标记，而必须一起看 `backPressured`、`busy`、`idle`？

# 一句话结论

因为同样显示“有问题”，可能分别代表被下游顶住、自己真的在忙，或者根本没输入可处理。

# 核心机制

1. 三个指标加起来约等于 1000ms
2. backpressure 由 output buffer 可用性决定
3. idleness 由输入是否存在决定
4. JobGraph 只是聚合视图

# 标准答案

Flink 的背压题如果只看一个 `High` 标记，通常会把“哪里慢”判断错。官方文档明确说明，每个 subtask 都有 `backPressuredTimeMsPerSecond`、`busyTimeMsPerSecond` 和 `idleTimeMsPerSecond` 三个指标，它们加起来大约是 `1000ms`；其中 back pressure 是按输出缓冲是否可用来判断的，而 idleness 看的是有没有输入。也就是说，一个 task 可能看起来“不健康”，但真实原因完全不同：可能是自己在忙，也可能是被下游顶住，还可能是根本没活干。再加上 JobGraph 上展示的是各 subtask 指标的最大聚合值，所以真正排障必须下钻到 subtask 层一起看三组指标。

# 必答点

1. 三指标组合含义
2. backpressure 和 idleness 的判定依据
3. JobGraph 是聚合视图

# 常见误答

1. 只看颜色不看指标
2. 把 High 直接等于 CPU 满
3. 不知道需要下钻 subtask
