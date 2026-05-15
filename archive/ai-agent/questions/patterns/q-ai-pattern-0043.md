---
id: q-ai-pattern-0043
title: 为什么 Agent Run 不能只看 final_output，还要设计多层结果表面
domain: ai-agent
component: agent-patterns
topic: run-results-final-output-continuation-resumable-state-surfaces
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-results
claim_ids:
  - pattern-claim-0205
  - pattern-claim-0206
  - pattern-claim-0207
  - pattern-claim-0208
  - pattern-claim-0209
  - pattern-claim-0210
related_docs:
  - ai-agent/patterns/run-results-final-output-continuation-and-resumable-state-surfaces
estimated_minutes: 12
---

# 题目

为什么 Agent Run 不能只看 `final_output`，还要设计多层结果表面？

# 一句话结论

因为 agent run 的输出不仅服务于“给用户看答案”，还服务于 continuation、恢复、观测、路由和流式 UI，所以结果天然是多层对象。

# 核心机制

1. answer surface 不等于 workflow surface
2. continuation surface 和 recovery surface 不能混成一个字段
3. 最终输出类型和下一轮路由都可能被 handoff 改写

# 标准答案

Agent run 不能只看 `final_output`，因为一次 run 结束后结果对象要服务多个不同目的。OpenAI Agents SDK 中，`RunResult` 和 `RunResultStreaming` 都同时暴露 `final_output`、`new_items`、`last_agent`、`raw_responses` 和 `to_state()`，而流式结果还额外提供 `stream_events()`、`current_agent`、`is_complete` 和 `cancel(...)`，这说明 SDK 自身就把结果视为多层表面。进一步，`final_output` 既可能是字符串，也可能是最后执行 agent 的 typed output 对象，还可能在审批中断等提前停止时为 `None`，并且由于 handoff，最后完成任务的 agent 可能不是起始 agent，因此最终输出类型本身就是工作流问题。continuation 层面，`to_input_list()` 支持不同模式的本地延续输入，但如果系统已经在用 `conversation_id` 或 `previous_response_id` 这类服务端状态管理，通常就不应再整份重放历史，否则会造成双重状态管理。观测层面，`new_items` 是 SDK 级运行语义的 richest surface，`raw_responses` 保留模型原始返回，两者不能互相替代；路由层面，`last_agent` 常常是下一轮最适合继续接手的 agent，而流式中的 `current_agent` 则支持实时 handoff 观察。最后，`interruptions` 和 `to_state()` 决定 run 是否能被安全恢复，因此恢复边界也属于结果设计的一部分。

# 必答点

1. 说明结果至少分 answer、workflow、continuation、recovery 等层
2. 说明 `final_output` 类型会受最后执行 agent 影响
3. 说明 `new_items` 和 `raw_responses` 的用途不同
4. 说明 `interruptions` 和 `to_state()` 是恢复边界

# 常见误答

1. 只把 run result 当成最终文本
2. 忽略 handoff 对输出类型和下一轮路由的影响
3. 一边使用服务端状态，一边手工完整重放历史
4. 不区分工作流语义和原始模型响应
