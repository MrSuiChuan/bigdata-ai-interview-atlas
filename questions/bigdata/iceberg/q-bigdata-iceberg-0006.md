---
id: q-bigdata-iceberg-0006
title: Iceberg 的 optimistic concurrency 和 commit conflict 应该怎么理解
domain: bigdata
component: iceberg
topic: concurrency
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-reliability
claim_ids:
  - iceberg-claim-0015
  - iceberg-claim-0016
  - iceberg-claim-0017
  - iceberg-claim-0018
related_docs:
  - bigdata/iceberg/write-model-and-optimistic-concurrency
estimated_minutes: 8
---

# 题目

Iceberg 的 optimistic concurrency 和 commit conflict 应该怎么理解？

# 一句话结论

它不是“没有冲突”，而是“先乐观地准备提交，在 commit 点验证假设，冲突时重试或失败”。

# 核心机制

1. writer 先读取当前表状态并生成新元数据
2. commit 时原子切换 metadata 指针
3. 如果当前状态已被别人推进，就重新验证 assumptions 是否仍然成立

# 标准答案

Iceberg 的 optimistic concurrency 是指 writer 不会先锁住整张表，而是先基于当前 snapshot 准备好新数据和新元数据，在 commit 时尝试原子地切换 metadata 指针。一次写入不仅有 actions，还有 assumptions；如果提交时发现表已经被别的 writer 改到了新的状态，就必须重新读取最新 metadata，并验证这些 assumptions 是否仍成立。成立则可重试，不成立则冲突失败。所以它的重点不是“没有锁”，而是“冲突在 commit 校验点被发现”。

# 必答点

1. atomic metadata swap
2. assumptions + actions
3. retry 前要重新验证，而不是直接覆盖

# 加分点

1. 能提到 assumptions / actions 是冲突校验骨架。
2. 能补充 manifest 不可变和 commit retry 复用之间的关系。

# 常见误答

1. 把 optimistic concurrency 讲成“完全无冲突”
2. 只说会 retry，不说 retry 需要基于最新状态重算或重验

# 追问

1. 为什么 compaction 也可能和正常写入冲突？
2. 为什么这种模型特别适合对象存储？