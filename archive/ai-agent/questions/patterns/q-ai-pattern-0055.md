---
id: q-ai-pattern-0055
title: 为什么 Human-in-the-Loop 首先是暂停恢复语义，而不是人工确认界面
domain: ai-agent
component: agent-patterns
topic: human-in-the-loop-interruptions-runstate-approval-resume-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-human-in-the-loop
claim_ids:
  - pattern-claim-0283
  - pattern-claim-0284
  - pattern-claim-0285
  - pattern-claim-0286
  - pattern-claim-0287
  - pattern-claim-0288
  - pattern-claim-0289
  - pattern-claim-0290
related_docs:
  - ai-agent/patterns/human-in-the-loop-interruptions-runstate-and-approval-resume-boundaries
estimated_minutes: 12
---

# 题目

为什么 Human-in-the-Loop 首先是暂停恢复语义，而不是人工确认界面？

# 一句话结论

因为审批真正影响的是 run 如何暂停、状态如何持久化、恢复时从哪里继续，以及模型最终会看到什么审批结果，而不是前端上点一个通过按钮。

# 核心机制

1. 审批绑定在具体 tool surface 上
2. interruption 是 run-wide 的暂停面
3. `RunState` 负责持久化、approve/reject 和恢复

# 标准答案

Human-in-the-Loop 首先是暂停恢复语义，而不是人工确认界面，因为 OpenAI Agents SDK 的审批流程明确是一个 pause-resume runtime。审批能力可以挂在 `function_tool`、`Agent.as_tool`、`ShellTool`、`ApplyPatchTool` 上，local MCP 通过 `require_approval`，hosted MCP 通过 `HostedMCPTool.tool_config["require_approval"]`，说明它首先是具体 tool surface 的控制逻辑。运行时上，当模型发出 tool call，runner 会评估审批规则，如果 `RunContextWrapper` 里已有该调用决定，就直接沿用；`always_approve=True` / `always_reject=True` 还能把决定变成当前 run 的 sticky decision。若需要暂停，审批项会出现在 `RunResult.interruptions` 或 `RunResultStreaming.interruptions` 中，类型是 `ToolApprovalItem`，而且这个 interruption surface 是 run-wide 的，handoff 后或 nested `Agent.as_tool()` 里的审批也会回到外层 run。恢复时必须先 `result.to_state()` 变成 `RunState`，再 `state.approve(...)` 或 `state.reject(...)`，最后使用原始 top-level agent 调 `Runner.run(agent, state)` 或 `Runner.run_streamed(agent, state)` 继续；恢复后如果又出现新审批，会再次进入同一暂停流程。进一步地，sticky decisions 会随着 `RunState` 的序列化与反序列化持续存在，审批拒绝的模型可见文本还可以由 `RunConfig.tool_error_formatter` 或单次 `rejection_message` 控制，而 serialized `RunState` 会携带 context、approvals、usage、tool_input、trace metadata 等数据，所以 context 必须按持久化数据来设计。这些都说明 HITL 本质上是 durable pause-resume control flow，而不是确认界面。

# 必答点

1. 说明 interruption 是 run-wide，不是当前 agent 私有
2. 说明恢复必须经过 `result.to_state()` 和 `Runner.run(agent, state)`
3. 说明 sticky decisions 会随 `RunState` 持久化
4. 说明 context 会跟着状态落盘，存在安全边界

# 常见误答

1. 把审批理解成 UI 组件
2. 认为 handoff 或 nested agent 的审批不会回到外层 run
3. 恢复时直接重放 prompt
4. 忽略 `RunState` 的持久化内容和安全含义
