---
id: q-bigdata-spark-0037
title: 为什么 MLlib、GraphX、SparkR 不应该和 Spark SQL 主线混着讲
domain: bigdata
component: spark
topic: mllib-graphx-sparkr-non-core-api-boundaries
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-mllib-guide
  - spark-graphx-guide
  - spark-sparkr-guide
claim_ids:
  - spark-claim-0174
  - spark-claim-0176
  - spark-claim-0177
related_docs:
  - bigdata/spark/mllib-graphx-sparkr-and-non-core-api-boundaries
estimated_minutes: 10
---

# 题目

为什么 MLlib、GraphX、SparkR 不应该和 Spark SQL 主线混着讲？

# 一句话结论

MLlib、GraphX、SparkR 是 Spark 生态中的特定 API 或兼容入口，不是 Spark SQL/DataFrame/Structured Streaming 主线。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

MLlib、GraphX、SparkR 是 Spark 生态中的特定 API 或兼容入口，不是 Spark SQL/DataFrame/Structured Streaming 主线。MLlib 的 DataFrame-based spark.ml 是主 API，RDD-based spark.mllib 维护模式；GraphX 是基于属性图和 RDD 的图计算 API；SparkR 从 Spark 4.0 起 deprecated。回答时要讲清它们共享 Spark 执行资源，但发展状态、适用场景和维护边界不同。

# 必答点

1. 说明 MLlib DataFrame API 主线
2. 说明 GraphX 属性图和 Pregel 边界
3. 说明 SparkR deprecated 状态
4. 说明这些 API 与核心执行资源关系

# 常见误答

1. 把 MLlib 当成完整 MLOps 平台
2. 把 GraphX 当成图数据库
3. 把 SparkR 当成新项目推荐 API

# 延伸追问

1. MLlib 为什么还要讲数据泄漏和评估？
2. GraphX 迭代为什么要关注缓存和 checkpoint？

