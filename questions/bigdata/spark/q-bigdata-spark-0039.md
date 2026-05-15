---
id: q-bigdata-spark-0039
title: Spark 生产排障为什么必须先分类症状，再收集证据，而不是直接调参数
domain: bigdata
component: spark
topic: production-troubleshooting-casebook
question_type: failure
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-monitoring-doc
  - spark-tuning-guide
  - spark-structured-streaming-apis
  - spark-sql-performance-tuning
claim_ids:
  - spark-claim-0180
  - spark-claim-0181
  - spark-claim-0183
related_docs:
  - bigdata/spark/production-troubleshooting-casebook
estimated_minutes: 10
---

# 题目

Spark 生产排障为什么必须先分类症状，再收集证据，而不是直接调参数？

# 一句话结论

Spark 排障要先判断症状属于 driver、executor、scheduler、shuffle、SQL plan、data source、streaming state、sink 还是外部系统。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

Spark 排障要先判断症状属于 driver、executor、scheduler、shuffle、SQL plan、data source、streaming state、sink 还是外部系统。Driver OOM、Executor OOM、FetchFailed、skew、流式延迟和写入重复的证据完全不同。正确流程是收集 Spark UI、event log、driver/executor 日志、SQL plan、task metrics、输入输出布局和外部系统日志，再基于证据提出修复，并用同一组指标复验。

# 必答点

1. 先做症状分类
2. 列出不同故障的证据入口
3. 说明修复要可复验
4. 避免直接调参

# 常见误答

1. 看到慢就加 executor
2. 看到 OOM 就只加内存
3. 不保留 event log 和 plan

# 延伸追问

1. FetchFailed 和数据倾斜如何区分？
2. Structured Streaming 延迟堆积看哪些 progress 字段？

