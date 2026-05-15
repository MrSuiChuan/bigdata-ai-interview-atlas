---
id: q-ai-practice-agent-harness-01
title: "长任务 Harness：为什么不能把它简化成一次模型调用？"
domain: ai-agent
component: agent-patterns
topic: harness-engineering
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-self-harness
claim_ids: []
related_docs:
  - ai-agent/foundations/agent-runtime-production-practice
estimated_minutes: 10
---

# 题目

长任务 Harness：为什么不能把它简化成一次模型调用？

# 一句话结论

长任务 Harness的重点是运行时控制，而不是单次生成。面试要说明模型、工具、状态、循环、停止条件和观测如何协作。

# 核心机制

一次模型调用只产生文本，Agent 运行时要在多步任务中不断读取状态、选择工具、处理异常、更新 trace，并在满足条件时安全停止。

# 标准答案

回答长任务 Harness时，不能只描述 prompt 或工具函数。应该先说明 Agent 是带状态和控制循环的系统，再解释工具调用只是外部动作接口。生产系统还要处理参数校验、权限、超时、重试、幂等、人工接管和评估回归。这样才能把实践经验上升为工程原理。

# 必答点

1. 说明 Agent 是运行时系统
2. 说明工具调用只是其中一层
3. 说明状态、循环和停止条件
4. 说明失败恢复和人工接管
5. 说明观测、评估和成本控制

# 常见误答

1. 只说模型会调用 API
2. 把 ReAct prompt 等同于完整 Agent
3. 不讲工具副作用
4. 不讲 trace 和评估

# 延伸追问

1. 如果工具返回错误，运行时如何处理？
2. 如何防止无限循环？
3. 什么场景不应该使用 Agent？

