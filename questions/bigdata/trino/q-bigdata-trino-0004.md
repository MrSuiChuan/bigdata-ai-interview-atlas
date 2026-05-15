---
id: q-bigdata-trino-0004
title: Trino 的 metadata 为什么经常决定 planning 时间上限
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: metadata-state
question_type: troubleshooting
difficulty: advanced
source_ids:
  - trino-connector-docs
  - trino-cost-based-optimizations-docs
claim_ids:
  - bigdata-trino-claim-0003
  - bigdata-trino-claim-0004
  - bigdata-trino-claim-0009
related_docs:
  - bigdata/trino/metadata-state
estimated_minutes: 10
---

# 题目

Trino 的 metadata 为什么经常决定 planning 时间上限？

# 一句话结论

因为查询真正开跑前，Coordinator 需要依赖 connector 拿到元数据、统计信息和 split 线索，metadata 质量和速度直接决定计划能否及时且正确地产生。

# 这题想考什么

这题考的是你是否理解 planning 不是空想过程，而是建立在 metadata、stats 和 connector 能力之上的。

# 回答主线

1. 先讲 planning 阶段依赖哪些元数据。
2. 再讲统计信息为什么影响优化器。
3. 再讲 metadata 慢会表现成什么现象。
4. 最后给出诊断抓手。

# 参考作答

Trino 做 planning 之前，并不是只靠 SQL 文本就能决定一切。Coordinator 需要通过 connector 知道表、列、分区、统计信息以及如何生成 split。没有这些信息，很多优化就无法成立。

尤其 cost-based optimization 很依赖统计信息。如果 stats 缺失或质量很差，Trino 就可能选错 join 顺序和 join distribution。于是你看到的表象也许是“running 变慢”，但根因其实出在 planning 输入信息不完整。生产里如果 planning 时间异常，或者 explain 结果明显和业务预期不符，优先就该回到 metadata 和 stats 这层。

# 现场判断抓手

1. 能把 metadata、stats 和 split generation 关联起来。
2. 能说明 join 决策依赖 stats。
3. 能区分 planning 慢和 running 慢。

# 常见误区

1. 把 metadata 只理解成表结构。
2. 把慢查询一律归到运行阶段。
3. 不讲统计信息对优化器的作用。

# 追问

1. SHOW STATS 在这类排障里为什么有价值？
2. 为什么有时 planning 就慢，但 Worker 其实没干多少活？
3. Connector 提供的 metadata 质量为什么会影响 join 策略？
