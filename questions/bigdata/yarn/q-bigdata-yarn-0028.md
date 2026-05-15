---
id: q-bigdata-yarn-0028
title: YARN 的故障恢复为什么要先定位状态归属
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: fault-recovery
question_type: failure
difficulty: advanced
source_ids:
  - hadoop-yarn-resource-manager-restart
  - hadoop-yarn-resource-manager-ha
claim_ids:
  - bigdata-yarn-claim-0010
  - bigdata-yarn-claim-0017
related_docs:
  - bigdata/yarn/fault-recovery
estimated_minutes: 10
---

# 题目

YARN 的故障恢复为什么要先定位状态归属？

# 一句话结论

因为只有先分清 RM 控制状态、ApplicationAttempt 状态、Container 执行状态和上层框架语义状态分别归谁，才能判断这次故障到底能不能接回、要在哪一层重建。

# 这题想考什么

这题考的是恢复思维是否真正分层。

# 回答主线

1. 先列出四类状态。
2. 再讲 HA / Restart / Attempt / Container 各自对应哪层。
3. 最后讲恢复顺序。

# 参考作答

YARN 的恢复题最怕不分状态归属。RM 持有的是全局应用和调度控制状态，ApplicationAttempt 代表应用运行尝试，Container 是节点执行状态，而上层框架还持有自己的任务和业务语义状态。不同状态层决定恢复动作完全不同。

如果只是 RM 可用性问题，优先看 HA；如果是状态恢复问题，再看 Restart；如果是 AM 失败，就会落到 Attempt；如果是节点故障，则多半要重建 Containers；如果是业务框架或结果语义问题，YARN 本身又不兜。这就是为什么恢复题必须先问“坏的是哪层状态”。

# 现场判断抓手

1. 能列出 RM、Attempt、Container、上层框架四层状态。
2. 能把 HA 和 Restart 分开。
3. 能说明恢复动作应按状态层选择。

# 常见误区

1. 所有故障都回答成“重跑应用”。
2. 不分控制面和执行面。
3. 把 YARN 恢复能力讲成业务恢复能力。

# 追问

1. 为什么 RM 侧恢复了，Application 还是可能失败？
2. 节点故障时为什么要继续追 Container 和 AM？
3. 上层框架语义状态为什么不能算进 YARN 自身恢复边界？
