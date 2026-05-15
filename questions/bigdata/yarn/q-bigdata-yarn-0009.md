---
id: q-bigdata-yarn-0009
title: 为什么 RM HA 打开了，YARN 也不等于应用无损恢复
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: fault-recovery
question_type: failure
difficulty: advanced
source_ids:
  - hadoop-yarn-resource-manager-ha
  - hadoop-yarn-resource-manager-restart
claim_ids:
  - bigdata-yarn-claim-0010
  - bigdata-yarn-claim-0023
  - bigdata-yarn-claim-0024
  - bigdata-yarn-claim-0034
related_docs:
  - bigdata/yarn/fault-recovery
estimated_minutes: 10
---

# 题目

为什么 RM HA 打开了，YARN 也不等于应用无损恢复？

# 一句话结论

因为 RM HA 解决的是控制面可用性，ApplicationAttempt、Container 和业务框架语义是否能继续，还要继续看 Restart、节点状态和上层框架。

# 这题想考什么

这题考的是你会不会把 HA、Restart、Attempt 重试和业务恢复拆开。

# 回答主线

1. 先讲 RM HA 解决什么。
2. 再讲 RM Restart 解决什么。
3. 再讲 Attempt 和 Container 层。
4. 最后回到业务框架边界。

# 参考作答

RM HA 的核心价值是让 `ResourceManager` 不成为控制面单点，所以它首先解决的是“谁继续提供调度与接纳服务”。但这不等于所有运行状态都天然无损接续。更准确的拆法应该是三层：第一层是 HA，回答谁是新的 Active RM；第二层是 Restart，回答旧状态能不能被重新带回来；第三层才是运行中的 Attempt、Container 和上层框架语义能不能继续接上。

再往下讲，`work-preserving restart` 也不能被说成“业务天然无损”。它更接近“尽量保住运行中的工作”，依赖 RM 状态恢复、NM 重同步和 AM 重注册。安全模式下甚至还要继续考虑 credentials 是否一起恢复，否则应用可能被接回来了，但访问 HDFS 或其他外围系统时又马上失败。

所以更成熟的答法一定会补一句：HA、Restart、Attempt 重试、Container 执行接续和业务语义恢复是分层的。只要你先分清“控制面活着”和“业务逻辑无损”不是同一件事，这题就不会答偏。

# 现场判断抓手

1. 能区分 HA 和 Restart。
2. 能讲到 Attempt / Container 层。
3. 能主动补上业务框架仍需承担恢复责任。

# 常见误区

1. 把 RM HA 当成全栈无感恢复。
2. 只讲 RM，不讲 AM 和 Container。
3. 把业务结果恢复也算进 YARN。

# 追问

1. work-preserving restart 为什么仍然不能直接等同于业务无损？
2. 节点故障时为什么 RM HA 帮不了容器执行面？
3. AM 重试和 Application 整体存活是什么关系？
