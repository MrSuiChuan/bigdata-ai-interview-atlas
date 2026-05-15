---
kb_id: ai-agent/patterns/multi-agent-coordination-delegation-and-shared-state
title: Multi-Agent Coordination / Delegation / Shared State：多 Agent 不是多几个角色，而是把控制权和状态边界设计清楚
domain: ai-agent
component: agent-patterns
topic: multi-agent-coordination-delegation-shared-state
difficulty: advanced
status: reviewed
sidebar_position: 24
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-agents-sdk-handoffs
  - openai-agents-sdk-tools
  - openai-agents-sdk-sessions
  - langgraph-subgraphs-docs
  - autogen-teams-docs
claim_ids:
  - pattern-claim-0099
  - pattern-claim-0100
  - pattern-claim-0101
  - pattern-claim-0102
  - pattern-claim-0103
tags:
  - ai-agent
  - multi-agent
  - delegation
  - handoff
  - shared-state
---
## 一句话结论

Multi-Agent Coordination / Delegation / Shared State：多 Agent 不是多几个角色，而是把控制权和状态边界设计清楚需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 multi-agent，就会快速落到一种很表层的说法：

1. 一个 agent 负责规划
2. 一个 agent 负责搜索
3. 一个 agent 负责总结

这种回答只能说明你知道“可以拆角色”，但还没有进入原理层。

因为真正决定系统质量的，不是角色名字，而是下面这些结构问题：

1. 任务交给别人以后，控制权到底是不是转移了
2. 子 agent 能看到多少历史上下文
3. 多个 agent 共用哪些状态，哪些状态必须隔离
4. 协作是单次调用，还是跨多轮持续存在
5. 多 agent 对话如果发生互相来回转发，怎么终止

如果这几个问题没有回答清楚，多 Agent 往往只是“把一个复杂问题拆成更多复杂问题”。

## 多 Agent 首先是控制流设计，不是人设设计

单 agent 变成多 agent，真正发生的变化，是控制流从单环路变成了可委派、可回收、可恢复的结构。

所以技术复盘中如果被问“为什么需要多 agent”，比较成熟的回答通常不是“因为一个 agent 不够聪明”，而是：

1. 不同子任务需要不同工具集或不同提示边界
2. 不同子任务的上下文规模差异很大，不适合全部塞进一个主上下文
3. 某些步骤需要隔离状态，避免中间草稿污染全局状态
4. 某些步骤需要显式转交控制权，某些步骤只需要把别人当成工具调用

也就是说，多 Agent 解决的是 orchestration problem，而不只是 prompt decomposition problem。

## Delegation 至少要分清 handoff 和 agent-as-tool

这是很多回答里最关键、也最容易漏掉的一层。

OpenAI Agents SDK 的 handoffs 文档说明，handoff 会把一个 agent 委派给另一个 agent，而且 handoff 在模型侧是以工具的形式暴露给 LLM 的；同时它还支持 `input_type`、`input_filter` 和 handoff 历史控制等定制项。

这件事说明了两个原理：

1. handoff 不是“普通函数调用”，而是 control transfer
2. delegation 输入并不是天然安全的，必须考虑过滤、裁剪和结构化传递

更重要的是，OpenAI 文档明确区分了 handoff 和 `Agent.as_tool()`：

1. handoff 之后，控制权交给 receiving agent
2. receiving agent 默认会看到之前的会话历史
3. `Agent.as_tool()` 则是让中心 orchestrator 把另一个 agent 当成能力模块调用
4. nested run 完成后，控制权仍然回到 orchestrator

这是一条非常适合理解这个主题时讲清楚的边界：

1. handoff 更像“把会话主导权转出去”
2. agent-as-tool 更像“我还掌控流程，只是调用一个专家子程序”

如果连这两种 delegation 都不区分，多 Agent 控制流其实没有真正讲明白。

## Shared State 不是越多越好，而是要先定义可见性边界

很多团队一开始做多 Agent，会下意识地追求“所有 agent 共享全部记忆”。

这通常是错误方向。

OpenAI Agents SDK sessions 文档给了一个很好的运行时记忆模型：

1. 每次 run 前，runner 会把已存储的历史内容预先拼接进来
2. 每次 run 后，新产生的 items 会自动写回 session
3. 如果需要共享、低时延的 session memory，官方建议使用 Redis-backed sessions

这说明 session memory 更接近：

1. 运行时会话连续性
2. 多次调用之间的短期共享上下文

但它不等于“所有 agent 永远共享同一切状态”。

因为共享状态越大，问题就越明显：

1. 无关上下文污染决策
2. 敏感信息扩散到本不该看到它的子 agent
3. 每个 agent 都携带越来越重的上下文包袱
4. 调试时很难判断错误究竟来自谁写入了错误状态

所以 shared state 的关键不是“共享多少”，而是“哪些状态必须成为系统公共事实”。

## LangGraph Subgraphs 把私有状态和共享状态讲得很清楚

LangGraph subgraphs 文档很适合拿来说明多 Agent 状态边界，因为它明确支持两种模式：

1. subgraph 保留 private state，通过 state mapping wrapper 与父图交换必要字段
2. subgraph 直接共享 parent state 中的某些 key

这意味着一个成熟系统会把状态拆成至少两层：

1. shared canonical state：主流程必须知道的事实，比如任务编号、审批结论、最终产出位置
2. private working state：某个子 agent 的中间推理、临时草稿、局部缓存、局部检索结果

这个区分很重要。

因为很多所谓的 multi-agent chaos，本质上不是模型不稳定，而是状态作用域设计错误：

1. 该私有的被全局广播了
2. 该共享的又没有共享，导致反复重复计算
3. 中间草稿被当成正式结论写回主状态

LangGraph 还给了另一个很实用的指导：

1. 大多数作为工具使用的子图，使用 per-invocation persistence 就够了
2. 只有当子 agent 自己需要跨多轮持续记忆时，才应该给它 per-thread persistence

这条边界特别值钱，因为它直接回答了“为什么不是所有子 agent 都需要长期记忆”。

## 多 Agent 里的 memory 范围，决定协作成本和风险

如果从技术复盘角度继续往下进一步分析，一个很成熟的答案会把 memory scope 讲成三类：

1. ephemeral invocation state：仅本次委派有效
2. session-level shared memory：同一会话或同一任务线程共享
3. long-term persistent memory：跨任务、跨会话复用的长期记忆

不同层级对应完全不同的治理要求：

1. invocation state 重点是局部正确性和轻量传递
2. session memory 重点是会话连续性和多次调用衔接
3. long-term memory 重点是权限、保留策略、删除和审计

如果这些层级混在一起，multi-agent 系统会非常难控。

## Coordination 不只是分工，还包括终止条件和轮次控制

多 Agent 最大的工程风险之一，不是“不会协作”，而是“协作停不下来”。

AutoGen Teams 的文档价值就在这里。它不是把一堆 agent 扔进同一个对话框里自由发挥，而是提供了显式 team orchestration pattern，比如 `RoundRobinGroupChat`，并要求你配 termination conditions。

这说明真正的 coordination 需要至少回答这些问题：

1. 谁决定下一位发言者
2. 每轮产出写到哪里
3. 什么条件下结束
4. 如果没有达成结束条件，是否允许继续重试

也就是说，多 Agent 不是把“一个循环”换成“多个 agent 轮流说话”，而是把调度策略显式化。

## 一个成熟的多 Agent 架构至少要回答五个问题

如果你想把这个主题答到原理层，通常要把下面五个面讲出来：

1. control ownership：任务什么时候 handoff，什么时候只是 tool-style nested run
2. context visibility：接收方默认看到哪些历史，哪些输入要过滤
3. state scope：哪些字段共享，哪些字段私有
4. memory duration：状态是单次调用、单线程会话，还是长期持久化
5. termination policy：由谁决定停止，如何避免 agent 之间无限转发

这五个维度一讲出来，回答就从“角色扮演”进入了“系统设计”。

## 机制解读

Multi-Agent Coordination 的核心，不是多几个角色，而是把 delegation、state scope 和 orchestration policy 设计清楚。OpenAI Agents SDK 的 handoffs 会把委派能力以工具形式暴露给 LLM，并支持 `input_type`、`input_filter` 和历史控制；handoff 发生后，控制权转交给接收 agent，而 `Agent.as_tool()` 则是由中心 orchestrator 调用专家 agent，nested run 结束后控制权仍回到 orchestrator。与此同时，sessions 会在每次运行前自动注入已存储历史，并在运行后自动写回新 items，Redis-backed session 适合共享、低时延的会话记忆。LangGraph subgraphs 又进一步说明，多 Agent 不应默认共享全部状态，而应区分 private state 与 shared state，并按需要选择 per-invocation 或 per-thread persistence。再往上看，AutoGen Teams 这类框架之所以强调 `RoundRobinGroupChat` 和 termination condition，是因为多 Agent 协作本质上是显式调度与终止控制，而不是把多个 agent 放在一起自由聊天。真正成熟的多 Agent 设计，必须同时定义控制权转移、上下文可见性、状态作用域、记忆保留时长和终止机制。

## 易混边界

1. 把多 Agent 理解成多个角色提示词
2. 不区分 handoff 和 agent-as-tool
3. 默认让所有 agent 共享全部历史和全部记忆
4. 只讲分工，不讲终止条件和轮次调度
5. 把局部中间状态直接当成全局事实写回主状态

## 相关样例

1. `examples/python/ai-agent/multi_agent_coordination_shared_state_outline.py`
