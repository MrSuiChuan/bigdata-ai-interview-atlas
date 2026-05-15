---
id: q-bigdata-spark-0023
title: 为什么 Spark 的 fetch failure 往往会牵连旧的 shuffle map stage，而不是只重试当前 reduce task
domain: bigdata
component: spark
topic: shuffle-map-output-fetch-failure-stage-resubmit-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs and source as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-rdd-guide
  - spark-dagscheduler-source
claim_ids:
  - spark-claim-0024
  - spark-claim-0079
  - spark-claim-0097
  - spark-claim-0098
  - spark-claim-0099
  - spark-claim-0100
  - spark-claim-0101
  - spark-claim-0102
related_docs:
  - bigdata/spark/shuffle-map-output-fetch-failure-and-stage-resubmit-boundaries
estimated_minutes: 12
---

# 题目

为什么 Spark 的 `fetch failure` 往往会牵连旧的 shuffle map stage，而不是只重试当前 reduce task？

# 一句话结论

因为 `fetch failure` 暴露的是 reduce 侧依赖的 shuffle 物化结果已经失效，真正需要恢复的是 map output 的生产权，而不是 reduce task 自己的执行逻辑。

# 核心机制

1. shuffle 会把 stage 沿数据重分布边界切开，下游 task 依赖上游 map output files
2. DAGScheduler 会记住哪些 `ShuffleMapStage` 已产生输出，并在这些输出丢失时负责恢复
3. `FetchFailed` 不是普通 task retry，而是 stage 级数据权威性失效信号

# 标准答案

Spark 的 `fetch failure` 之所以经常会牵连旧的 shuffle map stage，是因为 downstream reduce task 读的不是抽象 lineage，而是上一阶段已经物化出来的 shuffle map output files。Spark 官方源码说明，stage 是沿着 shuffle boundary 切开的，DAGScheduler 会记住哪些 `ShuffleMapStage` 已经生成了 output files，以便后续不必重复执行 map side。但是一旦当前 task 通过 `FetchFailed` 或与 `ExecutorLost` 相关的完成事件暴露出这些 map output 已经不可用，问题就不再是“当前 reduce task 拉数据失败了一次”，而是“它依赖的中间结果已经失去权威性”。因此恢复边界必须上推到负责生产这些 shuffle 文件的旧 stage。DAGScheduler 负责处理 shuffle output file 丢失，并可能重提旧 stage；它还会先短暂等待，看是否还有其他节点或 task 一并失败，再把缺失数据对应的 lost stages 统一 resubmit 成新的 `TaskSet`。更进一步，Spark 源码还说明 stage 经常被多个 jobs 共享，所以恢复时甚至可能重新创建已经完成并被清理掉的 old stage。若启用了 external shuffle service，executor 丢失也不必然等于 shuffle 文件丢失，Spark 可能会等真正出现 fetch failure 后再决定是否注销相关输出。核心结论就是：`fetch failure` 的恢复对象是失效的 shuffle 物化数据，而不是当前 reduce task 的一轮执行。

# 必答点

1. 说明 reduce task 依赖的是 shuffle map output files，而不是只有 lineage
2. 说明 DAGScheduler 负责处理 shuffle output 丢失
3. 说明 `FetchFailed` 往往触发的是旧 stage 重提，而不是纯 task 级重试
4. 说明 finished stage 也可能因恢复需求重新进入执行图

# 常见误答

1. 只说“网络问题导致拉取失败”
2. 认为 reduce task 自己多试几次就够了
3. 认为已完成 stage 永远不会再回来
4. 把 executor lost 和 shuffle data lost 直接画等号
