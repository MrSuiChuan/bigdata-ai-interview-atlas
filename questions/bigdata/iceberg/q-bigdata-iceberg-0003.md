---
id: q-bigdata-iceberg-0003
title: 为什么 Iceberg 会被称为 open table format，而不是查询引擎
domain: bigdata
component: iceberg
topic: open-table-format
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-docs-home
  - iceberg-docs-latest
claim_ids:
  - iceberg-claim-0001
  - iceberg-claim-0048
related_docs:
  - bigdata/iceberg/overview
estimated_minutes: 5
---

# 题目

为什么 Iceberg 会被称为 open table format，而不是查询引擎？

# 一句话结论

因为它的核心价值不在执行计算，而在统一定义表的元数据、版本、演进和正确性规则，让多个计算引擎共享同一张表。

# 核心机制

1. Spark、Flink、Trino、Hive 等负责执行
2. Iceberg 负责定义表状态、快照、分区和删除语义
3. 所以它是跨引擎共享的表规范，不是单个执行器

# 标准答案

Iceberg 被称为 open table format，是因为它并不自己承担查询执行，而是定义一套开放的表规范，让不同计算引擎都能基于同一套元数据和快照规则安全操作同一张表。它的价值在于表抽象、演进和正确性，而不是把 SQL 跑起来这件事本身。所以回答 Iceberg 时，重点应该放在 metadata、snapshot、schema evolution、partition evolution、delete file 和并发提交，而不是把它误讲成某种新的查询引擎。

# 必答点

1. 执行引擎和表格式分层
2. 多引擎共享同一张表语义
3. Iceberg 的核心是表规范而不是执行器

# 加分点

1. 能说明 open table format 强调的是共享元数据与演进规则。
2. 能把“不是查询引擎”与“可以被多引擎共同读取”连起来。

# 常见误答

1. 把 Iceberg 说成 Spark 的一个子模块
2. 把 open table format 讲成“开源文件格式”

# 追问

1. 多引擎共享时，真正要统一的到底是什么？
2. 为什么“大家读同一批 Parquet 文件”还不够？