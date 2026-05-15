---
id: q-bigdata-spark-0017
title: 为什么 Spark 调度必须分清 DAGScheduler 和 TaskScheduler，而不是只背 Job、Stage、Task
domain: bigdata
component: spark
topic: scheduler-stage-cut-locality-straggler-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs and source as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-job-scheduling
  - spark-tuning-guide
  - spark-dagscheduler-source
  - spark-taskscheduler-source
claim_ids:
  - spark-claim-0012
  - spark-claim-0037
  - spark-claim-0078
  - spark-claim-0079
  - spark-claim-0080
  - spark-claim-0081
related_docs:
  - bigdata/spark/scheduler-stage-cut-locality-and-straggler-boundaries
estimated_minutes: 12
---

# 题目

为什么 Spark 调度必须分清 DAGScheduler 和 TaskScheduler，而不是只背 `Job`、`Stage`、`Task`？

# 一句话结论

因为 Spark 调度真正考的是高层阶段规划和低层任务派发的职责边界，不把这两层分开，就解释不了 stage cut、locality、重试和 straggler。

# 核心机制

1. DAGScheduler 负责 stage-oriented 的高层 DAG 规划
2. stage 在 shuffle 边界切开，narrow dependency 在 stage 内 pipeline
3. TaskScheduler 负责低层任务派发、失败重试和 straggler 缓解

# 标准答案

Spark 调度必须分清 DAGScheduler 和 TaskScheduler，因为两者解决的是不同层级的问题。官方源码里，DAGScheduler 被定义成 high-level、stage-oriented scheduling layer：它为每个 job 计算 stage DAG，跟踪哪些 RDD 和 stage output 已经 materialized，找到 minimal schedule，然后把阶段作为 TaskSet 交给底层 TaskScheduler。源码还明确说明，stages are created by breaking the RDD graph at shuffle boundaries，像 `map`、`filter` 这样的 narrow dependency 会 pipeline 到同一 stage，而 shuffle dependency 会把计算切成多个 stage；每个 stage 内的 task 则是在同一 RDD 的各个 partition 上执行相同函数。与此同时，DAGScheduler 还负责根据 RDD preferred locations、cache 状态和 shuffle data 位置算出 preferred locations。TaskScheduler 则是 low-level task scheduler，它只服务一个 SparkContext，从 DAGScheduler 收到每个 stage 的 TaskSet，负责真正把 task 发到 cluster、运行 task、重试失败、mitigate stragglers，并把事件回传给 DAGScheduler。再结合 Tuning Guide，Spark 的 locality 还有 `PROCESS_LOCAL`、`NODE_LOCAL`、`NO_PREF`、`RACK_LOCAL`、`ANY` 等等级并带有 wait/fallback 机制。因此如果不分清 DAGScheduler 和 TaskScheduler，就无法准确解释为什么 stage 会在 shuffle 处分界、为什么 locality 偏好先由高层算出再由低层落地、以及为什么 shuffle 文件丢失和 task 失败重试不属于同一层逻辑。

# 必答点

1. 说明 DAGScheduler 是高层 stage 规划层
2. 说明 stage 在 shuffle 边界切开，narrow dependency 会 pipeline
3. 说明 TaskScheduler 是低层 task 派发和重试层
4. 说明 locality preference 的生成和执行分属不同层

# 常见误答

1. 把 Spark 调度器说成一个模糊黑盒
2. 只会背 job、stage、task，不会讲谁负责切图和派活
3. 把 locality 当成 executor 临场随便决定的
4. 把 shuffle 文件丢失和单 task 失败都说成“Spark 会自动重试”
