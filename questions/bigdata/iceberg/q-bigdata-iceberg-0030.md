---
id: q-bigdata-iceberg-0030
title: 为什么 Spark 写 Iceberg 要强调 DataSource V2，而不是把它当普通文件写出
domain: bigdata
component: iceberg
topic: spark-integration
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-spark-writes
  - iceberg-branching-and-tagging
claim_ids:
  - iceberg-claim-0030
  - iceberg-claim-0031
  - iceberg-claim-0033
  - iceberg-claim-0034
related_docs:
  - bigdata/iceberg/spark-write-path-and-sql-operations
estimated_minutes: 7
---

# 题目

为什么 Spark 写 Iceberg 要强调 DataSource V2，而不是把它当普通文件写出？

# 一句话结论

因为 Spark 对 Iceberg 的集成不是“往目录里落文件”，而是通过 DataSource V2 和 SQL 命令通道，把写入动作交给 Iceberg 去生成 data files、delete files 和新的表状态。

# 核心机制

1. Iceberg 在 Spark 中的写入入口建立在 DataSource V2 上。
2. Spark SQL 支持的 `INSERT INTO`、`DELETE FROM`、`UPDATE`、`MERGE INTO` 等操作最终都会落到 Iceberg 的表格式语义上。
3. 写 branch 时，目标 branch 也必须是 metadata 中已存在的正式引用。

# 标准答案

这题的核心不是背一个接口名，而是理解 Iceberg 在 Spark 里并不是被当成“普通文件输出路径”使用。DataSource V2 让 Spark 的 SQL 命令和 DataFrame 写入能够正式接到 Iceberg 的表格式实现上，因此一次写入最终关注的不是“目录里多了哪些文件”，而是“生成了哪些 data files、delete files、新的 metadata file，以及何时把新 snapshot 发布成当前状态”。也正因为是这条集成通道，Spark 中的 `DELETE FROM`、`UPDATE`、`MERGE INTO` 才不是临时 SQL 皮层，而是有了表格式层的正式落点。更进一步，如果写入目标是 branch，Spark 也不是写某个目录副本，而是写向已经存在的 metadata reference。 

# 必答点

1. DataSource V2 是 Spark 与 Iceberg 表语义对接的入口。
2. Spark 写 Iceberg 关注的是表状态变化，不只是文件落盘。
3. SQL 操作能成立，是因为底层有表格式语义承接。

# 加分点

1. 能顺带提到 branch 写入也通过正式 metadata reference 生效。
2. 能把这题和 `MERGE INTO`、`DELETE FROM` 的文件改写边界联系起来。

# 常见误答

1. 认为 Spark 写 Iceberg 本质上只是“把 Parquet 文件写到某个目录”。
2. 只说 DataSource V2 是新接口，不解释它为什么重要。

# 追问

1. 为什么说 Spark + Iceberg 的 DML 最终还是在改当前 snapshot 的文件集合？
2. 如果没有表格式层承接，为什么很多 SQL 看起来支持，实际很难保证多引擎一致语义？
