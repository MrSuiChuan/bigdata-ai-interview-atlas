---
id: q-bigdata-trino-0017
title: 排障 Trino 时，为什么要先分清 queue、planning、running、write 和 failure
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: troubleshooting
question_type: troubleshooting
difficulty: advanced
source_ids:
  - trino-pushdown-docs
  - trino-resource-groups-docs
  - trino-fault-tolerant-execution-docs
claim_ids:
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0014
  - bigdata-trino-claim-0022
  - bigdata-trino-claim-0023
related_docs:
  - bigdata/trino/troubleshooting
estimated_minutes: 10
---

# 题目

排障 Trino 时，为什么要先分清 queue、planning、running、write 和 failure？

# 一句话结论

因为这五类问题对应的证据入口和根因完全不同，不先分型就会把治理、优化、connector 和执行故障混成一团。

# 这题想考什么

这题考的是排障方法论，而不是会不会背某个错误码。

# 回答主线

1. 先给五类问题定义边界。
2. 再说每类先看什么。
3. 再讲为什么计划和资源问题最容易被混淆。
4. 最后给出统一排障路径。

# 参考作答

Trino 排障最需要先做的是生命周期分型。queue 问题优先看 resource group 和 selector；planning 问题优先看 metadata、stats 和 connector；running 问题优先看 pushdown、join、exchange、skew 和内存；write 问题优先看 connector 语义边界；failure 问题则要先分清是 Worker / 资源故障还是 connector / source 报错。

这样做的好处是证据能快速收敛。否则你可能拿着一个排队问题去改 SQL，或者拿着一个 connector 不支持的写入错误去调 Worker 参数。真正成熟的 Trino 排障，第一步永远是先把问题放回正确阶段。

# 现场判断抓手

1. 能把 queue 和 planning 分开。
2. 能说出 write 问题首先要查 connector 语义。
3. 能把 failure 和 FTE 边界联系起来。

# 常见误区

1. 所有问题都先去看 Worker。
2. 所有慢查询都先改 SQL。
3. 不区分 connector 能力边界和执行故障。

# 追问

1. planning 慢时第一批证据是什么？
2. 写入失败时为什么不应先怪 Trino 引擎？
3. 什么情况下 queue 问题会伪装成性能问题？
