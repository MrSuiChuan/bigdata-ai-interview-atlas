---
id: q-ai-mcp-0003
title: 为什么说 MCP 解决不了 Agent 编排问题，但仍然非常重要
domain: ai-agent
component: mcp
topic: protocol-boundary
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "MCP docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - mcp-introduction
  - mcp-architecture
  - mcp-server-concepts
claim_ids:
  - agent-runtime-claim-0008
  - mcp-claim-0003
  - mcp-claim-0010
related_docs:
  - ai-agent/protocols/mcp
  - ai-agent/protocols/mcp-architecture-and-primitives
estimated_minutes: 7
---

# 题目

为什么说 MCP 解决不了 Agent 编排问题，但仍然非常重要？

# 一句话结论

因为它只负责标准化连接与能力暴露，不负责系统如何思考和调度；但正因为有了这个标准，Agent 运行时才能更容易接入外部世界。

# 核心机制

1. MCP 不规定 reasoning policy 和 orchestration
2. MCP 统一 capability discovery and invocation
3. 因而它是生态底座，而不是调度器

# 标准答案

MCP 很重要，但它不是编排框架。它解决的是上下文和能力如何标准化暴露给客户端的问题，而不是模型如何推理、任务怎样拆分、多个 Agent 如何交接。也正因为它把接入层标准化了，像 OpenAI Agents SDK、LangGraph 这类上层运行时才更容易复用同一套外部能力接入方式。所以它不解决编排，但为编排降低了集成成本。

# 必答点

1. protocol boundary
2. interoperability value
3. enable but not replace orchestration

# 常见误答

1. 认为 MCP 会自动规划 Agent 行为
2. 认为用了 MCP 就不需要上层运行时