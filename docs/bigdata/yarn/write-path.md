---
kb_id: bigdata/yarn/write-path
title: YARN 应用提交路径与资源申请边界
description: 把 YARN 的“写入路径”纠正为应用提交、AM 启动、资源申请和容器启动链路，说明它真正推进的不是数据写入，而是资源接纳与执行上下文建立。
domain: bigdata
component: yarn
topic: write-path
difficulty: advanced
status: reviewed
sidebar_position: 5
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-architecture
  - hadoop-yarn-node-manager
  - hadoop-yarn-commands-reference
claim_ids:
  - bigdata-yarn-claim-0005
  - bigdata-yarn-claim-0006
tags:
  - yarn
  - submission-path
  - applicationmaster
  - container
  - knowledge-base
---
## YARN 没有传统意义上的“写入路径”，它真正推进的是应用提交和资源申请链路
很多组件都有写入路径，但 YARN 不是存储系统，所以不能把这页理解成“数据如何落盘”。放到 YARN 里，更准确的主题应该是：客户端如何把一个应用提交进集群、YARN 如何接纳它、怎样先启动 AM，再由 AM 继续申请更多 Containers。

## 第一步：客户端提交 Application
客户端提交时，进入 RM 的不是“一个已经在跑的任务”，而是一份应用定义和运行请求。此时 RM 记录的是一个新的 Application 实体，它会进入调度和接纳流程。

这一步最常见的误解是：以为应用一提交就直接在某个节点上跑起来。实际上还差非常多中间步骤。

## 第二步：先给 AM 找第一个 Container
YARN 里后续的一切协调都依赖 AM，所以调度链路的第一关键步，不是给业务任务分配 Container，而是先给 AM 分配一个可运行的 Container。没有这个 Container，应用连自己的协调器都起不来。

这也是为什么大量应用会长期停在 Accepted：

- 队列资源不足。
- `max-am-resource-percent` 等 AM 资源边界先被打满。
- 节点标签或资源规格让 AM Container 很难被安放。

## 第三步：NodeManager 真正启动 AM Container
Scheduler 决定把 AM 的 Container 给到哪个节点，不代表应用已经开始执行。真正把 AM 进程拉起来的是对应节点上的 NM。这里涉及的动作包括：

- 本地化依赖文件。
- 准备环境变量、命令和启动上下文。
- 在节点上真正启动进程。
- 向 RM 汇报运行与退出状态。

也就是说，调度成功和启动成功是两件不同的事。

## 第四步：AM 注册自己，再申请业务 Containers
AM 启动以后，会向 RM 注册自身，然后开始基于框架逻辑申请更多 Containers。这个阶段起，应用自己的资源策略才真正开始生效：

- 要多少 Containers。
- 每个 Container 多大。
- 是否要求本地性。
- 是否可以接受不同优先级和不同放置位置。

所以很多 YARN 性能问题其实不是“RM 慢”，而是 AM 的申请策略本来就不合理。

## 第五步：NM 继续批量拉起真正业务 Containers
当 Scheduler 继续分配出业务 Containers 后，对应 NM 再逐个执行启动。本地化、日志目录、磁盘健康、权限、依赖文件这些因素会再次成为关键边界。

这说明同一条应用提交链里，至少有两个完全不同的阶段会出问题：

1. AM 还没起来前的接纳与首个 Container 分配阶段。
2. AM 已经起来，但后续大批业务 Containers 起不来的执行阶段。

## 为什么这条链路和“数据写入”完全不同
真正的写存储系统，关注的是提交、持久化、可见性；而 YARN 这条链路关注的是：

- 资源是否被接纳。
- 首个协调器是否能启动。
- 后续资源能否持续拿到。
- 启动上下文是否完整。
- 节点侧容器是否真的活起来。

所以它不是数据路径，而是控制面和执行面联手建立运行上下文的路径。

## 生产里最先看的观察点
如果一条应用“提交了但没跑起来”，优先看：

1. Application 是否卡在 Accepted。
2. AM Container 是否迟迟拿不到。
3. AM Container 是否已经分配但启动失败。
4. AM 注册后，后续业务 Containers 是否申请策略异常或启动失败。

## 一个最小化观察示例
```bash
yarn application -status <application_id>
yarn logs -applicationId <application_id>
```

如果上层框架还有自己的 UI 或 driver 日志，这时候必须一起看，而不能只盯 YARN UI。

## 本页结论
YARN 的“提交路径”本质上是应用接纳和资源申请路径，不是数据写入路径。先启动 AM，再由 AM 继续申请 Containers，是这条链最容易被忽略、却最关键的原理点。
