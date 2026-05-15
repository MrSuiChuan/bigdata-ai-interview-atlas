---
id: q-ai-pattern-0049
title: 为什么多 Agent 委托必须先分清 Handoff 和 Agent-as-Tool
domain: ai-agent
component: agent-patterns
topic: handoffs-input-filters-agent-as-tool-delegation-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/handoffs-input-filters-agent-as-tool-and-delegation-boundaries
estimated_minutes: 12
---

# 题目

为什么多 Agent 委托必须先分清 Handoff 和 Agent-as-Tool？

# 一句话结论

因为 handoff 是接管式委托，`agent.as_tool()` 是调用式委托；它们在历史可见性、控制权转移、guardrails 作用范围和审批边界上完全不同。

# 核心机制

1. handoff 是 delegation-as-takeover
2. `as_tool` 是 delegation-as-call
3. `input_filter`、guardrails、nested history compaction 决定委托边界质量

# 标准答案

多 Agent 委托必须先分清 handoff 和 `agent.as_tool()`，因为它们不是同一种委托语义。OpenAI Agents SDK 文档说明，handoff 在模型眼里就是一个工具，默认名为 `transfer_to_<agent_name>`，也就是说模型是在当前决策点上显式把控制权交给另一个 agent；handoff 的 `input_type` 只是 handoff tool-call 的结构化参数，会被本地校验并传给 `on_handoff`，但不会替换接收 agent 的主输入，也不同于 `RunContextWrapper.context`，因此它本质上是交接元数据而不是新的主输入。为了控制接收方看到什么历史，handoff 还提供 `input_filter`，拿到 `HandoffInputData` 后可以改写可见历史，但不改变 session 的真实历史。进一步，nested handoffs 默认关闭，开启后会把前面 transcript 压成 `<CONVERSATION HISTORY>` 块，并允许 handoff-specific filter 覆盖 run-level filter，这说明多层委托的核心问题是历史压缩和过滤优先级。安全边界上，handoff 仍处在同一个 run 中，所以 input guardrails 只对第一个 agent 生效，output guardrails 只对最终产出 agent 生效，而每次 custom function-tool 调用要用 tool guardrails。与之相对，`agent.as_tool()` 让子 agent 像工具一样被调用：它只看到生成好的输入，执行完后原 agent 继续对话，并支持结构化参数、审批、流式回调和输出提取。所以成熟系统必须先决定是接管式委托还是调用式委托，再决定历史、guardrails 和 approvals 怎么绑。

# 必答点

1. 说明 handoff 和 `agent.as_tool()` 的控制权模型不同
2. 说明 handoff 参数不是接收 agent 的主输入
3. 说明 `input_filter` 改的是可见历史而不是存储历史
4. 说明 guardrails/approval 边界不会因 handoff 自动全部重跑

# 常见误答

1. 把 handoff 和 `agent.as_tool()` 都说成“调用另一个 agent”
2. 误以为 handoff 参数就是下一代理看到的全部输入
3. 把 `input_filter` 当成改底层真实历史
4. 忽略 nested handoff 的 transcript compaction 问题
