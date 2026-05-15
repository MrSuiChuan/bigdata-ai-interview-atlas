---
id: q-bigdata-iceberg-0008
title: branch、tag 和 time travel 的区别应该怎么讲才不混乱
domain: bigdata
component: iceberg
topic: branching-tagging
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-branching-and-tagging
  - iceberg-spec
  - iceberg-spark-writes
claim_ids:
  - iceberg-claim-0034
  - iceberg-claim-0035
  - iceberg-claim-0036
  - iceberg-claim-0037
  - iceberg-claim-0038
related_docs:
  - bigdata/iceberg/branching-tagging-and-time-travel
estimated_minutes: 7
---

# 题目

branch、tag 和 time travel 的区别应该怎么讲才不混乱？

# 一句话结论

time travel 是读历史 snapshot，tag 是给某个 snapshot 一个稳定名字，branch 是能继续接收新提交的移动引用。

# 核心机制

1. branch/tag 本质都是 named snapshot reference
2. tag 通常固定在某个版本，branch 会继续前进
3. time travel 不一定依赖 ref，只要旧 snapshot 还有效即可

# 标准答案

讲这题时要先把 snapshot 和 ref 分开。time travel 是按历史 snapshot 去读旧版本；tag 是给某个 snapshot 起一个稳定的名字，适合审计和长期保留；branch 则是可前进的引用，可以继续承接新提交，适合 write-audit-publish、灰度验证等流程。高质量回答还要补充 retention，因为 branch 和 tag 会影响 snapshot 的保留边界和存储成本。Spark 写 branch 时，branch 也必须预先存在，写入不会自动创建它。

# 必答点

1. snapshot 是基础，ref 是命名层
2. tag 固定、branch 可前进
3. retention 和发布流程是工程价值所在

# 加分点

1. 能提到 branch/tag 还会影响 retention 与 snapshot 清理边界。
2. 能把 write-audit-publish 作为 branch 的工程价值举出来。

# 常见误答

1. 把 tag 讲成“只读 branch”
2. 把三者都说成“历史版本查询”

# 追问

1. 为什么 write-audit-publish 更适合用 branch 而不是 tag？
2. branch/tag 会怎样影响 snapshot 清理？