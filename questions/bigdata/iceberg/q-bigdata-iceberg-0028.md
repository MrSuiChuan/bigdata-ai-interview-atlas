---
id: q-bigdata-iceberg-0028
title: 为什么通过 equality delete 表达的更新不会保留原始 row lineage
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
  - iceberg-claim-0120
related_docs:
  - bigdata/iceberg/row-lineage-first-row-id-and-v3-upgrade-boundaries
estimated_minutes: 6
---
# 题目

为什么通过 equality delete 表达的更新不会保留原始 row lineage？

# 一句话结论

因为在 Iceberg 表语义里，这类更新会被解释成“删掉旧行，再加入一条拥有新身份的新行”，而不是同一行原地延续身份。

# 核心机制

1. equality delete 表达的是按字段值删掉旧行。
2. 新写入的更新结果是新的行对象。
3. row lineage 只对新创建行赋予新的唯一身份，不会自动继承旧行身份。

# 标准答案

Iceberg 在 row lineage 上有一个很重要的边界：并不是所有业务上看起来像“更新”的动作，都会被格式层解释成“同一行继续存在，只是值变了”。对于通过 equality delete 表达的更新，规范把它看成旧行被删除，同时又新增了一条满足新状态的新行。因此，新的行会拥有自己的新 lineage 身份，而不是继承被删旧行的原始 row lineage。这个设计说明 row lineage 关注的是表格式层如何解释行对象的生命周期，而不是尽力模拟关系型数据库里的原地更新错觉。

# 必答点

1. equality delete 先移除旧行。
2. 更新结果在格式层会被看成新行写入。
3. 所以原始 lineage 不会自动保留。

# 加分点

1. 能顺带比较“业务语义上的更新”和“表格式语义上的旧行删除 + 新行创建”。
2. 能说明这也是为什么不能把 row lineage 简化成业务主键历史。

# 常见误答

1. 认为 equality delete 的更新天然等于原地修改。
2. 认为只要 key 没变，row lineage 就一定不变。

# 追问

1. 为什么这个边界对做审计解释时很重要？
2. position delete 和 equality delete 在 lineage 解释上最大的差别是什么？
