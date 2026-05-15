---
id: q-bigdata-iceberg-0025
title: manifest list 里的 partition field summary 和谓词下推之间是什么关系
domain: bigdata
component: iceberg
topic: scan-planning
question_type: principle
difficulty: expert
status: reviewed
version_scope: "Iceberg table spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-spec
claim_ids:
  - iceberg-claim-0111
  - iceberg-claim-0112
  - iceberg-claim-0113
  - iceberg-claim-0114
related_docs:
  - bigdata/iceberg/scan-planning-persistent-tree-manifest-summaries-and-pruning
estimated_minutes: 8
---
# 题目

manifest list 里的 partition field summary 和谓词下推之间是什么关系？

# 一句话结论

因为查询条件会先被转成针对 partition tuple 的谓词，而 manifest list 提供的 partition summaries 又让规划器能在展开具体文件之前先排除大量不可能命中的 manifests。

# 核心机制

1. 行过滤条件会先转换成 partition predicates。
2. manifest list 保存每个 manifest 的 partition field summaries。
3. 规划器依据 summary 决定哪些 manifests 值得继续下钻。

# 标准答案

Iceberg 的谓词下推不是等到打开 data file 之后才开始。规划阶段会先把行级过滤条件转换成对 partition tuple 的判断，再借助 manifest list 里的 partition field summaries 做第一轮排除。这些 summaries 包括 `contains_null`、`contains_nan`、`lower_bound`、`upper_bound` 等信息，足够让规划器先判断某个 manifest 是否可能命中当前查询。如果一整个 manifest 的边界信息已经说明它不可能命中，那么系统甚至不需要展开到文件级别再看。因此，这题的关键不是单纯背字段名，而是说明“summary 让下推发生在真正读文件之前”。

# 必答点

1. 查询过滤会先转成 partition 维度判断。
2. manifest list 的 summary 是规划期第一轮剪枝依据。
3. 这能减少不必要的 manifest 和 data file 读取。

# 加分点

1. 能补充 lower/upper bound 以字节形式按数据类型序列化。
2. 能说明全 null 或 NaN 时某些边界字段会是 null。

# 常见误答

1. 认为谓词下推只发生在 Parquet/ORC 文件扫描层。
2. 认为 manifest list 只是 manifest 路径列表，没有规划价值。

# 追问

1. 为什么 delete manifests 也会影响 planning 成本？
2. 如果 partition design 很差，这些 summaries 为什么也救不了所有查询？
