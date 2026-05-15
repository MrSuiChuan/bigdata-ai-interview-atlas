---
kb_id: community/datawhale/ai-agent/self-harness
title: Datawhale self-harness 项目整理
domain: community
component: datawhale
topic: self-harness
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: Datawhale self-harness as organized on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - datawhale-self-harness
claim_ids: []
---

# 一句话定位

聚焦长时间运行 Agent 的 Harness Engineering，适合整理可靠性、状态恢复、评估和观测。

# 项目在面试系统里的位置

self-harness 在本系统中被归入「长任务 Agent 可靠性工程项目」。整理它的目的不是复刻原仓库目录，而是把社区项目经验转成面试可表达的知识点、系统设计能力和项目复盘素材。

# 核心对象

1. 任务状态机：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
2. Checkpoint：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
3. 工具调用日志：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
4. 错误分类：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
5. 人工接管：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。
6. 评估集：回答时要说明它在链路中维护什么状态、和谁交互、失败时如何定位。

# 核心原理

1. Harness 把 Agent 从 demo 包装成可恢复、可观测、可评估的运行系统。
2. 长任务失败后必须知道执行到哪里、是否可重试、是否有副作用。
3. 评估和 tracing 是长任务 Agent 的基本能力。

# 可转化的面试场景

1. 设计长任务 Agent
2. 排查 Agent 执行中断
3. 说明 checkpoint 保存什么

# 标准回答框架

回答 self-harness 相关问题时，建议按四步组织：

1. 先说明它解决的工程问题：长任务 Agent 可靠性工程项目。
2. 再说明关键对象：任务状态机、Checkpoint、工具调用日志、错误分类、人工接管。
3. 然后讲清执行链路、状态变化、失败恢复和可观测性。
4. 最后补充边界：哪些结论来自 Datawhale trusted-community，哪些 API、协议或版本行为需要官方文档交叉复核。

# 常见误区

1. 只介绍仓库做了什么，不提炼背后的通用机制。
2. 把教程步骤当成面试答案，没有讲对象、状态和链路。
3. 不说明项目适用边界和生产化差距。
4. 把社区经验直接说成官方事实。

# 需要官方交叉复核的点

1. 具体 harness 实现
2. 日志/追踪工具接口
3. 模型调用重试语义

# 题库入口

1. `q-community-datawhale-self-harness-0001`
1. `q-community-datawhale-self-harness-0002`
1. `q-community-datawhale-self-harness-0003`
1. `q-community-datawhale-self-harness-0004`
1. `q-community-datawhale-self-harness-0005`
