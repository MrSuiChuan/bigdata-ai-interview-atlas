---
id: q-bigdata-trino-0019
title: 设计 Trino 服务时，为什么要先定义它承接什么负载
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: system-design
question_type: system-design
difficulty: advanced
source_ids:
  - trino-resource-groups-docs
  - trino-fault-tolerant-execution-docs
  - trino-security-docs
claim_ids:
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0015
  - bigdata-trino-claim-0018
  - bigdata-trino-claim-0024
related_docs:
  - bigdata/trino/system-design
estimated_minutes: 12
---

# 题目

设计 Trino 服务时，为什么要先定义它承接什么负载？

# 一句话结论

因为工作负载类型会反过来决定 catalog 策略、资源组设计、安全边界、底层数据契约和是否启用容错执行。

# 这题想考什么

这题考的是系统设计顺序是否正确。成熟回答必须先定角色，再谈参数和规模。

# 回答主线

1. 先定服务角色和负载。
2. 再讲由此推导出的 catalog 与治理设计。
3. 再讲安全和恢复模型。
4. 最后讲为什么参数不是第一步。

# 参考作答

Trino 可以是共享查询网关，也可以是面向某类分析的专项集群。如果负载以大量短查询为主，你会更关心延迟、资源组隔离和安全收口；如果负载是大批量长查询，你就更要考虑 exchange 成本、容错执行与集群隔离。也就是说，工作负载不是一个补充条件，而是整个设计的出发点。

一旦负载定下来，后面的设计才能顺：catalog 怎么拆、资源组怎么路由、认证授权怎么做、底层表布局要达到什么准备度、是否需要 QUERY 或 TASK retry。相反，如果一上来就从节点数和内存开始谈，通常说明系统角色还没有定义清楚。

# 现场判断抓手

1. 能把 workload 与 resource group / FTE / security 关联起来。
2. 能说出共享查询层与专项集群设计重点不同。
3. 能把 catalog 也纳入系统设计而不只是配置细节。

# 常见误区

1. 一上来只谈机器规模。
2. 不区分短查询与大批量重查询。
3. 忽略底层数据准备度。

# 追问

1. 为什么 TASK retry 常常更适合独立集群？
2. 共享网关为什么尤其要重视安全和审计？
3. catalog 设计为什么也算系统设计题的一部分？
