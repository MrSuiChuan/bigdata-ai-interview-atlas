---
id: q-bigdata-yarn-0014
title: CapacityScheduler 为什么既是容量模型，也是多租户治理模型
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: resource-governance
question_type: system-design
difficulty: advanced
source_ids:
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-reservation-system
claim_ids:
  - bigdata-yarn-claim-0014
  - bigdata-yarn-claim-0030
  - bigdata-yarn-claim-0035
related_docs:
  - bigdata/yarn/resource-governance
estimated_minutes: 10
---

# 题目

CapacityScheduler 为什么既是容量模型，也是多租户治理模型？

# 一句话结论

因为它不只是给队列分比例，还同时定义谁能进来、最低保底是多少、最高能借多少、AM 能占多少、哪些标签能访问。

# 这题想考什么

这题考的是你是否把 CapacityScheduler 看成平台治理核心，而不是单纯配置文件。

# 回答主线

1. 先讲它控制什么。
2. 再讲为什么不仅是容量百分比。
3. 再讲多租户场景下的价值。

# 参考作答

CapacityScheduler 的价值从来不只是“root 下几个队列各分多少容量”。它还定义队列树、用户入口、AM 资源边界、应用数限制、弹性借用、标签可见性，必要时还会和预留系统一起形成时间维度上的资源治理。

如果再往下讲透一点，至少要补两个高价值边界。第一个是 `AM` 入口资源边界，很多“队列看起来还有容量但应用就是起不来”的问题，其实不是总资源不够，而是 AM 可占资源比例已经先被打满。第二个是时间维度边界，普通容量模型解决的是“现在怎么分”，`ReservationSystem` 解决的是“未来某个时间窗能否提前保住资源”。

所以把它讲成“容量配置器”会太浅。更准确的说法是：它是 YARN 共享集群里的多租户资源治理骨架。真正的关键，不只是比例，而是谁被允许用哪部分资源、在高峰期怎样保底、在空闲时怎样借用、应用入口何时会被 AM 边界卡住，以及关键任务是否需要时间维度上的资源承诺。

# 现场判断抓手

1. 能提到 AM 资源边界和标签可见性。
2. 能解释保底和弹性借用。
3. 能把它和多租户治理联系起来。

# 常见误区

1. 只谈 capacity 百分比。
2. 不讲用户和应用数边界。
3. 忽略标签和预留。

# 追问

1. 为什么很多应用卡在 Accepted 其实和 AM 边界有关？
2. 预留系统适合解决什么问题？
3. 标签和队列结合后为什么治理会更强也更复杂？
