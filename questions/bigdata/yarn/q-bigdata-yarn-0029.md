---
id: q-bigdata-yarn-0029
title: 为什么队列看起来还有容量，应用却还是长期卡在 Accepted
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: resource-governance
question_type: troubleshooting
difficulty: advanced
source_ids:
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-node-labels
claim_ids:
  - bigdata-yarn-claim-0014
  - bigdata-yarn-claim-0035
related_docs:
  - bigdata/yarn/resource-governance
  - bigdata/yarn/troubleshooting
estimated_minutes: 10
---

# 题目

为什么队列看起来还有容量，应用却还是长期卡在 Accepted？

# 一句话结论

因为能不能启动新应用，先受 AM 入口资源、标签可见资源池、用户与应用数限制约束，而不是只看队列总容量百分比。

# 这题想考什么

这题考的是你能不能把“队列有资源”和“应用能起得来”拆成两个层次，而不是只会盯总资源水位。

# 回答主线

1. 先讲 Accepted 说明应用已经提交成功，但 AM 还没稳定拿到入口容器。
2. 再讲 AM 资源占比、标签分区、用户限制这三类常见门槛。
3. 最后讲为什么不能只看队列总容量。

# 参考作答

应用卡在 `Accepted`，首先说明它不是提交 ACL 问题，而是进入了调度阶段但还没有把第一个 `ApplicationMaster` 稳定拉起来。这个阶段最容易被误判的地方，就是大家只看“队列还剩多少容量”。

更准确的判断要往下拆。第一类常见边界是 `maximum-am-resource-percent` 一类 AM 入口资源上限。队列整体可能还有资源，但允许给 AM 使用的那部分已经打满了，于是新应用连第一个入口容器都起不来。第二类边界是节点标签或其他资源分区。全局有空闲资源，不等于当前队列或当前应用能访问到那部分资源。第三类边界是用户数、并发应用数这类治理限制，看起来不像“资源不足”，但同样会让应用停在 Accepted。

所以更成熟的答案一定会补一句：Accepted 不是简单的“集群没资源”，而是“入口资源、资源可见性和治理限制共同决定的结果”。

# 现场判断抓手

1. 能主动提到 AM 资源占比，而不只谈队列总容量。
2. 能提到标签分区会改变可见资源池。
3. 能把用户或应用数限制也纳入诊断视角。

# 常见误区

1. 只看 RM UI 上队列剩余容量就下结论。
2. 把 Accepted 直接等同于集群整体资源不够。
3. 完全不提 AM 入口资源边界。

# 追问

1. 为什么 AM 起不来时还不能谈后续业务 Containers？
2. 标签分区会怎样制造“全局有资源、局部没资源”的错觉？
3. 哪类命令或指标最适合证明问题卡在 AM 入口而不是执行层？
