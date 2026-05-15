---
id: q-bigdata-yarn-0030
title: RM HA、RM Restart 和 work-preserving restart 到底是什么关系
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
estimated_minutes: 12
---

# 题目

RM HA、RM Restart 和 work-preserving restart 到底是什么关系？

# 一句话结论

RM HA 解决的是控制面谁继续对外服务，RM Restart 解决的是状态能不能恢复，work-preserving restart 则进一步追求运行中的容器工作尽量不断掉，这三者不是同一层语义。

# 这题想考什么

这题考的是你能不能把 YARN 恢复语义拆开讲，而不是把所有恢复能力都压成一句“HA 就行”。

# 回答主线

1. 先讲 HA 只解决 Active/Standby 控制面可用性。
2. 再讲 Restart 关注 RM 重启后的状态重建。
3. 再讲 work-preserving restart 追求的是运行中工作尽量接续。
4. 最后补安全模式下 credentials 也属于恢复边界。

# 参考作答

更稳的讲法，是先把三个概念放回不同层次。`RM HA` 首先解决的是单个 ResourceManager 不能成为控制面单点，所以它回答的是“谁继续提供调度和接纳服务”。这并不等于应用一定无损继续。

`RM Restart` 进一步回答的是：RM 进程重启以后，之前的应用状态、调度状态和必要上下文能不能从持久化状态里恢复回来。再往下，`work-preserving restart` 才是在 Restart 语义上继续追求“已经在 NodeManager 上跑着的工作尽量不要白白丢掉”，也就是通过 RM 状态恢复、NM 重同步、AM 重注册，把运行中的容器工作重新接上。

所以这三个概念的关系，应该理解成一层层往里收：HA 解决控制面可用，Restart 解决状态是否带回来，work-preserving restart 解决运行中工作是否尽量保住。安全模式下还要继续考虑 credentials 是否一起恢复，否则作业即使被重新接纳，也可能在访问 HDFS 等外围系统时再次失败。

# 现场判断抓手

1. 能清楚区分 Active/Standby 和状态恢复。
2. 能解释 work-preserving restart 追求的是容器工作接续，而不是业务结果天然无损。
3. 能补一句安全模式下 credentials 也是恢复边界。

# 常见误区

1. 把 RM HA 直接等同于应用无感恢复。
2. 把 work-preserving restart 说成所有容器一定百分之百保活。
3. 完全不提 NM 重同步和 AM 重注册。

# 追问

1. 为什么 RM 已切到 Standby 也不代表应用已经恢复完成？
2. non-work-preserving restart 和 work-preserving restart 的实际差别在哪里？
3. 为什么恢复语义还要把 credentials 算进去？
