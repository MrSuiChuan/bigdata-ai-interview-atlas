---
kb_id: bigdata/yarn/metadata-state
title: YARN 元数据与状态管理
description: 解释 YARN 的应用状态、调度配置、节点分区、日志聚合与 Timeline 元数据分别存放在哪里，以及哪些是权威状态。
domain: bigdata
component: yarn
topic: metadata-state
difficulty: advanced
status: reviewed
sidebar_position: 4
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-architecture
  - hadoop-yarn-resource-manager-restart
  - hadoop-yarn-timeline-service-v2
  - hadoop-yarn-node-labels
  - hadoop-yarn-capacity-scheduler
claim_ids:
  - bigdata-yarn-claim-0003
  - bigdata-yarn-claim-0007
  - bigdata-yarn-claim-0011
  - bigdata-yarn-claim-0016
tags:
  - yarn
  - metadata
  - state-management
  - knowledge-base
---
## YARN 没有像 Hive 那样显眼的“元数据服务”，但它照样有很多关键状态需要分层理解
很多人一听元数据，就只想到“库表信息”。放到 YARN 里，这个思路就会失焦。YARN 的关键状态更多是运行时与治理状态，而不是业务数据描述。真正需要理解的是：哪些状态由 RM 持有，哪些散在 NM 上，哪些进入 Timeline 或日志系统，哪些只是配置文件定义的治理元数据。

## 第一类：应用与尝试状态，RM 是权威入口
应用是否存在、当前是哪个 Attempt、整体是 Accepted 还是 Running，这些状态首先都应该回到 RM 看。RM 是全局应用状态的权威视角，这也是为什么大量排障都先从 RM UI 或 `yarn application -status` 开始。

但要注意，RM 的“权威”并不等于“拥有所有细节”。它知道全局应用状态，不等于它持有每个容器的完整本地运行上下文。

## 第二类：队列与调度配置状态，本质是治理元数据
CapacityScheduler 的队列树、容量配比、访问控制、用户上限、AM 占比、可访问标签，这些其实都是 YARN 最重要的一类治理元数据。它们不描述业务数据，却决定应用能否进入系统、排队多久、能拿多少资源。

所以生产里经常会出现一种错觉：看起来是“任务慢”，实际是队列元数据配置导致的资源路径不同。只要队列配置有变化，系统行为就可能明显改变。

## 第三类：节点分区与放置状态，不是普通配置项，而是资源边界
Node Label、Node Attribute、Placement Constraint 这类信息经常被低估。它们看起来像“辅助信息”，但本质上决定的是资源集合的可见范围。

这意味着一份应用请求即使逻辑上只要 10 个容器，也可能因为：

- 只能进某个带标签的分区。
- 只能去带特定属性的节点。
- 要满足某种反亲和约束。

最终在调度上表现成“资源不足”。所以这类状态必须归入真正的调度元数据，而不是边缘装饰。

## 第四类：日志和历史状态，不在 RM 本体里闭合
YARN 的运行诊断不能只看 RM，因为大量细节状态会落到：

- NM 本地日志目录。
- 聚合后的远端日志。
- Timeline Service V2 之类的历史与指标系统。

这决定了一个很重要的事实：RM 负责“当前应用全局状态”，但并不天然替代日志和历史系统。很多“应用失败原因”如果只停留在 RM 侧，是看不完整的。

## 第五类：重启恢复状态，有显式持久化边界
RM Restart 文档对应的一个核心问题是：哪些状态在 RM 重启后还能被恢复。只要你启用了状态存储和相关恢复机制，一部分应用状态、尝试信息和调度信息可以在 RM 重启后恢复出来。但如果没有这层状态存储，RM 就只是内存态控制面。

这也是为什么“RM HA”和“RM Restart”不能混成一个概念：

- HA 更偏可用性切换。
- Restart 更偏状态恢复。

## 怎么判断哪个才是“权威状态”
一个更稳的判断方法是：先看这个状态用于回答什么问题。

- “应用整体现在处于什么阶段”：先看 RM。
- “为什么这个容器退出”：先看 NM 与容器日志。
- “为什么某队列拿不到资源”：先看调度器与队列配置。
- “为什么历史指标和运行指标对不上”：再看 ATS v2 与日志聚合链路。

也就是说，YARN 没有一个单一元数据中心，而是多个状态中心按职责分层。

## 本页结论
YARN 的元数据不是库表元数据，而是运行时与治理状态的集合。RM 负责全局应用视角，调度器配置负责治理边界，节点标签与属性负责资源分区，日志与 Timeline 负责诊断与历史。谁是权威状态，必须结合你正在回答的问题来判断。
