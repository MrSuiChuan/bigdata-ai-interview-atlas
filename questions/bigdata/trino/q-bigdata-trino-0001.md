---
id: q-bigdata-trino-0001
title: 为什么说 Trino 首先是分布式 SQL 查询引擎，而不是存储系统
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: overview
question_type: principle
difficulty: intermediate
source_ids:
  - trino-docs
  - trino-architecture-docs
  - trino-connector-docs
claim_ids:
  - bigdata-trino-claim-0001
  - bigdata-trino-claim-0003
  - bigdata-trino-claim-0004
  - bigdata-trino-claim-0020
related_docs:
  - bigdata/trino/overview
estimated_minutes: 8
---

# 题目

为什么说 Trino 首先是分布式 SQL 查询引擎，而不是存储系统？

# 一句话结论

因为 Trino 拥有的是 SQL 解析、优化、调度和联邦执行能力，而数据语义、事务与持久化边界仍然掌握在 connector 和底层系统手里。

# 这题想考什么

这题主要考你能不能先把系统定位说准，再把 Trino 和 Spark、ClickHouse、Iceberg 这类相邻角色拉开。如果一上来就说“它能查很多源”，深度还不够。

# 回答主线

1. 先定性：Trino 是查询引擎，不是存储系统。
2. 再讲对象：Coordinator、Worker、Catalog、Connector 各自负责什么。
3. 再讲链路：SQL 如何从解析一路走到 stage、task、split 执行。
4. 最后讲边界：一致性、写入语义和事务为什么不能脱离底层系统讨论。

# 参考作答

更稳的答法是先把定位拉正。Trino 真正拥有的是查询控制面和执行面：Coordinator 负责解析、分析、优化和调度，Worker 负责执行 task 和处理 split，Catalog 与 Connector 负责把外部系统接进来。也就是说，它擅长的是把一条 SQL 变成分布式执行计划，而不是把外部数据重新存进自己的存储体系。

接着要把边界讲清楚。Trino 不会替底层数据源创建一个新的全局事务模型，也不会天然拥有 Iceberg、Delta、Hudi 这类表格式自己的元数据与快照语义。它只能暴露 connector 和底层系统真正支持的能力。所以回答这题时，重点不在“能连多少源”，而在“它负责执行，数据和语义归底层”。

# 现场判断抓手

1. 能主动提到 Catalog / Connector 是边界适配层，而不是“驱动程序”。
2. 能说明 Trino 不统一提供跨异构数据源的事务一致性。
3. 能把 SQL -> Coordinator -> Worker -> source 这条链路讲出来。

# 常见误区

1. 把 Trino 说成数据库本体。
2. 把表格式或底层存储的能力算到 Trino 身上。
3. 只会说联邦查询，不会说状态与职责边界。

# 追问

1. 如果底层表是 Iceberg，哪些语义来自 Iceberg，哪些来自 Trino？
2. 如果一个查询跨两个 catalog，为什么不能自动理解成统一事务？
3. Trino 和 Spark SQL 的分工边界应该怎么讲？
