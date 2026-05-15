---
id: q-ai-pattern-0024
title: 为什么多 Agent 系统里 handoff、agent-as-tool 和 shared state 必须一起设计
domain: ai-agent
component: agent-patterns
topic: multi-agent-coordination-delegation-shared-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/multi-agent-coordination-delegation-and-shared-state
estimated_minutes: 10
---

# 题目

为什么多 Agent 系统里 handoff、agent-as-tool 和 shared state 必须一起设计？

# 一句话结论

因为多 Agent 的本质不是多几个角色，而是把控制权如何转移、状态如何可见、协作何时终止一起定义清楚；只讲其中一个，系统边界就会失真。

# 核心机制

1. handoff transfers control to another agent
2. agent-as-tool keeps the orchestrator in charge
3. shared and private state determine context scope and isolation

# 标准答案

多 Agent 系统最容易答浅的地方，是把它理解成几个不同角色的 prompt 组合。真正的关键在于控制流和状态边界。OpenAI Agents SDK 的 handoff 会把委派能力以工具形式暴露给 LLM，并支持 `input_type`、`input_filter` 与历史控制；handoff 后控制权会转给接收 agent，而且接收方默认能看到之前的会话历史。相对地，`Agent.as_tool()` 是由中心 orchestrator 把另一个 agent 当成功能模块调用，nested run 结束后控制权仍然回到 orchestrator。这说明 delegation 至少要分清 control transfer 和 nested execution 两类。与此同时，sessions 会在每次运行前自动注入历史，并在运行后自动写回新 items，Redis-backed session 适合共享、低时延的会话记忆；但 LangGraph subgraphs 又提醒我们，不应让所有子 agent 默认共享全部状态，而要区分 private state 和 shared state，并根据子 agent 是否需要跨多轮连续记忆，选择 per-invocation 还是 per-thread persistence。再往上，AutoGen Teams 这类编排模式之所以强调 termination conditions，是因为多 Agent 不只是分工，还要有调度和终止机制。成熟答案必须把 handoff、agent-as-tool、state scope 和 termination policy 一起讲清楚。

# 必答点

1. 说清 handoff 与 `Agent.as_tool()` 的控制权差异
2. 说明 shared state 不是越多越好
3. 说明 private state 与 shared canonical state 的边界
4. 提到终止条件或轮次调度，否则多 Agent 容易失控

# 常见误答

1. 把多 Agent 理解成多个角色提示词
2. 不区分控制权转移和工具式子调用
3. 默认共享全部历史和全部记忆
4. 完全不提 termination condition