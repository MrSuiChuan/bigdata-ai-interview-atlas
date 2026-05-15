---
id: q-bigdata-delta-0004
title: Reader 为什么必须先恢复 snapshot，而不是直接扫目录？
domain: bigdata
component: delta-lake
topic: metadata-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-protocol
  - delta-lake-utility
  - delta-lake-table-properties
claim_ids:
  - bigdata-delta-claim-0002
  - bigdata-delta-claim-0003
  - bigdata-delta-claim-0006
  - bigdata-delta-claim-0012
related_docs:
  - bigdata/delta-lake/metadata-state
estimated_minutes: 9
---

# 题目

Reader 为什么必须先恢复 snapshot，而不是直接扫目录？

# 标准答案

因为 Delta 的读语义是基于版本快照，而不是基于目录即时视图。Reader 读取一张 Delta 表时，实际顺序是：先去 `_delta_log` 找到最近 checkpoint，再回放 checkpoint 之后的 JSON commit，恢复出某个目标版本的完整 snapshot，然后才根据 snapshot 里的活跃文件集合、Schema 和表属性决定真正要读什么。直接扫目录只能看到“有哪些文件存在”，但看不到“哪些文件当前有效、哪些已经 remove、当前协议和元数据是什么”。

这条链路的意义非常大。第一，它让 reader 不会看到提交到一半的脏状态；第二，它让 time travel 和 restore 成为可能，因为 reader 可以明确地指向某个历史版本；第三，它让逻辑删除与物理删除分离，旧文件即使还在对象存储里，也不会因为目录扫描被误读进当前结果。

再往深一点讲，checkpoint 的价值也在这里。没有 checkpoint 时，reader 可能要从很早的版本开始重放日志；有 checkpoint 后，快照初始化成本会大幅下降。所以很多“Delta 读慢”的问题，第一步不该只是看 SQL，而要先看 snapshot 恢复路径是不是已经变得过重。

# 必答点

1. 说明 reader 先读 `_delta_log`，再恢复 snapshot。
2. 说明目录即时视图不足以代表当前表状态。
3. 说明 snapshot 恢复直接关系到一致性、time travel 和删除边界。
4. 说明 checkpoint 是读路径性能的重要组成部分。

# 加分点

1. 能说明 time travel 依赖旧日志和旧文件仍然在保留窗口内。
2. 能说明表属性也属于 reader 恢复状态的一部分。

# 常见误答

1. 认为 Delta 读路径和普通分区目录扫描本质一样。
2. 把 checkpoint 说成纯粹的“备份文件”。
3. 觉得只要对象存储里有文件，reader 就会把它读出来。

# 追问

1. 为什么 `DESCRIBE HISTORY` 不能替代真正的 snapshot 恢复？
2. 如果 checkpoint 很久没生成，会先影响什么？
3. `VACUUM` 和日志保留为什么会影响历史版本读取？