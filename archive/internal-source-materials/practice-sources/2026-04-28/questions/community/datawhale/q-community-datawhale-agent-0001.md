---
id: q-community-datawhale-agent-0001
title: Datawhale Agent 主线里，为什么不能把 Agent 简化成“LLM 加工具调用”？
domain: community
component: datawhale
topic: agent-runtime
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale Agent repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-hello-agents
  - datawhale-self-harness
claim_ids: []
related_docs:
  - community/datawhale/ai-agent/p0-agent-mainline
estimated_minutes: 10
---

# 题目

Datawhale Agent 主线里，为什么不能把 Agent 简化成“LLM 加工具调用”？

# 一句话结论

因为 Agent 是一个运行时系统，工具调用只是其中一层。高质量回答必须覆盖模型决策、工具边界、状态管理、执行循环、失败恢复、观测和评估。

# 核心机制

Agent 至少包含五个部分：模型负责理解和决策，工具负责外部动作，状态记录任务过程，控制循环决定下一步和停止条件，观测评估负责判断是否可用。只讲工具调用，会遗漏权限、重试、超时、幂等、人工接管和审计。

# 标准答案

不能把 Agent 简化成“LLM 加工具调用”。工具调用只说明模型可以请求外部能力，但 Agent 真正难的是运行时控制。一个可落地的 Agent 要能维护任务状态，决定什么时候调用工具、什么时候停止、什么时候回退；要能处理工具失败、参数错误、权限不足和副作用；还要有 tracing、日志、评估和人工接管。Datawhale 的 Agent 项目更适合作为实践入口，但面试回答要把它上升为 runtime 问题，而不是 demo 问题。

# 必答点

1. 说明 Agent 是 runtime，不是单条 prompt。
2. 说明工具调用只是一层能力。
3. 说明状态、循环、停止条件和失败恢复。
4. 说明权限、审计和观测。
5. 说明项目实践如何转成工程表达。

# 常见误答

1. 只说 Agent 能调用 API。
2. 把 ReAct prompt 等同于完整 Agent 系统。
3. 不讲工具失败和副作用。
4. 不讲 tracing 和评估。

# 延伸追问

1. 如果工具返回错误，Agent 应该怎么处理？
2. 长任务 Agent 为什么需要 checkpoint？
3. 如何防止 Agent 无限循环？
