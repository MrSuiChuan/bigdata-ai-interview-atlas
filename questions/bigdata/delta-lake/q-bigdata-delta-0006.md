---
id: q-bigdata-delta-0006
title: Delta 读取为什么不会看到“提交到一半”的脏数据？
domain: bigdata
component: delta-lake
topic: read-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-protocol
  - delta-lake-batch
  - delta-lake-streaming
claim_ids:
  - bigdata-delta-claim-0003
  - bigdata-delta-claim-0004
  - bigdata-delta-claim-0006
related_docs:
  - bigdata/delta-lake/read-path
estimated_minutes: 8
---

# 题目

Delta 读取为什么不会看到“提交到一半”的脏数据？

# 标准答案

因为 Delta 的读者永远是基于某个已经成功提交的 snapshot 读取，而不是盯着对象存储目录实时变化。写入阶段即便已经生成了一部分新文件，只要对应的日志版本还没正式提交，reader 恢复出的当前 snapshot 里就不会包含这些文件。这样读者看到的始终是一个稳定版本，而不是正在变化中的中间态。

这套机制本质上依赖 MVCC 思想。旧文件在新版本提交之前仍然属于旧 snapshot；新文件只有在新版本成功提交后才进入新 snapshot。所以当并发读写发生时，reader 不需要等待 writer 把每个文件都处理完，而是只需要依赖已经提交完成的版本边界。

再补一句容易忽视的点：这也解释了为什么 layout-only 的 `OPTIMIZE` 不会改变查询结果。它虽然会重写文件布局，但 reader 看到的仍然是某个完整快照，不会在过程中读到半旧半新的混合状态。

# 必答点

1. 说明 reader 基于已提交 snapshot，而不是实时目录。
2. 说明旧文件和新文件分别属于不同版本的可见性边界。
3. 说明这是快照隔离而不是目录锁定。
4. 说明布局重写不会破坏查询一致性。

# 加分点

1. 能把读路径解释到 checkpoint + JSON 回放。
2. 能顺带提到 streaming source 也是沿提交序列推进，而不是扫“新文件”。

# 常见误答

1. 认为对象存储本身保证了 Delta 的一致快照。
2. 认为 reader 必须等 writer 完全结束所有后台动作才可读。
3. 把 snapshot isolation 误说成全局序列化隔离。

# 追问

1. 如果 writer 已经落了文件，但 commit 失败，reader 为什么看不到？
2. 为什么说 `OPTIMIZE` 不改变 query result，却仍然会生成新版本？
3. 这套可见性模型和 time travel 是什么关系？