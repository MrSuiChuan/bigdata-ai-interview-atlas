---
id: q-bigdata-hive-0013
title: 为什么 Hive on Tez 题不能只答“Tez 比 MR 快”，而必须继续讲 DAG、MRR、MPJ 和 pipeline
domain: bigdata
component: hive
topic: hive-on-tez-dag-mrr-mpj-pipelined-execution
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive design docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - hive-on-tez
  - hive-introduction
claim_ids:
  - hive-claim-0003
  - hive-claim-0078
  - hive-claim-0079
  - hive-claim-0080
  - hive-claim-0081
  - hive-claim-0082
  - hive-claim-0083
related_docs:
  - bigdata/hive/hive-on-tez-dag-mrr-mpj-and-pipelined-execution
estimated_minutes: 12
---

# 题目

为什么 Hive on Tez 题不能只答“Tez 比 MR 快”，而必须继续讲 `DAG`、`MRR`、`MPJ` 和 pipeline？

# 一句话结论

因为 Hive on Tez 的收益不是一句“更快”就能解释完，它本质上是在把原来链式 MR 作业之间必须落盘、等待、再调度的硬边界，改造成一张可以连续推进的 DAG。

# 核心机制

1. `Tez` 是能直接执行任意 `DAG` 的通用执行框架，不是固定形状的单个 MR 作业。
2. `MRR` 让多个 reduce sink 之间不再必须通过临时 HDFS 文件衔接。
3. `MPJ` 让多父 `Join` 可以被保留成树形依赖，而不是被压碎成多段串行作业。
4. 整个 query plan 一次下发后，阶段之间可以做 pipeline，减少 barrier 和调度固定成本。

# 标准答案

如果只回答“Tez 比 MR 快”，这道题还停留在结论层。官方设计文档说明，`Tez` 是运行在 YARN 上的通用 `DAG` 框架，task 是顶点，edge 是一等公民的数据连接，因此它不是把一条查询拆成若干个互相隔离的固定形状作业，而是允许整条查询计划作为一张依赖图直接执行。这个结构差异落到 Hive 上，最关键的就是 `MRR` 和 `MPJ` 两类优化。`MRR` 对应的是多个 reduce sink 的链路不再必须先落 HDFS、再被下游重读，而可以在 `DAG` 内直接连接并 pipeline 传递；`MPJ` 对应的是多父 `Join` 不再被迫拆成多段孤立 MR job，而可以合并成树形 `DAG`。官方还明确指出，整个 query plan 可以一次性交给 `Tez`，从而减少阶段间 I/O、同步屏障和调度开销；对小数据集，shuffle 期间甚至可以 entirely in memory，这也是经典 MR 没有的优化。因此成熟答案要讲清楚的不是“结果更快”，而是“执行图为什么变了、哪些物化边界被消掉了、验证时应该去 `EXPLAIN` 里看什么”。

# 追问展开

1. 如果面试官继续问“那到底该看哪个层级”，应该回答 `DAG -> Vertex -> Task` 是三层不同对象，真正最有解释力的通常是 `Vertex` 层。
2. 如果继续问“怎么验证不是空口说”，应该回答 `MRR` 优化会在 `EXPLAIN` 计划里体现出来。
3. 如果继续问“是不是阶段越少越好”，应该补一句：不是，还要看数据倾斜、shuffle 规模和是否存在必须保留的物化边界。

# 必答点

1. 说明 `Tez` 的本质是通用 `DAG` 执行框架。
2. 说明 `MRR` 在消除多段 reduce 链之间的中间落盘。
3. 说明 `MPJ` 在改善多父 `Join` 的执行图表达。
4. 说明 pipeline 和整图下发是在减少 barrier、I/O 和调度固定成本。
5. 说明可以用 `EXPLAIN` 验证 `MRR` 是否命中。

# 常见误答

1. 只会说“Tez 更快”。
2. 知道 `MRR`、`MPJ` 缩写，却说不清分别在消除什么边界。
3. 完全不提整图下发和 pipeline，只把收益归因于“引擎更先进”。
4. 不知道 `EXPLAIN` 是第一证据入口。
