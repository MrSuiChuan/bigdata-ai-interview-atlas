---
kb_id: ai-agent/patterns/guardrail-tripwires-blocking-parallel-and-fail-closed-boundaries
title: "Guardrail Tripwire / Blocking vs Parallel / Fail-Closed 边界：真正难的不是拦不拦，而是能不能在副作用发生前拦住"
domain: ai-agent
component: agent-patterns
topic: guardrail-tripwires-blocking-parallel-fail-closed-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 51
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-guardrails
claim_ids:
  - pattern-claim-0255
  - pattern-claim-0256
  - pattern-claim-0257
  - pattern-claim-0258
  - pattern-claim-0259
  - pattern-claim-0260
tags:
  - ai-agent
  - guardrails
  - tripwire
  - blocking
  - parallel
---

# 一句话结论

Tripwire 不是“命中风险后报个错”这么简单，它真正定义的是系统在什么阶段停下、停下时有没有已经消耗 token、以及有没有已经产生工具副作用。

# 为什么这题很容易答浅

很多人一说 guardrail，就会回答：

1. 先做一次安全检测
2. 不通过就拦截
3. 通过了再继续

这个回答的问题在于，它把 guardrail 理解成了一个抽象“门卫”，却没有回答最核心的工程问题：

1. 门是在模型执行前，还是执行中，还是执行后
2. 拦截失败时，系统是否已经花掉 token
3. 更麻烦的是，工具调用是不是已经发生
4. 如果是多 agent 或多工具链路，guardrail 到底绑在哪个边界

面试官真正想听的，不是“能拦”，而是“在哪一层拦、拦住后还能保证什么”。

# Input Guardrail 先回答的是“是否让这次 run 开始”

OpenAI Agents SDK 的 guardrails 文档把 input guardrail 的执行语义写得很清楚：

1. 它只对链路中的第一个 agent 生效
2. 它收到的是与 agent 完全相同的输入
3. guardrail 函数先产出 `GuardrailFunctionOutput`
4. 若 `.tripwire_triggered` 为真，就抛出 `InputGuardrailTripwireTriggered`

这说明 input guardrail 的本质不是“模型输出后的复核”，而是对 run 入口做一次显式裁决。

如果面试官问“为什么 input guardrail 只跑在第一个 agent”，更强的回答应该是：

因为它设计上就是针对用户入口输入，而不是针对整条委托链上的每一次内部状态变化。内部链路如果要逐次检查，应该转向 tool guardrail，而不是误以为 agent-level input guardrail 会自动覆盖整条工作流。

# Parallel 和 Blocking 的差别，不是性能优化，而是副作用边界

这是这道题最容易答浅的地方。

官方文档明确给出两种 input guardrail 执行模式：

1. `run_in_parallel=True` 是默认值
2. guardrail 与 agent 同时开始
3. 这样延迟最好
4. 但如果 guardrail 最后失败，agent 可能已经消耗了 token，甚至已经执行了工具

另一种模式是：

1. `run_in_parallel=False`
2. guardrail 先跑完，agent 再开始
3. 如果 tripwire 触发，agent 根本不会执行
4. 因此可以避免 token 消耗和工具执行

这意味着 parallel 和 blocking 的本质差别并不是“一个快一点，一个慢一点”，而是：

1. parallel 更像低延迟优先
2. blocking 更像副作用隔离优先

这里有一个需要明确标注的推论：从官方执行语义可以推导出，blocking 更接近面试语境里常说的“pre-execution fail-closed”，而 parallel 虽然最终也会因为 tripwire 停止执行，但它并不保证在副作用发生前就停止。

这个推论不是文档原句，但它是对官方执行模式的直接工程化解读。

# Output Guardrail 解决的是“生成后是否允许放行”，不是“防止执行开始”

很多人把 output guardrail 理解成“模型再过一道安检”，这仍然太浅。

文档明确说明：

1. output guardrail 只在真正产出 final output 的 agent 上运行
2. 它总是在 agent 完成后执行
3. 它不支持 `run_in_parallel`
4. 若 tripwire 触发，抛出 `OutputGuardrailTripwireTriggered`

这说明 output guardrail 的控制点是 post-generation veto，而不是 pre-execution prevention。

所以如果一个系统已经让模型完成了复杂推理，甚至做完了若干内部动作，output guardrail 能做的是阻止最终结果被继续交付，而不是把前面的消耗和内部动作都“假装没发生”。

面试里如果有人把 input guardrail 和 output guardrail 说成“前后各加一道安全检查”，只能算及格；更强的说法应该是：

1. input guardrail 决定 run 是否应该开始
2. output guardrail 决定结果是否允许放行
3. 二者都不是逐工具的覆盖边界

# Tool Guardrail 才是逐次工具调用的真实拦截边界

官方文档对 tool guardrail 的描述非常关键：

1. 它作用于每一次 custom function-tool 调用
2. input tool guardrail 在工具执行前运行
3. output tool guardrail 在工具执行后运行
4. 前者可以跳过调用、替换输出或 raise tripwire
5. 后者可以替换输出或 raise tripwire

这说明如果面试官问：

“多 agent 场景里，如何保证每次工具调用都被检查？”

标准强答不应该是“给 agent 配 input/output guardrail”，而应该是：

如果你要覆盖每次自定义函数工具调用，真正的控制边界是 tool guardrail，因为它绑定的是 function-tool invocation，而不是 agent run 的入口和出口。

# 覆盖边界必须说清：Tool Guardrail 并不覆盖所有工具

这又是非常高频的误答点。

OpenAI Agents SDK 文档明确说明，tool guardrail 只适用于 `function_tool` 体系的自定义函数工具，它不覆盖：

1. handoff
2. hosted tools
3. built-in execution tools
4. `Agent.as_tool()` 本身

这意味着如果系统里用了：

1. `WebSearchTool`
2. `FileSearchTool`
3. `CodeInterpreterTool`
4. `HostedMCPTool`
5. `ComputerTool`
6. `ShellTool`
7. `ApplyPatchTool`

你不能想当然地认为“既然已经上了 tool guardrail，所以所有工具都被统一检查了”。

真正成熟的回答应该是：

1. 先区分工具类别
2. 再区分哪些走 function-tool pipeline
3. 最后再决定 guardrail、approval、sandbox、人工审查分别绑定在哪一层

# 面试里怎么把 Fail-Open / Fail-Closed 讲到原理层

如果一定要把这题讲到原理层，一个比较完整的结构是：

1. 先说明 tripwire 只是信号，不是全部语义
2. 再说明不同 guardrail 类型绑定在 run 的不同边界
3. 然后强调 input guardrail 有 parallel 和 blocking 两种执行模式
4. 再指出 blocking 可以在 agent 执行前拦下，而 parallel 可能已经发生 token 消耗和工具执行
5. 最后补上 tool guardrail 才是 custom function-tool 的逐调用边界，但并不覆盖 hosted tools 和 built-in execution tools

这样一来，你回答的就不再是“安全检查”，而是：

一个关于执行时序、异常抛出点、副作用暴露面和覆盖边界的控制模型。

# 标准面试答案

Guardrail tripwire 的核心，不是“风险命中后抛异常”这么简单，而是它定义了系统在什么阶段停下、停下时还能保证什么。OpenAI Agents SDK 明确说明，input guardrail 只对链路里的第一个 agent 生效，收到的是与 agent 相同的输入，若 guardrail 结果里的 `.tripwire_triggered` 为真，就抛出 `InputGuardrailTripwireTriggered`；而且它有两种执行模式，默认是 `run_in_parallel=True` 的并行模式，这样延迟更低，但如果 guardrail 最后失败，agent 可能已经消耗 token，甚至已经执行过工具。相对地，`run_in_parallel=False` 的 blocking 模式会先完成 guardrail，再启动 agent，因此一旦 tripwire 触发，就能避免 token 消耗和工具副作用。output guardrail 则不同，它只在最终产出 final output 的 agent 上运行，而且总是在 agent 完成后执行，不支持并行，所以它更像结果放行前的最终 veto，而不是执行前拦截。至于如果要逐次检查每次工具调用，真正的边界是 tool guardrail：它对每次 custom function-tool invocation 生效，输入 guardrail 在工具执行前，输出 guardrail 在工具执行后，可以跳过调用、替换输出或 raise tripwire。但官方也明确写了，tool guardrail 只覆盖 `function_tool`，并不覆盖 handoff、hosted tools、built-in execution tools 或 `Agent.as_tool()` 本身。所以成熟回答必须把 tripwire、执行模式、工具副作用和覆盖边界一起讲出来，而不是笼统说一句“guardrail 可以拦截风险请求”。

# 常见误答

1. 把 tripwire 理解成普通告警，而不是执行终止语义
2. 认为 parallel 和 blocking 只是延迟差异
3. 误以为 output guardrail 能阻止前面已经发生的工具副作用
4. 以为 tool guardrail 覆盖所有工具类型
5. 不区分 agent-level guardrail 和 per-tool guardrail 的边界

# 相关样例

1. `examples/python/ai-agent/guardrail_execution_boundary_outline.py`
