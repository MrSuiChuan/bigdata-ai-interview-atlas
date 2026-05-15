---
kb_id: ai-agent/patterns/approval-workflows-escalation-policies-and-human-override-semantics
title: Approval Workflows / HITL / RunState / Human Override：人工介入不是补个按钮，而是重新定义暂停、恢复和执行权边界
domain: ai-agent
component: agent-patterns
topic: approval-workflows-hitl-runstate-human-override
difficulty: advanced
status: reviewed
sidebar_position: 36
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-agents-sdk-human-in-the-loop
  - openai-agents-sdk-run-state
  - langgraph-interrupts-docs
  - autogen-human-in-the-loop-docs
claim_ids:
  - pattern-claim-0162
  - pattern-claim-0163
  - pattern-claim-0164
  - pattern-claim-0165
  - pattern-claim-0166
  - pattern-claim-0167
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
  - approval
  - human-in-the-loop
  - runstate
  - escalation
  - override
---
## 一句话结论

Approval Workflows / HITL / RunState / Human Override：人工介入不是补个按钮，而是重新定义暂停、恢复和执行权边界需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 human in the loop，就会回答：

1. 高风险操作让人确认一下
2. 确认后继续执行
3. 不通过就拒绝

这类回答最大的问题，是把审批理解成 UI 行为，而不是运行时语义。真正的工程问题其实是：

1. 审批绑定在哪种 tool surface 上
2. 审批暂停的是一次 tool call、一个节点，还是整个 run
3. 审批发生在多 agent handoff 之后时，谁负责统一接收决定
4. 人工 override 改的是“是否执行”、输入参数，还是整个状态
5. 恢复后是从原地继续，还是从节点开头重放
6. 当前 run 是怎么持久化暂停态的

如果这些问题说不清，那“human-in-the-loop”本质上就还只是一个概念标签。

## 先把四个词说准

## Approval Workflow 是 Pause-Resume Protocol

OpenAI Agents SDK 的 human-in-the-loop 文档明确把审批建模成对敏感工具调用的暂停。系统遇到需要审批的调用时不会直接继续向下执行，而是把待审批项暴露为 interruption；审批完成后，再依靠 `RunState` 继续执行。

这里最重要的不是“有人看了一眼”，而是：

1. 暂停是运行态的一部分，不是日志备注
2. 待审批项必须能被序列化，否则进程重启后无法恢复
3. 恢复必须回到同一条 run，而不是重新发一条新 run

也就是说，approval workflow 的本质是 pause-resume protocol，不是 notification protocol。

## HITL Control Surface 先决定覆盖边界

审批能力不是 agent 的一个抽象开关，而是挂在具体调用 surface 上。官方文档明确支持：

1. `function_tool`
2. `Agent.as_tool`
3. `ShellTool`
4. `ApplyPatchTool`
5. local MCP 的 `require_approval`
6. hosted MCP 的 `HostedMCPTool.tool_config["require_approval"]`

这解释该组件设计时不能只问“要不要人工审批”，还要问审批是绑在 function tool、agent-as-tool、local MCP 还是 hosted MCP 上。不同绑定点，恢复语义和控制边界都不完全一样。

## Escalation Policy 是执行权上收规则

审批并不等于所有动作都找人点一次。`needs_approval` 既可以全局开启，也可以按调用动态判断。

这意味着系统必须事先定义：

1. 什么操作无条件升级
2. 什么操作根据参数、环境、租户或风险评分动态升级
3. 什么操作允许低权限自动执行

这就是 escalation policy。它回答的是“什么情况下要把执行权上收给人”，而不是“出错后找谁背锅”。

## Human Override Semantics 是人工到底覆盖哪一层

很多系统把人工介入理解成 approve / reject 二选一，但这太浅。LangGraph interrupts 文档里，`Command(resume=...)` 提供的值会成为 `interrupt()` 的返回值，这意味着人工不仅可以说“过”或“不过”，还可以：

1. 修改参数再执行
2. 修改图状态再继续
3. 补充上下文、备注或审计原因
4. 改变后续路由分支

这说明 human override 真正覆盖的不是一个布尔开关，而是状态机的输入。

## 为什么审批面必须是 Run-Wide 的

OpenAI Agents SDK 的一个高价值事实是：审批面是 run-wide 的。也就是说，哪怕审批发生在 handoff 之后，或者发生在嵌套的 `Agent.as_tool()` 内部，待审批事件仍会浮到最外层 run 上，由最初那条 run 来恢复。

这件事非常关键，因为一旦进入多 agent 结构，调用链通常是这样的：

1. 顶层 agent 收到用户请求
2. handoff 给执行型 agent
3. 执行型 agent 再调用 `Agent.as_tool()` 包裹的子 agent
4. 子 agent 继续经由 MCP 或 shell / apply-patch 工具执行环境动作

如果审批语义只绑定在“当前活跃 agent”，那么下层一旦切换执行上下文，高风险动作就很容易绕过上层治理。run-wide approval 的意义，就是保证决策权边界和执行链深度无关。

## `result.to_state()` 才是暂停恢复的核心转换点

官方文档给出了标准恢复流程：

1. 先拿到 paused 的 `result`
2. 用 `result.to_state()` 变成 `RunState`
3. 对某个 interruption 调 `state.approve(...)` 或 `state.reject(...)`
4. 再用 `Runner.run(agent, state)` 或 `Runner.run_streamed(agent, state)` 恢复
5. 恢复时必须传原始 top-level agent
6. 恢复后如果后面再出现新审批，还会再次进入同一流程

这说明 HITL 的本质不是“确认后重新发一遍请求”，而是：

1. 挂起
2. 序列化
3. 修改待恢复状态
4. 从原执行链继续

## Sticky Decision 和 Rejection Message 说明它不是一次性弹窗

官方文档还给了两个很强的运行时语义：

1. `always_approve=True` / `always_reject=True` 会把同一工具在本次 run 后续调用的决定变成 sticky decision
2. sticky decisions 会被写进 `RunState`，因此在 `to_string()/from_string()` 或 `to_json()/from_json()` 之后仍然存在
3. 审批拒绝的模型可见文本可以通过 `RunConfig.tool_error_formatter` 或单次 `state.reject(..., rejection_message=...)` 定制

这意味着审批不是“一次弹窗、一次处理”，而是：

1. 有 per-call decision
2. 有 run-scoped sticky decision
3. 有运行态持久化
4. 会反向影响模型接下来如何理解这次失败

## 为什么人工介入本质上是控制回路边界

AutoGen 的 human-in-the-loop 文档提供了另一个很重要的视角：人类反馈不是临时插队，而是明确的控制回路边界。团队可以：

1. 在达到 `max_turns` 后主动停止
2. 在满足 termination condition 时停住
3. 保留内部状态
4. 后续带着新的人类反馈恢复会话

这说明 override 不一定只发生在“动作执行前”；它也可以发生在“系统已经形成一轮候选方案之后，但还没被允许继续自治扩张”的节点上。

## 一个成熟的审批系统至少要定义六件事

如果要把这个主题答到原理层，至少要把下面六件事讲出来：

1. 触发规则：哪些操作、哪些参数、哪些上下文触发审批
2. 暂停边界：暂停的是 tool call、node，还是整个 run
3. 决策载体：审批结果如何被编码，是否允许参数修改和状态修改
4. 恢复语义：恢复后从哪里继续，哪些代码会重放
5. 作用域：审批是否覆盖 handoff、嵌套 agent、shell、MCP 等下层执行面
6. 审计要求：谁批准的、为什么批准、改了什么、是否可追溯

少一层都可能出事故。比如只定义触发规则、不定义恢复语义，就会在审批通过后重复执行旧动作；只定义审批按钮、不定义作用域，就会在多 agent 链路里失去治理一致性。

## 机制解读

Approval workflow、HITL、RunState 和 human override 必须一起设计，因为它们共同定义的是一条完整的控制链。OpenAI Agents SDK 的 human-in-the-loop 文档说明，敏感工具调用可以在执行时暂停，待审批项作为 interruption 暴露出来，并通过 `RunState` 序列化运行态后恢复，这说明审批本身就是 run 生命周期的一部分，而不是界面层提示。更关键的是，官方文档明确审批面是 run-wide 的，所以即便审批发生在 handoff 之后或嵌套的 `Agent.as_tool()` 内部，待审批项仍会浮到最外层 run 并由原始 run 恢复，这解决的是多 agent 深链路下治理边界被打穿的问题。与此同时，`needs_approval` 可以全局启用，也可以按调用动态判定，并适用于 function tools、`Agent.as_tool()`、shell / apply-patch 以及 MCP tools，这说明 escalation policy 的本质是“何时上收决策权”。从 LangGraph 的角度看，`Command(resume=...)` 的值会成为 `interrupt()` 返回值，而且 interrupts 可以直接放在工具内部，所以人工 override 不是简单的 approve/reject，而是能够修改参数、修改状态甚至改变后续路由的控制输入。AutoGen 进一步说明 human-in-the-loop 还可以作为控制回路边界，在达到 `max_turns` 或终止条件后保存状态、接受人类反馈并继续。因此，成熟的审批设计必须同时定义触发条件、暂停边界、恢复语义、override 粒度、作用域覆盖范围和审计链路，而不是把“人工审批”理解成界面层的一个按钮。

## 易混边界

1. 把人工审批理解成单纯的 UI 弹窗
2. 只设计触发审批的规则，不设计恢复语义
3. 认为审批只影响当前 agent，不需要覆盖 handoff 和嵌套工具
4. 把 override 简化成 approve / reject，忽略参数和状态修改
5. 忽略 `RunState` 会持久化 decision 与 context 的安全边界

## 相关样例

1. `examples/python/ai-agent/approval_workflow_human_override_outline.py`
2. `examples/python/ai-agent/hitl_runstate_resume_outline.py`
