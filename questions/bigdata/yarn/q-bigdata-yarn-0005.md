---
id: q-bigdata-yarn-0005
title: YARN 的应用提交路径为什么一定要先讲 AM Container
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: write-path
question_type: operations
difficulty: advanced
source_ids:
  - hadoop-yarn-architecture
  - hadoop-yarn-node-manager
  - hadoop-yarn-capacity-scheduler
claim_ids:
  - bigdata-yarn-claim-0005
  - bigdata-yarn-claim-0006
  - bigdata-yarn-claim-0035
  - bigdata-yarn-claim-0040
related_docs:
  - bigdata/yarn/write-path
estimated_minutes: 10
---

# 题目

YARN 的应用提交路径为什么一定要先讲 AM Container？

# 一句话结论

因为没有首个 AM Container，应用连自己的协调器都起不来，后续所有业务 Containers 的申请和编排都无从谈起。

# 这题想考什么

这题考的是你有没有把“提交应用”和“真正进入运行阶段”分开。

# 回答主线

1. 先讲提交 Application。
2. 再讲为什么先调度 AM Container。
3. 再讲 NM 启动与 AM 注册。
4. 最后讲后续业务 Containers。

# 参考作答

更稳的答法是：客户端先把 `Application` 交给 RM，但这不等于应用已经在跑。YARN 必须先给 `ApplicationMaster` 分配首个 Container，因为没有 AM，应用就没有自己的协调器，后续既不能申请业务资源，也不能组织任务执行。也就是说，提交链路真正的分水岭不是“请求有没有送进 RM”，而是“首个 AM Container 有没有稳定起来并向 RM 注册”。

所以很多 `Accepted` 长时间不动的问题，本质上不是“业务任务太重”，而是 AM 入口阶段还没打通。这个阶段可能卡在三层：一是队列侧 `AM` 入口资源占比已经打满；二是标签或分区导致可见资源池太窄；三是容器虽然已经分配，但 `NodeManager` 的本地化、目录、健康检查或启动链没让 AM 真正活起来。

等 AM 通过 NM 启动并成功向 RM 注册以后，应用自己的资源申请策略才真正开始工作，后续业务 Containers 才会被陆续分配和启动。所以如果你能在回答里补一句“提交成功、AM 分配成功、AM 启动成功、AM 注册成功是四个不同层次”，这题就会明显深一层。

# 现场判断抓手

1. 能主动把 AM Container 放到提交链路最前面。
2. 能区分调度成功和容器启动成功。
3. 能说明 AM 注册后才进入后续资源申请。

# 常见误区

1. 把提交成功等同于应用开始运行。
2. 不提 AM Container。
3. 把 YARN 讲成直接给业务任务分配资源。

# 追问

1. 为什么很多应用会卡在 Accepted 而不是直接失败？
2. 如果 AM Container 分配了但没起来，优先看哪一层？
3. AM 申请策略为什么会反过来影响整体性能？
