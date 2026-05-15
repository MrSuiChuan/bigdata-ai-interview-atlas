---
id: q-bigdata-iceberg-0007
title: Iceberg 的 row-level delete 为什么会带来读放大和维护压力
domain: bigdata
component: iceberg
topic: row-level-operations
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-spec
  - iceberg-spark-writes
claim_ids:
  - iceberg-claim-0027
  - iceberg-claim-0028
  - iceberg-claim-0029
  - iceberg-claim-0032
  - iceberg-claim-0033
related_docs:
  - bigdata/iceberg/row-level-changes-and-delete-files
  - bigdata/iceberg/maintenance-and-file-management
estimated_minutes: 8
---

# 题目

Iceberg 的 row-level delete 为什么会带来读放大和维护压力？

# 一句话结论

因为行级变更不再只是读取 base data file，还要同时解释 delete file 和新的 snapshot 边界，读路径与元数据都会变重。

# 核心机制

1. position delete 和 equality delete 会把删除信息单独记录下来
2. reader 需要把 data file 和 delete file 一起解释
3. delete file、多次 MERGE 和小文件积累后，必须依赖 maintenance 控制成本

# 标准答案

Iceberg 的行级删除建立在 delete file 之上，规范里至少有 position delete 和 equality delete 两类表达。这样做的好处是，很多变更不必重写整张表，但代价是读路径不再只看 data file，还要结合 delete file 判断哪些行在当前 snapshot 下仍然可见。这会带来读放大、planning 变重以及更多元数据维护压力。如果再叠加频繁的 MERGE、DELETE、UPDATE，小文件和 delete file 都会持续累积，因此必须配合 snapshot expiration、rewrite data files、rewrite manifests 等维护动作。

# 必答点

1. delete file 是正式表内容，不是临时补丁
2. 读路径需要 merge-on-read 式解释
3. 行级变更能力和 maintenance 必须一起讲

# 加分点

1. 能区分 position delete、equality delete 带来的读放大与维护压力。
2. 能顺带提到 delete file 积累后为什么常常要配合 compaction 或重写。

# 常见误答

1. 只说支持 DELETE，不说为什么读会更复杂
2. 以为 delete file 只影响写入，不影响查询成本

# 追问

1. 什么情况下 DELETE 可以退化成 metadata-only delete？
2. 为什么 MERGE INTO 往往比 INSERT OVERWRITE 更适合变化表？