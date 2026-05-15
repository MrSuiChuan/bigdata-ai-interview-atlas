---
id: q-bigdata-flink-0021
title: 为什么 Flink 的流 Join 题必须先讲 inner semantics，再讲时间边界
domain: bigdata
component: flink
topic: window-join-interval-join-time-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-joining
claim_ids:
  - flink-claim-0101
  - flink-claim-0102
  - flink-claim-0103
  - flink-claim-0104
  - flink-claim-0105
related_docs:
  - bigdata/flink/window-join-interval-join-and-time-boundaries
estimated_minutes: 10
---

# 题目

为什么 Flink 的流 Join 题必须先讲 inner semantics，再讲时间边界？

# 一句话结论

因为很多人一上来就拿离线 SQL 外连接直觉套流 join，导致对 unmatched 行和结果语义的预期全错。

# 核心机制

1. window join 和 interval join 都是 inner 语义
2. unmatched 元素不会被保留
3. interval join 还要再满足相对时间范围条件

# 标准答案

Flink 的流 Join 题如果不先讲 inner semantics，就很容易被 SQL 外连接直觉带偏。官方文档明确说明，window join 的行为像 inner join，只有两边同 key 且同窗口中的元素才会被组合输出，没有匹配的一侧不会保留；interval join 也明确只支持 inner join，同时要求右侧时间戳落在相对左侧的一段时间区间内。这说明高质量答案不能先谈“像数据库 join 一样怎么写”，而必须先定住 Flink 流 join 的语义边界，再去讲窗口或时间条件。

# 必答点

1. inner semantics
2. unmatched 不输出
3. interval join 还叠加相对时间条件

# 常见误答

1. 直接按 SQL outer join 直觉理解
2. 以为 interval join 可以做 left/right join
3. 不知道流 join 的结果本身也带时间语义
