---
id: q-bigdata-iceberg-0027
title: 表升级到 Iceberg v3 之后，历史数据和 next-row-id 会发生什么
domain: bigdata
component: iceberg
topic: row-lineage
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg table spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-spec
claim_ids:
  - iceberg-claim-0119
related_docs:
  - bigdata/iceberg/row-lineage-first-row-id-and-v3-upgrade-boundaries
estimated_minutes: 6
---
# 题目

表升级到 Iceberg v3 之后，历史数据和 `next-row-id` 会发生什么？

# 一句话结论

升级到 v3 时，`next-row-id` 会从 0 初始化，但历史 snapshots 不会被改写，升级前行在读取时 row id 仍可能是 null。

# 核心机制

1. v3 升级不会回写历史 snapshots。
2. `next-row-id` 初始化为 0，为升级后的新写入建立起点。
3. 升级前历史行读取时可以表现为 null row ids。

# 标准答案

Iceberg 把 row lineage 设计成“从升级后开始建立”的能力，而不是“升级时给历史所有行补造身份”的能力。规范明确规定，表升级到 format v3 时，`next-row-id` 会初始化为 0，用来给后续新写入的数据分配行身份；但已有 snapshots 不会因此被修改，升级前那些历史行在读取时可能仍然表现为 null row IDs。这个边界很重要，因为它说明 v3 升级不是一次回填工程，而是给未来提交建立新的 lineage 规则。

# 必答点

1. 升级不会改写历史 snapshots。
2. `next-row-id` 初始化为 0。
3. 历史行可能仍然读成 null row IDs。

# 加分点

1. 能说明这体现了 Iceberg 对历史兼容和升级成本的权衡。
2. 能顺带提到新行的 lineage 语义只从升级后的提交开始逐步建立。

# 常见误答

1. 认为升级到 v3 后历史全量数据都会立刻拥有 `_row_id`。
2. 认为 `next-row-id` 代表历史数据总行数。

# 追问

1. 为什么这种升级方式比“回填所有历史行身份”更现实？
2. 如果业务一定要求历史行也有稳定身份，为什么这已经超出 v3 升级本身的默认语义？
