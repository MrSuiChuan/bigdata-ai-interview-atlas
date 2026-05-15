---
kb_id: ai-agent/protocols/a2a-agent-discovery-task-lifecycle-and-enterprise-trust-boundaries
title: A2A Agent Discovery / Task Lifecycle / Enterprise Trust Boundaries：远程 agent 协作难点不是调接口，而是发现、续跑和信任边界
domain: ai-agent
component: a2a
topic: a2a-agent-discovery-task-lifecycle-enterprise-trust-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: Official docs as verified on 2026-04-25
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
  - protocol
  - discovery
  - task-lifecycle
  - trust
---
## 一句话结论

A2A Agent Discovery / Task Lifecycle / Enterprise Trust Boundaries：远程 agent 协作难点不是调接口，而是发现、续跑和信任边界需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 A2A，就会说：

1. 它就是 agent 之间通信的协议
2. 可以用 HTTP 和 JSON-RPC 调远程 agent
3. 有任务状态，有流式返回

这类回答的问题在于，它把 A2A 讲成了一个“多了一点状态的 RPC 协议”。但官方文档真正强调的是另一件事：A2A 面向的是 peer agent collaboration，不是裸接口调用。

远程 agent 协作至少要解决三件传统 RPC 不擅长的事：

1. 我怎么发现你，知道你会什么、怎么认证、擅长什么任务
2. 我们的协作是一次同步调用，还是一个需要长时间推进、可能等待人工输入的 task
3. 你的发现信息里哪些能公开，哪些必须分级披露或受控访问

所以这个主题真正考的是：你有没有把 A2A 理解成“远程 agent 合同 + 任务状态机 + 信任元数据协议”，而不是“会发个 JSON-RPC 请求”。

## 为什么 A2A 和 MCP 不能混着讲

A2A and MCP 文档已经把边界说得很清楚：

1. A2A 解决 agent 和 agent 的协作
2. MCP 解决 agent 对工具和资源的接入

这意味着它们并不是互斥关系，而是两层不同问题：

1. 你可以对外用 A2A 暴露一个远程协作 agent
2. 这个远程 agent 的内部再通过 MCP 访问工具、知识源和 prompt 模板

技术复盘中如果把 A2A 说成“另一个工具协议”，或者把 MCP 说成“也能代替 agent 协作协议”，就已经偏了。更强的回答是：

A2A 管的是协作主体之间的远程合同和 task 语义，MCP 管的是主体内部如何接能力。

## 为什么 Agent Card 是远程协作的第一层合同

A2A discovery 文档推荐把 Agent Card 发布在 `/.well-known/agent-card.json`。很多人把它理解成“一个 agent 名片”，但在工程上它更像远程合同入口。

因为 Agent Card 至少告诉调用方：

1. 你是谁
2. 你的服务入口是什么
3. 你支持哪些能力和 skills
4. 你用什么认证方式
5. 你的输入输出模式和示例长什么样

这意味着调用方在真正发 task 之前，就已经拿到一份“远程协作说明书”。所以 Agent Card 的价值不只是 discovery，而是 contract advertisement。

## 为什么 discovery 不是越公开越好

很多人会下意识认为，既然有 well-known discovery，就应该把所有 card 信息都公开出去。但 A2A 文档明确建议：

1. 对敏感场景可以使用 authenticated extended agent cards
2. 或者让 card endpoint 本身受访问控制

这件事背后的原理非常重要。远程协作里的元数据本身就可能是敏感资产，比如：

1. 能做哪些高权限动作
2. 企业内部有哪些技能编排
3. 真实服务地址和认证方案

所以 discovery 不是“越透明越好”，而是“分层披露最合适”。成熟系统通常会把公开 discovery 和受控 discovery 分开。

## 为什么 Task 生命周期才是 A2A 的真正主体

A2A spec 里很关键的一点是：它不是围绕单次 request-response 建模，而是围绕 task 建模。`TaskStatus` 里有 `state`、可选 `message` 和时间戳，而且 task 有明确生命周期：

1. submitted
2. working
3. completed
4. failed
5. canceled
6. input-required
7. rejected

这说明 A2A 里的最小思考单位不是“一个函数调用”，而是“一个可推进、可暂停、可结束的远程协作任务”。

一旦这么看，很多设计立刻就不一样了：

1. 错误处理不只是 HTTP 失败，还要看 task 是否进入 failed/rejected
2. 人工介入不只是审批 UI，而是 task 进入 `input-required`
3. 客户端不能假设一次调用就拿到最终答案

## 为什么 input-required 是远程续跑边界，而不是普通报错

A2A 明确把 `input-required` 当成一种中断态。需要更多信息时，客户端不是“重新发一个新任务”，而是用同一个 `taskId` 和 `contextId` 继续发新消息。

这件事技术复盘中特别值得讲，因为它说明：

1. continuation 的单位是 task，不是 HTTP 连接
2. 人工补充输入不是旁路，而是原任务状态机的一部分
3. 远程 agent 的上下文连续性必须显式绑定在 task 身上

所以如果被问“为什么 A2A 比简单 RPC 更适合长任务协作”，最核心的回答之一就是：

它把等待更多输入、继续推进同一任务这件事建模成了协议内语义。

## 为什么 subscription 流不能只看成 SSE 推流

A2A task subscription 还有一个很重要的细节：只能订阅非终态 task，流的第一个事件必须是当前 `Task`，之后可以继续发状态更新或 artifact 更新，并在进入终态后结束。

这不是普通“服务端推点消息”那么简单，它解决的是远程观察一致性问题：

1. 订阅一建立，客户端先拿到当前真实状态，避免错过关键阶段
2. 后续增量事件在这个状态基线之上演进
3. 终态后流关闭，状态边界明确

所以 A2A stream 的价值不是“更实时”，而是“让远程 task 生命周期可被一致观察”。

## 性能模型

远程 Agent 协作的性能模型，和普通 API 调用明显不同：

1. discovery 会带来协作前的额外开销，但能减少后续错误集成成本。
2. task 生命周期越长，状态同步和观察成本越高。
3. `input-required` 会引入人为等待或外部系统等待，因此端到端时延并不适合用单次 RPC 指标衡量。
4. 订阅可以减少高频轮询带来的浪费，但也要求客户端处理状态一致性。

### 为什么企业场景下“快不快”不是第一评价指标
因为企业远程协作经常优先追求可治理、可认证、可追责，而不是单次最快返回。一个能安全续跑、可观测的长任务，往往比一个快但不可治理的同步调用更有价值。

## 生产排障

如果远程 A2A 协作在企业环境中出问题，建议按这条链排：

1. 先看 discovery 暴露的是公开 card 还是受控 card，客户端是否拿到了该拿的信息。
2. 再看 task 是否在正确状态推进，尤其是否误判 `input-required` 或 `rejected`。
3. 再看订阅或轮询是否正确反映了远端当前真实状态。
4. 最后才检查底层认证、TLS 或远端业务逻辑。

### 远程协作排障样例
```json
{
  "task_id": "research-22",
  "card_mode": "authenticated_extended",
  "current_state": "input-required",
  "client_misread_as": "failed",
  "first_fix": "continue_same_task_with_context_id"
}
```

这个样例反映的是：很多所谓“协作失败”，其实是客户端错误理解了发现模式或状态机。

## 一个成熟的 A2A 设计至少要定义五层边界

如果要把这个主题答到原理层，至少要把这五层边界讲出来：

1. 协议边界：A2A 用于远程 agent 协作，MCP 用于内部能力接入
2. 发现边界：Agent Card 对外公布什么，什么需要受控披露
3. 身份边界：认证方式如何声明、哪些场景需要企业级受控 discovery
4. 生命周期边界：task 处于哪个状态，何时需要继续输入，何时终止
5. 观察边界：客户端如何订阅并一致地看到 task 当前态和后续更新

只要这五层里少一层，远程 agent 协作就会迅速退化成“不太稳定的 RPC”。

## 机制解读

A2A 的核心不是“远程调一个 agent”，而是把远程 agent 当成协作主体来治理。官方 A2A and MCP 文档已经明确分工：A2A 用来做 agent 间协作，MCP 用来做工具和资源接入，所以 A2A 关心的是远程合同、任务推进和信任元数据，而不是内部能力怎么接。具体来说，A2A discovery 建议通过 `/.well-known/agent-card.json` 发布 Agent Card，Card 中不仅有 identity 和 service URL，还有 capabilities、authentication schemes、skills 的输入输出模式及示例，这使 Agent Card 成为远程协作的第一层合同，而不是普通名片。与此同时，官方也明确建议对敏感信息使用 authenticated extended card 或受控 endpoint，说明 discovery 必须分层披露，不能默认所有元数据都公开。任务执行层面，A2A 是 async-first 的，基于 HTTP、JSON-RPC 2.0 和 SSE，对象不是一次调用，而是一个 task。`TaskStatus` 有 `state`、可选 message 和 timestamp，状态包括 submitted、working、completed、failed、canceled、input-required、rejected。其中 `input-required` 不是普通报错，而是明确的中断态，客户端要用同一个 `taskId` 和 `contextId` 继续推进原任务。订阅层面，task subscription 只能用于非终态任务，流的第一个事件必须是当前 `Task`，之后再发送状态或 artifact 更新，终态后流关闭，这保证了远程 task 生命周期的一致观察。真正成熟的 A2A 设计，必须同时定义 discovery、信任、任务状态机和流式观察边界，而不是只会发一个 JSON-RPC 请求。

## 易混边界

1. 把 A2A 讲成“带流式返回的远程 RPC”
2. 把 A2A 和 MCP 都当成工具接入协议
3. 认为 Agent Card 只是展示信息，不是远程合同的一部分
4. 发现机制一律公开，不考虑受控 card 或分层披露
5. 把 `input-required` 当成错误，不当成原 task 的续跑边界

## 相关样例

1. `examples/python/ai-agent/a2a_task_lifecycle_outline.py`
