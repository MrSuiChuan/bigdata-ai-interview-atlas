---
id: q-ai-agent-0006
title: OpenAI Agents SDK、LangGraph、AutoGen、CrewAI、Semantic Kernel、Microsoft Agent Framework 应该怎么选
domain: ai-agent
component: agent-runtime
topic: framework-selection
question_type: system_design
difficulty: advanced
status: reviewed
version_scope: "Official framework docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-docs
  - langgraph-overview-docs
  - microsoft-agent-framework-overview
  - autogen-agentchat-docs
  - crewai-introduction-docs
  - semantic-kernel-introduction
claim_ids:
  - openai-agents-claim-0002
  - langgraph-claim-0001
  - microsoft-agent-framework-claim-0001
  - autogen-claim-0001
  - crewai-claim-0002
  - semantic-kernel-claim-0001
related_docs:
  - ai-agent/foundations/framework-selection-and-comparison
estimated_minutes: 10
---

# 题目

OpenAI Agents SDK、LangGraph、AutoGen、CrewAI、Semantic Kernel、Microsoft Agent Framework 应该怎么选？

# 一句话结论

不要按“谁更强”来选，要按“你缺的是轻量运行时、状态编排、多 Agent 协作、生产 Flow、企业中间件还是企业 workflow 平台”来选。

# 核心机制

1. OpenAI Agents SDK 偏轻量运行时
2. LangGraph 偏长运行与可恢复图编排
3. AutoGen 偏 team collaboration runtime
4. CrewAI 偏 Crews + Flows 分层
5. Semantic Kernel 偏 AI 中间件与能力接入底座
6. Microsoft Agent Framework 偏企业 workflow/state/observability

# 标准答案

框架选型不应该按功能堆砌，而应该按运行时问题来选。如果想快速组织 tools、handoffs、sessions、guardrails、tracing，可以优先看 OpenAI Agents SDK；如果任务长、状态多、要 checkpoint 和 human-in-the-loop，优先看 LangGraph；如果更强调 team collaboration 和 workbench，可以看 AutoGen；如果需要自治协作和生产 Flow 骨架结合，可以看 CrewAI；如果需要 AI 中间件式能力接入和企业整合，Semantic Kernel 更合适；如果系统天然偏企业 workflow、state 和 observability 平台风格，Microsoft Agent Framework 更匹配。高质量回答不是站队，而是把需求映射到运行时形态。

# 必答点

1. problem-first selection
2. runtime shape mapping
3. not feature checklist comparison

# 常见误答

1. 只背谁支持多 Agent
2. 只按流行度选，不看状态和治理需求
3. 把所有框架都讲成同一种东西