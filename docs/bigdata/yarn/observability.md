---
kb_id: bigdata/yarn/observability
title: YARN 可观测性与诊断入口
description: 说明 YARN 的可观测性为什么必须同时覆盖 RM 全局视角、队列与节点指标、AM / Container 日志以及 ATS v2 历史视角。
domain: bigdata
component: yarn
topic: observability
difficulty: advanced
status: reviewed
sidebar_position: 16
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-commands-reference
  - hadoop-yarn-node-manager
  - hadoop-yarn-timeline-service-v2
  - hadoop-yarn-capacity-scheduler
claim_ids:
  - bigdata-yarn-claim-0016
  - bigdata-yarn-claim-0017
  - bigdata-yarn-claim-0029
  - bigdata-yarn-claim-0039
  - bigdata-yarn-claim-0041
tags:
  - yarn
  - observability
  - logs
  - rm-ui
  - knowledge-base
---
## 看 YARN，绝不能只看 RM UI，而要把全局视角、节点视角、应用视角和历史视角一起拼起来
YARN 的观测比很多人想得更分散。因为它本来就不是一个单点执行器，而是控制面、应用协调面和节点执行面共同组成的系统。所以高质量的可观测性至少要覆盖四层：

- RM 全局状态层。
- 队列与调度层。
- NM / AM / Container 日志层。
- Timeline 历史层。

## 第一层：RM 全局状态层
RM UI 和 `yarn application / queue / node` 命令最适合回答：

- 应用卡在哪个阶段。
- 某队列容量是否吃满。
- 节点是否健康、是否被纳入可分配范围。

这层非常适合做“第一眼判断”，但不适合替代细故障上下文。

一个最小命令抓手通常可以从这里开始：

```bash
yarn application -status application_1710000000000_0421
yarn queue -status root.analytics
yarn node -list -showDetails
```

## 第二层：队列与调度层
很多“作业慢”其实压根还没开始执行，而是在调度层等待。此时重点应放在：

- 队列水位。
- 用户与应用数限制。
- AM 资源占比。
- 标签与属性带来的资源分区。

如果不把队列层单独拎出来观察，就会把很多治理问题误判成执行问题。

## 第三层：节点与容器日志层
真正解释“为什么起不来”“为什么退出”“为什么本地化失败”的证据，通常在：

- NM 日志。
- AM 日志。
- Container 日志。
- 退出码与本地化上下文。

这说明观测不能只停留在 RM 侧状态，要继续追到节点执行面。

## 第四层：Timeline 与历史层
ATS v2 更适合承接历史指标和长期诊断。它不一定是每次排障的第一入口，但对于回看应用历史、做趋势分析和保留长期证据很有价值。

如果需要解释它和 RM UI 的边界，最稳的说法是：RM UI 更偏当前控制面状态，ATS v2 更偏历史实体、flow、flow run 和应用级长期指标视图。两者不是谁替代谁，而是时间维度不同。

## 一个实用的观测顺序
1. 先看 RM：应用在哪个阶段。
2. 再看队列：是不是治理边界在卡。
3. 再看日志：容器和节点到底怎么失败的。
4. 最后看 ATS：历史上是否重复出现、有没有长期趋势。

## 本页结论
YARN 的可观测性不是单一 UI，而是 RM、队列、NM / Container 日志和 ATS v2 共同组成的证据链。只会说“看 RM UI”和“看日志”，还不够；更成熟的回答必须知道这些入口分别回答什么问题。
