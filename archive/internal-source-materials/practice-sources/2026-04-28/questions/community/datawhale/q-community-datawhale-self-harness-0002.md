---
id: q-community-datawhale-self-harness-0002
title: 如果基于 self-harness 做一个可面试的系统方案，核心架构应该怎么讲？
domain: community
component: datawhale
topic: self-harness
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: Datawhale self-harness as organized on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - datawhale-self-harness
claim_ids: []
related_docs:
  - community/datawhale/ai-agent/self-harness
estimated_minutes: 10
---

# 题目

如果基于 self-harness 做一个可面试的系统方案，核心架构应该怎么讲？

# 一句话结论

基于 self-harness 讲系统设计时，要先抽象目标和边界，再画出 任务状态机、Checkpoint、工具调用日志、错误分类 等核心对象的协作链路，并补充状态存储、失败恢复、观测指标和权限控制。不能只复述安装步骤或 notebook 流程。

# 核心机制

1. Harness 把 Agent 从 demo 包装成可恢复、可观测、可评估的运行系统。
2. 长任务失败后必须知道执行到哪里、是否可重试、是否有副作用。
3. 评估和 tracing 是长任务 Agent 的基本能力。

# 标准答案

基于 self-harness 讲系统设计时，要先抽象目标和边界，再画出 任务状态机、Checkpoint、工具调用日志、错误分类 等核心对象的协作链路，并补充状态存储、失败恢复、观测指标和权限控制。不能只复述安装步骤或 notebook 流程。 具体回答时要把 任务状态机、Checkpoint、工具调用日志、错误分类、人工接管 放到同一条链路里解释，说明它们分别承担什么职责、维护什么状态、异常时如何定位。最后要补充：Datawhale 在这里作为 trusted-community 来源，适合提供项目经验和学习路径；涉及 API、协议、框架版本或模型能力边界时，必须继续用官方来源交叉复核。

# 必答点

1. 说明项目定位：长任务 Agent 可靠性工程项目。
2. 说明核心对象：任务状态机、Checkpoint、工具调用日志、错误分类、人工接管。
3. 说明执行链路和状态变化。
4. 说明失败排查或工程权衡。
5. 说明 trusted-community 和官方复核边界。

# 常见误答

1. 只背项目名或仓库目录。
2. 只讲安装步骤，不讲机制。
3. 不讲异常和边界。
4. 把社区经验直接当成官方事实。

# 延伸追问

1. 设计长任务 Agent 时，你会如何设计评估指标？
2. 排查 Agent 执行中断 时，你会如何设计评估指标？
3. 说明 checkpoint 保存什么 时，你会如何设计评估指标？
