---
id: q-bigdata-iceberg-0001
title: 为什么 Iceberg 不是“给 Parquet 套一层壳”，而是一种 table format
domain: bigdata
component: iceberg
topic: overview
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-docs-home
  - iceberg-reliability
claim_ids:
  - iceberg-claim-0001
  - iceberg-claim-0011
  - iceberg-claim-0048
related_docs:
  - bigdata/iceberg/overview
estimated_minutes: 6
---

# 题目

为什么 Iceberg 不是“给 Parquet 套一层壳”，而是一种 table format？

# 一句话结论

因为它解决的是“很多文件如何组成一张可并发读写、可演进、可回溯的表”，而不是“单个文件怎么存”。

# 核心机制

1. 文件格式只定义单个文件编码，表格式定义整张表的元数据与版本语义
2. Iceberg 用 snapshot、manifest、metadata tree 管理表状态
3. 它还定义 schema evolution、partition evolution、delete file 和并发提交规则

# 标准答案

Iceberg 不是简单的文件格式增强，因为 Parquet 这类格式只回答单个文件怎么编码，而 Iceberg 回答的是一张分析表如何在对象存储和多引擎环境下稳定存在。它通过 metadata、snapshot、manifest 来定义表状态，通过 field ID 和 partition evolution 解决长期演进问题，通过 optimistic concurrency 解决并发提交正确性，通过 delete file 支撑行级变更。所以它本质上是 table format，而不是文件壳层。

# 必答点

1. 文件格式和表格式的职责边界
2. metadata tree 是表状态真相来源
3. 并发提交与演进能力是 table format 的一部分

# 加分点

1. 能顺带说明 object store 环境为什么会把 table format 的价值放大。
2. 能提到多引擎共享表时，真正共享的是 metadata 语义而不是目录本身。

# 常见误答

1. 只说 Iceberg 底层还是 Parquet，所以没本质区别
2. 只背 time travel，不解释表抽象升级

# 追问

1. 如果没有 table format，多引擎共享同一张表会遇到什么问题？
2. 为什么对象存储让 table format 变得更重要？