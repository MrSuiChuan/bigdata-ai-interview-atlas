---
id: q-bigdata-yarn-0012
title: YARN 性能题为什么要先谈调度链，而不是先谈框架算子
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: performance-model
question_type: principle
difficulty: advanced
source_ids:
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-node-manager
claim_ids:
  - bigdata-yarn-claim-0012
  - bigdata-yarn-claim-0013
  - bigdata-yarn-claim-0020
related_docs:
  - bigdata/yarn/performance-model
estimated_minutes: 10
---

# 题目

YARN 性能题为什么要先谈调度链，而不是先谈框架算子？

# 一句话结论

因为 YARN 的性能首先体现在资源有没有顺畅地从队列和 Scheduler 流到 AM、Container 和节点执行链，而不是直接体现在算子效率上。

# 这题想考什么

这题考的是你能不能区分“YARN 性能”和“Spark 作业性能”。

# 回答主线

1. 先讲 YARN 关心的性能对象。
2. 再讲 Accepted、AM 申请、Container 规格、NM 启动四类瓶颈。
3. 最后讲与上层框架的边界。

# 参考作答

更稳的答法是：YARN 性能的重点不是 Spark 算子跑多快，而是应用能不能被及时接纳、AM 能不能起来、Container 能不能合理分配、NM 能不能把容器稳稳拉起。也就是说，它的第一性原理是调度链顺不顺。

如果应用长期卡在 Accepted、AM 资源占比太高、Container 规格把资源切得太碎、NM 本地化很慢，这些都会表现成“作业很慢”，但根因其实还没有进入业务算子层。所以回答时一定要先把 YARN 自己的性能模型讲出来，再决定哪些问题应该交给上层框架。

# 现场判断抓手

1. 能把调度链说成 YARN 的性能主对象。
2. 能区分 Accepted 问题和业务执行问题。
3. 能讲出 Container 规格与资源碎片。

# 常见误区

1. 直接从 Spark DAG 优化开始答。
2. 所有慢都归成 RM 性能差。
3. 不提 AM 和 NM。

# 追问

1. 为什么 AM 申请策略会成为 YARN 性能瓶颈？
2. Container 规格过大和过小各有什么问题？
3. 何时该把问题继续下放给 Spark 或 MapReduce 本身？
