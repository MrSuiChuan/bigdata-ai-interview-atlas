---
id: q-bigdata-trino-0028
title: Trino 的故障恢复为什么要先定位状态归属
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: fault-recovery
question_type: failure
difficulty: advanced
source_ids:
  - trino-fault-tolerant-execution-docs
claim_ids:
  - bigdata-trino-claim-0014
  - bigdata-trino-claim-0015
  - bigdata-trino-claim-0016
related_docs:
  - bigdata/trino/fault-recovery
estimated_minutes: 10
---

# 题目

Trino 的故障恢复为什么要先定位状态归属？

# 一句话结论

因为只有先分清 query 控制状态、worker 执行状态、中间 exchange 状态和底层源系统状态分别归谁，才能判断这次故障到底能不能重试、该从哪里恢复。

# 这题想考什么

这题考的是恢复思维是否到位。真正懂的人，不会一上来就谈“重跑一下”。

# 回答主线

1. 先列出几类状态。
2. 再讲默认模式下哪些状态易失。
3. 再讲 FTE 如何改变状态边界。
4. 最后讲恢复判断顺序。

# 参考作答

Trino 恢复题最怕不分状态归属。query 的控制状态主要在 Coordinator，task 的局部执行状态主要在 Worker，中间 exchange 数据在默认模式下也不是天然稳定的，而底层数据可见性和写入语义则归 connector 与源系统管理。不同状态归属，决定了故障后的处理策略完全不同。

所以面试里更成熟的答法是：先判断故障打断的是哪一层状态；如果只是 Worker 易失状态丢了，默认会导致查询失败；如果启用了 FTE 且 exchange manager 存在，某些中间状态才有机会复用；如果问题落在语义错误或 connector 不支持上，就根本不是重试能解决的。这种回答比单说“可以重跑”深入得多。

# 现场判断抓手

1. 能主动列出 Coordinator、Worker、exchange、source 四类状态边界。
2. 能说明默认为什么失败。
3. 能把恢复策略和状态归属直接挂钩。

# 常见误区

1. 所有故障都回答成重试。
2. 不区分执行状态和业务数据状态。
3. 把 FTE 说成万能恢复。

# 追问

1. 为什么 exchange manager 会改变恢复边界？
2. 如果 connector 不支持 query retries，应如何回答恢复能力？
3. 为什么用户错误不属于恢复语义的一部分？
