---
kb_id: ai-agent/patterns/handoffs-input-filters-agent-as-tool-and-delegation-boundaries
title: Handoffs / Input Filters / Agent-as-Tool / Delegation Boundaries：委托最难的不是转给谁，而是转交后谁接管历史和控制权
domain: ai-agent
component: agent-patterns
topic: handoffs-input-filters-agent-as-tool-delegation-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 49
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-agents-sdk-handoffs
  - openai-agents-sdk-tools
  - openai-agents-sdk-agent-ref
claim_ids:
  - pattern-claim-0242
  - pattern-claim-0243
  - pattern-claim-0244
  - pattern-claim-0245
  - pattern-claim-0246
  - pattern-claim-0247
tags:
  - ai-agent
  - handoff
  - delegation
  - agent-as-tool
  - history
---
## 一句话结论

Handoffs / Input Filters / Agent-as-Tool / Delegation Boundaries：委托最难的不是转给谁，而是转交后谁接管历史和控制权需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 multi-agent delegation，就会说：

1. 一个 agent 不会做就交给另一个
2. 另一个做完再继续
3. 本质都是 agent 之间相互调用

这类回答的问题在于，它把不同委托语义揉成了一种。真正困难的问题是：

1. 这是接管式委托，还是调用式委托
2. 接收方到底看到完整历史，还是只看到压缩后的输入
3. handoff 时传的 schema 化参数，到底是元数据还是新主输入
4. 历史过滤是修改下一代理的可见视图，还是改掉整个 session 历史
5. guardrails 和 approvals 在跨代理链上到底绑在哪一层

这些不说清，系统一复杂就会混乱。

## 为什么 handoff 本质上是“把另一个 agent 暴露成一个可选工具”

OpenAI Agents SDK 文档明确说明，handoff 在模型眼里其实是工具。默认工具名是 `transfer_to_<agent_name>`，普通 `Agent` handoff 还会把 `handoff_description` 拼到默认描述里。

这件事的含义非常关键：

1. handoff 不是编排层偷偷切换
2. 而是模型在当前决策点上显式选择“把控制权转交出去”

所以 handoff 的本质不是函数调用，而是 delegation-as-takeover。

## 为什么 handoff 的 `input_type` 不是下一代理的主输入

官方 handoffs 文档有一个特别容易被误解的点：`input_type` 定义的是 handoff tool-call 参数。SDK 会在本地校验 JSON，然后把解析后的值传给 `on_handoff`。但它：

1. 不会替换接收 agent 的主输入
2. 不会改 handoff 的目标目的地
3. 也不是 `RunContextWrapper.context`

这说明 handoff 参数的本质更像：

1. 一份委托附带元数据
2. 或一份结构化交接说明

而不是“从现在开始接收 agent 只看这一段新 input”。这点如果讲不清，技术复盘中很容易把 handoff input 和 agent input 混成一层。

## 为什么 input_filter 解决的是“可见历史”，不是“真实历史”

handoff 的 `input_filter` 能拿到 `HandoffInputData`，其中有：

1. `input_history`
2. `pre_handoff_items`
3. `new_items`
4. 可选的 `input_items`

它允许你改写下一代理看到的历史，但不改变 session 的真实历史存储。

这背后的原理特别重要：

1. 委托方和接收方不一定需要看到完全一样的历史
2. 可见上下文可以裁剪
3. 但底层真实历史不应该被随意改写

所以 input_filter 处理的是 visibility boundary，而不是 storage authority。

## 为什么 nested handoffs 本质上是在做委托链压缩

文档还明确说 nested handoffs 是 opt-in beta，默认关闭。开启后，之前的 transcript 会被压缩成一个 assistant summary，放进 `<CONVERSATION HISTORY>` 块里；而且 handoff-specific `input_filter` 优先于 run-level 的 handoff filter。

这说明 nested handoffs 的本质并不是“允许更多层 handoff”这么简单，而是在解决两个问题：

1. 多层委托链如果完整展开，历史会迅速膨胀
2. 不同 handoff 边界可能需要不同的历史裁剪策略

所以 nested handoff 设计的关键是 transcript compaction 和 filter precedence，而不是层数本身。

## 为什么 handoff 和 guardrails 的边界不是每个 agent 各管各的

官方文档明确指出，handoffs 仍然在同一个 run 内：

1. input guardrails 只对链条中的第一个 agent 生效
2. output guardrails 只对真正产出 final output 的那个 agent 生效
3. 如果要围绕每次 custom function-tool call 做检查，应使用 tool guardrails

这说明多 agent 委托里的安全边界不是“每个 agent 自己带一套独立 guardrails”，而是 run-level guardrails 和 per-tool guardrails 的组合。

所以如果技术复盘官问“handoff 后 guardrail 会不会重新跑一遍”，强回答应该是：

默认不会；要看 guardrail 是 input、output，还是 tool 级别。

## 为什么 `agent.as_tool()` 不是“轻量 handoff”

`Agent.as_tool()` 和 handoff 看起来都能让另一个 agent 干活，但文档给出的差异非常根本：

1. `as_tool()` 里的子 agent 收到的是生成好的输入，而不是完整对话历史
2. 子 agent 返回后，原 agent 继续对话
3. 它支持结构化输入参数、approval pauses、streaming callbacks、custom output extraction

这说明 `as_tool()` 本质上是：

1. delegation-as-call
2. nested execution
3. caller remains in control

而 handoff 是：

1. delegation-as-takeover
2. new agent becomes the conversational owner

这是这道题最关键的分界。

## 一个成熟的委托设计至少要回答五个问题

如果要把这个主题答到原理层，至少要讲清楚这五件事：

1. 这是 handoff 还是 `as_tool()`
2. 目标代理看到的是完整历史、过滤后的历史，还是构造好的新输入
3. 委托参数是交接元数据，还是主输入的一部分
4. guardrails/approvals 绑定在 run、tool，还是委托边界
5. 多层委托链如何压缩 transcript、如何定义 filter precedence

只有这五个问题都说清，multi-agent delegation 才不是一句“让另一个 agent 做一下”。

## 机制解读

多 agent 委托不能把 handoff 和 `agent.as_tool()` 混为一谈，因为它们分别对应接管式委托和调用式委托。OpenAI Agents SDK 文档说明，handoff 在模型看来就是一个工具，默认工具名为 `transfer_to_<agent_name>`，并可带 `handoff_description`，这意味着 handoff 是由模型显式选择把控制权转交给另一个 agent，而不是编排层后台静默切换。handoff 的 `input_type` 只定义 handoff tool-call 的结构化参数，SDK 会本地校验后把解析结果传给 `on_handoff`，但这份参数不会替换接收 agent 的主输入、不会改变目标 agent，也不同于 `RunContextWrapper.context`，所以它本质上是交接元数据而不是新的主输入。与此同时，`input_filter` 拿到的是 `HandoffInputData`，其中包含 `input_history`、`pre_handoff_items`、`new_items` 和可选 `input_items`，它解决的是“下一代理能看到什么历史”，而不改变 session 的真实历史。nested handoffs 又进一步说明，多层委托的核心问题是 transcript compaction 和 filter precedence：它默认关闭，开启后会把先前历史压成 `<CONVERSATION HISTORY>` 块，并让 handoff-specific filter 优先于 run-level filter。安全边界层面，handoff 仍然处在同一个 run 中，因此 input guardrails 只对第一个 agent 生效，output guardrails 只对产出 final output 的 agent 生效，而每次自定义 function-tool 调用要用 tool guardrails 单独约束。与之相对，`agent.as_tool()` 让另一个 agent 以工具方式被调用：子 agent 只接收生成好的输入，执行结束后原 agent 继续对话，并支持结构化参数、approval、streaming callback 和 custom output extraction。所以成熟系统必须先分清 delegation-as-takeover 还是 delegation-as-call，再设计历史、输入、guardrails 和 approvals 的边界。

## 易混边界

1. 把 handoff 和 `agent.as_tool()` 都理解成“让另一个 agent 干活”
2. 认为 handoff 参数会自动变成接收 agent 的主输入
3. 把 input_filter 当成修改真实历史，而不是改写可见视图
4. 误以为 handoff 后 input/output guardrails 会重新从头跑
5. 忽略多层 handoff 的 transcript 膨胀和 filter precedence 问题

## 相关样例

1. `examples/python/ai-agent/handoff_vs_as_tool_outline.py`
