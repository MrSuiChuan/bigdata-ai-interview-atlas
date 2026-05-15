---
id: q-bigdata-hive-0008
title: Hive 里为什么不能只说“开 CBO”，还必须一起讲统计和 EXPLAIN
domain: bigdata
component: hive
topic: cbo-and-explain
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - hive-language-manual-ddl
  - hive-explain
  - hive-config-properties
claim_ids:
  - hive-claim-0039
  - hive-claim-0040
  - hive-claim-0041
  - hive-claim-0042
  - hive-claim-0043
  - hive-claim-0044
related_docs:
  - bigdata/hive/statistics-cbo-and-explain
estimated_minutes: 10
---

# 题目

Hive 里为什么不能只说“开 CBO”，还必须一起讲统计和 EXPLAIN？

# 一句话结论

因为 CBO 不是凭空起作用的，它要建立在统计存在和开关启用的前提上，而 `EXPLAIN` 则是验证优化是否真的发生的直接工具。

# 核心机制

1. `ANALYZE TABLE ... COMPUTE STATISTICS FOR COLUMNS` 收集列统计
2. `DESCRIBE FORMATTED` 可验证统计是否存在
3. `hive.cbo.enable` 控制 Calcite CBO
4. `EXPLAIN` 提供 CBO、VECTORIZATION 等多个观察视角

# 标准答案

Hive 优化题如果只回答“开 CBO”，通常还不够。更完整的回答应该是一条链：先看统计信息有没有，因为 `ANALYZE TABLE ... COMPUTE STATISTICS FOR COLUMNS` 和 `DESCRIBE FORMATTED` 决定了优化器有没有可靠输入；再看 `hive.cbo.enable` 是否开启了基于 Calcite 的成本优化；最后用 `EXPLAIN` 去验证计划是不是按预期被重写、优化器是不是实际生效。也就是说，统计是输入，CBO 是决策，EXPLAIN 是验证。

# 必答点

1. 统计先行
2. CBO 开关
3. EXPLAIN 做验证

# 常见误答

1. 只说 Hive 有 CBO
2. 不知道如何收集和查看列统计
3. 不用 EXPLAIN 验证计划