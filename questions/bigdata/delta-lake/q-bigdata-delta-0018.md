---
id: q-bigdata-delta-0018
title: 面试里怎么比较 Delta、裸 Parquet 目录和传统数据库事务思维？
domain: bigdata
component: delta-lake
topic: comparison
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-docs
  - delta-lake-faq
  - delta-lake-protocol
claim_ids:
  - bigdata-delta-claim-0001
  - bigdata-delta-claim-0002
  - bigdata-delta-claim-0004
  - bigdata-delta-claim-0038
related_docs:
  - bigdata/delta-lake/comparison
estimated_minutes: 9
---

# 题目

面试里怎么比较 Delta、裸 Parquet 目录和传统数据库事务思维？

# 标准答案

比较 Delta 最有价值的角度，不是罗列命令，而是比较“真相来源”和“治理成本”。裸 Parquet 目录通常依赖目录列举和人为约定来判断哪些文件属于当前表；Delta 则把真相来源收敛到 `_delta_log`，用版本和 snapshot 来定义当前表状态。所以 Delta 相比裸目录，最大的进步不是功能数量，而是把原本脆弱、隐式的规则变成了正式表协议。

再和传统数据库事务思维比较，Delta 确实借用了事务数据库的原子提交和一致快照思想，但它的底层仍然是对象存储文件，不是页式存储引擎；它的事务范围主要是单表，不支持多表事务和外键；它的 DML 本质上仍然是文件级重写或逻辑删除，而不是原地更新。所以更准确的说法是：Delta 继承了数据库里的事务边界思想，但不是通用 OLTP 数据库的等价替身。

这种比较方式更成熟，因为它能直接回答“为什么要用 Delta”和“为什么不能把它当数据库或当普通目录”。

# 必答点

1. 说明裸目录和 Delta 的根本差异在真相来源。
2. 说明 Delta 和数据库相同的是事务边界思想，不同的是底层载体和范围。
3. 说明 Delta 的治理价值来自协议化，而不是单纯命令增多。
4. 说明单表事务边界不能被夸大成数据库级全局能力。

# 加分点

1. 能把 time travel、restore、CDF 回到“版本历史”这条主线解释。
2. 能把“为什么不是全局事务数据库”讲得很克制准确。

# 常见误答

1. 只说“Delta 比 Parquet 多 ACID”。
2. 把 Delta 直接类比成数据库替代品。
3. 对比只停留在语法层，不谈真相来源。

# 追问

1. Delta 和裸 Parquet 最大的工程差异究竟是什么？
2. 为什么说 Delta 更像表协议，而不是数据库实例？
3. 如果业务要跨两张表同时事务更新，Delta 为什么不能直接接住？