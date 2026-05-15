---
id: q-bigdata-spark-0033
title: 为什么 Spark SQL 结果不对时，不能只从 AQE 和 Join 策略排查
domain: bigdata
component: spark
topic: sql-semantics-ansi-null-type-udf-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-sql-reference
claim_ids:
  - spark-claim-0162
  - spark-claim-0163
  - spark-claim-0164
related_docs:
  - bigdata/spark/sql-semantics-ansi-null-type-and-udf-boundaries
estimated_minutes: 10
---

# 题目

为什么 Spark SQL 结果不对时，不能只从 AQE 和 Join 策略排查？

# 一句话结论

AQE 和 Join 策略解决的是物理执行选择，不能替代 SQL 语义判断。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

AQE 和 Join 策略解决的是物理执行选择，不能替代 SQL 语义判断。结果不对时要先确认 ANSI mode、类型转换、Null 语义、名称解析、函数语义和 UDF 返回类型是否符合业务口径。语义层错误会在物理计划之前形成，执行再快也只会更快地产生错误结果。排查应先看 analyzed plan、schema、null 分布、cast 和过滤或 join 条件，再看 optimized/physical plan 和 runtime metrics。

# 必答点

1. 区分语义层和物理优化层
2. 说明 ANSI、类型和 Null 影响结果
3. 说明 UDF 优化器可见性边界
4. 给出 analyzed plan 和样本回归证据

# 常见误答

1. 把所有 SQL 问题都归因于 Catalyst
2. 只看 physical plan 不看 analyzed plan
3. 忽略 Null 和隐式 cast

# 延伸追问

1. ANSI mode 升级前怎么做回归？
2. UDF 为什么可能阻断优化？

