---
id: q-bigdata-trino-0007
title: Trino 的一致性边界为什么必须回到底层数据源来回答
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: consistency-boundaries
question_type: system-design
difficulty: advanced
source_ids:
  - trino-docs
  - trino-connector-docs
claim_ids:
  - bigdata-trino-claim-0020
  - bigdata-trino-claim-0022
related_docs:
  - bigdata/trino/consistency-boundaries
estimated_minutes: 10
---

# 题目

Trino 的一致性边界为什么必须回到底层数据源来回答？

# 一句话结论

因为 Trino 负责的是查询执行，不会在多个异构系统之上自动创造一个新的全局事务和一致性模型。

# 这题想考什么

这题考的是边界意识。答得成熟的人，会主动把一致性问题拆回 connector 和源系统；答得浅的人会把 SQL 引擎误讲成事务平台。

# 回答主线

1. 先给出结论：Trino 不提供跨异构全局事务。
2. 再讲读取和写入都要回到底层系统语义。
3. 再讲跨 catalog 查询为什么更不能想当然。
4. 最后讲调用方责任。

# 参考作答

更稳的答法是先把边界说死：Trino 不会把 MySQL、Hive、Iceberg、Kafka 这类完全不同的数据源统一成一个新的全局事务世界。它只是在查询层把这些系统连接起来。

这意味着一致性问题一定要回到底层系统。读路径上，某张表什么时候可见、快照边界怎么定义，取决于底层表格式和源系统；写路径上，Trino 也只能暴露 connector 真正支持的提交语义。尤其是跨 catalog 查询，更不能把“能在一条 SQL 里查到”误答成“已经具备统一事务保证”。

# 现场判断抓手

1. 能主动区分“查询能联邦执行”和“事务能统一保证”。
2. 能提到底层表格式和源系统决定可见性。
3. 能补充调用方仍要承担幂等、补偿和业务校验。

# 常见误区

1. 把 Trino 当成全局事务层。
2. 看到一条 SQL 查多源，就默认强一致。
3. 不讲调用方责任和底层能力边界。

# 追问

1. 如果底层是 Iceberg 与 MySQL 混查，一致性该怎么描述？
2. 为什么能写 MERGE 不等于拥有统一事务模型？
3. 面试官追问“那 Trino 保证什么”，你会怎么答？
