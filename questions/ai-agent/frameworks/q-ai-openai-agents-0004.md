---
id: q-ai-openai-agents-0004
title: OpenAI Agents SDK 里 handoff 和 agent-as-tool 的区别是什么
domain: ai-agent
component: openai-agents-sdk
topic: delegation
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-handoffs
  - openai-agents-sdk-tools
claim_ids:
  - openai-agents-claim-0005
  - openai-agents-claim-0006
  - openai-agents-claim-0007
related_docs:
  - ai-agent/frameworks/openai-agents-runtime-and-tools
  - ai-agent/frameworks/openai-agents-handoffs-sessions-tracing
estimated_minutes: 7
---

# 题目

OpenAI Agents SDK 里 handoff 和 agent-as-tool 的区别是什么？

# 一句话结论

agent-as-tool 是子能力调用，handoff 是控制权交接。

# 核心机制

1. agent-as-tool 调用完成后控制权返回原 Agent
2. handoff 是当前 Agent 把后续执行交给另一个 Agent
3. handoff 也作为工具暴露给模型，但运行时语义不同

# 标准答案

在 OpenAI Agents SDK 里，agent-as-tool 表示把另一个 Agent 作为子能力调用，调用完成后结果回到原 Agent；handoff 则表示当前 Agent 把后续执行正式交给另一个 Agent。两者都可能以“工具”形式暴露给模型，但 agent-as-tool 的本质是调用，handoff 的本质是 delegation。

# 必答点

1. control ownership
2. return semantics
3. 表示形式相似但运行时语义不同

# 常见误答

1. 认为两者只是命名不同
2. 认为 handoff 只是调用更复杂的工具