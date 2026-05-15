---
id: q-bigdata-iceberg-0026
title: Iceberg v3 的 row lineage 到底新增了什么，为什么必须靠继承赋值
domain: bigdata
component: iceberg
topic: row-lineage
question_type: principle
difficulty: expert
status: reviewed
version_scope: "Iceberg table spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-spec
claim_ids:
  - iceberg-claim-0115
  - iceberg-claim-0116
  - iceberg-claim-0117
  - iceberg-claim-0118
related_docs:
  - bigdata/iceberg/row-lineage-first-row-id-and-v3-upgrade-boundaries
estimated_minutes: 9
---
# 题目

Iceberg v3 的 row lineage 到底新增了什么，为什么必须靠继承赋值？

# 一句话结论

v3 让表开始正式跟踪新行身份，核心对象包括 `next-row-id`、`_row_id` 和 `_last_updated_sequence_number`；它们之所以要靠继承赋值，是因为最终提交成功前，真正的 sequence 与起始 row id 还没稳定下来。

# 核心机制

1. v3+ 要为新创建的行维护 row lineage。
2. 关键字段是 `next-row-id`、`_row_id`、`_last_updated_sequence_number`。
3. 这些值与最终 commit 成功后的版本顺序有关，因此需要 inheritance。

# 标准答案

Iceberg v3 的 row lineage，不是简单多了两个隐藏列，而是表格式开始正式维护“新行在表生命周期里的身份”。规范要求 v3+ 表至少维护 `next-row-id`、每行唯一的 `_row_id`，以及反映最后更新版本关系的 `_last_updated_sequence_number`。之所以这些值不能在任务一开始就拍死，是因为 writer 在准备阶段还不知道最终 commit 会不会成功、sequence number 会怎样落定、这一批新行的起始 row id 最终该怎样解释。Iceberg 采用 inheritance，就是把“先写文件”和“提交后形成最终身份解释”拆开，等 snapshot commit 成功之后，再用稳定的表状态去解释这些 lineage 值。

# 必答点

1. row lineage 是 v3+ 的表级能力。
2. 关键对象不止 `_row_id`，还包括 `next-row-id` 和 `_last_updated_sequence_number`。
3. 继承赋值的根因是提交成功前最终顺序尚未稳定。

# 加分点

1. 能说明只含新行的数据文件可以暂时省略某些 lineage 列，由 reader 视作 null 再继承解释。
2. 能把这套设计和 Iceberg 一贯的“先准备、后发布”提交模型联系起来。

# 常见误答

1. 认为 row lineage 只是文件里多存了一个业务主键。
2. 认为 lineage 值在任务写文件时就已经天然确定。

# 追问

1. 为什么 row lineage 不能简单等同于业务主键？
2. 如果表还停留在 v2，为什么不能谈 v3 这一套 lineage 语义？
