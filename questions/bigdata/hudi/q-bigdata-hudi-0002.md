---
id: q-bigdata-hudi-0002
title: timeline、instant、file group、file slice 之间到底是什么关系
domain: bigdata
component: hudi
topic: core-objects-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: Apache Hudi docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hudi-timeline-docs
  - hudi-file-layout-docs
claim_ids:
  - bigdata-hudi-claim-0003
  - bigdata-hudi-claim-0004
  - bigdata-hudi-claim-0009
related_docs:
  - bigdata/hudi/core-objects-state
  - bigdata/hudi/partition-layout
estimated_minutes: 10
---

# 题目

timeline、instant、file group、file slice 之间到底是什么关系？

# 一句话结论

timeline 和 instant 管表级版本推进，file group 管记录长期归属，file slice 管某个提交边界上的可读物理组合，这四者一起才构成 Hudi 的状态模型。

# 这题想考什么

这题考的是对象层次感。答得一般的人会把这些词平铺罗列；答得深的人会明确谁持有表状态、谁持有物理布局、谁决定读写边界。

# 回答主线

1. 先按状态所有权拆层。
2. 再讲 timeline 与 instant 的控制面关系。
3. 然后讲 file group 与 file slice 的数据面关系。
4. 最后说明为什么读写和恢复都必须同时看这两层。

# 参考作答

可以先把这四个对象分成两层。第一层是表级状态层：timeline 记录整张表发生过哪些动作，instant 是 timeline 上的具体动作单元，例如 commit、deltacommit、compaction、clean、rollback。它们回答的是“表现在处于什么版本边界”。

第二层是物理布局层：file group 是某批记录长期归属的文件组，file slice 是这个 file group 在某个提交边界上对外暴露的可读切片。对 COW 来说，slice 更接近一代代新的 base file；对 MOR 来说，slice 往往由 base file 加若干 log file 构成。

把两层串起来以后，很多问题就能解释了。比如目录里有新文件但查不到数据，往往是 instant 还没 completed；MOR 查询越来越慢，往往是 file slice 上的 log 越挂越多；恢复时不能只删文件，也是因为必须先确认哪个 instant 对哪些 slice 负责。

# 现场判断抓手

1. 看最近的 instant 类型和状态。
2. 看目标 partition 下 file group 和 file slice 的结构。
3. 区分问题是在状态层还是物理层先失衡。

# 常见误区

1. 把 file group 和 file slice 当同义词。
2. 只记对象名字，不讲它们属于哪一层。
3. 用目录存在性代替 instant 状态判断。

# 追问

1. 为什么 file slice 才是读路径真正消费的对象？
2. MOR 场景下 file slice 为什么更容易变复杂？
3. 为什么说 timeline 是恢复和排障的第一现场？
