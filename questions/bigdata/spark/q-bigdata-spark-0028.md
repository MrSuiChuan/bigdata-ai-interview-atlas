---
id: q-bigdata-spark-0028
title: 为什么 Spark 的列式缓存和 pruning 题，不能只答“只扫需要的列，所以更快”
domain: bigdata
component: spark
topic: columnar-cache-scan-pruning-sql-runtime-footprint
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs and release notes as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-sql-performance-tuning
  - spark-configuration-doc
  - spark-release-1-6-0
  - spark-release-2-0-0
claim_ids:
  - spark-claim-0077
  - spark-claim-0085
  - spark-claim-0087
  - spark-claim-0123
  - spark-claim-0124
  - spark-claim-0125
  - spark-claim-0126
  - spark-claim-0127
  - spark-claim-0129
related_docs:
  - bigdata/spark/columnar-cache-scan-pruning-and-sql-runtime-footprint
estimated_minutes: 12
---

# 题目

为什么 Spark 的列式缓存和 pruning 题，不能只答“只扫需要的列，所以更快”？

# 一句话结论

因为 Spark SQL 的运行时足迹不仅取决于扫了几列，还取决于缓存 batch 大小、压缩策略、向量化读取、动态分区裁剪和单 task 工作集。

# 核心机制

1. 列式缓存让 Spark 只读必要列，并自动压缩以降低 GC 压力
2. `batchSize`、compression 和 vectorized reader 共同决定 cached columnar data 的运行时形态
3. pruning 还包括 join 场景下的动态分区裁剪，单分区过大时 planner 仍可能主动引入 shuffle

# 标准答案

如果只回答“只扫需要的列，所以更快”，列式缓存和 pruning 题就还是停在宣传语层面。Spark SQL Performance Tuning 文档说明，Spark SQL 可以按 in-memory columnar format 缓存表、查询时只扫描需要的列，并自动调压缩以减少内存和 GC 压力，这说明列式缓存真正解决的是把无关数据挡在执行路径之外。但这还不代表 runtime footprint 一定小。配置文档进一步说明，`spark.sql.inMemoryColumnarStorage.batchSize` 默认 10000，批次更大虽然有利于 memory utilization 和 compression，却会提高 OOM 风险；`spark.sql.inMemoryColumnarStorage.compressed` 默认 true，Spark 会按列统计自动选 codec；`spark.sql.inMemoryColumnarStorage.enableVectorizedReader` 默认 true，说明 cached columnar data 也尽量以向量化方式被消费。再往 pruning 看，除了列裁剪，`spark.sql.optimizer.dynamicPartitionPruning.enabled` 默认也为 true，当 partition column 同时作为 join key 时，Spark 会生成 pruning predicate 来减少不必要 partition 的扫描。即便如此，官方配置还说明 `spark.sql.maxSinglePartitionBytes` 默认 128 MB，单 partition 过大时 planner 会引入 shuffle 来改善并行度，说明单 task working set 仍是核心约束。最后，`spark.sql.defaultCacheStorageLevel` 默认 `MEMORY_AND_DISK`，说明 Spark SQL 默认缓存策略本来就在复用速度和内存压力之间做折中。所以成熟答案必须把列式布局、压缩、向量化、动态分区裁剪和单 task 工作集一起讲出来。

# 必答点

1. 说明列式缓存不只是“按列存一下”
2. 说明 `batchSize`、compression、vectorized reader 会改变运行时足迹
3. 说明 pruning 不止列裁剪，还包括动态分区裁剪
4. 说明单 partition 过大时 planner 仍会为并行度插入 shuffle

# 常见误答

1. 只会说“少扫几列更快”
2. 不知道 `batchSize` 过大也可能带来 OOM
3. 不知道动态分区裁剪是 join 场景的重要优化
4. 认为做了 pruning 就不会再有大工作集问题
