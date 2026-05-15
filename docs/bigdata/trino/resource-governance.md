---
kb_id: bigdata/trino/resource-governance
title: Trino 资源治理与多租户边界
description: 说明 Trino 资源组如何通过选择器、队列、并发与内存边界治理共享查询服务，并解释它解决什么问题、解决不到哪里。
domain: bigdata
component: trino
topic: resource-governance
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-docs
  - trino-resource-groups-docs
  - trino-cost-based-optimizations-docs
  - trino-admin-properties
claim_ids:
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0013
  - bigdata-trino-claim-0011
  - bigdata-trino-claim-0009
  - bigdata-trino-claim-0023
  - bigdata-trino-claim-0024
tags:
  - trino
  - resource-governance
  - multi-tenant
  - knowledge-base
  - production
---
## Trino 的资源治理，本质上不是“限流参数”，而是“查询路由加配额边界”
在共享 Trino 集群里，最常见的风险不是某一条 SQL 天生很差，而是不同类型的查询互相伤害。BI 临时分析、报表查询、批量回填、管理员命令、CTAS 或 `MERGE` 如果全部挤进同一条资源路径，最后出现的往往不是单点慢，而是整个平台进入排队、抖动和抢内存状态。

Trino 官方把这件事交给 `resource group`。它的核心语义可以直接记成三句话：

- 每个查询只会被放进一个资源组。
- 查询消耗的是该组以及其祖先组的资源预算。
- 资源不足时，通常不是直接杀掉正在运行的查询，而是让新查询先排队；只有排队上限也被打满时，才会出现拒绝。

这意味着 Trino 的资源治理不是事后补丁，而是控制面的一部分。

## Resource group 真正解决的是哪类问题
它主要解决四类平台级问题：

1. 不同工作负载如何共用同一套 Trino 服务。
2. 哪些查询该优先跑，哪些查询应该先排队。
3. 内存、并发、扫描额度被谁先占满时，平台怎样保护高优先级流量。
4. 当查询量暴涨时，平台如何把伤害控制在局部，而不是拖垮所有用户。

如果把 Trino 当成统一 SQL 入口，这一页其实就是它的“交通规则”。

## 真正的治理对象不是 SQL 文本，而是“进入系统的查询流”
Trino 资源组的选择不是拍脑袋，而是通过 `selector` 把查询按属性路由到不同组。官方文档给出的可用匹配维度包括：

- `user`
- `originalUser`
- `authenticatedUser`
- `source`
- `queryType`
- `clientTags`

而且规则是按顺序处理、命中第一条就生效。这一点非常关键，因为它说明资源治理不是“查询执行以后再看情况”，而是查询进入系统时就已经决定了命运。

更稳的理解方式是把资源治理看成两段：

1. 先路由：这条查询到底属于哪一类负载。
2. 再配额：这一类负载同时能跑多少、能排多少、占多少内存、需要什么调度策略。

## 为什么说它既是配额问题，也是路由问题
很多团队一提资源治理，就只想到“每个池子给多少并发”。这只说对了一半。因为如果路由规则本身有问题，再漂亮的配额也会失效。

最典型的误判包括：

- 只按用户分组，结果同一个服务账号承接了完全不同的流量。
- 没有把 `SELECT`、`INSERT / CTAS`、`DDL` 这类查询类型拆开，导致短查询被长查询拖住。
- BI 工具全部共用同一个 `source`，最后临时分析和固定报表互相影响。
- 明明是跨部门共享平台，却没有把不同租户的隔离边界体现在选择器规则里。

所以，资源治理答到原理层时，不能只背内存和并发，还要讲“入口分类是否合理”。

## 资源组限制的不是一切，它有明确边界
资源组很重要，但它解决不了所有慢查询问题。至少下面几类问题，资源组并不能替你兜底：

- 底层表分区和文件布局很差，导致扫描量本来就巨大。
- connector 几乎没有 pushdown，数据被整批拉回 Trino。
- 统计信息缺失，优化器把大表误判成小表做 broadcast join。
- 上游业务在高峰时段一次性放进大量重查询。

也就是说，资源组能决定“谁先跑、谁排队、谁先被保护”，但不能把坏执行计划变成好执行计划。

## 资源治理最值得先拆开的几类负载
实际设计里，最常见的拆法通常不是按项目目录，而是按工作负载性质：

- 交互式短查询：延迟敏感，应该重点保护体验。
- 批量重查询：吞吐敏感，适合更严格的并发上限。
- 写入或回填类查询：风险高，最好和只读分析区分开。
- 管理类语句：比如需要快速执行的 kill、show、explain 类操作，不适合被长队列卡死。

如果这几类负载混在一起，平台通常很难既稳住交互体验，又维持大查询吞吐。

## 如何判断资源治理是否已经失效
比起“感觉慢”，更可操作的证据通常是下面这些：

- 查询大部分时间耗在 queue，而不是 planning 或 running。
- 同一类查询在高峰期持续进入排队，但低峰期表现正常。
- 高优先级业务明明流量不大，却和普通 adhoc 查询一起拥塞。
- 某一组并发不高，但内存边界先被打满，导致新查询迟迟进不去。
- `join-max-broadcast-table-size` 已经在保护并发，但平台仍因错误负载混跑而抖动。

这些现象说明问题已经不只是 SQL 单体，而是治理模型本身。

## 一条更靠谱的治理设计主线
如果要设计 Trino 共享服务，建议按下面顺序思考：

1. 先按业务时效和查询重量给工作负载分层。
2. 再为每层定义入口规则，而不是只定义资源上限。
3. 再决定并发、排队、内存和必要的扫描 / CPU 保护边界。
4. 最后用监控去验证路由是否符合预期，而不是等到故障时才猜。

## 本页结论
Trino 的资源治理本质上是“查询如何被归类，并在共享平台里按规则竞争资源”。真正成熟的回答，必须同时讲清 selector、resource group、queue、concurrency、memory 和工作负载分类边界；如果只会说“调大并发”或“多加机器”，还没进入治理层。


### 一个最小治理核对样例
资源治理最容易被答成“限制并发和内存”，但真正高价值的是看查询有没有进入正确的资源池。下面这个最小样例适合帮助理解 selector 与 group limit 的组合含义。

```yaml
resource_group_check:
  user: bi_analyst
  source: dashboard
  expected_group: adhoc_small
  queued_queries_limit: enforced
  hard_concurrency_limit: enforced
```

如果一条查询排队很久，第一步不是怀疑 SQL，而是先确认它是不是进错了组。

