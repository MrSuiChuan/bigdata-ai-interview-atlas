---
id: q-bigdata-yarn-0003
title: ResourceManager、Scheduler、ApplicationMaster、NodeManager 各自负责什么
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: architecture-and-roles
question_type: principle
difficulty: intermediate
source_ids:
  - hadoop-yarn-architecture
  - hadoop-yarn-node-manager
claim_ids:
  - bigdata-yarn-claim-0001
  - bigdata-yarn-claim-0004
  - bigdata-yarn-claim-0005
related_docs:
  - bigdata/yarn/architecture-and-roles
estimated_minutes: 8
---

# 题目

ResourceManager、Scheduler、ApplicationMaster、NodeManager 各自负责什么？

# 一句话结论

RM 是全局控制面，Scheduler 是资源分配策略层，AM 是每应用协调器，NM 是节点执行代理，Container 是最终资源与进程承载单元。

# 这题想考什么

这题考的是你能不能把 YARN 讲成“控制面 + 应用协调面 + 节点执行面”，而不是平铺角色表。

# 回答主线

1. 先给四个角色定性。
2. 再讲它们如何串成一次提交链路。
3. 再补一句 Scheduler 为什么是纯调度器。
4. 最后讲 Container 的位置。

# 参考作答

RM 负责全局接纳和资源管理，Scheduler 负责按队列和资源规则做资源分配；AM 是每个应用自己的协调器，向 RM 注册后继续申请和释放 Containers；NM 在单节点上真正启动、监控和清理 Containers。

这几层不能混。尤其 Scheduler 只是资源分配策略层，它不替 Spark 理解 DAG，也不替业务决定逻辑重试。Container 则是最终被分配的资源单元，调度成功和容器启动成功也不是同一件事。把这条关系讲清楚，YARN 架构题就不会停留在名词堆里。

# 现场判断抓手

1. 能区分 RM 和 Scheduler。
2. 能把 AM 说成“每应用一个协调器”。
3. 能指出 NM 负责本地化和节点侧执行。

# 常见误区

1. 把 Scheduler 当成可忽略的内部细节。
2. 把 AM 说成 RM 的一个子线程。
3. 不提 Container。

# 追问

1. 为什么 AM 必须先拿到第一个 Container？
2. 为什么 NM 不是被动守护进程？
3. Scheduler 为什么不负责业务任务正确性？
