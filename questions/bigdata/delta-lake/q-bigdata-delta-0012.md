---
id: q-bigdata-delta-0012
title: Delta 性能问题为什么不能只归因于 Spark 或只归因于小文件？
domain: bigdata
component: delta-lake
topic: performance-model
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-protocol
  - delta-lake-optimizations
  - delta-lake-best-practices
claim_ids:
  - bigdata-delta-claim-0006
  - bigdata-delta-claim-0028
  - bigdata-delta-claim-0029
  - bigdata-delta-claim-0041
related_docs:
  - bigdata/delta-lake/performance-model
estimated_minutes: 10
---

# 题目

Delta 性能问题为什么不能只归因于 Spark 或只归因于小文件？

# 标准答案

因为 Delta 的性能本身就是“元数据恢复 + 文件布局 + 执行引擎计划”三层联合作用。只归因于 Spark，会忽略日志长度、checkpoint、分区设计、统计信息和 Z-Order 这些 Delta 层因素；只归因于小文件，又会忽略 Spark 物理计划、Shuffle、Join 和资源争用。

更完整的性能模型应该这样拆：先有 snapshot 恢复成本，也就是 reader 需要花多少代价把当前版本状态还原出来；再有文件定位和裁剪成本，也就是分区、列裁剪、统计信息和数据跳过到底减少了多少扫描范围；最后才是 Spark 等执行引擎真正把这些文件读进来、完成过滤聚合和后续算子的执行成本。

所以面试里更成熟的回答不是“调个 Spark 参数”或“跑一次 OPTIMIZE”，而是先把慢拆到阶段上，再决定该治哪一层。

# 必答点

1. 说明 Delta 性能至少分元数据、布局、执行三层。
2. 说明只盯 Spark 或只盯小文件都不完整。
3. 说明 snapshot 恢复成本本身就是性能模型的一部分。
4. 说明调优前先做阶段归因。

# 加分点

1. 能提到统计信息和数据跳过为什么会影响扫描上限。
2. 能提到流表还要额外考虑保留和恢复窗口对性能的影响。

# 常见误答

1. 认为 Delta 性能慢就一定是对象存储或 Spark 参数问题。
2. 认为只要把小文件合掉，所有性能问题都会解决。
3. 完全不提 checkpoint 和日志回放成本。

# 追问

1. 如果一张表历史很长但文件并不碎，为什么仍然可能变慢？
2. Z-Order 为什么不是跑一次就永远有效？
3. 如何判断瓶颈先落在表布局还是执行计划？