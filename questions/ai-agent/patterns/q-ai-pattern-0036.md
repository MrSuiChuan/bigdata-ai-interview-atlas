---
id: q-ai-pattern-0036
title: 为什么 Approval Workflow、HITL、RunState 和 Human Override Semantics 必须一起设计
domain: ai-agent
component: agent-patterns
topic: approval-workflows-hitl-runstate-human-override
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/approval-workflows-escalation-policies-and-human-override-semantics
estimated_minutes: 12
---

# 题目

为什么 Approval Workflow、HITL、RunState 和 Human Override Semantics 必须一起设计？

# 一句话结论

因为人工介入真正控制的不是一个“确认按钮”，而是高风险动作何时暂停、由谁接管、允许改什么、状态如何持久化，以及恢复后从哪继续执行。

# 核心机制

1. approval is a pause-resume protocol, not a UI acknowledgement
2. escalation defines when execution authority is raised to humans
3. run-wide interruptions and `RunState` define the durable recovery surface
4. override semantics define whether humans can reject, edit arguments, or edit state

# 标准答案

Approval workflow、HITL、RunState 和 human override 必须一起设计，因为它们分别回答同一条控制链上的不同问题。Approval workflow 解决“系统在哪里停住以及如何恢复”，OpenAI Agents SDK 的 human-in-the-loop 文档说明敏感工具调用可以暂停，待审批项会以 interruption 形式暴露，并依赖 `RunState` 恢复，这说明审批是 run 生命周期的一部分，而不是界面层提示。Escalation policy 解决“什么情况下把执行权上收给人”，因为 `needs_approval` 可以全局启用，也可以按调用动态判定，并适用于 function tools、`Agent.as_tool()`、shell / apply-patch 以及 MCP tools，所以团队必须定义清楚风险边界。RunState 则解决“暂停状态怎么持久化、怎么 approve / reject、怎么带着 sticky decisions 恢复”，而且官方明确说明 interruption surface 是 run-wide 的，哪怕审批发生在 handoff 或嵌套 agent 内，也会浮到外层 run。Human override semantics 最后回答“人介入后到底改什么”，LangGraph 的 `Command(resume=...)` 会成为 `interrupt()` 的返回值，因此人工不只是 approve / reject，还可以修改参数、状态乃至后续路由。AutoGen 还说明人类反馈可以作为会话控制边界保存状态并恢复。所以如果这四者分开设计，最后通常会出现“能停但不知道为什么停”“能审批但绕不过深层工具”“改了参数却没真正改变执行”的问题。

# 必答点

1. 说明 approval 本质是 pause-resume 语义
2. 说明 escalation 本质是执行权上收规则
3. 说明 interruption 是 run-wide，恢复依赖 `RunState`
4. 说明 override 不只是 approve / reject，还可能改参数或状态
5. 说明多 agent 场景下审批必须覆盖 handoff 和嵌套执行

# 常见误答

1. 把人工审批理解成单纯的 UI 弹窗
2. 只设计触发审批的规则，不设计恢复语义
3. 认为审批只和当前 agent 有关，不会冒到外层 run
4. 忽略工具内部也可能需要定义 interrupt 和 override
