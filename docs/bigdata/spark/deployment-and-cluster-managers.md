---
kb_id: bigdata/spark/deployment-and-cluster-managers
title: Spark 部署模式与集群管理器
description: 解释 Spark client/cluster mode、Standalone、YARN、Kubernetes、动态资源、shuffle tracking 与 decommission 边界。
domain: bigdata
component: spark
topic: deployment-and-cluster-managers
difficulty: advanced
status: reviewed
sidebar_position: 8
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-cluster-overview
  - spark-submitting-applications
  - spark-running-on-yarn
  - spark-running-on-kubernetes
  - spark-standalone-mode
  - spark-job-scheduling
  - spark-configuration-doc
  - spark-docs-home
claim_ids:
  - spark-claim-0045
  - spark-claim-0046
  - spark-claim-0047
  - spark-claim-0048
  - spark-claim-0072
  - spark-claim-0073
  - spark-claim-0074
  - spark-claim-0142
  - spark-claim-0143
  - spark-claim-0144
tags:
  - spark
  - deploy
  - driver
  - executor
  - cluster-manager
  - dynamic-allocation
  - knowledge-base
  - production
---
## 定位与边界

部署模式决定 Driver 在哪里运行，集群管理器决定资源如何申请和回收。Spark 的执行语义仍然是 Driver 组织计划、Executor 执行 Task，但 Driver 的位置、网络可达性、日志归属、失败影响和资源生命周期会因 client mode、cluster mode、Standalone、YARN、Kubernetes 而不同。

不要把部署模式和计算模型混为一谈。client mode 不等于本地执行，cluster mode 也不等于更快；它们主要改变 Driver 生命周期和运维边界。

## Client Mode 与 Cluster Mode

client mode 下 Driver 运行在提交应用的客户端进程中，适合交互式调试和本地开发。风险是客户端断开、网络不可达或本机资源不足会直接影响应用，Driver 日志也在客户端侧。

cluster mode 下 Driver 运行在集群内部，适合生产定时任务和长时间运行任务。它降低了客户端机器对应用生命周期的影响，但要求集群侧具备完整依赖、日志、权限、镜像、配置和网络访问能力。

## 集群管理器差异

Standalone 是 Spark 自带的集群管理模式，概念简单，适合独立 Spark 集群。YARN 把 Spark 应用放入 Hadoop 资源队列，重点是队列容量、ApplicationMaster、NodeManager、container 日志和多租户治理。Kubernetes 把 Driver 和 Executor 映射为 Pod，重点是镜像、service account、namespace、pod 调度、volume 和 executor pod 生命周期。

这些模式都不改变 Spark 计划和 stage/task 的核心语义，但会改变资源申请、故障恢复、日志采集、依赖分发和安全隔离的具体操作方式。

## 动态资源与 Shuffle 边界

Dynamic Allocation 会根据 backlog 和空闲状态调整 executor 数量。它能提升集群利用率，但会引入 executor 回收与 shuffle 数据可用性的边界问题。传统做法依赖 external shuffle service；新模式可以依赖 shuffle tracking 等机制避免过早回收仍持有 shuffle 输出的 executor。

判断动态资源是否适合，要看作业是否存在长时间 shuffle 依赖、cache 重用、状态任务、短批次流任务和外部 shuffle 服务稳定性。动态资源不是免费扩缩容，错误配置会造成频繁申请释放、缓存失效、延迟波动和 shuffle fetch failure。

## Executor Decommission

Decommission 的目标是在节点维护、缩容或抢占时尽量迁移 shuffle 或缓存相关状态，降低直接杀 executor 带来的重算和失败风险。它不是事务保证，也不能消除所有 executor 丢失影响；它只是把“突然消失”变成“有机会迁移和通知”的过程。

排查 decommission 问题时，应看 executor removed reason、shuffle fetch failure、block migration 日志、cluster manager 事件和节点维护窗口。不能只看 Spark 应用是否最终成功，还要看重算代价和尾延迟是否被放大。

## 生产检查清单

1. Driver 位置：是否需要集群内长期运行，是否依赖客户端网络。
2. 依赖分发：jar、py-files、conf、native lib、镜像是否对 Driver 和 Executor 都可见。
3. 日志与 UI：Driver、executor、event log、History Server 是否可追踪。
4. 资源隔离：队列、namespace、service account、executor cores/memory/overhead 是否合理。
5. 动态资源：shuffle tracking、external shuffle service、idle timeout、min/max executor 是否匹配负载。
6. 退出语义：失败重试、driver restart、application attempt、pod/container 退出码是否能定位根因。

## 示例：提交参数阅读方式

```bash
spark-submit \
  --deploy-mode cluster \
  --master yarn \
  --conf spark.dynamicAllocation.enabled=true \
  --conf spark.shuffle.service.enabled=true \
  --conf spark.eventLog.enabled=true \
  app.py
```

这段配置不能只看“开了动态资源”。需要继续确认 YARN 队列是否允许扩容、external shuffle service 是否部署、event log 是否落到可靠存储、Driver 日志是否能从 ResourceManager 或 History Server 找到。

## 来源与事实边界

本页依据 Spark Cluster Mode、Submitting Applications、YARN、Kubernetes、Standalone、Job Scheduling 和 Configuration 文档。不同公司平台可能封装 spark-submit 或替换默认配置，实际生产判断必须以平台文档和当前应用配置为准。
