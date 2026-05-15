---
id: q-bigdata-trino-0014
title: Resource Group 为什么既是配额问题，也是路由问题
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: resource-governance
question_type: system-design
difficulty: advanced
source_ids:
  - trino-resource-groups-docs
claim_ids:
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0013
related_docs:
  - bigdata/trino/resource-governance
estimated_minutes: 10
---

# 题目

Resource Group 为什么既是配额问题，也是路由问题？

# 一句话结论

因为查询先要被 selector 归到某一类工作负载，再谈并发、排队和内存上限；入口分类错了，配额再漂亮也会失效。

# 这题想考什么

这题考的是你对资源治理有没有平台视角，而不是只把它当并发阈值配置。

# 回答主线

1. 先讲 selector 负责什么。
2. 再讲资源组限制什么。
3. 再讲错误路由会造成什么。
4. 最后讲共享平台如何设计。

# 参考作答

Trino 的 resource group 不是简单的“并发池”。官方文档明确说明，查询会先通过 selector 按 user、source、authenticatedUser、queryType、clientTags 等属性匹配到一个资源组，然后才开始受该组的并发、排队和内存边界约束。

所以资源治理天然是两段：先路由，再配额。如果把 adhoc、报表、回填和写入任务全都路由进同一个组，你后面怎么调并发都只是让错误负载继续混跑。真正成熟的共享平台设计，一定会先定义负载分类和入口规则，再定义资源边界。

# 现场判断抓手

1. 能主动说出 selector 的匹配维度。
2. 能说明“每个查询只进一个组”。
3. 能把共享平台工作负载分层说出来。

# 常见误区

1. 把资源组理解成单纯的并发数配置。
2. 完全不提 selector。
3. 以为资源组能解决坏 SQL 和坏布局。

# 追问

1. 为什么查询排队未必是 SQL 本身有问题？
2. 什么情况下应该按 source 拆分，而不是按 user 拆分？
3. 资源组和安全治理有什么联动关系？
