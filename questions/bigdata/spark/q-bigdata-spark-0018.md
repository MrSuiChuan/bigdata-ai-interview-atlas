---
id: q-bigdata-spark-0018
title: 为什么 Spark Unified Memory 不是简单把内存切成 execution 和 storage 两半
domain: bigdata
component: spark
topic: unified-memory-execution-storage-spill-eviction
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs and Spark 1.6.0 release notes as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-tuning-guide
  - spark-release-1-6-0
claim_ids:
  - spark-claim-0034
  - spark-claim-0038
  - spark-claim-0082
  - spark-claim-0083
  - spark-claim-0084
related_docs:
  - bigdata/spark/unified-memory-execution-storage-spill-and-eviction
estimated_minutes: 11
---

# 题目

为什么 Spark Unified Memory 不是简单把内存切成 `execution` 和 `storage` 两半？

# 一句话结论

因为现代 Spark 的内存模型是共享而非静态切分，并且 execution 与 storage 的挤压权不对称，这直接决定了 cache 是否会被赶走、spill 何时发生以及 GC 压力怎么传导。

# 核心机制

1. Spark 1.6 之后是 unified memory，而不是 exclusive division
2. execution 与 storage 共享统一区域 `M`，但 execution 可以挤 storage，storage 不能挤 execution
3. `spark.memory.fraction`、`spark.memory.storageFraction` 只是描述 `M` 与 `R` 的默认边界

# 标准答案

Spark Unified Memory 不是简单把内存切成 execution 和 storage 两半，因为 Spark 1.6.0 的 release notes 已经明确说明这是 shared memory for execution and caching instead of exclusive division。Spark 4.1.1 Tuning Guide 进一步解释，execution memory 用于 shuffles、joins、sorts、aggregations 等运行时计算，storage memory 用于 caching 和内部数据传播，它们共享统一区域 `M`。真正关键的边界是：execution 可以挤占 storage，但只挤到 storage usage 降到阈值 `R` 为止；storage 不能反向挤 execution，所以 `cache()` 不是绝对保留。参数层面，`spark.memory.fraction` 默认是 0.6，表示 `M` 占 `(JVM heap - 300MiB)` 的比例；`spark.memory.storageFraction` 默认是 0.5，表示 `R` 占 `M` 的比例。官方还特别提醒，如果 OldGen 已经接近打满，应该降低 `spark.memory.fraction`，因为宁可缓存更少对象，也不要让 GC 把任务执行拖慢。再往下，很多 reduce-side OOM 不是总数据量太大，而是单 task working set 太大，Spark 官方建议可以通过提高 parallelism 来减小单 task 输入规模。因此成熟回答必须把 unified design、`M/R` 边界、eviction 不对称、GC trade-off 和单 task working set 一起讲出来。

# 必答点

1. 说明 unified memory 是共享模型，不是固定分区
2. 说明 execution 可挤 storage，但 storage 不可挤 execution
3. 说明 `spark.memory.fraction` 与 `spark.memory.storageFraction` 的默认含义
4. 说明 cache、spill、GC 与单 task working set 是连在一起的

# 常见误答

1. 把 Spark 内存答成两个静态区域
2. 认为 cache 之后数据一定常驻
3. 只会调大 heap，不会分析 task working set
4. 觉得 spill 只是“磁盘变多”而不是 execution memory 压力表现
