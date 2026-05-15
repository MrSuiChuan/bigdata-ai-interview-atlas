---
id: q-bigdata-delta-0030
title: Delta 的 Schema 题为什么不能只答“支持 mergeSchema”？
domain: bigdata
component: delta-lake
topic: schema-evolution-constraints-and-column-mapping
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-batch
  - delta-lake-constraints
  - delta-lake-column-mapping
claim_ids:
  - bigdata-delta-claim-0019
  - bigdata-delta-claim-0022
  - bigdata-delta-claim-0044
  - bigdata-delta-claim-0045
  - bigdata-delta-claim-0047
related_docs:
  - bigdata/delta-lake/schema-evolution-constraints-and-column-mapping
estimated_minutes: 10
---

# 题目

Delta 的 Schema 题为什么不能只答“支持 `mergeSchema`”？

# 标准答案

因为 Schema 相关问题真正考的是四层边界：默认怎么校验、什么时候允许演进、约束如何拦截脏数据、以及列身份变更是否会影响兼容性。只答 `mergeSchema=true`，最多说明你知道某种写时扩列手段，但还远远没有讲到 Schema 治理的本体。

官方 batch 文档明确说明，Delta 默认会先做 Schema enforcement：额外列会报错、缺失目标列会写 `null`、类型必须兼容、列名不能只靠大小写区分。这说明 Delta 的第一原则是保护表语义，而不是无条件吞下上游变化。只有在明确允许的场景下，才谈得上 Schema evolution。

再往生产里落，Schema 变更还会直接影响流作业。官方文档明确指出，更新表 Schema 后，读取该表的流会终止，需要重启。若表还启用了 column mapping，非新增型 Schema 变化对 Structured Streaming 的要求更高。也就是说，Schema 变更不是“改完就算了”，而是一场影响下游契约的发布事件。

# 必答点

1. 说明默认先做 Schema enforcement，再谈 evolution。
2. 说明 `mergeSchema` 只是写时演进的一种手段。
3. 说明约束可以把脏数据拦在写入边界。
4. 说明 Schema 变更会影响流作业，column mapping 还会带来协议风险。

# 加分点

1. 能讲清 column mapping 为什么不仅是“改列名方便”。
2. 能区分默认值、生成列、身份列各自改变的边界。

# 常见误答

1. 认为 Delta 默认会自动接住所有新列。
2. 完全不提约束和流重启边界。
3. 把 column mapping 当作零成本元数据增强。

# 追问

1. 为什么 column mapping 开启后是兼容性工程变更？
2. 约束和 Schema enforcement 的角色分别是什么？
3. 身份列为什么会反过来影响并发设计？