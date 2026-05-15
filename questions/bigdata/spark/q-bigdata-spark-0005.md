---
id: q-bigdata-spark-0005
title: Spark 里的 cache、persist、checkpoint、localCheckpoint 到底有什么本质区别
domain: bigdata
component: spark
topic: persistence-vs-checkpoint
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-23"
last_verified_at: "2026-04-23"
source_ids:
  - spark-rdd-guide
  - spark-dataset-javadoc
claim_ids:
  - spark-claim-0018
  - spark-claim-0019
  - spark-claim-0020
  - spark-claim-0021
  - spark-claim-0029
  - spark-claim-0030
  - spark-claim-0031
related_docs:
  - bigdata/spark/shuffle-persistence-fault-tolerance
  - bigdata/spark/checkpoint-and-plan-truncation
estimated_minutes: 10
---

# 题目

Spark 里的 cache、persist、checkpoint、localCheckpoint 到底有什么本质区别？

# 一句话结论

cache / persist 主要解决复用性能，checkpoint 主要解决计划截断和恢复边界，localCheckpoint 则是更快但不可靠的截断手段。

# 为什么会有这个机制

Spark 既要解决“同一结果别反复算”，也要解决“执行链太长、恢复链太远怎么办”，这两个问题不能靠一个 API 一起解决。

# 核心机制

1. 默认 transformed RDD 每次 action 都可能重算
2. `cache()` / `persist()` 把结果保留下来供复用
3. checkpoint 截断 logical plan
4. localCheckpoint 使用 executor 缓存子系统，因此更快但不可靠

# 关键对象与状态

1. storage level
2. logical plan
3. checkpoint directory
4. executor cache subsystem

# 完整链路

同一结果反复使用时，先考虑 persist；如果执行计划本身越来越长、恢复链越来越深，checkpoint 才是用来砍断历史链路的手段。若只是追求更轻量的计划截断，可以考虑 localCheckpoint，但要接受不可靠边界。

# 边界与不保证项

1. cache 不会自动截断 lineage 或 logical plan
2. checkpoint 不是“更稳的 cache”
3. localCheckpoint 不是 full checkpoint 的等价快速版
4. `eager = false` 时，checkpoint 下来的数据可能和该次 job 实际使用的数据不同

# 故障场景

如果把 checkpoint 和 cache 混为一谈，线上就很容易出现“以为已经建立稳定边界，结果重试或恢复语义并不是自己想的那样”。

# 代价与权衡

persist 用空间换时间，checkpoint 用额外落盘和管理成本换更短的恢复边界；localCheckpoint 再进一步用可靠性换速度。

# 标准答案

cache / persist 主要是为了复用中间结果、减少重复计算，不会从根本上切断历史依赖；缓存丢了，Spark 仍可能根据原始 transformations 去重算。checkpoint 的核心是截断 logical plan 或 lineage，给后续执行建立新的恢复边界，尤其适合迭代场景。localCheckpoint 虽然更快，但官方明确说它依赖 executor 的缓存子系统，因此不可靠，甚至可能影响 job completion。若 checkpoint 使用 `eager = false`，还要注意最终 checkpoint 的数据可能与该次 job 实际使用的数据不完全一致。

# 必答点

1. persist 偏性能复用
2. checkpoint 偏计划截断
3. localCheckpoint 不可靠
4. `eager = false` 的非确定性边界

# 加分点

1. 能指出 RDD 和 Dataset `cache()` 默认 storage level 不同
2. 能说明 checkpoint 对迭代算法尤其有价值

# 常见误答

1. 把 checkpoint 说成更稳的 cache
2. 认为 localCheckpoint 只是更快一点，没有语义差别

# 追问

1. 如果 cache 丢了，Spark 为什么还能继续跑？
2. 什么场景下你会接受 localCheckpoint 的不可靠性？

