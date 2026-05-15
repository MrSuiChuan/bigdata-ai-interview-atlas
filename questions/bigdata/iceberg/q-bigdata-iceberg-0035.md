---
id: q-bigdata-iceberg-0035
title: 直接写 main 和走 write-audit-publish branch，真实取舍应该怎么讲
domain: bigdata
component: iceberg
topic: branch-governance
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-branching-and-tagging
  - iceberg-spark-writes
  - iceberg-spec
claim_ids:
  - iceberg-claim-0038
  - iceberg-claim-0057
  - iceberg-claim-0058
  - iceberg-claim-0064
  - iceberg-claim-0065
related_docs:
  - bigdata/iceberg/branching-tagging-and-time-travel
  - bigdata/iceberg/branch-tag-retention-schema-selection-and-wap
estimated_minutes: 8
---

# 题目

直接写 main 和走 write-audit-publish branch，真实取舍应该怎么讲？

# 一句话结论

直接写 main 路径更短、成本更低，但未验证结果会更快暴露给主读者；write-audit-publish branch 增加了分支治理和保留成本，却能把“写入完成”和“正式发布”明确拆开。

# 核心机制

1. WAP 模型会先把数据写到 audit branch，再验证后 fast-forward 到 main。
2. branch 是正式 metadata reference，必须预先存在。
3. branch 本身还有 retention 约束和治理成本，main 又永不过期。

# 标准答案

如果业务允许写完即对主读者开放，而且质量校验链路很轻，直接写 main 路径最短，发布成本最低。但当你需要把“结果先产生”与“结果正式发布”分成两个阶段时，write-audit-publish 的 branch 模型就更合适。它让数据先落在 audit branch 上，等验证通过后再推进到 main，这样主读者看到的仍是已验收版本。代价也要讲清楚：branch 不是免费开关，它是正式 metadata reference，必须预建，而且 retention 与生命周期治理都要跟上；如果还用 Spark 的 `spark.wap.branch`，也不能再和显式 branch 标识同时混用。所以更成熟的说法不是“branch 一定更高级”，而是“它用额外治理复杂度，换来了更清晰的发布边界”。

# 必答点

1. 直接写 main 的优势是路径短、治理成本低。
2. branch/WAP 的优势是把写入与发布显式拆开。
3. branch 有预建、保留和配置边界，不是零成本方案。

# 加分点

1. 能提到 main 永不过期，而其他 refs 受 retention 策略影响。
2. 能说明这种取舍本质上是在平衡发布安全性与流程复杂度。

# 常见误答

1. 认为 branch 只是“更麻烦一点的 tag”。
2. 认为写 branch 时如果不存在，Spark 会自动顺手创建。

# 追问

1. 为什么 tag 不适合承接 write-audit-publish 的持续写入阶段？
2. 如果 audit branch 长期不清理，会给 snapshot 保留和存储成本带来什么后果？
