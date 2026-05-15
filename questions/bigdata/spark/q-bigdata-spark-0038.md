---
id: q-bigdata-spark-0038
title: 为什么 Spark Declarative Pipelines 不是另一个计算引擎，而是声明式管道编排入口
domain: bigdata
component: spark
topic: declarative-pipelines-sdp-flow-dataset-orchestration-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-declarative-pipelines-guide
claim_ids:
  - spark-claim-0178
  - spark-claim-0179
related_docs:
  - bigdata/spark/declarative-pipelines-sdp-flow-dataset-and-orchestration-boundaries
estimated_minutes: 10
---

# 题目

为什么 Spark Declarative Pipelines 不是另一个计算引擎，而是声明式管道编排入口？

# 一句话结论

Spark Declarative Pipelines 引入 flow、dataset、pipeline project 和 CLI，让用户声明目标数据集和依赖关系，由 pipeline 做分析和编排。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

Spark Declarative Pipelines 引入 flow、dataset、pipeline project 和 CLI，让用户声明目标数据集和依赖关系，由 pipeline 做分析和编排。它底层仍基于 Spark，不替代 Spark SQL、Structured Streaming 或数据源语义。storage、catalog、database、checkpoint、权限、外部 source/sink 仍需要配置和验证。dry-run 能发现部分语法和分析错误，但不能证明真实数据、权限和性能都没问题。

# 必答点

1. 说明 flow、dataset、pipeline project
2. 说明底层仍是 Spark
3. 说明 storage/catalog/checkpoint 边界
4. 说明 dry-run 与生产运行差异

# 常见误答

1. 把 SDP 当作新执行引擎
2. 认为 dry-run 等于发布成功
3. 忽略 checkpoint 和 catalog 配置

# 延伸追问

1. Streaming table 和 materialized view 有什么区别？
2. 声明式管道如何处理外部副作用？

