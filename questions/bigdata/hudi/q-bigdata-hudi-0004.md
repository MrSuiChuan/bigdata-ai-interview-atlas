---
id: q-bigdata-hudi-0004
title: 为什么说 .hoodie 和 timeline 才是 Hudi 表状态的第一现场
domain: bigdata
component: hudi
topic: metadata-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: Apache Hudi docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hudi-timeline-docs
  - hudi-file-layout-docs
claim_ids:
  - bigdata-hudi-claim-0004
  - bigdata-hudi-claim-0008
  - bigdata-hudi-claim-0010
related_docs:
  - bigdata/hudi/metadata-state
  - bigdata/hudi/fault-recovery
estimated_minutes: 9
---

# 题目

为什么说 `.hoodie` 和 timeline 才是 Hudi 表状态的第一现场？

# 一句话结论

因为 Hudi 的版本语义不是靠“目录里有哪些文件”决定的，而是靠 `.hoodie` 下的 timeline 和 instant 文件决定哪些动作已经成为稳定版本。

# 这题想考什么

这题考的是元数据观。答得好的人会把 catalog、目录和表内部元数据分开；答得浅的人只会说“去看表路径”。

# 回答主线

1. 先讲 catalog 元数据和 Hudi 内部元数据的区别。
2. 再讲 timeline 为什么是真相来源。
3. 然后解释恢复和读路径为什么都依赖它。
4. 最后落到排障现场。

# 参考作答

很多人一说元数据，就只想到 Hive Metastore 里的表定义。但对 Hudi 来说，catalog 解决的是“表在哪里、叫什么”，不负责解释“这张表当前哪一个版本有效”。后者主要由 `.hoodie` 目录下的 timeline 和 instant 体系承担。

timeline 记录了 commit、deltacommit、clean、rollback、compaction 等动作及其状态推进，因此它才是版本边界的真相来源。读路径要先看哪些 instant 已 completed，恢复路径也要先看哪些动作需要回滚或重试。

所以排障时如果只看数据目录，很容易把半成品文件、历史残留文件和稳定版本混在一起。更稳的做法是先看 `.hoodie` 和 timeline，再结合 file slice、查询类型和执行日志收敛问题。

# 现场判断抓手

1. 看 `.hoodie` 下最近 instant 的类型和状态。
2. 看当前查询依赖的 begin instant 或 completed 边界。
3. 区分 catalog 可见和 Hudi 表状态可见。

# 常见误区

1. 把 Hive Metastore 当成 Hudi 版本真相。
2. 先扫目录，再猜结果为什么不对。
3. 把半成品文件直接当稳定数据。

# 追问

1. 为什么 rollback 必须先回到 timeline 上判断？
2. metadata table 和 timeline 的职责为什么不能混？
3. 目录里有文件但查询不到时，第一步该看哪里？
