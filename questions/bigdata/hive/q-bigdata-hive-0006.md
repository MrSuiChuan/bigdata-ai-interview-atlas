---
id: q-bigdata-hive-0006
title: Hive ACID 事务要讲到什么程度，才算真正讲到原理层
domain: bigdata
component: hive
topic: transactions
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - hive-transactions
  - hive-managed-external-tables
claim_ids:
  - hive-claim-0018
  - hive-claim-0034
  - hive-claim-0035
  - hive-claim-0036
  - hive-claim-0037
  - hive-claim-0038
related_docs:
  - bigdata/hive/transactions-and-compaction
estimated_minutes: 10
---

# 题目

Hive ACID 事务要讲到什么程度，才算真正讲到原理层？

# 一句话结论

至少要同时讲清表类型前提、配置前提、不可逆边界和 compaction 运行机制，不能只停在“支持 `UPDATE/DELETE`”。

# 核心机制

1. 事务只支持 managed table
2. 需要 `transactional=true`
3. 需要 `DbTxnManager`、并发和动态分区相关配置
4. transactional 表不能简单改回非 ACID
5. 后台 compaction 线程是事务运行时的一部分

# 标准答案

Hive ACID 事务如果只回答成“支持 `UPDATE/DELETE`”，通常还不够。更完整的答法是：事务表只支持 managed table，并且要声明 `transactional=true`，同时还需要 `hive.txn.manager=DbTxnManager`、`hive.support.concurrency=true` 和 `hive.exec.dynamic.partition.mode=nonstrict` 等配置前提。进一步，transactional 表一旦建立就不能再简单改回非 ACID 表。最后还要补一句：事务表不是只靠建表属性就能长期运行，后台 compaction 线程和 cleaner 机制也是它的重要组成部分。

# 必答点

1. 只支持 managed table
2. 配置前提
3. compaction 也是主链路一部分

# 常见误答

1. 只说支持 `UPDATE/DELETE`
2. 不提 managed table 前提
3. 不提 compaction