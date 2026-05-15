---
id: q-bigdata-delta-0005
title: Delta 写入为什么必须先写文件、再提交 _delta_log？这和原子性有什么关系？
domain: bigdata
component: delta-lake
topic: write-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-protocol
  - delta-lake-concurrency-control
  - delta-lake-batch
claim_ids:
  - bigdata-delta-claim-0005
  - bigdata-delta-claim-0007
  - bigdata-delta-claim-0008
related_docs:
  - bigdata/delta-lake/write-path
estimated_minutes: 10
---

# 题目

Delta 写入为什么必须先写文件、再提交 `_delta_log`？这和原子性有什么关系？

# 标准答案

Delta 的写入路径不是“边写边让读者看见”，而是典型的 staged write + atomic commit。先把候选数据文件写出来，是为了让真正的提交动作只剩下“发布新版本”这一步；再去提交 `_delta_log`，是为了把这批候选文件一次性纳入表状态。只有日志版本提交成功，读者才会在新 snapshot 里看到这些文件，这正是表级原子性的关键。

如果反过来边写边暴露给 reader，就会出现一批文件写了一半、另一批文件还没写完、reader 却已经开始扫描的脏读问题。Delta 用“先写文件、后切换版本”的方式，把中间态藏了起来。读者要么看到旧版本，要么看到新版本，不会看到半成品。

再结合并发控制来看，这种提交模型还有第二层价值：多个 writer 可以并行准备各自的新文件，但真正决定谁成功的是提交时的乐观并发校验。也就是说，文件准备可以并行，表版本发布必须有序。这就是为什么“写文件成功”和“写表成功”是两回事。

# 必答点

1. 说明数据文件是候选结果，不等于已入表。
2. 说明真正的提交边界在 `_delta_log` 新版本。
3. 说明这种模型如何避免读者看到中间态。
4. 说明它为什么与乐观并发控制天然配合。

# 加分点

1. 能补一句“失败写入可能留下孤立文件，但不会进入快照”。
2. 能补一句“这也是原子替换比删目录重建更安全的原因”。

# 常见误答

1. 认为写入成功的标志是对象存储里多了 Parquet 文件。
2. 觉得 Delta 的事务是靠文件锁把所有 writer 串行化。
3. 把 staging 文件和最终快照混为一谈。

# 追问

1. 写入失败后目录里残留文件，为什么 reader 通常看不到？
2. overwrite、merge、restore 这些操作为什么也遵循同样的提交骨架？
3. 如果多个 writer 同时准备文件，冲突到底在什么时候被发现？