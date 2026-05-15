---
id: q-bigdata-delta-0003
title: 为什么 Delta Lake 不是计算引擎，却又必须和 Spark 一起理解？
domain: bigdata
component: delta-lake
topic: architecture-and-roles
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-docs
  - delta-lake-concurrency-control
  - delta-lake-catalog-managed-tables
claim_ids:
  - bigdata-delta-claim-0001
  - bigdata-delta-claim-0007
  - bigdata-delta-claim-0008
  - bigdata-delta-claim-0040
related_docs:
  - bigdata/delta-lake/architecture-and-roles
estimated_minutes: 8
---

# 题目

为什么 Delta Lake 不是计算引擎，却又必须和 Spark 一起理解？

# 标准答案

先说边界：Delta Lake 自己不负责 Join、Shuffle、任务调度和执行资源分配，这些是 Spark 之类计算引擎的职责。Delta 真正负责的是表协议、事务日志、版本历史和提交边界，也就是“这张表什么状态才算合法、读者应该看到哪个快照、写入如何有序进入版本线”。

但它又必须和 Spark 一起理解，因为 Spark 往往是最常见的执行与提交客户端。批作业和流作业会先读取当前快照，生成新文件或变更动作，再按 Delta 协议尝试提交新版本；查询时又会先恢复快照，再交给 Spark 去完成扫描、过滤和后续算子执行。所以很多线上问题都恰好发生在二者边界上：表状态没问题，但 Spark 计划很差；或者 Spark 作业写出了文件，但 Delta 提交因为冲突失败。

更进一步说，Delta 的很多工程价值恰恰来自这种分层：它把表语义从执行引擎里抽出来，让同一张表可以被多种客户端以一致方式理解。但只要回答时把 Spark 的执行职责和 Delta 的表职责混为一谈，后面的排障和设计就会越讲越乱。

# 必答点

1. 说明 Spark 负责执行，Delta 负责表语义。
2. 说明写入和读取都发生在 Delta 与 Spark 的边界协作上。
3. 说明很多问题出在“表层正确但执行层不佳”或反过来的交界处。
4. 说明这种分层为什么有利于湖仓治理。

# 加分点

1. 能提到 Catalog / Metastore 也属于相邻控制面，而不是 `_delta_log` 的替代品。
2. 能提到 catalog-managed tables 是更进一步的控制面演化方向。

# 常见误答

1. 把 Delta 说成 Spark 内部的一个存储格式插件。
2. 认为查询快慢完全由 Delta 决定，忽略执行引擎计划。
3. 认为 Spark 写成功就等于 Delta 表状态一定成功切换。

# 追问

1. 为什么“文件已经写出来了”不代表“表已经写成功了”？
2. 排查读慢时，哪些问题先归 Spark，哪些先归 Delta？
3. 如果以后不是 Spark 访问这张表，Delta 的哪些语义仍然成立？