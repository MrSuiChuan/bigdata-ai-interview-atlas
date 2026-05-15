---
kb_id: bigdata/yarn/core-objects-state
title: YARN 核心对象与状态所有权
description: 从 Application、ApplicationAttempt、Container、Queue、Node Label、Delegation Token 等对象出发，解释 YARN 里谁拥有状态、谁只执行动作。
domain: bigdata
component: yarn
topic: core-objects-state
difficulty: advanced
status: reviewed
sidebar_position: 2
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-architecture
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-node-labels
  - hadoop-yarn-application-security
claim_ids:
  - bigdata-yarn-claim-0003
  - bigdata-yarn-claim-0004
  - bigdata-yarn-claim-0009
  - bigdata-yarn-claim-0015
tags:
  - yarn
  - core-objects
  - state
  - knowledge-base
  - production
---
## YARN 最容易讲浅的地方，是对象名字都认识，却不知道状态到底归谁
真正做过 YARN 的人，回答不会停留在“RM、NM、AM、Container”这几个名字上。他会继续往下讲：哪些状态属于全局、哪些属于应用、哪些只是节点局部、哪些只是安全或调度附属状态。只有把状态归属说清楚，恢复、排障和治理题才会站得住。

## 先抓住最重要的五类对象
| 对象 | 核心作用 | 最关键的状态归属 |
| --- | --- | --- |
| Application | 一次提交到 YARN 的应用实体 | 全局应用级状态，主要由 RM 维护 |
| ApplicationAttempt | 应用的一次实际运行尝试 | 尝试级状态，和 AM 生命周期直接相关 |
| Container | 一次资源分配与进程启动单元 | 分配决策由 RM / Scheduler 产生，运行状态由 NM 感知 |
| Queue | 多租户资源治理边界 | 队列容量、访问边界和调度策略 |
| Node / Node Label / Node Attribute | 节点资源与资源分区边界 | 可分配资源池和放置范围 |

如果把这些对象全都看成“YARN 的内部名词”，后面很多回答会自动变糊。

## Application 和 ApplicationAttempt 不是同一个东西
这是很多面试里的分水岭。Application 表示“这次提交的应用整体”，而 ApplicationAttempt 表示“这个应用实际跑起来的某一次尝试”。

为什么这区分重要？因为它直接关系到恢复与重试：

- 应用整体还在，不代表当前 Attempt 没挂。
- AM 失败后，通常是 Application 的新 Attempt 再次启动。
- 排障时看到应用失败，往往要继续追到具体 Attempt 的日志和容器轨迹。

所以，讲 YARN 生命周期时如果没有 Attempt 这一层，往往说明理解还停在 UI 视图层。

## Container 的状态不是一个地方说了算
Container 很像 YARN 里的“资源契约单元”。它的状态要分成两半看：

- “该不该被分配、分配到哪里”主要是 RM / Scheduler 的决策结果。
- “有没有真正启动、跑成什么样、为什么退出”主要由 NM 侧观察和上报。

这就是为什么同样一个容器问题，根因可能完全不同：

- 资源申请迟迟拿不到，是调度层问题。
- 容器已经分配但启动失败，是 NM、本地化或环境问题。
- 容器反复退出，是上层框架进程或资源限制问题。

## Queue 是治理对象，不是目录层级装饰
队列不只是展示用路径，比如 `root.analytics.spark`。在 CapacityScheduler 下，队列是真正的治理对象：

- 谁能进来。
- 进来后最低能保住多少容量。
- 高峰时能不能借别人的空闲资源。
- 应用数、AM 占比、用户上限怎样约束。

所以 Queue 持有的不是“业务含义”，而是多租户资源边界。

## Node Label、Node Attribute、Placement Constraint 都是“放置语义”对象
YARN 里真正影响放置的不只是“某节点还有多少内存”。还包括：

- `Node Label`：把集群切成逻辑分区，队列或应用只能访问其中一部分。
- `Node Attribute`：给节点打上更细的属性标签，便于治理和选择。
- `Placement Constraint`：表达更强的亲和 / 反亲和与放置约束。

这些对象决定的是“资源不是均匀平铺在整个集群上的”。所以 YARN 的“资源不够”，很多时候其实是“你被允许使用的那部分资源不够”。

## 安全对象常被忽略，但它们也是状态边界
在安全模式下，YARN 不是谁提交都能直接启动进程。这里至少还存在几类安全相关对象：

- 提交用户与代理用户。
- Delegation Token / Credentials。
- Queue ACL。
- 日志访问边界。

这些对象虽然不直接决定调度速度，却会直接决定某次提交能不能成立、日志能不能看、AM 能不能代表应用继续申请资源。

## 一个更靠谱的状态分层方式
更稳的理解方式，是把对象分成四层：

1. 全局控制状态：Application、Queue、Cluster Node 状态。
2. 应用尝试状态：ApplicationAttempt、AM 注册与存活状态。
3. 节点执行状态：Container 启停、NM 健康、本地化、退出码。
4. 放置与安全附属状态：Label、Attribute、ACL、Token、日志权限。

这样分类以后，排障时就不会一上来只看 RM UI。

## 本页结论
YARN 的对象如果只背名词，几乎没有实战价值。真正关键的是状态归属：Application 和 Attempt 分层、Container 的调度状态与执行状态分层、Queue 和 Label 代表治理边界、安全对象代表访问边界。只要这几层立住，后面的恢复、排障和设计题就都能顺着展开。
