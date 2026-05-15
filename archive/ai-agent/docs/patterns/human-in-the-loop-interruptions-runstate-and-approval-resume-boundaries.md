---
kb_id: ai-agent/patterns/human-in-the-loop-interruptions-runstate-and-approval-resume-boundaries
title: "Human-in-the-Loop / Interruptions / RunState：审批真正考的是暂停恢复语义，不是点一个确认按钮"
domain: ai-agent
component: agent-patterns
topic: human-in-the-loop-interruptions-runstate-approval-resume-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 55
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
tags:
  - ai-agent
  - human-in-the-loop
  - interruptions
  - approvals
  - runstate
---

# 一句话结论

Human-in-the-loop 不是给 agent 加一个“人工确认”的界面，而是把高风险工具调用变成可暂停、可持久化、可恢复、可重复进入的运行时控制流。

# 为什么这题很容易答浅

很多人一说人工审批，就会回答：

1. 高风险动作先让人确认
2. 人点通过就继续
3. 不通过就终止

这类回答最大的问题是把审批理解成 UI 行为，而不是运行时语义。

真正的工程问题其实是：

1. 哪些工具类型支持审批
2. 审批命中后结果体现在哪
3. 当前 run 是怎么暂停的
4. 如何把暂停状态持久化下来
5. 恢复时该传哪个 agent、哪个 state
6. 批了一部分没批完怎么办
7. 拒绝时模型到底会看到什么错误信息

如果这些问题答不上来，那“human-in-the-loop”本质上就还只是一个概念标签。

# 哪些能力支持审批，先决定了你的控制面能覆盖到哪里

OpenAI Agents SDK 的 human-in-the-loop 文档明确写了支持面：

1. `function_tool`
2. `Agent.as_tool`
3. `ShellTool`
4. `ApplyPatchTool`

此外：

1. local MCP server 通过 `require_approval`
2. hosted MCP 通过 `HostedMCPTool.tool_config["require_approval"]`
3. hosted MCP 还能配 `on_approval_request`

这说明审批不是 agent 的一个统一开关，而是绑定在具体可调用 surface 上。

也就是说，系统设计时不能只问“需不需要人工审批”，还要问：

1. 审批是绑在 function tool
2. 绑在 agent-as-tool
3. 绑在 local MCP
4. 还是 hosted MCP

不同绑定点，恢复语义和控制边界都不完全一样。

# Runner 不是简单检测一次审批，而是有状态地执行审批规则

文档给出的审批流程非常关键：

1. 模型发出 tool call
2. runner 评估对应审批规则
3. 如果 `RunContextWrapper` 里已存在该调用的审批决定，就直接沿用
4. `always_approve=True` / `always_reject=True` 可以把同一工具在本次 run 后续调用的决定变成 sticky decision

这说明审批不是“一次弹窗、一次处理”，而是：

1. 有 per-call decision
2. 有 run-scoped sticky decision
3. 有运行态缓存

所以如果面试官问“审批会不会每次同样工具都重新问一遍”，强回答应该是：

默认按 call ID 判定，但可以通过 always approve/reject 把本次 run 后续同工具调用的决策持久化为 sticky decision。

# 中断是 run-wide 的，不是当前 agent 局部的

官方文档还特别强调了一个极易答错的点：

1. interruption 会出现在 `RunResult.interruptions`
2. 流式则在 `RunResultStreaming.interruptions`
3. 条目类型是 `ToolApprovalItem`
4. 里面包含 `agent.name`、`tool_name`、`arguments`
5. 这不仅覆盖当前 agent
6. handoff 后的工具审批也会冒出来
7. nested `Agent.as_tool()` 里的审批同样会冒到外层 run

这说明 HITL 的审批面是 run-wide，而不是“哪个 agent 当前在前台，就由谁自己处理审批”。

这个边界一旦讲清楚，很多多 agent 审批问题就清楚了：

1. 审批不是每个子 agent 各自暂停各自恢复
2. 而是统一回到外层 run 的 interruption surface

# `result.to_state()` 才是暂停恢复的核心转换点

文档明确给出标准恢复流程：

1. 先拿到 paused 的 `result`
2. 用 `result.to_state()` 变成 `RunState`
3. 对某个 interruption 调 `state.approve(...)` 或 `state.reject(...)`
4. 再用 `Runner.run(agent, state)` 或 `Runner.run_streamed(agent, state)` 恢复
5. 这里的 `agent` 必须是原始 top-level agent
6. 恢复后 run 会从中断点继续，并且如果后面再出现新审批，还会再次进入同一流程

这说明 HITL 的本质不是“确认后重新发一遍请求”，而是：

1. 挂起
2. 序列化
3. 修改待恢复状态
4. 从原执行链继续

如果恢复时传错 agent，或者试图直接重放最后一段 prompt，而不是恢复 `RunState`，那就不是官方语义下的 resume。

# Sticky Decision 可以跨持久化继续生效

文档还给了一个很强的原理点：

1. `always_approve=True` / `always_reject=True` 形成的 sticky decisions
2. 会被写进 `RunState`
3. 因此在 `to_string()/from_string()` 或 `to_json()/from_json()` 之后仍然存在

这意味着 sticky decision 不是内存里的临时缓存，而是 paused run 状态的一部分。

对于长审批链或审批挂很久的任务，这是非常重要的运行时语义。

# 拒绝工具调用时，模型看到什么并不是固定死的

很多人忽略了 rejection message 这层。

文档明确说，审批拒绝的模型可见文本可以有两层自定义：

1. run 级别：`RunConfig.tool_error_formatter`
2. 单次调用级别：`state.reject(..., rejection_message=...)`
3. 如果两者都存在，单次 rejection message 优先

这非常重要，因为它说明审批拒绝不是纯控制平面事件，它还会反向影响模型接下来如何理解这次失败。

成熟系统经常需要区分：

1. 给模型看的拒绝原因
2. 给审计系统看的真实拒绝原因

而不是一律塞同一段文本。

# `RunState` 是持久化对象，不是“临时恢复句柄”

官方文档对 `RunState` 的描述非常值得单独讲出来：

1. 它被设计成 durable
2. 可以 `to_json()` / `to_string()` 存数据库或队列
3. 可以之后 `from_json()` / `from_string()` 再恢复
4. 序列化内容不仅有 app context
5. 还包含 approvals、usage、serialized `tool_input`、nested agent-as-tool resumptions、trace metadata、server-managed conversation settings

这条信息的工程含义非常强：

1. `RunContextWrapper.context` 不是纯运行时内存
2. 它一旦进了 `RunState`，就变成持久化数据
3. 所以不该随意往 context 塞本不想落盘或跨系统传播的秘密数据

这是很多团队会忽视的安全边界。

# Local Shell 与 Hosted Shell 的审批边界并不对称

文档还特别指出：

1. local `ShellTool` 与 `ApplyPatchTool` 支持审批和 `on_approval`
2. hosted shell environments 不支持 `needs_approval` 或 `on_approval`

这说明“同样叫 shell”，审批能力边界也会因为执行位置不同而不同。

这个点很适合用来拉开候选人的层次，因为它能证明你理解：

能力名相同，不代表控制面相同。

# 面试里怎么把 HITL 讲到原理层

一个更完整的回答结构通常是：

1. 先说明审批绑定在具体 tool surface 上，而不是抽象 agent 开关
2. 再说明 interruption 是 run-wide 的统一暂停面
3. 然后讲 `result.to_state()` 到 `Runner.run(agent, state)` 的恢复链条
4. 再补 sticky decision 如何写入 `RunState`
5. 最后讲 rejection message 和 serialized context 的安全边界

这样回答就不是“人工确认一下”，而是在讲一个真正可持久化、可恢复、可审计的 pause-resume runtime。

# 标准面试答案

Human-in-the-loop 的本质不是加一个人工确认按钮，而是把高风险工具调用建模成 pause-resume 控制流。OpenAI Agents SDK 的 human-in-the-loop 文档明确说明，审批规则可以挂在 `function_tool`、`Agent.as_tool`、`ShellTool`、`ApplyPatchTool` 上，local MCP 通过 `require_approval`，hosted MCP 通过 `HostedMCPTool.tool_config["require_approval"]` 和可选 `on_approval_request` 来实现，这说明审批首先是绑定在具体调用 surface 上。运行时上，当模型发出 tool call，runner 会评估审批规则；如果 `RunContextWrapper` 里已经存有该调用的决定，就直接沿用，而 `always_approve=True` / `always_reject=True` 会把决策变成当前 run 后续同工具调用的 sticky decision。若需要暂停，审批项会以 `ToolApprovalItem` 的形式出现在 `RunResult.interruptions` 或 `RunResultStreaming.interruptions`，其中包含 `agent.name`、`tool_name`、`arguments` 等信息，而且这套 interruption surface 是 run-wide 的，handoff 后或 nested `Agent.as_tool()` 里的审批同样会冒到外层 run。恢复时，要先 `result.to_state()` 变成 `RunState`，再 `state.approve(...)` 或 `state.reject(...)`，最后用原始 top-level agent 调 `Runner.run(agent, state)` 或 `Runner.run_streamed(agent, state)` 继续；恢复后如果又遇到新审批，会再次进入同一流程。更进一步，sticky decisions 会随 `RunState` 一起在 `to_string()/from_string()`、`to_json()/from_json()` 中持久化；审批拒绝的模型可见文本既可以通过 `RunConfig.tool_error_formatter` 做 run 级默认，也可以用 `state.reject(..., rejection_message=...)` 覆盖单次调用；而序列化后的 `RunState` 不只存 context，还会带 approvals、usage、tool_input、nested resumptions、trace metadata 等 runtime 元数据，因此 context 应被视为持久化数据而非纯临时对象。成熟回答必须把支持面、interruption surface、RunState 恢复链条和持久化边界一起讲出来。

# 常见误答

1. 把审批理解成前端确认框，而不是暂停恢复语义
2. 认为审批只影响当前 agent，不会冒到外层 run
3. 恢复时直接重发 prompt，而不是恢复 `RunState`
4. 不知道 sticky decisions 会持久化到状态里
5. 忽略 `RunContextWrapper.context` 会跟着 `RunState` 一起落盘

# 相关样例

1. `examples/python/ai-agent/hitl_runstate_resume_outline.py`
