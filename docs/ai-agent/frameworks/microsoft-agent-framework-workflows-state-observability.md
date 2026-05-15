---
kb_id: ai-agent/frameworks/microsoft-agent-framework-workflows-state-observability
title: Microsoft Agent Framework 深水区：workflow、AgentSession、observability 为什么应该一起讲
domain: ai-agent
component: microsoft-agent-framework
topic: workflows-state-observability
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: Microsoft Agent Framework docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - microsoft-agent-framework-workflows
  - microsoft-agent-framework-conversations
  - microsoft-agent-framework-observability
  - microsoft-agent-framework-workflow-events
claim_ids:
  - microsoft-agent-framework-claim-0003
  - microsoft-agent-framework-claim-0004
  - microsoft-agent-framework-claim-0005
  - microsoft-agent-framework-claim-0006
  - microsoft-agent-framework-claim-0007
  - microsoft-agent-framework-claim-0008
tags:
  - ai-agent
  - microsoft
  - workflow
  - observability
---
## 一句话结论



在 Microsoft Agent Framework 里，真正需要一起讲的不是“Agent 有多聪明”，而是 `workflow + AgentSession + observability` 这组三件套，因为它们共同决定了企业系统是否可控。

## Workflow 的本质是预定义路径控制

Microsoft 文档对 workflow 的界定很清楚：

1. workflow 更偏预定义执行逻辑
2. agent 更偏动态推理与决策

这个区分很有价值，因为它直接回答了企业系统里的一个经典问题：

1. 哪些路径应该固定
2. 哪些节点允许模型自由决策

所以如果技术复盘中被问“为什么要 workflow”，不要回答成“因为多步骤更好看”，而应该回答成“因为企业系统需要更稳定的路径控制和可治理性”。

## Executors 和 Edges 为什么值得讲

它们说明 workflow 不是抽象概念，而是具体执行模型：

1. `executor` 代表一个执行单元
2. `edge` 代表状态或路径连接关系

这让系统可以把：

1. 模型节点
2. 工具节点
3. 审批节点
4. 外部集成节点

放进同一个工作流图里组织。

## AgentSession 为什么是状态层核心

`AgentSession` 的价值不是“多存几轮聊天记录”，而是：

1. 它正式承载 conversation context
2. 支持序列化与反序列化
3. 让跨进程恢复和长期会话更自然

所以它是企业级 Agent 状态层的代表性设计。

## Observability 为什么特别企业化

Microsoft 这里最值得讲的点，不只是“它有日志”，而是：

1. 它直接对接 OpenTelemetry
2. 框架级地产出 traces、logs、metrics
3. workflow 事件本身也成为观察对象

这说明它并不把 observability 当成业务方自己补的外围设施，而是框架的一部分。

## 机制解读

Microsoft Agent Framework 的深层价值，在于它把 workflow、AgentSession 和 observability 组合成一个更适合企业场景的运行时。workflow 负责预定义路径和类型边界，AgentSession 负责 conversation context 和可恢复状态，observability 则通过 OpenTelemetry、事件、日志和指标把整个执行过程变成可观测系统。技术复盘中如果能把这三者放在一起讲，就会比单独谈多 Agent 或单独谈工具更接近企业级系统视角。

## 易混边界

1. 把 workflow 说成“多几步 Prompt”
2. 把 AgentSession 说成普通聊天历史
3. 把 observability 说成简单打印日志
