---
id: q-ai-openai-agents-0001
title: 为什么在某些场景下应该使用 OpenAI Agents SDK，而不是只做底层模型调用
domain: ai-agent
component: openai-agents-sdk
topic: runtime-choice
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "OpenAI Agents SDK docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-docs
  - openai-platform-agents-overview
claim_ids:
  - openai-agents-claim-0001
  - openai-agents-claim-0002
related_docs:
  - ai-agent/frameworks/openai-agents-sdk
estimated_minutes: 6
---

# 题目

为什么在某些场景下应该使用 OpenAI Agents SDK，而不是只做底层模型调用？

# 一句话结论

因为它提供的是多步骤 Agent 运行时，而不只是一次模型生成接口。

# 核心机制

1. 简单单轮调用时，底层 API 可能足够
2. 多步骤任务需要 tools、handoffs、sessions、guardrails、tracing
3. SDK 把这些重复工程统一收进运行时

# 标准答案

如果任务只是简单单轮生成，直接用底层模型调用往往已经够用；但当系统需要多轮工具调用、跨轮状态、任务交接、策略拦截和可观测性时，OpenAI Agents SDK 会更合适。因为它不是简单语法糖，而是围绕 agents、tools、handoffs、sessions、guardrails 和 tracing 组织的一套运行时。

# 必答点

1. 轻量 runtime 定位
2. 多步骤任务场景
3. 底层调用并没有被完全取代

# 常见误答

1. 说成“所有 OpenAI 接入都应该先上 SDK”
2. 把它说成 Prompt 包装器