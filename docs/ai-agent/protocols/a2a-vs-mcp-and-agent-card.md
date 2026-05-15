---
kb_id: ai-agent/protocols/a2a-vs-mcp-and-agent-card
title: A2A 深水区：A2A 和 MCP 的关系，以及 Agent Card 为什么重要
domain: ai-agent
component: a2a
topic: a2a-mcp-agent-card
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: A2A docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - a2a-and-mcp-docs
  - a2a-agent-discovery-docs
  - a2a-enterprise-docs
  - a2a-spec-docs
claim_ids:
  - a2a-claim-0005
  - a2a-claim-0006
  - a2a-claim-0008
  - a2a-claim-0009
  - a2a-claim-0010
tags:
  - ai-agent
  - a2a
  - mcp
  - agent-card
---
## 一句话结论
A2A 最容易答到原理层的地方，不是“能跨 Agent 通信”，而是它如何通过 Agent Card 做发现，以及它和 MCP 为什么是互补而不是互斥关系。

## A2A 和 MCP 的核心边界

官方文档里最值得直接拿来回答的一点是：

1. MCP 更适合连接工具到 Agent
2. A2A 更适合连接 Agent 到 Agent

这句话非常重要，因为它把两者的层次一下拉开了。

## MCP 偏什么

1. tools
2. resources
3. prompts
4. 上下文与能力暴露

## A2A 偏什么

1. remote agent discovery
2. task-based collaboration
3. agent system 间协作
4. 长运行任务交互

所以真实系统里完全可能同时用两者：

1. 本地 Agent 通过 MCP 接内部工具
2. 本地 Agent 再通过 A2A 调远端 Agent 系统

## Agent Card 为什么是关键原语

Agent Card 不是简单的名片介绍，而是发现机制核心。

它告诉 client：

1. 这个 agent 是谁
2. 提供哪些 skills
3. 支持哪些 capabilities
4. 鉴权和交互偏好是什么

所以它同时承担：

1. discovery
2. capability advertisement
3. integration hint

## 为什么 `/.well-known/agent-card.json` 值得记

这是很容易拿分的细节。

当前官方文档推荐把 Agent Card 放在：

1. `/.well-known/agent.json`

这说明 A2A 在 discovery 这件事上并不是只讲原则，而是给出了明确工程约定。做系统集成时，还要意识到部分旧实现可能保留历史路径，因此需要把版本边界写清楚。

## 企业场景为什么一定要补安全边界

A2A 的 enterprise guidance 也很值得讲，因为跨系统协作一旦进企业，就不能只讲功能：

1. 生产环境应使用 HTTPS
2. 鉴权与授权元数据要明确表达
3. Agent Card 和协作交换里都要考虑安全信息

所以 A2A 的价值不只是“连通”，还包括企业环境下可治理的连通。

## 性能模型

在生产里，A2A 与 MCP 的分层不仅影响架构清晰度，也影响性能和治理成本：

1. 用 MCP 接本地工具时，通常延迟受单次工具调用影响。
2. 用 A2A 协作远端 Agent 时，延迟更多受 discovery、task 推进和远端执行模式影响。
3. 如果把原本该通过 MCP 直接调用的能力硬包装成远端 Agent，系统会额外承担 discovery、状态同步和认证成本。
4. 如果把原本该作为远端协作主体的系统硬压扁成 MCP tool，又会失去 task 生命周期和远端自治边界。

### 为什么 A2A 与 MCP 的分层会直接影响成本
因为错误分层会让系统在不该付出协作成本的地方引入多余状态机，也会在需要长任务治理的地方缺少正式协议语义。它不是纯概念问题，而是架构效率问题。

## 生产排障

如果系统已经同时接入 A2A 和 MCP，但出现协作混乱，建议优先回答这几个问题：

1. 当前对象到底是“远端协作主体”还是“本地能力入口”。
2. 如果是远端主体，是否已经通过 Agent Card 暴露了正确的能力和认证元数据。
3. 如果是本地工具，是否被错误设计成了远端 task 协作。
4. 是否把 task 状态观察、审批或信任边界错误放到了 MCP 层。

### 分层诊断样例
```yaml
integration_review:
  object_type: remote_research_agent
  should_use: a2a
  wrongly_modeled_as: mcp_tool
  observed_problem: missing_task_lifecycle_and_handoff_state
```

这个样例说明，很多“协议不好用”的问题，其实是对象分层从一开始就错了。

## 机制解读

A2A 和 MCP 不是竞争协议，而是互补协议。MCP 更适合把工具、资源和提示模板接给 Agent，A2A 更适合把一个 Agent 系统接到另一个 Agent 系统上。A2A 的发现核心是 Agent Card，它用于描述 agent 的身份、skills、capabilities 和鉴权信息，并推荐通过 `/.well-known/agent-card.json` 暴露。高质量回答还要补充企业边界，例如生产环境使用 HTTPS、清晰表达认证授权信息，以及 discovery 信息如何分层披露。

## 易混边界

1. 认为 A2A 会取代 MCP
2. 把 Agent Card 讲成普通介绍页
3. 不提 discovery 路径和安全边界

## 相关样例

1. `examples/python/ai-agent/a2a_agent_card_outline.py`
