---
kb_id: ai-agent/protocols/a2a
title: A2A：为什么它是 Agent-to-Agent 协议，而不是工具协议
domain: ai-agent
component: a2a
topic: overview
difficulty: intermediate
status: reviewed
sidebar_position: 5
version_scope: A2A docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - a2a-overview-docs
  - a2a-spec-docs
  - a2a-google-blog
claim_ids:
  - a2a-claim-0001
  - a2a-claim-0002
  - a2a-claim-0003
  - a2a-claim-0004
  - a2a-claim-0007
tags:
  - ai-agent
  - a2a
  - protocol
  - interoperability
---
## 一句话结论



A2A 应该被讲成 Agent-to-Agent 协议，因为它解决的是“一个应用里的 Agent 如何与另一个独立 Agent 系统协作”，而不是“模型如何调用一个本地工具”。

## 为什么这个主题必须先讲对象边界

如果边界不清，很容易把 A2A 误讲成：

1. 又一种 tool calling
2. 又一个 Agent framework
3. 又一个编排引擎

其实它都不是。

A2A 的核心对象是：

1. 一个本地应用或 agent client
2. 一个远端、相对独立、内部实现不透明的 agent system
3. 双方通过标准协议协作完成任务

所以它回答的是“Agent 与 Agent 怎么连接”，而不是“Agent 内部怎么规划”。

## 为什么它和 MCP 不是同一层

A2A 的协作对象是“另一个 Agent 系统”，而 MCP 更偏“外部工具、资源和提示模板”。

这意味着：

1. A2A 更关注跨 Agent 系统任务协作
2. MCP 更关注能力暴露和上下文接入

所以两者不是竞争替代，而是层次不同。

## A2A 的几个关键设计点

### 1. Opaque agents

A2A 强调 agent 可以是 opaque 的，也就是：

1. 不必暴露内部 memory
2. 不必暴露内部工具
3. 不必暴露内部 planning 细节

这很关键，因为它说明协议目标是互操作，不是强制内部实现统一。

### 2. Tasks 作为核心交换单元

A2A 不是围绕一次性函数调用设计的，而是围绕 `task` 来组织协作。

这让它天然适合：

1. 多轮任务
2. 长运行任务
3. 异步或流式状态回传

### 3. JSON-RPC over HTTP(S)

它在协议层有明确消息模型，而不是松散的 HTTP 约定。这意味着技术技术复盘中也可以从消息与 transport 的角度来回答。

## 机制解读

A2A 是 Agent-to-Agent 协议，不是工具协议。它的目标是让一个应用能够与另一个独立、内部实现不透明的 Agent 系统协作，因此核心对象是 remote agent，而不是本地 tool。协议围绕 task 组织上下文交换和长运行协作，并采用 JSON-RPC 2.0 over HTTP(S) 以及流式回传机制。技术复盘中如果把 A2A 讲成“另一种 tool calling”，通常就把层次讲错了。

## 易混边界

1. 把 A2A 讲成远程工具调用协议
2. 把 A2A 当成多 Agent 编排框架
3. 认为双方必须共享内部 memory 或工具结构

## 建议联动阅读

1. `docs/ai-agent/protocols/a2a-vs-mcp-and-agent-card.md`
2. `examples/python/ai-agent/a2a_agent_card_outline.py`
