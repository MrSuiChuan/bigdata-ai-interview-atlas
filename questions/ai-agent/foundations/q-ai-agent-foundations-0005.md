---
id: q-ai-agent-foundations-0005
title: 从零做 Agent 时，什么时候应该停在最小运行时，什么时候要升级到 Workflow 或 Harness
domain: ai-agent
component: agent-foundations
topic: from-scratch-agent-runtime-loop
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs and 实践资料 hello-agents repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - practice-hello-agents
claim_ids:
  - practice-p0-claim-0001
  - practice-p0-claim-0002
related_docs:
  - ai-agent/foundations/from-scratch-agent-runtime-loop-and-learning-path
  - ai-agent/foundations/session-memory-checkpoint-and-stop-policy
estimated_minutes: 12
---

# 题目

从零做 Agent 时，什么时候应该停在最小运行时，什么时候要升级到 Workflow 或 Harness？

# 一句话结论

当任务短、风险低、状态简单时，最小运行时就够；当任务开始跨步骤、跨进程、跨系统或涉及副作用恢复时，就该升级到 Workflow 或 Harness。

# 核心机制

1. 最小运行时解决单任务闭环
2. Workflow 解决预定义路径和确定性控制
3. Harness 解决长任务、恢复、审批、幂等和观测
4. 升级边界取决于风险、状态复杂度和恢复需求

# 标准答案

最小 Agent 运行时适合短任务、低风险任务和读多写少的场景，例如查询、总结、轻量分析。这时只要有模型决策、工具 schema、observation、run state 和 stop policy，系统就已经能稳定工作。只有当任务开始出现明显的多阶段控制、固定审批节点、等待外部事件、需要跨进程恢复、需要防止副作用重复执行时，才应该升级到 Workflow 或 Harness。Workflow 负责更确定性的路径控制，Harness 负责长任务执行责任、checkpoint、幂等、人工接管和观测。高质量回答的关键，不是说“功能越多越好”，而是说明升级边界由风险和状态复杂度决定。

# 必答点

1. 说明最小运行时适合什么场景
2. 说明 Workflow 解决什么问题
3. 说明 Harness 解决什么问题
4. 说明升级触发条件是风险和恢复需求
5. 说明不是一开始就堆所有框架能力

# 常见误答

1. 认为最小 Agent 一定不实用
2. 认为所有任务一开始都该上 Harness
3. 把 Workflow 和 Harness 混成同一层
4. 不讲副作用和恢复边界
