---
id: q-bigdata-flink-0016
title: 为什么 Flink SQL 的动态表题必须继续讲 append、retract、upsert，而不是只说“流转表再写 SQL”
domain: bigdata
component: flink
topic: dynamic-tables-continuous-queries-changelog-encodings
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-dynamic-tables
claim_ids:
  - flink-claim-0075
  - flink-claim-0076
  - flink-claim-0077
  - flink-claim-0078
  - flink-claim-0079
related_docs:
  - bigdata/flink/dynamic-tables-continuous-queries-and-changelog-encodings
estimated_minutes: 11
---

# 题目

为什么 Flink SQL 的动态表题必须继续讲 `append`、`retract`、`upsert`，而不是只说“流转表再写 SQL”？

# 一句话结论

因为流 SQL 的真正难点是结果如何持续变化并被正确编码给下游，而不是 SQL 语法本身。

# 核心机制

1. dynamic table 是持续变化的逻辑结果
2. 有的查询只 append，有的查询会 update 历史结果
3. 下游必须通过 append、retract、upsert 等编码理解这些变化

# 标准答案

如果只回答“流先变表，再写 SQL”，通常还没有讲到 Flink SQL 的核心机制。官方文档说明，dynamic table 是持续变化的逻辑结果，continuous query 永不终止，并在任意时刻语义等价于对输入表快照执行同一条 batch query。关键难点在于结果的 changelog 语义：append query 只产生 `INSERT`，而 update query 会产生 `INSERT` 和 `UPDATE`。因此 dynamic table 在输出时必须被编码成 append、retract 或 upsert 流：retract 用撤回旧值再发送新值的方式表达更新，upsert 则要求唯一键，用单条 keyed 消息表达更新。官方还明确指出，dynamic table 转 `DataStream` 时只支持 append 和 retract。这就是为什么高质量答案必须继续讲 changelog 编码，而不能只停在“把流注册成表”。

# 必答点

1. dynamic table 和 continuous query 的关系
2. append query 与 update query 的差异
3. append / retract / upsert 的语义边界

# 常见误答

1. 把 dynamic table 当普通静态表
2. 不知道 update query 会持续修改历史结果
3. 不知道 upsert 依赖唯一键
