---
id: q-bigdata-flink-0024
title: 为什么 Source 显示 High Backpressure，不一定说明 Source 自己慢
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
  - flink-claim-0107
  - flink-claim-0109
related_docs:
  - bigdata/flink/monitoring-backpressure-busy-idle-and-bottleneck-location
estimated_minutes: 7
---

# 题目

为什么 `Source` 显示 `High Backpressure`，不一定说明 `Source` 自己慢？

# 一句话结论

因为背压是从下游反向传播上来的。

# 核心机制

1. task 产出快于下游消费就会背压
2. 背压沿数据流反方向传播
3. output buffer 没位置时，上游会先被顶住

# 标准答案

如果 `Source` 在 Flink WebUI 里显示 `High Backpressure`，并不一定说明 `Source` 本身处理慢。官方文档明确指出，背压是当任务生产速度超过下游消费速度时产生的，并且会逆着数据流方向传播。因此 Source 变成高背压，常常意味着真正慢的是后面的某个 operator 或 sink，它把 output buffer 压满以后，压力一路往上游顶回 Source。也正因为如此，背压排障不能只盯当前节点名字，而要顺着下游继续定位真正消费不过来的位置。

# 必答点

1. 背压逆向传播
2. Source High 常是下游慢的反映

# 常见误答

1. 看见 Source High 就优化 Source
2. 不继续往下游定位真正瓶颈
