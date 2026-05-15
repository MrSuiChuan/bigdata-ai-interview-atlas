---
id: q-bigdata-iceberg-0024
title: 为什么说一个 manifest 只对应一个 partition spec，这对 partition evolution 有什么意义
domain: bigdata
component: iceberg
topic: scan-planning
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg table spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-spec
claim_ids:
  - iceberg-claim-0110
related_docs:
  - bigdata/iceberg/scan-planning-persistent-tree-manifest-summaries-and-pruning
estimated_minutes: 6
---
# 题目

为什么说一个 manifest 只对应一个 partition spec，这对 partition evolution 有什么意义？

# 一句话结论

因为它把“这批文件该按哪套分区规则解释”明确记录进 metadata，使旧 spec 和新 spec 的文件能在同一张表里长期共存而不混淆。

# 核心机制

1. 每个 manifest 中的文件都来自同一个 partition spec。
2. 分区 spec 变更后，旧文件保留在旧 manifest，新文件进入新 manifest。
3. reader 通过 metadata 知道每批文件该按哪套 spec 解释。

# 标准答案

partition evolution 之所以能成立，不是因为表强迫所有历史文件立刻改写成新布局，而是因为 metadata 能同时解释多代布局。一个 manifest 只对应一个 partition spec，正是这个能力的重要前提。这样当表从旧 spec 演进到新 spec 时，历史文件继续留在旧 manifest 中，新写入的数据进入新 spec 的 manifest。reader 在规划时不需要假装所有文件都来自同一种分区布局，而是可以依据 manifest 已经登记好的 spec 信息做正确解释。更直接地说，这条规则把“旧布局继续有效”从口头承诺变成了元数据可复核事实。

# 必答点

1. 一个 manifest 只对应一个 spec。
2. 分区演进后旧文件和新文件并存，但不会混淆解释。
3. 真正支撑 partition evolution 的是 metadata，而不是全表重写。

# 加分点

1. 能把这题和 hidden partitioning 联起来，说明查询层不必跟着改物理表达式。
2. 能顺带提到 manifest summary 也会帮助规划期剪枝。

# 常见误答

1. 认为分区策略一改，历史文件就必须立刻重写。
2. 认为 manifest 只是文件路径清单，不承担 spec 解释责任。

# 追问

1. 为什么 partition evolution 被说成 metadata 操作？
2. 如果查询层把旧物理分区表达式写死，会怎样削弱这套设计收益？
