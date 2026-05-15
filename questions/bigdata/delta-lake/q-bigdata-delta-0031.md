---
id: q-bigdata-delta-0031
title: 为什么 MERGE 是 Delta 里最能拉开深度差距的一道题？
domain: bigdata
component: delta-lake
topic: dml-merge-delete-vectors
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-update
  - delta-lake-deletion-vectors
  - delta-lake-concurrency-control
claim_ids:
  - bigdata-delta-claim-0009
  - bigdata-delta-claim-0024
  - bigdata-delta-claim-0025
  - bigdata-delta-claim-0046
related_docs:
  - bigdata/delta-lake/dml-merge-delete-vectors
estimated_minutes: 10
---

# 题目

为什么 `MERGE` 是 Delta 里最能拉开深度差距的一道题？

# 标准答案

因为 `MERGE` 表面上像一条 upsert SQL，底层却同时考验你对文件定位、DML 语义、冲突边界、删除向量和源数据质量的理解。真正深入的回答，不会停留在“匹配就更新、不匹配就插入”，而会继续讲：它先根据匹配条件定位目标文件和目标行，然后决定是重写文件还是利用 deletion vectors 先记录逻辑删除，最后再把结果提交成新版本。

这道题最有价值的一条官方边界，是 merge 在多个 source row 同时匹配一个 target row 并尝试更新时会失败，因为结果变得歧义。这说明 merge 的稳定性不只依赖 Delta 本身，还依赖源数据是否已经按业务主键去重。很多 CDC 链路真正的坑，不在 SQL 写法，而在源数据质量。

如果表启用了 deletion vectors，还要补一句：DV 的价值是把一部分行级变化从“立即重写大文件”变成“先记录逻辑删除”，降低即时写放大；但后续仍然需要 `OPTIMIZE`、`REORG ... APPLY PURGE` 等维护手段把逻辑变化物理化。所以 `MERGE` 不是一条孤立 SQL，而是写路径与维护路径交汇的典型题。

# 必答点

1. 说明 merge 底层不是原地改行，而是文件级或逻辑行级变更。
2. 说明 source 多行命中同一 target row 的歧义失败边界。
3. 说明 deletion vectors 的价值和限制。
4. 说明 merge 的稳定性依赖源数据去重和并发环境。

# 加分点

1. 能说明 append-only 表会直接改变 DML 边界。
2. 能说明 merge 常和 CDC 设计、下游增量消费一起讨论。

# 常见误答

1. 只会背 `MERGE INTO ... WHEN MATCHED ...` 语法。
2. 认为 merge 就像数据库里原地 update。
3. 完全不提 source 歧义和 DV。

# 追问

1. 为什么说 merge 常常先暴露的是源数据问题，而不是 Delta 问题？
2. DV 启用后，为什么仍然不能忘掉后续维护？
3. merge 失败时，如何区分是并发冲突还是 source 歧义？