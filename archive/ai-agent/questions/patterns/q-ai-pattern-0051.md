---
id: q-ai-pattern-0051
title: 为什么 Guardrail Tripwire 的本质是执行边界与副作用边界设计
domain: ai-agent
component: agent-patterns
topic: guardrail-tripwires-blocking-parallel-fail-closed-boundaries
question_type: principle
difficulty: advanced
status: reviewed
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
related_docs:
  - ai-agent/patterns/guardrail-tripwires-blocking-parallel-and-fail-closed-boundaries
estimated_minutes: 12
---

# 题目

为什么 Guardrail Tripwire 的本质是执行边界与副作用边界设计？

# 一句话结论

因为 tripwire 真正决定的不是“报不报警”，而是系统在哪一层停止、停止时是否已经耗费 token、以及是否已经发生工具副作用。

# 核心机制

1. input guardrail 有 parallel 与 blocking 两种执行模式
2. output guardrail 是结果放行边界，不是执行前边界
3. tool guardrail 才是 custom function-tool 的逐次调用边界

# 标准答案

Guardrail tripwire 的本质是执行边界与副作用边界设计，因为 OpenAI Agents SDK 里不同 guardrail 类型绑定在不同运行阶段。input guardrail 只对链路中的第一个 agent 生效，收到与 agent 相同的输入，并在 `.tripwire_triggered` 为真时抛出 `InputGuardrailTripwireTriggered`。更关键的是，它有两种执行模式：默认的 parallel 模式会与 agent 同时开始，所以即使最后 tripwire 触发，agent 也可能已经消耗 token，甚至执行过工具；而 blocking 模式会先完成 guardrail，再启动 agent，因此一旦命中 tripwire，就能避免 token 消耗和工具副作用。output guardrail 则只对最终输出 agent 生效，而且总是在 agent 完成后才运行，不支持并行，所以它更像结果放行前的 veto。至于如果要覆盖每次自定义工具调用，真正的边界是 tool guardrail，它对每个 `function_tool` 调用在前后都可以做检查、跳过、替换或 raise tripwire，但官方也明确写了它不覆盖 hosted tools、built-in execution tools、handoff 或 `Agent.as_tool()` 本身。所以 tripwire 这道题的重点不在“会不会拦”，而在“何时拦、拦住后还剩什么副作用”。

# 必答点

1. 说明 parallel 模式可能已经发生 token 消耗和工具执行
2. 说明 blocking 模式能在 agent 启动前终止执行
3. 说明 output guardrail 是 post-generation veto
4. 说明 tool guardrail 只覆盖 custom function tools

# 常见误答

1. 把 tripwire 只说成安全告警
2. 认为 parallel 和 blocking 只是速度差异
3. 误以为 output guardrail 可以消除之前已发生的副作用
4. 认为 tool guardrail 能覆盖所有工具类型
