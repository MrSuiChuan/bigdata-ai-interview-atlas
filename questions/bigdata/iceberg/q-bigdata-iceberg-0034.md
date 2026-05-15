---
id: q-bigdata-iceberg-0034
title: Iceberg 查询变慢时，应该先 RewriteDataFiles 还是先 RewriteManifests
domain: bigdata
component: iceberg
topic: maintenance-deep-dive
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and maintenance docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-maintenance
  - iceberg-reliability
  - iceberg-spec
claim_ids:
  - iceberg-claim-0042
  - iceberg-claim-0043
  - iceberg-claim-0102
  - iceberg-claim-0114
related_docs:
  - bigdata/iceberg/maintenance-and-file-management
  - bigdata/iceberg/scan-planning-persistent-tree-manifest-summaries-and-pruning
estimated_minutes: 8
---

# 题目

Iceberg 查询变慢时，应该先 `RewriteDataFiles` 还是先 `RewriteManifests`？

# 一句话结论

先看瓶颈是在文件打开和小文件层，还是在 metadata planning 层；前者优先 `RewriteDataFiles`，后者优先 `RewriteManifests`。

# 核心机制

1. `RewriteDataFiles` 解决的是小文件过多带来的文件打开开销和 metadata 体积问题。
2. `RewriteManifests` 解决的是 manifest 布局与查询模式不匹配导致的 planning 成本问题。
3. manifest 自动 compact 只在写入模式天然贴近查询过滤时效果最好。

# 标准答案

这题不能用“哪个动作更高级”来判断，而要先判断慢在什么层。如果慢的根因是小文件过多、单次查询需要打开大量 data files，那么更优先的通常是 `RewriteDataFiles`，因为它直接针对文件数量和文件大小治理。可如果真正拖慢的是 planning，也就是 manifests 和 manifest lists 虽然已经带了足够多摘要信息，但 manifest 布局本身和查询模式严重错位，那么更有效的往往是 `RewriteManifests`。Iceberg 还明确说明 manifest 会按加入顺序自动 compact，但这种自动行为只有在写入模式本来就贴近查询过滤时效果最好。因此更成熟的回答是：这不是固定先后顺序问题，而是“先判断慢在文件层还是 metadata planning 层，再选对应维护动作”。

# 必答点

1. `RewriteDataFiles` 重点治理小文件与文件打开成本。
2. `RewriteManifests` 重点治理 metadata 布局与 planning 效率。
3. 自动 manifest compact 并不总能替代主动重组。

# 加分点

1. 能补充 manifests / manifest lists 的摘要本来就支持 planning 剪枝，但布局失真后收益会下降。
2. 能提到很多真实现场是两类问题并存，需要先抓主瓶颈。

# 常见误答

1. 认为查询慢统一先做 compaction 就行。
2. 把 `RewriteManifests` 当成 data file compaction 的别名。

# 追问

1. 什么迹象更像是文件打开过多，而不是 metadata planning 失真？
2. 为什么写入模式天然贴近查询过滤时，manifest 自动 compact 更容易奏效？
