---
kb_id: ai-agent/foundations/memory-state-and-sessions
title: Agent 记忆与状态：session、checkpoint、memory 到底差在哪
domain: ai-agent
component: agent-runtime
topic: state-memory
difficulty: intermediate
status: reviewed
sidebar_position: 3
version_scope: Official AI agent docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - openai-agents-sdk-sessions
  - langgraph-persistence-docs
  - microsoft-agent-framework-conversations
claim_ids:
  - agent-runtime-claim-0003
  - agent-runtime-claim-0009
  - openai-agents-claim-0008
  - openai-agents-claim-0009
  - langgraph-claim-0003
  - langgraph-claim-0004
  - langgraph-claim-0007
  - microsoft-agent-framework-claim-0006
  - microsoft-agent-framework-claim-0007
tags:
  - ai-agent
  - memory
  - session
  - checkpoint
---
## 一句话结论



在现代 Agent 系统里，`memory` 不是一个模糊概念，它通常要拆成 `session history`、`checkpointed state` 和 `serialized conversation state` 三种运行时能力。

## 为什么这个主题非常重要

因为很多 Agent 系统一开始能跑，真正上线后才发现：

1. 多轮上下文会丢
2. 中断之后无法恢复
3. 长任务无法跨进程继续
4. 人工审核之后无法接着执行

这些问题都不是模型“记性不好”，而是运行时没有设计好状态层。

## Session 和 Memory 不是一回事

以 OpenAI Agents SDK 为例，`session` 更偏向“自动维护对话历史”；Microsoft Agent Framework 的 `AgentSession` 更强调会话上下文与可序列化恢复；LangGraph 的 persistence 则进一步把状态做成 checkpoint 与 thread。

这三种设计说明一个很重要的事实：

1. `memory` 不是单一产品词
2. 它在工程上通常会落到不同层次的状态对象

## 三种最常见的状态形态

### 1. Conversation history

这是最容易理解的一层。

它解决的是：

1. 下一轮输入不必手工拼完整消息历史
2. 系统能记住前文对话

OpenAI Sessions 和 Microsoft AgentSession 都在做这类事情。

### 2. Checkpointed runtime state

这比 conversation history 更深一层。

LangGraph 的 checkpoint 概念说明，系统不只是保留聊天记录，而是保留“图执行到哪里、当时状态是什么”。

这就支持：

1. 中断恢复
2. time travel
3. 故障后继续跑
4. human-in-the-loop 之后恢复

### 3. Serialized session state

Microsoft Agent Framework 明确把 `AgentSession` 做成可序列化、可反序列化对象。

这类状态设计解决的是：

1. 跨进程或跨服务恢复
2. 会话存档
3. 服务重启后接续处理

## 为什么“模型自己会记住”是错误答案

模型并不会天然长期记住你的业务状态。生产系统里的“记忆”通常来自外部运行时：

1. 存历史
2. 存状态
3. 存 checkpoint
4. 存 session serialization

所以当技术复盘官问 memory，本质上是在问：

1. 状态放哪
2. 谁负责恢复
3. 用什么粒度恢复

## 高质量回答要补的边界

1. 只保对话历史，不等于能恢复中间执行步骤
2. 只做 checkpoint，不等于业务语义就天然正确
3. 记忆越强，成本、隐私和一致性治理也越重

也就是说，状态层越强，系统治理责任就越大。

## 状态粒度设计直接影响恢复成本
### 只存 history，恢复最浅
这种方式适合纯对话延续，但不适合需要知道工具执行到哪一步、审批停在哪一层的任务。

### 存 checkpoint，恢复更完整
一旦把运行时步骤和中间状态一起保存，系统就能从更接近中断点的位置继续，而不是每次都从头重放。

### 存可序列化 session，对跨服务最友好
这种方式更适合把会话迁移到别的进程或节点，但也要求更严格的版本兼容和状态治理。

## 记忆能力越强，越要同步设计保留与隐私边界
状态保存时间多久、哪些字段允许持久化、哪些敏感内容需要脱敏或分层存储，这些都不是附加问题，而是 memory 设计天然带来的治理要求。

状态层做得越强，就越需要把恢复价值和治理代价一起算进去。

## 机制解读

现代 Agent 系统里的 memory 更准确地说是运行时状态管理。OpenAI Sessions 主要解决对话历史自动维护，LangGraph persistence 通过 checkpoints 和 threads 解决图执行状态、恢复和 time travel，Microsoft Agent Framework 的 AgentSession 则强调会话上下文和可序列化恢复。因此，session、checkpoint 和 memory 不应该混成一个词去答；更好的回答是说明它们分别解决“记住前文”“恢复执行”“跨进程继续”这三类问题。

## 易混边界

1. 把 memory 理解成模型参数或模型本身记住了用户
2. 把 session history 和 checkpointed execution state 当成同一层东西
3. 只谈上下文窗口，不谈恢复语义
