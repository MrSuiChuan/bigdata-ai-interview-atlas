---
id: q-bigdata-hive-0004
title: Managed Table、External Table 和 Temporary Table 的本质区别是什么
domain: bigdata
component: hive
topic: table-types
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - hive-language-manual-ddl
  - hive-managed-external-tables
  - hive-transactions
claim_ids:
  - hive-claim-0006
  - hive-claim-0008
  - hive-claim-0012
  - hive-claim-0016
  - hive-claim-0017
  - hive-claim-0018
related_docs:
  - bigdata/hive/managed-external-and-temporary-tables
estimated_minutes: 8
---

# 题目

`Managed Table`、`External Table` 和 `Temporary Table` 的本质区别是什么？

# 一句话结论

本质上是在区分数据生命周期归谁管理、当前会话可见性如何、以及 Hive 能不能对底层文件和事务边界负责。

# 核心机制

1. managed table 由 Hive 管理数据和元数据生命周期
2. external table 只由 Hive 管理元数据，不管理底层文件
3. temporary table 只在当前 session 可见并自动清理
4. 事务只支持 managed table

# 标准答案

Hive 三类表的本质区别不只是删不删数据，而是谁拥有数据生命周期。`Managed table` 由 Hive 托管，Drop 时会删元数据和数据；`external table` 只把 schema 绑定到外部文件，Drop 时只删元数据，不删底层文件；`temporary table` 只在当前 session 中可见，结束后自动删除，还会屏蔽同名永久表。进一步，事务表只能是 managed table，因为 ACID 前提要求 Hive 对底层文件生命周期有控制权。

# 必答点

1. 生命周期归属
2. session 可见性边界
3. 事务只支持 managed table

# 常见误答

1. 只说“一个删数据一个不删数据”
2. 不知道临时表会屏蔽同名永久表