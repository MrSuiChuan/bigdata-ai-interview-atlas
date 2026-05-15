---
id: q-bigdata-delta-0021
title: 为什么 Delta 不能被当成计算引擎本身，也不能被当成普通 Parquet 目录？
domain: bigdata
component: delta-lake
topic: comparison
question_type: comparison
difficulty: intermediate
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-docs
  - delta-lake-protocol
  - delta-lake-faq
claim_ids:
  - bigdata-delta-claim-0001
  - bigdata-delta-claim-0002
  - bigdata-delta-claim-0004
  - bigdata-delta-claim-0038
related_docs:
  - bigdata/delta-lake/overview
  - bigdata/delta-lake/comparison
estimated_minutes: 8
---

# 题目

为什么 Delta 不能被当成计算引擎本身，也不能被当成普通 Parquet 目录？

# 标准答案

因为 Delta 的定位恰好卡在这两者之间。它不是计算引擎，所以不负责 Join、Shuffle、任务调度和资源管理；它也不是普通 Parquet 目录，因为表状态不再依赖目录扫描和人工约定，而是依赖 `_delta_log` 定义的版本与 snapshot。真正准确的回答应该是：Delta 是建立在数据湖文件之上的表协议层。

说它不是计算引擎，是为了把 Spark 等执行职责切开；说它不是普通目录，是为了把事务日志和快照语义讲出来。很多回答之所以浅，就是只说了前半句或后半句，没把这个双边界同时说明。

# 必答点

1. 说明 Delta 不负责执行引擎层职责。
2. 说明 Delta 也不再依赖普通目录语义作为真相来源。
3. 说明其核心是表协议、版本和 snapshot。
4. 说明这两条边界必须同时讲。

# 加分点

1. 能把“不是目录”进一步解释为“reader 先恢复 snapshot，而不是直接扫路径”。
2. 能把“不是引擎”进一步解释为“Delta 和 Spark 必须分层排障”。

# 常见误答

1. 只说“它不是 Spark”。
2. 只说“它是带 ACID 的 Parquet”。
3. 讲不清为什么这两条边界要一起说。

# 追问

1. 如果只把 Delta 当目录，会在哪些场景里答错？
2. 如果只把 Delta 当引擎插件，又会在哪些场景里答错？
3. 为什么这道题本质上是在考你是否建立了系统边界感？