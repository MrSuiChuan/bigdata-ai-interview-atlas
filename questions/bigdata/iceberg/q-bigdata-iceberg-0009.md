---
id: q-bigdata-iceberg-0009
title: 为什么说 Iceberg 的 maintenance 是常态工作，而不是后置清理
domain: bigdata
component: iceberg
topic: maintenance
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-maintenance
claim_ids:
  - iceberg-claim-0039
  - iceberg-claim-0040
  - iceberg-claim-0041
  - iceberg-claim-0042
  - iceberg-claim-0043
related_docs:
  - bigdata/iceberg/maintenance-and-file-management
estimated_minutes: 7
---

# 题目

为什么说 Iceberg 的 maintenance 是常态工作，而不是后置清理？

# 一句话结论

因为快照历史、delete file、小文件和 manifest 都会持续增长，不治理就会同时拖慢读性能、增加元数据成本并推高存储占用。

# 核心机制

1. snapshot 不清理，旧文件引用就不会释放
2. 小文件和 delete file 积累会推高 scan 与 planning 成本
3. data file rewrite、manifest rewrite、orphan cleanup 必须纳入常态化流程

# 标准答案

Iceberg 的维护不是偶尔做一次 compaction 就够了。因为表一旦长期运行，历史 snapshots 会持续保留文件引用，行级变更会产生 delete file，流式或微批写入会制造大量小文件，manifest 也会不断膨胀。于是读路径、planning 和存储成本都会一起上升。因此必须把 expire snapshots、delete orphan files、rewrite data files、rewrite manifests 当成常态工作来设计。特别是 orphan cleanup 还有误删风险，保留窗口不能短于最长写任务时间。

# 必答点

1. maintenance 至少要区分四类动作
2. snapshot expiration 不等于立刻删所有旧文件
3. orphan cleanup 需要安全窗口

# 加分点

1. 能区分 expire snapshots、orphan cleanup、RewriteDataFiles、RewriteManifests 的职责边界。
2. 能说明维护本质上是在治理历史窗口、文件布局和 metadata 布局。

# 常见误答

1. 把 maintenance 简化成 compaction
2. 以为只要做 data rewrite 就够了

# 追问

1. manifest rewrite 和 data file rewrite 分别解决什么问题？
2. 为什么 delete 很多的表会越来越慢？