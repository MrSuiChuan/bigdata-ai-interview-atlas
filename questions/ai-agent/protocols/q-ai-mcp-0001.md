---
id: q-ai-mcp-0001
title: 为什么 MCP 应该被讲成协议层标准，而不是 Agent 框架
domain: ai-agent
component: mcp
topic: overview
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "MCP docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - mcp-introduction
  - mcp-architecture
claim_ids:
  - mcp-claim-0001
  - mcp-claim-0002
  - mcp-claim-0003
related_docs:
  - ai-agent/protocols/mcp
estimated_minutes: 6
---

# 题目

为什么 MCP 应该被讲成协议层标准，而不是 Agent 框架？

# 一句话结论

因为它解决的是能力暴露与互操作问题，而不是推理、规划或流程编排问题。

# 核心机制

1. MCP 定义 host-client-server 结构
2. 标准化 context 与 capability 暴露
3. 不规定 LLM 如何推理或系统如何编排

# 标准答案

MCP 应该被讲成协议层标准，因为它的核心任务是用统一的结构和消息方式，把工具、资源和提示模板等外部能力暴露给 AI 应用。它关注的是连接和互操作，而不是推理策略、任务规划或系统编排。所以 MCP 不是 Agent framework，而是 Agent 生态里的协议底座。

# 必答点

1. protocol not runtime
2. interoperability
3. no reasoning policy

# 常见误答

1. 把 MCP 当成工具框架
2. 以为接了 MCP 就自动拥有 Agent 系统