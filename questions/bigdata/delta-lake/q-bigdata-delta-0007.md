---
id: q-bigdata-delta-0007
title: Delta 的 ACID 到底保证到哪一层，为什么不能把它说成全局事务系统？
domain: bigdata
component: delta-lake
topic: consistency-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-concurrency-control
  - delta-lake-faq
  - delta-lake-table-properties
claim_ids:
  - bigdata-delta-claim-0007
  - bigdata-delta-claim-0008
  - bigdata-delta-claim-0038
related_docs:
  - bigdata/delta-lake/consistency-boundaries
estimated_minutes: 10
---

# 题目

Delta 的 ACID 到底保证到哪一层，为什么不能把它说成全局事务系统？

# 标准答案

最准确的说法是：Delta 的 ACID 保证以单表为边界。它能保证同一张表上的版本提交原子、有序，读者看到一致 snapshot，并且多个 writer 并发时通过乐观并发控制来避免表状态被破坏。但它不支持传统意义上的多表事务，也不支持外键，因此不能把它回答成“整个数据平台的全局事务系统”。

这条边界在生产里非常重要。比如一个作业同时写 Delta 表、发 Kafka 消息、更新外部数据库，即便 Delta 这一步提交成功，也不代表整个链路自动一致；反过来，Delta 提交失败，也不意味着外部系统就一定没有副作用。也就是说，Delta 负责的是表内正确性，端到端一致性仍然属于上层架构设计。

再往细处讲，Delta 的并发安全不是靠大锁，而是靠 commit-time validation。多个 writer 可以同时准备写入，但如果它们改到了相同文件集合，就会在提交时冲突失败。这保护的是表语义，不是帮你把外部业务系统一起纳入事务。

# 必答点

1. 明确说出 Delta 的事务保证以单表为边界。
2. 说明它不支持多表事务和外键。
3. 说明并发控制保护的是表状态，不是跨系统副作用。
4. 说明端到端一致性仍需要上层补偿或幂等设计。

# 加分点

1. 能结合 `txnAppId` / `txnVersion` 说明表内幂等与全链路 exactly-once 不是一回事。
2. 能结合 `RESTORE` 或 `VACUUM` 说明恢复边界也受保留策略影响。

# 常见误答

1. 看到 ACID 就直接类比成关系型数据库的全局事务。
2. 认为 Delta transaction 可以顺带覆盖 Kafka、MySQL 等外部系统。
3. 不知道并发写冲突是提交时检测，而不是文件落地时就直接报错。

# 追问

1. 如果一个流作业同时写 Delta 和外部索引库，如何设计一致性？
2. 为什么说 `foreachBatch` 幂等不等于整个链路 exactly-once？
3. Delta 的 ACID 和传统数据库事务最大的不同点是什么？