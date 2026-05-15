---
id: q-ai-agent-0001
title: 为什么 AI Agent 不应该被讲成“带工具的聊天机器人”
domain: ai-agent
component: agent-runtime
topic: overview
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Official AI agent framework docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-docs
  - langgraph-overview-docs
  - microsoft-agent-framework-overview
claim_ids:
  - agent-runtime-claim-0001
  - agent-runtime-claim-0010
related_docs:
  - ai-agent/foundations/overview
estimated_minutes: 6
---

# 题目

为什么 AI Agent 不应该被讲成“带工具的聊天机器人”？

# 一句话结论

因为现代 Agent 系统的核心不只是工具调用，而是把模型、工具、状态、编排和观测组织成同一运行时。

# 核心机制

1. Agent 有多轮执行循环，而不是一次性回复
2. 系统要管理工具、状态、交接和恢复
3. 生产里还必须考虑 tracing、guardrails 和可治理性

# 标准答案

AI Agent 不能只讲成“带工具的聊天机器人”，因为主流框架都把模型调用外面的运行时问题做成了一等公民，包括工具调用、状态管理、任务交接、可恢复执行和观测控制。聊天机器人更像一个前端形态，而 Agent 是一套执行系统。高质量回答应该从运行时视角讲，而不是只停在 Prompt 和工具列表。

# 必答点

1. 运行时视角
2. 状态与编排
3. 生产治理能力

# 常见误答

1. 把 Agent 简化成“会调函数的大模型”
2. 完全不提状态和流程控制