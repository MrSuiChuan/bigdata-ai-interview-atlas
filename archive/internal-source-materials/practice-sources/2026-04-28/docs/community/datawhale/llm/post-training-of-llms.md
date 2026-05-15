---
kb_id: community/datawhale/llm/post-training-of-llms
title: Datawhale post-training-of-llms 项目整理
domain: community
component: datawhale
topic: post-training-of-llms
difficulty: advanced
status: reviewed
sidebar_position: 30
version_scope: Datawhale post-training-of-llms as organized on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - datawhale-post-training-of-llms
claim_ids: []
---

# 一句话定位

围绕 LLM 后训练课程，适合整理 SFT、偏好优化、DPO/RLHF、评估和安全边界。

# 项目在面试系统里的位置

post-training-of-llms 在本系统中被归入「LLM 后训练项目」。整理它的目的不是复刻原仓库目录，而是把社区项目经验转成面试可表达的知识点、系统设计能力和项目复盘素材。

# 核心对象

1. SFT 数据：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
2. Preference Pair：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
3. Reward Model：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
4. DPO：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
5. RLHF：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
6. 评估集：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
7. 安全策略：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。

# 核心原理

1. 后训练主要改善指令遵循、偏好对齐和安全行为，不等于事实知识实时更新。
2. 偏好数据质量决定偏好优化上限。
3. 后训练必须配合回归评估防止能力退化。

# 可转化的面试场景

1. 比较 SFT 和 DPO
2. 设计偏好数据
3. 评估后训练效果

# 标准回答框架

回答 post-training-of-llms 相关问题时，建议按四步组织：

1. 先说明它解决的工程问题：LLM 后训练项目。
2. 再说明关键对象：SFT 数据、Preference Pair、Reward Model、DPO、RLHF。
3. 然后讲清执行链路、状态变化、失败恢复和可观测性。
4. 最后补充边界：哪些结论来自 Datawhale trusted-community，哪些 API、协议或版本行为需要官方文档交叉复核。

# 常见误区

1. 只介绍仓库做了什么，不提炼背后的通用机制。
2. 把教程步骤当成面试答案，没有讲对象、状态和链路。
3. 不说明项目适用边界和生产化差距。
4. 把社区经验直接说成官方事实。

# 需要官方交叉复核的点

1. 算法公式
2. 训练框架实现
3. 评估方法

# 题库入口

1. `q-community-datawhale-post-training-of-llms-0001`
1. `q-community-datawhale-post-training-of-llms-0002`
1. `q-community-datawhale-post-training-of-llms-0003`
1. `q-community-datawhale-post-training-of-llms-0004`
1. `q-community-datawhale-post-training-of-llms-0005`
