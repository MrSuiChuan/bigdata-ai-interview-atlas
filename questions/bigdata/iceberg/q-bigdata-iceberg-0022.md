---
id: q-bigdata-iceberg-0022
title: metadata tracked cleanup、orphan cleanup、rewrite manifests 三者分别解决什么问题
domain: bigdata
component: iceberg
topic: maintenance-deep-dive
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg maintenance docs and spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-maintenance
  - iceberg-spec
claim_ids:
  - iceberg-claim-0093
  - iceberg-claim-0094
  - iceberg-claim-0095
  - iceberg-claim-0096
  - iceberg-claim-0097
  - iceberg-claim-0100
  - iceberg-claim-0101
  - iceberg-claim-0102
  - iceberg-claim-0103
  - iceberg-claim-0104
related_docs:
  - bigdata/iceberg/metadata-retention-orphan-cleanup-and-manifest-rewrite-safety
estimated_minutes: 9
---
# 题目

metadata tracked cleanup、orphan cleanup、rewrite manifests 三者分别解决什么问题？

# 一句话结论

它们分别处理“仍被 metadata log 跟踪的旧 metadata 文件”“已经脱离有效元数据树的孤儿文件”“manifest 布局与查询模式不匹配带来的 planning 成本”这三类完全不同的问题。

# 核心机制

1. tracked metadata cleanup 只处理仍被 metadata log 跟踪的旧 metadata files。
2. orphan cleanup 处理不再被有效 metadata 引用的孤儿文件。
3. rewrite manifests 处理的是 metadata 布局效率，而不是垃圾文件删除。

# 标准答案

这三件事经常被误讲成“都是清理”，但它们的对象完全不同。metadata tracked cleanup 面向的是 metadata log 里仍然登记着的旧 metadata files；它属于“正式被追踪的旧账本清理”。orphan cleanup 面向的是那些已经不在有效元数据树中、但物理上还存在的孤儿文件，它既可能是旧 metadata，也可能是旧 data/delete 文件。rewrite manifests 则根本不是删除垃圾，而是重新组织 manifest files，让 metadata 布局更贴近查询模式，降低 scan planning 成本。更准确地说，前两者偏生命周期治理，后者偏元数据性能治理。

# 必答点

1. 三者处理的对象不同。
2. orphan cleanup 不能等同于 tracked metadata cleanup。
3. rewrite manifests 的目标是 planning 效率，不是文件回收。

# 加分点

1. 能提到 delete-after-commit 只会处理仍被跟踪的 metadata files。
2. 能顺带说明 orphan cleanup 要注意 retention interval 和路径字符串一致性。

# 常见误答

1. 认为做了 expire snapshots 就不需要 orphan cleanup。
2. 认为 rewrite manifests 是 data file compaction 的另一种说法。

# 追问

1. 为什么 orphan cleanup 的保留窗口不能短于最长写作业时长？
2. 为什么路径 scheme 或 authority 变化会让 orphan cleanup 变危险？
