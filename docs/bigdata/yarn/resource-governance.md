---
kb_id: bigdata/yarn/resource-governance
title: YARN 资源治理与多租户边界
description: 围绕 CapacityScheduler、队列树、用户上限、AM 资源占比、预留与抢占，解释 YARN 共享集群如何做多租户资源治理。
domain: bigdata
component: yarn
topic: resource-governance
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-node-labels
  - hadoop-yarn-node-attributes
  - hadoop-yarn-reservation-system
  - hadoop-yarn-placement-constraints
claim_ids:
  - bigdata-yarn-claim-0009
  - bigdata-yarn-claim-0014
  - bigdata-yarn-claim-0030
  - bigdata-yarn-claim-0035
tags:
  - yarn
  - resource-governance
  - capacityscheduler
  - multi-tenant
  - knowledge-base
---
## YARN 的资源治理，本质上不是“调大队列”，而是给不同租户和不同负载建立稳定资源边界
共享 YARN 集群最怕的不是资源不够，而是资源边界不清。Spark 批作业、MapReduce 回填、临时报表、流式批量补数如果都混进同一个资源池，最后的结果往往不是“大家都慢一点”，而是高峰时段整个集群进入拥塞、AM 起不来、短作业长期排队、重作业挤占所有空闲资源。

在 YARN 里，这件事主要由 `CapacityScheduler` 解决。它不是简单的先进先出队列，而是一套多租户容量治理模型：

- 队列有层级。
- 每层可以有最小保证与最大上限。
- 空闲资源可以在规则内弹性借用。
- 用户、应用数、AM 资源占比、标签可见性都能参与治理。

## 为什么 Queue 在 YARN 里是真治理对象
Queue 在 RM UI 上看起来像目录树，但它真正承载的是：

- 谁可以提交应用。
- 一类业务最低能保住多少容量。
- 一类业务最高能借到多少资源。
- 某类应用能不能访问带标签的节点分区。
- 应用与用户是否会被上限保护卡住。

因此，YARN 的多租户不是“大家进同一个集群就行”，而是“大家先被路由进不同治理边界”。

## CapacityScheduler 的核心思路，不是平均主义，而是有保证的弹性共享
CapacityScheduler 之所以适合企业共享集群，是因为它同时追求两件事：

1. 给关键租户保底。
2. 在别人空闲时允许弹性借用。

这和“绝对平均分资源”完全不是一回事。真正成熟的资源治理，也从来不是大家一人一半，而是关键业务保底、非关键业务吃弹性。

## AM 资源上限为什么经常成为“应用明明进了队列却起不来”的第一道门
很多团队第一次遇到 YARN 资源治理问题时，会盯着队列总容量看，结果发现队列好像还有空闲资源，但应用仍然卡在 `Accepted`。这里一个非常关键、也非常官方的机制是 `maximum-am-resource-percent` 一类 AM 资源占比限制。

这意味着队列里并不是所有资源都能直接拿来启动新的 `ApplicationMaster`。一旦 AM 可用配额先打满，就会出现下面这种现象：

- 队列整体还有剩余资源。
- 已有任务容器也许还在正常跑。
- 但新的应用连第一个 AM Container 都进不去。

所以 YARN 的“应用进不去”经常不是总资源绝对不足，而是入口型资源被单独卡住了。这个边界如果回答不出来，资源治理题就容易停留在“调大队列容量”这种过粗粒度上。

## 资源治理里最容易被忽视的四个边界
### 1. AM 资源边界
大量应用排队却起不来时，经常不是队列总资源耗尽，而是 AM 能占用的资源比例先被打满。因为没有 AM，应用后续根本谈不上申请任务 Containers。

### 2. 用户与应用数边界
如果一个团队高峰期一次提交大量小应用，可能不是每个应用都很大，但会把同一队列的应用数和用户上限打满，导致别人看起来“有资源却拿不到”。

### 3. 节点标签与属性边界
资源不是默认整个集群共享的。只要标签、属性或放置约束生效，你的队列看到的资源池就会突然变小。很多“集群明明空闲，为什么我拿不到资源”其实就是这个原因。

### 4. 预留与抢占边界
Reservation System 和 preemption 都属于更高级的治理工具。它们不是为了让系统更复杂，而是为了在高峰和长周期容量规划下，让关键负载有时间维度上的资源保证。

## Reservation System 解决的是“时间轴上的资源承诺”，不是简单再加一层队列
只靠队列容量，YARN 更擅长回答“此刻谁至少能拿多少资源”。但对于夜间大回填、定时批任务或者必须在某个时间窗内启动的关键负载，仅有瞬时容量边界还不够。

Reservation System 的价值就在这里：它把治理从“空间上的资源切分”扩展到“时间上的资源承诺”。更稳的理解方式是：

- Queue / capacity 决定平时怎么共享。
- Reservation 决定未来某个时间段能否提前留出资源。

这也是为什么它通常要和 `plan queue` 这类治理对象一起理解，而不是把它看成一个单独的调度插件名字。

## 一个更靠谱的资源治理配置思路
真正做 YARN 资源治理时，建议按下面顺序设计：

1. 先按团队或负载形态拆主队列。
2. 再给每个队列定义最小容量和允许弹性上限。
3. 再决定 AM 占比、用户上限、并发应用保护边界。
4. 最后才引入标签、预留、属性和放置约束做精细治理。

很多集群一上来就把标签和限制打得很细，最后不是治理更强，而是人人都拿不到资源。

## 一个最小化示例
```xml
<property>
  <name>yarn.scheduler.capacity.root.queues</name>
  <value>etl,adhoc</value>
</property>
<property>
  <name>yarn.scheduler.capacity.root.etl.capacity</name>
  <value>70</value>
</property>
<property>
  <name>yarn.scheduler.capacity.root.adhoc.capacity</name>
  <value>30</value>
</property>
<property>
  <name>yarn.scheduler.capacity.root.adhoc.maximum-am-resource-percent</name>
  <value>0.2</value>
</property>
```

这个示例的重点不是背属性，而是理解它在表达什么：不同负载先分开，再决定保底、弹性和 AM 入口边界。

## 本页结论
YARN 的资源治理题，核心不是“怎么调一个队列参数”，而是“怎么把共享集群拆成稳定的资源边界”。回答到位的关键，是把队列层级、容量、AM 占比、用户上限、标签与预留系统串成一条治理主线。
