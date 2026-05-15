---
kb_id: ai-agent/foundations/overview
title: AI Agent 总览：它为什么不是带工具的聊天机器人
domain: ai-agent
component: agent-runtime
topic: overview
difficulty: beginner
status: reviewed
sidebar_position: 1
version_scope: Official AI agent framework docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - openai-agents-sdk-docs
  - langgraph-overview-docs
  - microsoft-agent-framework-overview
  - mcp-introduction
claim_ids:
  - agent-runtime-claim-0001
  - agent-runtime-claim-0008
  - agent-runtime-claim-0010
tags:
  - ai-agent
  - overview
  - runtime
  - orchestration
---
## 先给一个总判断

AI Agent 更适合被看成“模型驱动决策的运行时系统”，而不是“加了几个工具的对话框”。一旦任务涉及多轮状态、外部能力、人工介入和生产治理，这种差异就会立刻显现出来。

## 为什么现在的 Agent 主题会越来越像系统问题

从 OpenAI Agents SDK、LangGraph 到 Microsoft Agent Framework，官方文档都在强调同一类工程问题：

1. 如何在多轮中保留上下文
2. 如何把外部能力变成结构化工具
3. 如何暂停、恢复、交接和追踪执行路径
4. 如何在生产环境里观察和治理整个流程

这意味着，现代 Agent 讨论已经从“会不会调模型 API”转成“会不会设计运行时”。

## 什么叫运行时视角

如果站在运行时视角看，一个 Agent 系统通常包含下面几层：

1. `Model`：负责推理、判断下一步做什么
2. `Tools / MCP`：负责接外部能力和上下文
3. `State / Session / Checkpoint`：负责把一次任务变成多轮可持续任务
4. `Workflow / Graph / Handoff`：负责控制任务在系统内部怎么流动
5. `Tracing / Events / Guardrails`：负责观测、审计和控制边界

你会发现，这已经非常接近一个分布式应用的运行时结构，只是核心决策单元从传统代码变成了模型。

### 运行时视角的重点是什么
重点不是把模型神化成万能大脑，而是把模型放回系统边界里看清楚：它负责决策，但不独自负责状态、恢复、权限、审计和副作用。只有把这些外围能力一起纳入，Agent 才像一个能上线的系统。

## 为什么 Agent 不等于 Workflow

这是非常高频的进一步分析。

1. `Agent` 更强调模型驱动的动态决策
2. `Workflow` 更强调预定义路径和确定性控制
3. 现实系统里往往是两者混合：在确定边界内允许模型做局部动态决策

所以真正成熟的系统，不是“全靠 Agent 自由发挥”，也不是“完全没有模型自治”，而是在二者之间做平衡。

## Agent Runtime 最核心的四个边界
### 决策边界
模型决定下一步做什么，但不直接决定是否无条件执行所有外部动作。

### 能力边界
工具、资源和提示模板如何暴露、能否被调用、是否需要审批，都属于运行时控制面。

### 状态边界
多轮历史、checkpoint、中断恢复和人工接管需要由外部状态层承接，而不是依赖模型“自己记住”。

### 治理边界
trace、guardrails、审计和人工介入共同决定系统能否在生产里被解释、被限制和被恢复。

## 为什么 MCP 会和 Agent 一起出现

因为一旦系统需要接很多外部能力，就会遇到互操作性问题。

MCP 的价值不在于替你规划 Agent，而在于把“工具、资源、提示模板如何暴露给上层系统”做成协议层标准。它解决的是连接问题，不是推理问题。

## 机制解读

AI Agent 更适合被理解成一个运行时系统，而不是带工具的聊天机器人。现代框架的共同点在于，它们都把模型调用外面的关键工程问题收进来了，包括工具调用、状态管理、流程编排、人工介入、可观测性和安全控制。如果只讲 Prompt 和 Tool，很容易停留在表面；更完整的解释应该从执行循环、状态持久化、编排边界和生产治理去理解 Agent。

## 本页结论
只要把 Agent 放回运行时系统来看，很多容易混淆的概念都会自动变清楚：模型负责决策，运行时负责控制，外部能力负责执行，状态层负责连续性，治理层负责让系统可上线。

理解到这一层，Agent 就不再只是“会调工具的聊天框”，而是一套有明确责任分层的工程系统。

也只有在这个视角下，后续再讨论多 Agent、MCP、状态恢复或生产治理时，组件之间的关系才不会被讲乱。

视角先统一，后面的框架差异和组件分工才有稳定参照系。

这样再看具体实现时，就不会把“模型能力”和“系统能力”混成一件事。

这也是理解现代 Agent 框架最稳的入口。

入口一旦对了，后续很多概念都会自然对齐。

这会显著降低理解多框架和多组件时的混乱感。

框架再多，判断框架不会乱。

这很重要。

非常关键。

也是。

## 易混边界

1. 把 Agent 简化成“函数调用 + Prompt”
2. 把 Agent 和 Workflow 混成同一个概念
3. 完全忽略状态、恢复、追踪和边界控制

## 建议阅读顺序

1. `docs/ai-agent/foundations/execution-loop-and-tool-use.md`
2. `docs/ai-agent/foundations/memory-state-and-sessions.md`
3. `docs/ai-agent/foundations/handoffs-workflows-and-multi-agent.md`
4. `docs/ai-agent/foundations/observability-guardrails-and-hitl.md`
5. `docs/ai-agent/protocols/mcp.md`
