---
id: q-bigdata-trino-0016
title: Trino 的可观测性为什么必须同时看计划、运行态和 connector 侧
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: observability
question_type: operations
difficulty: advanced
source_ids:
  - trino-pushdown-docs
  - trino-cost-based-optimizations-docs
  - trino-admin-properties
claim_ids:
  - bigdata-trino-claim-0007
  - bigdata-trino-claim-0009
  - bigdata-trino-claim-0023
related_docs:
  - bigdata/trino/observability
estimated_minutes: 10
---

# 题目

Trino 的可观测性为什么必须同时看计划、运行态和 connector 侧？

# 一句话结论

因为 Trino 查询可能在计划层做错、在运行层跑偏，或者根因根本不在引擎里，而在 connector 与底层数据源。

# 这题想考什么

这题考的是你的观察框架是否完整。真正做过排障的人，不会只盯着 CPU 和错误日志。

# 回答主线

1. 先讲三层证据模型。
2. 再讲每层最重要的入口。
3. 再讲三层之间的因果关系。
4. 最后讲典型误判。

# 参考作答

更稳的答法是先把可观测性拆成三层。计划层看 explain 和 show stats，判断 pushdown、join 和 scan 是否合理；运行层看 queue / planning / running 时间、stage / task 长尾、blocked reason 和 memory；边界层看 connector、元数据系统、对象存储或数据库本身是否拖慢。

如果只看其中一层，很容易误判。比如查询慢，可能是没有 pushdown，也可能是 resource group 排队，还可能是 Hive Metastore 或对象存储侧抖动。所以 Trino 的诊断证据必须跨层拼起来，而不是靠单一指标猜。

# 现场判断抓手

1. 能把 explain / analyze 和 stage / task 分解一起讲。
2. 能说明 connector / source side 不是可选观察项。
3. 能区分 planning 慢、running 慢和 queue 慢。

# 常见误区

1. 把可观测性简化成“看机器指标”。
2. 只看 Trino UI，不看边界系统。
3. 不讲 explain 的诊断价值。

# 追问

1. 为什么 ScanFilterProject 是否存在能作为诊断信号？
2. 什么时候应该优先怀疑 metadata 服务？
3. 为什么 queue 时间也要纳入观测？
