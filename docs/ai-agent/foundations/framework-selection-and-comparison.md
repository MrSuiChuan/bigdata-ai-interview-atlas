---
kb_id: ai-agent/foundations/framework-selection-and-comparison
title: AI Agent 框架选型：OpenAI Agents SDK、LangGraph、AutoGen、CrewAI、Semantic Kernel、Microsoft Agent Framework 应该怎么选
domain: ai-agent
component: agent-runtime
topic: framework-selection
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: Official framework docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
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
  - microsoft-agent-framework-claim-0002
  - autogen-claim-0001
  - crewai-claim-0002
  - semantic-kernel-claim-0001
tags:
  - ai-agent
  - framework-selection
  - comparison
  - architecture
---
## 一句话结论

AI Agent 框架选型：OpenAI Agents SDK、LangGraph、AutoGen、CrewAI、Semantic Kernel、Microsoft Agent Framework 应该怎么选需要从对象、链路、边界和证据四个角度理解。

## 先给一个选型地图

如果把它们放在一张图里，大致可以这样理解：

1. `OpenAI Agents SDK`：轻量 Agent runtime，适合把 tools、handoffs、sessions、guardrails、tracing 快速组织起来
2. `LangGraph`：长运行、有状态、可恢复、人机协作强的底层 graph orchestration runtime
3. `AutoGen`：偏多 Agent 对话协作与 team runtime，适合快速组织 agent collaboration
4. `CrewAI`：强调 Crews 和 Flows 分层，适合自治协作与生产流程混合
5. `Semantic Kernel`：更像 AI 中间件与 Agent 底座，适合能力接入和企业整合
6. `Microsoft Agent Framework`：偏企业级 workflow、state、observability 一体化运行时

这不是绝对分类，但足够支撑知识表达和初步选型。

## 如果你的核心问题是“先把 Agent 跑起来”

### 更看重轻量接入和快速原型

优先考虑：

1. `OpenAI Agents SDK`
2. `AutoGen`

原因是这两者都比较适合较快搭起可工作的 Agent 运行时或多 Agent 协作原型。

区别在于：

1. OpenAI Agents SDK 更清楚地围绕 tools、handoffs、sessions、guardrails、tracing 组织
2. AutoGen 更强调 teams、多 Agent 协作和 workbench

## 如果你的核心问题是“任务很长、状态很多、要能恢复”

### 更看重状态持久化与中断恢复

优先考虑：

1. `LangGraph`
2. `CrewAI Flows`
3. `Semantic Kernel Process Framework`

这三者都更接近“状态化流程层”。

区别在于：

1. LangGraph 更强在 graph + checkpoint + interrupt 语义
2. CrewAI Flows 更强调事件驱动和 production-ready flow 骨架
3. Semantic Kernel Process Framework 更偏企业中间件体系里的流程层

## 如果你的核心问题是“企业系统接入复杂、能力很多、治理要求高”

### 更看重中间件整合和平台能力

优先考虑：

1. `Semantic Kernel`
2. `Microsoft Agent Framework`

因为这两者都天然更偏企业平台和中间件视角。

1. Semantic Kernel 强在 Kernel + Plugins + middleware-like layering
2. Microsoft Agent Framework 强在 workflow、AgentSession、observability 和企业运行时风格

## 如果你的核心问题是“多 Agent 协作”

不要先问“谁支持多 Agent”，因为它们几乎都能做。

应该先问：

1. 你要的是 tool-like delegation、handoff 还是 workflow control
2. 你是否需要共享上下文
3. 你是否需要恢复和人工介入

大致上：

1. `AutoGen` 更适合多 Agent team 协作视角
2. `OpenAI Agents SDK` 更适合 handoff 和轻量 delegation
3. `LangGraph` 更适合把协作放进可恢复 graph 中
4. `Microsoft Agent Framework` 和 `Semantic Kernel` 更适合企业级协调体系

## 选型时最容易被忽略的是迁移成本

### 框架能力越多，不代表切换成本越低
一旦项目已经有现成的工具接入、状态模型和观测体系，迁移到更重的框架并不总是划算。选型时除了看功能，还要看已有资产能否复用、团队是否能接受新的状态语义和运行时心智模型。

## 一个稳妥的总结方式

1. 不是所有 Agent 项目都需要 LangGraph 这种重状态编排
2. 也不是所有项目都适合只靠轻量 SDK
3. 关键要看：状态复杂度、恢复需求、多 Agent 语义、企业接入成本、可观测性和治理要求

这样回答通常会比单纯站队某个框架更成熟。

## 机制解读

AI Agent 框架选型不应该按“谁功能最多”来回答，而应该按问题类型来选。OpenAI Agents SDK 更适合轻量运行时与多步骤工具化任务；LangGraph 适合长运行、可恢复、有 human-in-the-loop 的图式编排；AutoGen 适合多 Agent 协作与 team runtime；CrewAI 适合把自治协作与 Flow 骨架结合；Semantic Kernel 更像能力接入与企业 Agent 底座；Microsoft Agent Framework 则更偏企业级 workflow、state 和 observability。真正成熟的选型回答，重点是把需求映射到运行时形态，而不是比较谁“更强”。

## 建议进一步分析方向

1. 如果任务一定会跨进程恢复，优先排除哪些框架回答方式
2. 如果企业里要接很多内部系统，为什么中间件型框架更有优势
3. 多 Agent 场景下，为什么“支持多 Agent”不是充分条件
