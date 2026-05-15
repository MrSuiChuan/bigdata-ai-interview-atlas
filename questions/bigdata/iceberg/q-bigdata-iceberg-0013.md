---
id: q-bigdata-iceberg-0013
title: branch 和 tag 的 retention 为什么会影响 expire snapshots 的结果
domain: bigdata
component: iceberg
topic: branch-governance
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-branching-and-tagging
  - iceberg-spec
claim_ids:
  - iceberg-claim-0057
  - iceberg-claim-0058
  - iceberg-claim-0059
  - iceberg-claim-0060
related_docs:
  - bigdata/iceberg/branch-tag-retention-schema-selection-and-wap
estimated_minutes: 7
---
# 题目

branch 和 tag 的 retention 为什么会影响 `expire snapshots` 的结果？

# 一句话结论

因为 snapshot 过期并不是只按年龄删，而是要先看哪些 snapshot 仍被 branch 或 tag 引用，以及 branch 自己要求至少保留多少祖先版本。

# 核心机制

1. branch 和 tag 都是 named snapshot references。
2. 引用可以携带自己的 retention 配置。
3. `expire snapshots` 需要先计算哪些 refs 仍然有效，再决定哪些 snapshot 能过期。

# 标准答案

Iceberg 的 `expire snapshots` 不是“按时间把旧 snapshot 删掉”这么简单。因为 branch 和 tag 本质上都是对 snapshot 的命名引用，而且它们还能带自己的 retention 配置，例如 branch 至少要保留多少祖先 snapshot、某个 ref 最长能保留多久。规范给出的过期逻辑是：先移除已经过期的 refs（main 除外），然后保留仍被有效 refs 指向的 snapshots，并为每条 branch 额外保留满足其策略要求的祖先链，最后其余 snapshot 才进入可过期范围。所以 branch/tag 之所以会影响 `expire snapshots`，根因在于它们改变了“哪些 snapshot 仍然属于有效历史”。

# 必答点

1. branch/tag 都是 snapshot reference。
2. retention 不只影响引用自身，也影响 snapshot 是否还能过期。
3. `expire snapshots` 先算引用关系，再算删除范围。

# 加分点

1. 能提到 main 分支不会过期。
2. 能顺带说明 retention 直接影响时间旅行窗口和存储成本。

# 常见误答

1. 认为 snapshot 过期只看提交时间。
2. 认为 tag 只是名字，不会影响清理策略。

# 追问

1. 默认情况下 branch 和 tag 的保留策略是什么？
2. 为什么一条长期保留的审计 branch 可能显著增加存储成本？
