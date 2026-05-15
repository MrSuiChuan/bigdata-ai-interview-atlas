---
kb_id: bigdata/yarn/fault-recovery
title: YARN 故障恢复与状态重建
description: 围绕 ResourceManager HA、ResourceManager Restart、ApplicationAttempt 重试与 NodeManager 故障，解释 YARN 故障后哪些状态能接回来，哪些必须重新建立。
domain: bigdata
component: yarn
topic: fault-recovery
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-resource-manager-ha
  - hadoop-yarn-resource-manager-restart
  - hadoop-yarn-node-manager
  - hadoop-yarn-architecture
claim_ids:
  - bigdata-yarn-claim-0010
  - bigdata-yarn-claim-0017
  - bigdata-yarn-claim-0023
  - bigdata-yarn-claim-0024
  - bigdata-yarn-claim-0034
tags:
  - yarn
  - fault-recovery
  - rm-ha
  - restart
  - knowledge-base
---
## YARN 的恢复题，第一步不是谈“有没有 HA”，而是先问“坏掉的是哪一层状态”
YARN 的故障恢复最容易被讲偏成一句话：“RM 做 HA 就行”。这远远不够。真正的恢复判断，至少要分四层：

- RM 控制面还在不在。
- RM 的状态能不能恢复。
- 当前 ApplicationAttempt 能不能继续。
- 节点上的 Containers 还活不活、能不能被重新接回。

如果不先分层，HA、Restart、AM retry、Container 重试这些概念就会被混成一团。

## 第一层：RM HA 解决的是控制面可用性
RM HA 的核心价值是：当 `Active RM` 不可用时，`Standby RM` 可以接管服务，从而避免整个集群失去接纳和调度入口。它回答的是“RM 还在不在”，而不是“应用一定无损继续”。

这里一个很容易被讲错的细节是：HA 不是两个调度器一起对外分流，而是任一时刻只有一个 RM 处于 Active 状态。客户端、NM 和 AM 最终都要重新连到新的 Active RM 上，控制面才算真正恢复。

所以 RM HA 很重要，但它不是全部恢复语义。只有理解到这一步，后面才不会把所有恢复能力都压到 HA 上。

## 第二层：RM Restart 解决的是状态能不能接回来
RM Restart 更关心的是：RM 重启以后，之前的应用状态、调度状态和必要上下文能否从状态存储里恢复出来。尤其是 work-preserving restart 这类能力，重点就是尽可能不让已经在节点上运行的工作白白丢掉。

这说明 HA 和 Restart 分别回答两个问题：

- HA：谁继续对外服务。
- Restart：新的 RM 能带着多少旧状态回来。

如果再往下追一层，RM Restart 其实还要区分两种语义：

- `non-work-preserving restart`：RM 恢复应用与调度状态，但节点上的旧容器不会按“原样继续跑”这个目标来保留。
- `work-preserving restart`：RM 依赖状态存储、NM 重同步和 AM 重注册，尽量把已经跑着的工作重新接回来。

这也是为什么生产里不能只说一句“RM 支持 restart”。真正有用的是讲清楚恢复的是控制面元数据，还是连运行中的容器工作也希望一起接上。

## 第三层：ApplicationAttempt 仍然是应用级恢复核心
就算 RM 层恢复得很好，也不代表当前 AM 一定还正常。AM 如果挂了，Application 往往要靠新的 Attempt 再起来。也就是说，应用层恢复最终还是绕不过 Attempt。

因此，真正成熟的恢复回答一定会补一句：RM 恢复和应用恢复是两层事。控制面回来了，不代表作业就已经从业务视角恢复完成。

## 第四层：NodeManager 和 Container 的恢复边界
节点故障时，最直接受影响的是该节点上的 Containers。这里的关键不是“RM 是否知道节点掉了”，而是：

- 这些 Containers 的运行上下文是否还存在。
- 上层框架或 AM 是否会重新申请替代容器。
- 节点恢复后，之前状态是否还能被接续或只能重建。

所以节点级故障和 RM 故障是两种完全不同的恢复语义。

## 第五层：安全模式下，恢复还要带上 credentials
如果集群开了安全模式，恢复问题还不只是“任务有没有状态”。RM Restart 官方文档还强调了 credentials 的恢复与重新下发边界。原因很简单：应用即使被重新接纳，如果它访问 HDFS 或其他 Hadoop 服务所需的 credentials 没有跟着恢复，作业也只是“看起来回来了”，实际上很快会在外围访问上再次失败。

## 一个更可靠的恢复判断顺序
1. 先确认坏掉的是 RM、AM、NM 还是业务进程本体。
2. 再确认这是可用性切换问题还是状态恢复问题。
3. 再判断是否需要新的 Attempt 或新的 Containers。
4. 最后才判断上层框架和业务语义如何补偿。

## 生产里最容易犯的误解
1. 把 RM HA 当成应用无感恢复。
2. 把 work-preserving restart 当成所有 Containers 都一定保活。
3. 看到新 Attempt 起来，就以为业务自动幂等。
4. 节点掉了却只盯 RM，不追容器和日志。 

## 本页结论
YARN 的故障恢复，核心是分清控制面恢复、状态恢复、应用尝试恢复和节点执行恢复。只要先问“坏的是哪层状态”，RM HA、RM Restart、Attempt 重试和 Container 重建的关系就会清楚很多。
