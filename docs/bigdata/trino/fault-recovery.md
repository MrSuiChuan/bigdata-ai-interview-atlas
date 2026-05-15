---
kb_id: bigdata/trino/fault-recovery
title: Trino 故障恢复与状态重建
description: 解释 Trino 默认失败模型、QUERY 与 TASK 两类重试策略、exchange manager 的作用及其适用边界。
domain: bigdata
component: trino
topic: fault-recovery
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-docs
  - trino-fault-tolerant-execution-docs
  - trino-connector-docs
claim_ids:
  - bigdata-trino-claim-0014
  - bigdata-trino-claim-0015
  - bigdata-trino-claim-0016
  - bigdata-trino-claim-0017
  - bigdata-trino-claim-0020
  - bigdata-trino-claim-0022
tags:
  - trino
  - fault-recovery
  - retry
  - knowledge-base
  - production
---
## 理解 Trino 恢复，第一步不是谈重试次数，而是先接受它默认会失败
很多人潜意识里把 Trino 想成“某个节点挂了，系统应该自己兜住”。但官方 fault-tolerant execution 文档首先说明的恰恰相反：默认情况下，如果节点在执行过程中故障，或者节点资源不足以执行任务，查询会失败，需要重新运行。

这件事非常重要，因为它决定了 Trino 的恢复语义不是天然存在，而是一个需要显式设计的能力。

## 默认失败模型说明了什么
默认模型的核心含义有两层：

1. query state 主要由 Coordinator 管理，worker 上的执行状态是易失的。
2. 如果没有额外的容错执行机制，中间结果和任务执行上下文不具备天然可迁移性。

所以，一条长查询天然比一条短查询更容易暴露这种脆弱性，因为它更有可能在执行过程中遇到节点故障、资源波动或外部系统异常。

## Fault-tolerant execution 到底改变了什么
开启 fault-tolerant execution 后，Trino 可以在发生故障时重试整条查询，或者重试查询里的单个 task。官方文档特别强调，启用这项能力后，中间的 exchange 数据会被 spool 下来，从而在 worker 宕机或其他故障时被其他 worker 重新利用。

这意味着恢复能力的关键，不只是“允许重试”，而是“中间状态是否被放到了可复用的边界上”。

## QUERY 重试和 TASK 重试，不是同一种设计
官方文档把两种模式区分得很明确：

- `QUERY`：整条查询失败后自动重试一次新的查询执行。
- `TASK`：失败时只重试局部 task，而不是把整条查询从头再跑。

两者的适用面也不同：

- `QUERY` 更适合以大量短查询为主的集群。
- `TASK` 更适合大型批量查询，因为重试更小的执行单元通常比整条查询重跑更划算。

这不是“哪个更高级”的问题，而是 workload 匹配问题。

## 为什么 TASK 重试一定会把你带到 exchange manager
官方文档明确写到：要使用 `TASK` retry policy，必须配置 exchange manager。原因并不神秘，因为 task 级恢复要能让新的 worker 继续消费已有中间结果，而这些结果必须有一个稳定、可共享的外部存放边界。

如果没有 exchange manager，中间 exchange 数据只是局部易失状态，task 级重试就没有可靠落点。

文档还进一步提醒：即使用 `QUERY`，如果结果集或中间去重缓冲超过内存边界，也通常强烈建议配置外部 exchange manager，而不是只依赖 Coordinator 的内存缓冲。

## 容错执行能解决什么，解决不到什么
它能缓解的主要是执行期故障，例如：

- worker 故障
- 某些执行阶段资源波动
- 长查询在执行期遇到局部失败

但它解决不到下面这些问题：

- SQL 语法错误、语义错误、用户误用
- connector 本身不支持 fault-tolerant execution
- 跨异构系统的统一事务一致性
- 业务侧把不该重试的写入语义当成可以随便重试

官方文档就明确指出，broken query 或 user error 不在容错重试范围内。

## 为什么 connector 支持边界必须单独确认
fault-tolerant execution 不是引擎一开即用的万能开关。官方文档明确给出 warning：打开 `retry-policy` 后，某些 connector 可能直接返回“`This connector does not support query retries`”。

因此生产设计里必须把这个问题前置：

- 这条关键业务查询落在哪个 connector 上。
- 该 connector 是否支持对应的容错执行模式。
- 写入类语义和读取类语义是否都有相同支持边界。

如果不确认这一步，容错开关本身就可能成为新故障源。

## TASK 模式为什么常常要独立集群
官方文档还专门提醒：`TASK` retry 更适合大批量查询，但对高频短查询会带来更高延迟，因此最佳实践往往是把大型批量任务与短查询负载拆到不同集群。

这背后的原理很简单：

- 容错能力提升，通常伴随更多交换数据落盘、更多协调和更多外部 I/O。
- 这些成本对大型长查询是值得的，对海量短查询却未必划算。

所以恢复策略本质上也是系统设计取舍。

## 生产里应该怎样验证恢复能力
要验证 Trino 的恢复能力，至少要回答下面几件事：

1. 集群默认是 `NONE`、`QUERY` 还是 `TASK`。
2. 如果是 `TASK`，exchange manager 是否已经可靠配置。
3. 关键 connector 是否支持目标重试模式。
4. 失败发生时，系统是否真的进入重试，而不是直接报语义错误或能力不支持。
5. 批量重查询和短交互查询是否已经按恢复成本分层部署。

## 本页结论
Trino 的故障恢复不是默认拥有的强能力，而是要靠 fault-tolerant execution 显式建立。回答到原理层时，关键要讲清楚四点：默认为什么会失败、QUERY 和 TASK 的差异、exchange manager 为什么是任务级恢复的前提、以及 connector 和 workload 边界为什么决定这项能力能不能真正落地。

## 一致性与容错
Trino 的恢复能力，本质上是在“执行期失败”和“中间状态可复用性”之间做显式治理：

1. 默认模式下，中间执行状态是易失的，所以节点失败会直接导致查询失败。
2. Query retry 通过整体重跑换取恢复，但成本更高。
3. Task retry 通过外部化 exchange 数据换取局部恢复，但前提更多。
4. connector 若不支持对应模式，容错能力就会在边界处失效。

### 为什么 Trino 恢复一定要讲 connector 边界
因为引擎层即使支持重试，也不代表底层数据访问语义允许重试。恢复能力不是单靠 Coordinator 配置出来的，而是执行层和 connector 能力共同成立的结果。

## 生产排障
如果开启了 fault-tolerant execution 之后仍然频繁失败，建议按下面顺序拆：

1. 先确认当前是 `NONE`、`QUERY` 还是 `TASK`。
2. 如果是 `TASK`，确认 exchange manager 是否稳定可用。
3. 再确认关键 connector 是否支持当前重试策略。
4. 最后再判断是工作负载特征不匹配，还是底层资源、数据源或配置出了问题。

### 恢复诊断样例
```yaml
fte_diagnosis:
  retry_policy: TASK
  exchange_manager: configured
  connector_support: false
  observed_error: "This connector does not support query retries"
```

这个样例说明，很多“恢复没生效”的根因不在 Trino 核心，而在 connector 边界没有被提前验证。
