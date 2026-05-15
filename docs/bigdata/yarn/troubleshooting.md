---
kb_id: bigdata/yarn/troubleshooting
title: YARN 生产排障路径
description: 按提交失败、Accepted 卡住、AM 起不来、Container 启动失败、节点异常、日志缺失和上层框架失败等场景组织 YARN 的排障顺序。
domain: bigdata
component: yarn
topic: troubleshooting
difficulty: advanced
status: reviewed
sidebar_position: 17
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-commands-reference
  - hadoop-yarn-node-manager
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-resource-manager-restart
claim_ids:
  - bigdata-yarn-claim-0016
  - bigdata-yarn-claim-0017
  - bigdata-yarn-claim-0020
  - bigdata-yarn-claim-0038
  - bigdata-yarn-claim-0040
tags:
  - yarn
  - troubleshooting
  - diagnosis
  - knowledge-base
---
## YARN 排障最重要的第一步，不是翻日志，而是先把问题放回正确阶段
YARN 故障有一个非常典型的特点：表面都像“作业失败”，但其实阶段可能完全不同。真正稳的排障顺序，是先问它失败在提交、接纳、调度、节点执行还是上层框架语义层。

## 第一类：根本提交不进去
这类问题优先看身份、队列 ACL、代理用户和基础连接链路。连 Application 都进不了 RM，说明问题还停在入口层，而不是运行层。

## 第二类：长时间卡在 Accepted
这类问题优先看队列容量、AM 资源占比、节点标签和资源颗粒度。Accepted 说明应用已经进入系统，但连首个 AM Container 都没有稳定拿到。

## 第三类：AM Container 分配了，但 AM 起不来
这时候要立刻去看 NM、本地化和容器启动日志。很多人排障卡在这里，是因为只看 RM，没继续追节点执行面。

## 第四类：AM 起了，但后续业务 Containers 不稳定
这类问题更容易混进上层框架因素。此时要同时看：

- AM 申请策略。
- 队列与标签边界。
- NM 启动与本地化情况。
- 上层框架自己如何解释这些资源申请和失败。

## 第五类：节点异常或容器频繁丢失
优先看节点健康、磁盘、日志目录、本地化目录、NM 存活与退出码。只盯应用日志通常会缺失大量节点侧上下文。

## 第六类：日志缺失或拿不到
不要直接理解成“应用没日志”。先判断：

- 容器本地日志有没有生成。
- 日志聚合有没有成功。
- 权限与远端目录是否允许读取。

这类问题本质上是可见性边界问题，而不一定是应用没跑。

命令行上最有用的两步通常是：

```bash
yarn applicationattempt -list application_1710000000000_0421
yarn logs -applicationId application_1710000000000_0421
```

第一条帮你先确认是不是已经有 Attempt，以及 Attempt 层是否已经发生切换；第二条再去确认日志到底是没生成、没聚合，还是只是你现在看的入口不对。

## 第七类：其实是上层框架失败
这是 YARN 排障里最常见的边界错位。YARN 已经把容器起起来了，但 Spark / MapReduce / Flink 自己失败。此时 YARN 只能告诉你运行边界，不能替你解释业务算子或执行图逻辑。

## 一个更实用的排障主线
1. 先看 Application 是否进入 RM。
2. 再看是不是卡在 AM Container。
3. 再看 NM 和 Container 日志。
4. 再把证据和上层框架 UI 对上。
5. 最后才判断是否需要调整队列、标签、资源规格或应用申请策略。

## 本页结论
YARN 排障的关键不是“会不会看日志”，而是“能不能先按阶段分型，再把日志、队列和上层框架证据拼起来”。只要 Accepted、AM、Container、NM、上层框架这五层分得清，绝大多数 YARN 问题都能迅速收敛。
