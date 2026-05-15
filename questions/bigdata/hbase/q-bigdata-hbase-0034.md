---
id: q-bigdata-hbase-0034
title: 如果业务访问模式在半年后变了，为什么 HBase 表经常需要重做，而不是只加索引？
domain: bigdata
component: hbase
topic: system-design
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: HBase official docs as verified on 2026-05-09
last_verified_at: '2026-05-09'
source_ids:
  - hbase-schema-design
  - hbase-datamodel
  - hbase-book
claim_ids:
  - bigdata-hbase-claim-0001
  - bigdata-hbase-claim-0009
  - bigdata-hbase-claim-0018
related_docs:
  - bigdata/hbase/system-design
  - bigdata/hbase/comparison
estimated_minutes: 9
---

# 题目

如果业务访问模式在半年后变了，为什么 HBase 表经常需要重做，而不是只加索引？

# 一句话结论

HBase 没有靠二级索引就把访问模式完全改写的通用能力，主访问路径一旦变了，表模型通常也得重做。

# 这题想考什么

这题主要考你能不能把访问模式翻译成 RowKey、列族、容量和恢复设计，而不是只会画架构图。

# 回答主线

1. 说明 HBase 物理顺序和访问路径高度绑定 `RowKey`。
2. 说明访问模式变化常常影响整张表的热点、Region 布局和 scan 代价。
3. 说明外围索引或补丁方案很多时候不能从根上解决问题。
4. 说明必要时应重做表模型或拆到别的系统。

# 参考作答

因为 HBase 的核心设计是围绕 `RowKey` 主轴组织物理顺序和请求路径的，它不像很多关系型数据库那样天然把“主存储结构”和“多套二级索引访问路径”做成系统默认能力。访问模式一旦变化，受影响的往往不是某个查询计划，而是整张表的顺序、热点、Region 布局和 scan 成本。

比如原来主请求是按用户点查，后来变成按时间段和属性组合查历史数据，那么原有 `RowKey` 主轴可能就不再贴合主要访问模式。此时即使补一些外围索引或中间表，也常常只是局部缓解，因为底层主表仍然按旧顺序存储，热点和 scan 代价依然存在。很多情况下，更稳的方案就是承认访问模式已经变了，重新设计表模型，或者把新的分析式访问拆去别的系统。

这也是为什么 HBase 的前期建模非常关键。它不是一个“先随便存，后面再慢慢加索引纠正”的系统，而是一个“访问模式几乎直接写进物理结构”的系统。

# 现场判断抓手

1. 这是 HBase 与关系型数据库建模思维的根本区别之一。
2. 访问模式被写进物理结构”是 HBase 优势也是约束。

# 常见误区

1. 觉得后面随便加个索引就能补回来。
2. 不知道查询模式变化会反过来改变热点和布局问题。
3. 把 HBase 当成关系型数据库那样看待后期可塑性。

# 追问

1. 什么场景下你会选择补旁路索引，什么场景下必须重做主表？
2. 为什么历史包袱越重，后期改 HBase 表越贵？
3. 哪些业务一开始就不适合用 HBase 做主表？
