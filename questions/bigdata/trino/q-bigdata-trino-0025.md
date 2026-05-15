---
id: q-bigdata-trino-0025
title: Trino 的可观测性应该如何从指标、日志和计划三层组织
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
  - bigdata/trino/troubleshooting
estimated_minutes: 10
---

# 题目

Trino 的可观测性应该如何从指标、日志和计划三层组织？

# 一句话结论

计划层回答“理论上应该怎么跑”，指标层回答“实际上跑成了什么样”，日志层回答“边界系统和错误上下文到底发生了什么”。

# 这题想考什么

这题更偏观测体系设计，考的是你能否把不同观测材料放到正确层级，而不是一股脑堆监控。

# 回答主线

1. 先定义三层含义。
2. 再说明每层最适合回答什么问题。
3. 再讲三层如何联动。
4. 最后补一句哪些指标最容易误导。

# 参考作答

如果按体系搭建，计划层优先用 explain、explain analyze、show stats 去判断 scan、pushdown、join 和 exchange；指标层看 queue / planning / running 时间、stage / task 分解、blocked reason、memory pressure、spill 和吞吐；日志层则补齐 connector、元数据系统、对象存储、数据库等边界系统上下文。

这三层缺一不可。只有计划层，你知道理论工作量但不知道实际长尾；只有指标层，你看到慢却不知道计划错没错；只有日志层，则很容易只盯错误文案而看不见执行形态。真正成熟的可观测性，是让三层能互相对证。

# 现场判断抓手

1. 能把 explain 放进观测体系。
2. 能把 stage / task / blocked reason 归到指标层。
3. 能把 connector / source 日志归到边界层。

# 常见误区

1. 把日志、指标、计划混成同一层。
2. 只建指标，不保留 explain 证据。
3. 忽略边界系统日志。

# 追问

1. 为什么 explain 也是一种可观测性证据？
2. blocked reason 在排障里为什么有价值？
3. 如果计划和指标矛盾，优先怎么解释？
