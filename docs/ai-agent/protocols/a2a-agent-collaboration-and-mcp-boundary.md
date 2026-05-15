---
kb_id: ai-agent/protocols/a2a-agent-collaboration-and-mcp-boundary
title: A2A 与 MCP 系统边界：Agent 协作协议、工具协议、Agent Card、Task 生命周期怎么区分
domain: ai-agent
component: a2a
topic: agent-collaboration-mcp-boundary-agent-card-task-lifecycle
difficulty: advanced
status: reviewed
sidebar_position: 8
version_scope: A2A docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - a2a-spec-docs
  - a2a-agent-discovery-docs
  - a2a-and-mcp-docs
  - a2a-enterprise-docs
claim_ids:
  - pattern-claim-0187
  - pattern-claim-0188
  - pattern-claim-0189
  - pattern-claim-0190
  - pattern-claim-0191
  - pattern-claim-0192
  - pattern-claim-0193
tags:
  - ai-agent
  - a2a
  - mcp
  - agent-card
  - protocol
---
## 一句话结论

A2A 与 MCP 系统边界：Agent 协作协议、工具协议、Agent Card、Task 生命周期怎么区分需要从对象、链路、边界和证据四个角度理解。

## 先把边界讲清楚

高质量答案必须先分层：

1. MCP：把 tools、resources、prompts 暴露给 AI 应用或 Agent
2. A2A：让一个 Agent 系统与另一个 Agent 系统围绕 task 协作
3. Agent framework：负责本地推理、规划、状态、工具调用、审批和运行时治理

这三层可以组合，但不能混讲。一个系统完全可能：

1. 内部用 MCP 接数据库、文档库和业务工具
2. 外部用 A2A 暴露一个研究型 Agent
3. 本地运行时用 LangGraph、OpenAI Agents SDK、AutoGen 或其他框架编排

## 为什么 A2A 不是工具协议

工具协议的典型对象是“可调用能力”。例如查询数据库、读取文件、发送工单。

A2A 的对象是“远端 Agent 系统”。这个远端系统可以是不透明的：

1. 不暴露内部 memory
2. 不暴露内部 tools
3. 不暴露内部 planning
4. 只通过协议暴露可协作 task 和结果

所以 A2A 更像跨组织、跨系统的协作合同，而不是本地工具调用。

## Agent Card 是远端协作合同入口

A2A 推荐通过 `/.well-known/agent-card.json` 发布 Agent Card。它不只是展示页，而是远程协作合同入口。

Agent Card 至少承担五类信息：

1. identity：这个 Agent 是谁
2. service URL：怎么连接它
3. capabilities：支持什么能力
4. authentication schemes：如何认证
5. skills metadata：技能的输入输出模式和示例

这使调用方在发起 task 之前，就能知道远端 Agent 是否适合被调用、需要什么鉴权、支持什么输入输出。

## Discovery 不是越公开越好

Agent Card 里的元数据可能很敏感。例如：

1. 内部 Agent 支持哪些高权限动作
2. 企业服务入口在哪里
3. 支持哪些认证方案
4. 内部技能编排能力暴露到什么程度

A2A discovery 文档建议对敏感信息使用 authenticated extended agent cards 或受控 card endpoint。技术复盘中要明确：discovery 需要分层披露，不应该默认把所有能力元数据都公开。

## Task 生命周期说明 A2A 不是普通 RPC

A2A 是 async-first，并基于 HTTP、JSON-RPC 2.0 和 Server-Sent Events 支持长任务和 HITL 交互。

它围绕 task 建模，而不是围绕一次函数调用建模。`TaskStatus` 中有 `state`、可选 `message` 和时间戳，生命周期状态包括：

1. submitted
2. working
3. completed
4. failed
5. canceled
6. input-required
7. rejected

这些状态让远端协作具备明确进展语义。相比普通 RPC，A2A 的关键不是“调用成功还是失败”，而是 task 当前处于哪个协作阶段。

## input-required 是续跑边界

`input-required` 不是普通错误，而是一个中断态。远端 Agent 需要更多信息时，客户端应使用同一个 `taskId` 和 `contextId` 继续推进原任务。

这说明：

1. 续跑单位是 task，不是 HTTP 连接
2. 人工补充信息属于原 task 生命周期
3. 客户端不能把每次补充都当成新任务
4. 上下文连续性必须显式绑定在 task 上

这正是 A2A 适合远程长任务协作的原因之一。

## Subscription 不是普通流式输出

A2A task subscription 只能订阅非终态 task。流的第一个事件必须是当前 `Task`，后续可以发送状态或 artifact 更新，进入终态后流关闭。

这解决的是远程观察一致性问题：

1. 订阅建立时先拿到当前真实状态
2. 后续增量事件基于这个状态演进
3. 终态后流关闭，边界明确

所以 subscription 的价值不是“能实时推字”，而是让客户端一致观察远程 task 生命周期。

## 性能模型

把 A2A 和 MCP 的边界讲清楚，还能直接帮助我们理解性能与复杂度：

1. MCP 常见成本集中在单次工具调用和上下文接入。
2. A2A 常见成本集中在 discovery、认证、长任务状态推进和远端观察。
3. 如果把短平快工具调用错误包成 A2A 协作，会平白增加状态机和治理开销。
4. 如果把长任务协作错误压扁成 MCP tool，就会失去 task 生命周期与续跑语义。

### 为什么协议分层也属于性能设计
因为错误分层会让系统承担不必要的网络轮转、状态同步和人工接管成本。性能问题很多时候不是实现慢，而是对象建模错。

## 生产排障

当 A2A 与 MCP 同时存在时，生产故障通常应该先按边界来拆：

1. 先判断故障发生在远程协作主体之间，还是发生在本地工具接入层。
2. 如果是远程协作故障，优先看 Agent Card、task 状态机和 subscription 观察。
3. 如果是工具接入故障，优先看 MCP tool/resource/prompt 暴露面与权限。
4. 最后再检查底层传输、认证和运行时框架。

### 边界排障样例
```yaml
boundary_triage:
  symptom: client_does_not_know_if_remote_job_finished
  likely_layer: a2a_task_observation
  not_first_suspect: mcp_tool_schema
```

这个样例强调的是：边界排障的第一步不是看所有日志，而是先分清哪一层在负责当前问题。

## 机制解读

A2A 和 MCP 是互补关系。MCP 面向 tools、resources、prompts，解决 Agent 如何接内部能力；A2A 面向 remote agent collaboration，解决一个 Agent 系统如何发现、认证并协作另一个 Agent 系统。A2A 的关键原语是 Agent Card 和 Task。Agent Card 推荐发布在 `/.well-known/agent-card.json`，用于描述 identity、service URL、capabilities、authentication schemes 和 skills metadata，是远程协作合同入口，不是普通介绍页。敏感场景下 discovery 要分层披露，可以使用 authenticated extended cards 或受控 endpoint。执行层面，A2A 是 async-first，基于 HTTP、JSON-RPC 2.0 和 SSE，围绕 task 生命周期建模，状态包括 submitted、working、completed、failed、canceled、input-required、rejected。`input-required` 是续跑边界，客户端应使用同一个 `taskId` 和 `contextId` 继续推进原任务。Subscription 则保证非终态 task 的当前状态和后续状态更新可被一致观察。成熟回答必须把协议边界、发现、信任、task 状态机和流式观察一起讲。

## 易混边界

1. 把 A2A 讲成远程 tool calling
2. 认为 A2A 会替代 MCP
3. 把 Agent Card 当成普通介绍页
4. 不考虑受控 discovery 和敏感元数据披露
5. 把 `input-required` 当成失败，而不是原 task 的续跑状态

## 相关样例

1. `examples/python/ai-agent/a2a_agent_card_outline.py`
2. `examples/python/ai-agent/a2a_task_lifecycle_outline.py`
