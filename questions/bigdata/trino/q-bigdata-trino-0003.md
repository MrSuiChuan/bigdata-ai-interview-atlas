---
id: q-bigdata-trino-0003
title: Coordinator、Worker、Catalog、Connector 各自负责什么
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: architecture-and-roles
question_type: principle
difficulty: intermediate
source_ids:
  - trino-architecture-docs
  - trino-connector-docs
claim_ids:
  - bigdata-trino-claim-0002
  - bigdata-trino-claim-0003
  - bigdata-trino-claim-0004
  - bigdata-trino-claim-0005
related_docs:
  - bigdata/trino/architecture-and-roles
estimated_minutes: 8
---

# 题目

Coordinator、Worker、Catalog、Connector 各自负责什么？

# 一句话结论

Coordinator 负责控制面，Worker 负责执行面，Catalog 决定命名边界，Connector 决定对具体数据源的真实能力。

# 这题想考什么

这题考的是你能不能用角色分工把 Trino 说活，而不是只会说“一主多从”式的泛化表述。

# 回答主线

1. 先给四个角色定性。
2. 再讲它们如何串成一次查询。
3. 再补一句最容易混淆的边界。
4. 最后落到生产现象上。

# 参考作答

最核心的答法是把四个角色放回一条查询链路里。客户端把 SQL 交给 Coordinator，Coordinator 做解析、分析、优化、stage 切分和 task 调度；Worker 接到 task 后执行 split、运行算子，并和其他 Worker 交换中间结果。

Catalog 是命名与配置边界，告诉 Trino 某个名字空间映射到哪个数据源；Connector 则是具体的数据源适配层，决定元数据、统计信息、split、pushdown 以及写入语义如何暴露给 Trino。所以 Catalog / Connector 不是附属组件，而是能力边界的来源。

# 现场判断抓手

1. 能明确说出 Connector 决定 pushdown 和写入能力边界。
2. 能把 Coordinator 的职责说到 planning 和 scheduling 层。
3. 能把 Worker 和 task / split 关联起来。

# 常见误区

1. 把 Catalog 和 Connector 混成一个概念。
2. 把 Coordinator 说成只负责接收 SQL。
3. 不讲中间结果交换和 stage / task 关系。

# 追问

1. 为什么 Coordinator 压力不只是网络入口压力？
2. 为什么 Connector 会影响查询计划而不只是读数据？
3. Catalog 命名策略为什么会影响治理和安全？
