---
id: q-bigdata-spark-0032
title: 为什么 Spark 写入题不能只答 save mode，而必须继续讲 commit、catalog 和外部存储语义
domain: bigdata
component: spark
topic: data-source-v2-write-commit-output-semantics
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-sql-data-sources
  - spark-sql-guide
claim_ids:
  - spark-claim-0158
  - spark-claim-0159
related_docs:
  - bigdata/spark/data-source-v2-write-commit-and-output-semantics
estimated_minutes: 10
---

# 题目

为什么 Spark 写入题不能只答 save mode，而必须继续讲 commit、catalog 和外部存储语义？

# 一句话结论

Spark 写入必须拆成 API 意图、Spark 执行、DataSource/Catalog 能力和外部系统可见性四层。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

Spark 写入必须拆成 API 意图、Spark 执行、DataSource/Catalog 能力和外部系统可见性四层。save mode 只是表达 append、overwrite、ignore 或 errorIfExists 等意图；真正的原子性、分区覆盖、失败清理、并发写入和结果可见性取决于数据源、catalog、commit protocol、表格式和底层存储。高质量回答要说明 task 可能重试，foreachBatch 或 JDBC 写入需要幂等，作业成功不等于下游业务 exactly-once。

# 必答点

1. 区分 API 意图和提交语义
2. 说明 commit protocol、catalog 和外部存储边界
3. 说明 task 重试和外部写入幂等
4. 给出输出验证证据

# 常见误答

1. 把 overwrite 当成强事务
2. 忽略对象存储、JDBC、湖仓表格式差异
3. 不讨论失败重试和重复写

# 延伸追问

1. 动态分区覆盖为什么危险？
2. foreachBatch 如何设计幂等？

