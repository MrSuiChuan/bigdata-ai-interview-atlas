---
id: q-bigdata-iceberg-0020
title: format v2、format v3、position delete、equality delete、deletion vector 之间的关系怎么讲
domain: bigdata
component: iceberg
topic: spec-versioning
question_type: principle
difficulty: expert
status: reviewed
version_scope: "Iceberg table spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-spec
claim_ids:
  - iceberg-claim-0083
  - iceberg-claim-0084
  - iceberg-claim-0085
  - iceberg-claim-0086
  - iceberg-claim-0087
  - iceberg-claim-0088
  - iceberg-claim-0089
related_docs:
  - bigdata/iceberg/format-version-delete-vectors-and-sequence-number-inheritance
estimated_minutes: 10
---
# 题目

format v2、format v3、position delete、equality delete、deletion vector 之间的关系怎么讲？

# 一句话结论

v2 把 delete files 正式引入为行级变更载体，position delete 和 equality delete 都属于这条线；v3 又新增 deletion vectors，并限制未来继续新增 position delete。

# 核心机制

1. format v2 支持在 immutable data files 上做行级更新和删除。
2. position delete 按文件路径和行位置删，equality delete 按 field ID 和列值删。
3. format v3 引入 deletion vectors，且不允许再新增新的 position delete files。

# 标准答案

这题最容易被答成一串术语。更稳的讲法是先抓版本主线：Iceberg format v2 让 delete files 成为正式行级变更载体，因此 position delete 和 equality delete 开始成为表格式层标准能力。position delete 通过 data file 路径加行位置标识被删行，equality delete 则通过一个或多个 field ID 对应的列值来标识被删行。到了 format v3，规范又引入 deletion vectors，说明删除表达能力继续演进，而且 v3 不允许再新增新的 position delete files，只保留升级前已有 position deletes 的有效性。所以这几者的关系不是并列概念，而是一条“v2 建立 delete file 体系，v3 在其上继续演进删除表达能力”的版本主线。

# 必答点

1. v2 是 delete files 正式进入表格式的关键版本。
2. position delete 和 equality delete 的定位方式不同。
3. v3 新增 deletion vectors，并限制未来新增 position deletes。

# 加分点

1. 能补充 equality delete 使用的是 field ID，而不是单纯列名。
2. 能说明一个 data file 在一个 snapshot 中至多只能有一个 deletion vector。

# 常见误答

1. 把 deletion vector 说成 position delete 的别名。
2. 认为升级到 v3 之后历史 position delete 会全部失效。

# 追问

1. 为什么 v3 不再允许继续新增新的 position delete files？
2. equality delete 对使用列有什么限制边界？
