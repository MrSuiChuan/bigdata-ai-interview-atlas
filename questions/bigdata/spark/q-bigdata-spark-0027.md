---
id: q-bigdata-spark-0027
title: 为什么 Spark 的 CBO 和统计信息题，不能只说“统计不准会影响优化器”
domain: bigdata
component: spark
topic: statistics-cbo-cardinality-estimation-plan-misfire
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-sql-performance-tuning
  - spark-configuration-doc
claim_ids:
  - spark-claim-0053
  - spark-claim-0116
  - spark-claim-0118
  - spark-claim-0119
  - spark-claim-0120
  - spark-claim-0121
  - spark-claim-0122
related_docs:
  - bigdata/spark/statistics-cbo-cardinality-estimation-and-plan-misfire
estimated_minutes: 12
---

# 题目

为什么 Spark 的 CBO 和统计信息题，不能只说“统计不准会影响优化器”？

# 一句话结论

因为真正要讲清的是统计从哪里来、优化器有没有实际用上、你如何观测偏差，以及更准确的统计为什么要付出额外成本。

# 核心机制

1. Spark 的 plan quality 来自 data source、catalog 和 runtime statistics 三类信息
2. `spark.sql.cbo.enabled` 和 `spark.sql.cbo.planStats.enabled` 解决的不是同一层问题
3. histogram、auto update 等能力能提高统计质量，但都不是零成本

# 标准答案

如果只说“统计不准会影响优化器”，这题还是太抽象。Spark SQL Performance Tuning 文档已经把统计来源写得很清楚：Spark 之所以能在多种执行计划里做选择，是因为它会估计每个节点的输出规模，而这些估计来自 data source statistics、catalog statistics 和 runtime statistics。配置层面还要继续分层：`spark.sql.cbo.enabled` 只是打开 cost-based optimizer，而 `spark.sql.cbo.planStats.enabled` 才决定 logical plan 会不会从 catalog 抓 row count 和 column stats，因此“CBO 已开”不等于“计划一定正在用到完整统计”。真正排查计划失手时，官方建议用 `DESCRIBE EXTENDED` 看表或列统计，用 `EXPLAIN COST` 或 `DataFrame.explain(mode="cost")` 看优化器估计，再到 SQL UI Details 里看 `Statistics(..., isRuntime=true)` 对照运行时真实值。与此同时，更好的统计也有代价：`spark.sql.statistics.histogram.enabled` 会生成 equi-height histogram，提高估计精度，但需要额外 table scan；`spark.sql.statistics.size.autoUpdate.enabled` 会在数据变化时自动更新 table size，但表文件很多时会拖慢数据变更命令。所以成熟回答必须把统计来源、配置分层、观测路径和采集成本一起讲出来。

# 必答点

1. 说明 statistics 不止一种来源
2. 说明 `cbo.enabled` 和 `cbo.planStats.enabled` 不是同一件事
3. 说明 `DESCRIBE EXTENDED`、`EXPLAIN COST`、runtime statistics 的观测闭环
4. 说明 histogram 与 auto update 都有额外成本

# 常见误答

1. 以为只要开 CBO 就自然有好统计
2. 不知道怎么观察 optimizer 实际拿到了哪些统计
3. 不知道 histogram 需要额外 table scan
4. 看见计划失手就只会加 hint
