---
id: q-bigdata-hive-0010
title: Hive Materialized View 题为什么一定要讲 rewrite、rebuild 和增量维护边界
domain: bigdata
component: hive
topic: materialized-view
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - hive-materialized-views
claim_ids:
  - hive-claim-0055
  - hive-claim-0056
  - hive-claim-0057
  - hive-claim-0058
  - hive-claim-0059
  - hive-claim-0060
  - hive-claim-0061
related_docs:
  - bigdata/hive/materialized-views-and-rewrite
estimated_minutes: 10
---

# 题目

Hive Materialized View 题为什么一定要讲 rewrite、rebuild 和增量维护边界？

# 一句话结论

因为 Hive MV 的价值不只是“提前算好一张表”，而在于优化器是否会自动用它、刷新时走增量还是全量、以及哪些变更会打断这条快路径。

# 核心机制

1. MV 默认可参与 automatic query rewrite
2. `DISABLE REWRITE` 可以关闭自动改写
3. `REBUILD` 负责刷新
4. 默认先尝试增量刷新，再在必要时回退全量刷新
5. `UPDATE/DELETE` 会强制 full rebuild

# 标准答案

Hive Materialized View 题如果只回答“预计算结果表”，通常不够。更完整的主线是：它默认是否参与 automatic query rewrite，是否被标成 stale，刷新时通过 `ALTER MATERIALIZED VIEW ... REBUILD` 是走增量还是全量，以及哪些 source 变化会打断增量维护。官方明确指出，Hive 会先尝试 incremental rebuild，不行再回退 full rebuild；当前只有 `INSERT` 类变化支持增量维护，`UPDATE` 和 `DELETE` 会强制全量重建，而且 rebuild 期间还会持有 exclusive lock。因此真正值钱的不是“有 MV”，而是优化器敢不敢用它、运维能不能稳地维护它。

# 必答点

1. automatic rewrite
2. rebuild 机制
3. INSERT 与 UPDATE/DELETE 的增量边界

# 常见误答

1. 只说是预计算表
2. 不知道 stale MV 默认不会参与自动改写
3. 不知道 `UPDATE/DELETE` 会打断增量维护