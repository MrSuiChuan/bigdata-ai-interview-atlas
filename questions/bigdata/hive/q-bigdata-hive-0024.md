---
id: q-bigdata-hive-0024
title: 为什么 Hive 的 Outer Join 谓词下推题不能只答“把过滤条件尽量提前”
domain: bigdata
component: hive
topic: predicate-pushdown-outer-join-storage-pushdown-vectorization-observability
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive design docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - hive-language-manual-joins
  - hive-outer-join-behavior
claim_ids:
  - hive-claim-0120
  - hive-claim-0122
  - hive-claim-0123
related_docs:
  - bigdata/hive/predicate-pushdown-outer-join-storage-pushdown-and-vectorization-observability
estimated_minutes: 11
---

# 题目

为什么 Hive 的 `Outer Join` 谓词下推题不能只答“把过滤条件尽量提前”？

# 一句话结论

因为外连接里的过滤位置会直接改变补空语义，不是单纯的性能优化动作。

# 核心机制

1. Hive 区分 preserved-row table 和 null-supplying table
2. during-join predicate 与 after-join predicate 的可推送方向不同
3. 在 `LEFT OUTER JOIN` 后把右表条件写进 `WHERE`，会把补空行过滤掉

# 标准答案

Hive 的 `Outer Join` 谓词下推题如果只答“把过滤条件尽量提前”，通常说明还没有进入语义安全层。官方 `OuterJoinBehavior` 设计文档明确把外连接相关表分成 `preserved-row table` 和 `null-supplying table`，并给出两条核心规则：during-join predicates 不能推过 preserved-row table，after-join predicates 不能推过 null-supplying table。这说明“能不能下推”首先不是性能问题，而是结果集定义问题。官方 `LanguageManual Joins` 又进一步说明 `joins occur before WHERE clauses`，所以在 `LEFT OUTER JOIN` 后，如果把右表条件写进 `WHERE`，那些本应保留的“左表有、右表无”的行，会因为右表列为 `NULL` 而在 `WHERE` 阶段被过滤掉，等于你自己把 `LEFT OUTER` 语义抵消掉了。因此成熟回答一定要把三层讲清：preserved/null-supplying 的角色划分；during-join 和 after-join 的不同下推边界；以及 `ON` 与 `WHERE` 在外连接里绝不是可随便互换的两个位置。

# 必答点

1. 说明 preserved/null-supplying 的划分
2. 说明 during-join 和 after-join 的不同规则
3. 说明 `LEFT OUTER JOIN` 右表条件放到 `WHERE` 会破坏语义

# 常见误答

1. 一上来就说“过滤越早越好”
2. 不知道 `ON` 和 `WHERE` 在外连接中不是等价的
3. 不知道 Hive planner 里有专门规则控制这件事
4. 把语义边界误说成单纯性能技巧
