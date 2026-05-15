---
id: q-bigdata-trino-0012
title: Trino 性能题为什么要先谈扫描量和计划质量
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: performance-model
question_type: principle
difficulty: advanced
source_ids:
  - trino-pushdown-docs
  - trino-cost-based-optimizations-docs
claim_ids:
  - bigdata-trino-claim-0006
  - bigdata-trino-claim-0009
  - bigdata-trino-claim-0010
  - bigdata-trino-claim-0011
  - bigdata-trino-claim-0023
related_docs:
  - bigdata/trino/performance-model
estimated_minutes: 10
---

# 题目

Trino 性能题为什么要先谈扫描量和计划质量？

# 一句话结论

因为 Trino 的第一成本往往是读了多少不该读的数据，以及优化器是否拿着正确的 stats 选了合理的 join 与 exchange 策略。

# 这题想考什么

这题考的是你能不能从工作量模型回答性能问题，而不是上来就背内存参数。

# 回答主线

1. 先讲扫描量和 pushdown。
2. 再讲 stats 对 join 选择的影响。
3. 再讲 exchange 与广播 / 分区 join 的代价。
4. 最后再落到治理和参数。

# 参考作答

Trino 的性能第一原则不是“先调参数”，而是“先减少不该做的工作”。如果过滤没下推、列没裁剪、底层布局又很差，那么查询一开始就输在扫描量上。

接着要看计划质量。cost-based optimization 非常依赖统计信息，stats 不准时，join 顺序和 join distribution 很容易选错，进而放大 exchange 和内存压力。所以更成熟的性能回答一定是：先看 scan、pushdown、stats、join 和 exchange，最后才看内存、spill、资源组这些执行层和治理层参数。

# 现场判断抓手

1. 能把 scan、pushdown、stats、join、exchange 串成一条因果链。
2. 能解释 broadcast join 和 partitioned join 的取舍。
3. 能指出 explain / show stats 是性能题证据入口。

# 常见误区

1. 一上来就讲 JVM、线程或 Worker 数量。
2. 把性能完全当成运行时资源问题。
3. 不讲计划质量。

# 追问

1. 为什么 stats 缺失会让 broadcast join 成为风险？
2. join-max-broadcast-table-size 在这里起什么作用？
3. 什么时候资源组问题会伪装成性能问题？
