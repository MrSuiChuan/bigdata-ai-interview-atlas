---
id: q-bigdata-delta-0027
title: Delta 和相邻组件的职责边界，为什么一定要按“表协议、执行、存储、Catalog”四层讲？
domain: bigdata
component: delta-lake
topic: architecture-and-roles
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-docs
  - delta-lake-concurrency-control
  - delta-lake-catalog-managed-tables
claim_ids:
  - bigdata-delta-claim-0001
  - bigdata-delta-claim-0008
  - bigdata-delta-claim-0040
related_docs:
  - bigdata/delta-lake/architecture-and-roles
estimated_minutes: 8
---

# 题目

Delta 和相邻组件的职责边界，为什么一定要按“表协议、执行、存储、Catalog”四层讲？

# 标准答案

因为只要少了一层，回答就会开始串台。表协议层负责定义版本、snapshot、提交和兼容性；执行层负责扫描、过滤、Join、Shuffle 和流批作业；存储层负责保存日志文件和数据文件；Catalog 层负责表发现、命名和部分管理控制面。把这四层拆开之后，很多常见问题就能快速归位：读慢不一定是 Delta，也可能是执行计划；写失败不一定是 Spark，也可能是表协议冲突；表名能解析出来不等于版本状态就是 Catalog 说了算。

这也是为什么面试里很多看似简单的问题，一旦答不清边界，就会把 Spark、对象存储、Catalog 和 Delta 全部揉成一团。真正成熟的回答，一定是先分层，再谈交互。

# 必答点

1. 说明至少要拆成表协议、执行、存储、Catalog 四层。
2. 说明每一层各自回答什么问题。
3. 说明很多常见故障都发生在这些层的交界处。
4. 说明分层是为了排障和设计，而不是为了背架构图。

# 加分点

1. 能解释 catalog-managed tables 为什么会让 Catalog 角色更重。
2. 能举一例“表状态没问题，但执行层出问题”的场景。

# 常见误答

1. 把 Delta 和 Spark 讲成一个组件。
2. 认为 Catalog 就是表状态权威来源。
3. 只会画图，不会解释每层责任。

# 追问

1. 为什么“表能找到”不等于“表状态就没问题”？
2. 哪些问题最适合先看执行层，哪些先看表协议层？
3. catalog-managed tables 和传统路径表相比，边界上最重要的变化是什么？