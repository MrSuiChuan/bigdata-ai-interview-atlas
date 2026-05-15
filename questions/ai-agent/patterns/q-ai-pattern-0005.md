---
id: q-ai-pattern-0005
title: 为什么说协议、运行时、模式三层不分开，Agent 架构就会讲乱
domain: ai-agent
component: agent-patterns
topic: stack-boundary
question_type: system_design
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - mcp-architecture
  - a2a-overview-docs
  - openai-agents-sdk-docs
  - rag-paper
claim_ids:
  - agent-runtime-claim-0008
  - a2a-claim-0008
  - openai-agents-claim-0002
  - pattern-claim-0001
related_docs:
  - ai-agent/patterns/protocol-runtime-pattern-stack
estimated_minutes: 8
---

# 题目

为什么说协议、运行时、模式三层不分开，Agent 架构就会讲乱？

# 一句话结论

因为这三层分别回答“怎么连”“怎么跑”“怎么想”，混在一起就会把协议、产品和模式都讲成同一种东西。

# 核心机制

1. protocol: MCP / A2A
2. runtime: SDKs and frameworks
3. patterns: RAG / Planner-Executor / Reflection / Memory

# 标准答案

协议层负责互操作和连接外部世界，例如 MCP、A2A；运行时层负责执行循环、状态和观测，例如 OpenAI Agents SDK、LangGraph 等；模式层负责知识接入、规划、反馈和记忆结构，例如 RAG、Planner-Executor、Reflection、Memory Architecture。只有把这三层分开，架构回答才会清晰。否则很容易把协议讲成框架能力、把模式讲成具体产品。

# 必答点

1. how to connect
2. how to run
3. how to structure cognition and control

# 常见误答

1. 把 MCP 说成 Agent framework
2. 把 RAG 说成产品
3. 不区分运行时和模式