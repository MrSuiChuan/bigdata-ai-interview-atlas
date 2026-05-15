---
id: q-bigdata-trino-0011
title: 一条 Trino 查询从提交到结果返回会经历哪些关键状态
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: lifecycle
question_type: principle
difficulty: intermediate
source_ids:
  - trino-architecture-docs
claim_ids:
  - bigdata-trino-claim-0002
  - bigdata-trino-claim-0005
related_docs:
  - bigdata/trino/lifecycle
estimated_minutes: 8
---

# 题目

一条 Trino 查询从提交到结果返回会经历哪些关键状态？

# 一句话结论

可以按“进入系统、解析分析、计划生成、排队调度、task 执行、结果返回或失败”这条主线来讲。

# 这题想考什么

这题考的是你是否能把抽象对象真正串成生命周期，而不是只会单点解释名词。

# 回答主线

1. 先讲入口和解析。
2. 再讲 planning 与 split / stage 生成。
3. 再讲 queue 与 scheduling。
4. 最后讲 running、finish 和 fail。

# 参考作答

更完整的答法是：客户端把 SQL 交给 Coordinator 后，先经过解析和语义分析，然后结合 metadata、stats 和 connector 能力形成分布式计划。接下来查询可能先进入 resource group 的队列，再被切成 stage 和 task，下发给 Worker 执行 split。

在运行阶段，stage 之间会通过 exchange 传递中间结果。最终要么结果被 Coordinator 汇总并返回给客户端，要么在执行中因为资源、节点或 connector 问题失败。把这条生命周期讲出来，很多性能题和排障题就都能自然接上。

# 现场判断抓手

1. 能把 queue 放进生命周期，而不是只讲 running。
2. 能说明 planning 依赖 metadata 和 connector。
3. 能把 stage / task / split 放到时间顺序里。

# 常见误区

1. 把生命周期讲成“解析后直接执行”。
2. 完全不提 queue 和 scheduling。
3. 只背对象，不讲状态流转。

# 追问

1. 为什么查询有时主要耗在 queue 而不是 running？
2. planning 阶段慢通常该看哪层？
3. 生命周期里哪一段最容易被 connector 影响？
