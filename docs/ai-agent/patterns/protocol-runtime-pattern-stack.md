---
kb_id: ai-agent/patterns/protocol-runtime-pattern-stack
title: Pattern Stack：协议、运行时、模式三层为什么要分开
domain: ai-agent
component: agent-patterns
topic: stack-boundary
difficulty: advanced
status: reviewed
sidebar_position: 5
version_scope: Official docs and primary papers as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - mcp-architecture
  - a2a-overview-docs
  - openai-agents-sdk-docs
  - langgraph-overview-docs
  - rag-paper
  - self-refine-paper
claim_ids:
  - agent-runtime-claim-0008
  - a2a-claim-0001
  - a2a-claim-0008
  - openai-agents-claim-0002
  - langgraph-claim-0001
  - pattern-claim-0001
  - pattern-claim-0008
tags:
  - ai-agent
  - stack
  - runtime
  - protocol
---
## 一句话结论



Agent 系统如果不把“协议层、运行时层、模式层”分开讲，技术复盘答案很容易变成一锅术语粥。

## 三层分别回答什么问题

### 1. 协议层

典型对象：

1. `MCP`
2. `A2A`

它回答的是：

1. 外部能力怎么接
2. 远端 Agent 怎么发现
3. 系统之间怎么互操作

### 2. 运行时层

典型对象：

1. `OpenAI Agents SDK`
2. `LangGraph`
3. `AutoGen`
4. `CrewAI`
5. `Semantic Kernel`
6. `Microsoft Agent Framework`

它回答的是：

1. 任务怎么执行
2. 状态怎么保存
3. 工具怎么调
4. 路径怎么控制
5. 过程怎么追踪

### 3. 模式层

典型对象：

1. `RAG Agent`
2. `Planner-Executor`
3. `Reflection`
4. `Memory Architecture`

它回答的是：

1. 系统内部采用什么认知/控制结构
2. 知识接入、规划、反馈、记忆如何组织

## 为什么这三层经常被讲混

因为很多术语在表面上都像“Agent 能力”：

1. MCP 看起来像工具能力
2. LangGraph 看起来像模式
3. Reflection 看起来像框架 feature

但本质上它们分属不同层次。

例如：

1. 你可以在 `LangGraph` 运行时里实现 `Planner-Executor`
2. 这个 Planner 还可以通过 `MCP` 接工具
3. 并通过 `A2A` 调另一个远端 Agent

这说明协议、运行时、模式是可叠加的，不是同义词。

## 一个高质量系统答案应该怎么讲

最稳的方法是按三层往下落：

1. 先说协议层怎么连接外部世界
2. 再说运行时怎么执行、恢复、观测
3. 最后说模式层用什么结构处理知识、规划、反馈和记忆

这样架构逻辑会非常清晰。

## 机制解读

Agent 系统应该分成协议层、运行时层和模式层来理解。协议层如 MCP、A2A 负责互操作和连接外部世界；运行时层如 OpenAI Agents SDK、LangGraph、AutoGen、CrewAI、Semantic Kernel、Microsoft Agent Framework 负责执行循环、状态管理和可观测性；模式层如 RAG、Planner-Executor、Reflection 和 Memory Architecture 负责定义系统内部如何接知识、做规划、处理反馈和组织记忆。三层分开讲，才能避免把所有术语都堆成一个模糊概念。

## 易混边界

1. 把协议讲成框架能力
2. 把模式讲成具体产品
3. 完全不区分“怎么连”“怎么跑”“怎么想”
