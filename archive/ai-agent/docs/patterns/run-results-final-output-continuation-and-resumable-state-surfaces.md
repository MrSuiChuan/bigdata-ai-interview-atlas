---
kb_id: ai-agent/patterns/run-results-final-output-continuation-and-resumable-state-surfaces
title: "Run Results / Final Output / Continuation / Resumable State Surfaces：一次 run 结束后，真正重要的不只是最后一句话"
domain: ai-agent
component: agent-patterns
topic: run-results-final-output-continuation-resumable-state-surfaces
difficulty: advanced
status: reviewed
sidebar_position: 43
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
tags:
  - ai-agent
  - results
  - continuation
  - run-state
  - interruptions
---

# 一句话结论

成熟的 agent 系统不会把一次 run 的结果简化成 `final_output`。真正可运营的结果面至少包括最终答案、增量元数据、原始模型响应、下一轮延续输入、当前或最后执行 agent，以及可恢复运行态。

# 为什么这题很容易答浅

很多人一讲 run result，就会说：

1. 看最终输出是什么
2. 输出对了就结束
3. 下次再把用户问题接着发给 agent

这类回答的问题是，它把 agent run 当成了单轮文本生成，而不是一个包含 handoff、tools、审批、流式事件和可恢复状态的工作流。

在 agent 系统里，“结果”至少可能有六种不同用途：

1. 给用户展示最终答案
2. 给 UI 展示执行过程
3. 给下一轮对话做 continuation
4. 给审批恢复做 resumable snapshot
5. 给观测系统做 raw payload 分析
6. 给 handoff 体系决定下一轮该由谁继续

所以这题真正考的是：你有没有把 result surface 当成一个多层对象，而不是一句 `print(final_output)`。

# 为什么 `final_output` 不是唯一真相

OpenAI Agents SDK 的结果对象明确区分 `RunResult` 和 `RunResultStreaming`。两者都共享一些关键表面：

1. `final_output`
2. `new_items`
3. `last_agent`
4. `raw_responses`
5. `to_state()`

而流式结果还额外提供：

1. `stream_events()`
2. `current_agent`
3. `is_complete`
4. `cancel(...)`

这说明 SDK 自己就不认为“结果 = 最后一段文本”。如果只看 `final_output`，你会丢掉：

1. 中间工具调用和 handoff 元数据
2. 原始模型响应
3. 中断与审批信息
4. 下一轮接续所需的状态对象

# 为什么 `final_output` 的类型本身就是工作流问题

官方文档明确说，`final_output` 可能有三种情况：

1. 没配置 `output_type` 时是字符串
2. 配置 typed output 时是最后那个 agent 的结构化对象
3. 如果 run 提前停止，例如卡在审批中断，可能是 `None`

而且它被标成 `Any`，因为 handoff 之后最后完成任务的 agent 可能不是起始 agent。

这件事非常适合面试深挖，因为它说明：

1. result type 不只由“任务定义”决定
2. 还由“最后是哪一个 agent 完成收尾”决定
3. 多 agent handoff 会改变最终输出契约

所以强一点的回答不是“final_output 可能是字符串或对象”，而是：

final_output 的类型是工作流末端 agent 合同的结果，而不是启动 agent 的固定属性。

# 为什么 continuation 最怕双重状态管理

`to_input_list()` 提供 continuation 输入的转换，但文档明确区分了不同模式：

1. `preserve_all`：尽量保留完整转换历史
2. `normalized`：在 handoff 过滤、嵌套历史重写后给出更规范的本地 continuation 输入

同时官方也提醒：如果你已经在用 OpenAI server-managed state，比如 `conversation_id` 或 `previous_response_id`，通常就只传新的用户输入，而不是把 `to_input_list()` 整份再回发一次。

这背后的原理非常重要：

1. 本地 continuation 和服务端 continuation 是两套状态管理面
2. 两套都当权威时，最容易出现重复历史和错误重放

所以 continuation 不是“能不能拼回历史”的问题，而是“当前到底谁在维护对话真相”的问题。

# 为什么 `new_items` 和 `raw_responses` 不能互相替代

OpenAI Agents SDK 文档对这两层表面区分得很清楚：

1. `new_items` 是 SDK 层最丰富的运行视图，包含 agent、tool、handoff、approval 等元数据
2. `raw_responses` 是原始模型响应负载

这意味着它们解决的不是同一个问题：

1. 你想看 agent workflow 级事件，用 `new_items`
2. 你想看模型端到底返回了什么，用 `raw_responses`

如果一个团队只存 `last_response_id`，却不保留 `raw_responses`，很多多步 run 的真实模型行为就已经丢了；如果只存 `raw_responses`，又没有 SDK 层元数据，workflow 语义也会变得难解释。

# 为什么 `last_agent` 和 `current_agent` 直接影响下一轮路由

官方文档特别提到：

1. `last_agent` 往往是下一轮用户输入最适合继续交给的 agent
2. 在流式模式下，`current_agent` 会随着 run 进展而变化

这说明在 multi-agent workflow 里，“谁完成了上一轮”不是一个可有可无的字段，而是下一轮 continuation routing 的重要信号。

如果你忽略了它，常见后果就是：

1. 每一轮都错误地从顶层 agent 重新开始
2. handoff 后的专业 agent 无法延续上下文角色
3. UI 不能正确显示当前到底是谁在工作

# 为什么 interruption 和 resumable state 才是真正的恢复边界

审批类中断并不是外围机制。结果对象会把 pending approvals 暴露在 `interruptions` 中，而且这些中断可能来自：

1. 直接工具
2. handoff 之后到达的工具
3. 嵌套的 `Agent.as_tool()` 执行

同时，`to_state()` 可以导出可恢复的 `RunState`。对于流式 run，官方还提醒应该先把 `stream_events()` 消费完，再去检查 interruptions 和恢复。

这说明真正的恢复边界不是“模型最后说了什么”，而是：

1. 当前 run 停在了哪里
2. 待处理 interruption 是什么
3. 可恢复状态快照是不是已经完整

# 一个成熟的结果面设计至少要拆成五层

如果要把这题答到原理层，至少要把这五层表面说出来：

1. answer surface：用户最终看到什么
2. workflow surface：这轮发生了哪些 agent/tool/handoff 事件
3. model surface：原始模型响应是什么
4. continuation surface：下一轮输入应该怎么构造
5. recovery surface：如果被中断，如何从同一个 run 继续

少一层都可能让系统在产品化时掉链子。

# 标准面试答案

Agent run 的结果不能只看 `final_output`，因为一次 run 结束后至少有不同层级的结果表面要服务不同目的。OpenAI Agents SDK 中，`Runner.run()` 返回 `RunResult`，`Runner.run_streamed()` 返回 `RunResultStreaming`；两者都提供 `final_output`、`new_items`、`last_agent`、`raw_responses` 和 `to_state()`，而流式结果还额外提供 `stream_events()`、`current_agent`、`is_complete` 和 `cancel(...)`，这本身就说明“结果”并不等于最后一句话。进一步，`final_output` 既可能是字符串，也可能是最后执行 agent 的 typed output 对象，还可能在审批中断等提前停止场景下为 `None`，并且它被标成 `Any`，因为 handoff 会改变最终完成任务的 agent，所以最终输出类型本质上是末端 agent 合同的结果。continuation 层面，`to_input_list()` 提供不同模式的本地延续输入，但如果系统已经在用 `conversation_id` 或 `previous_response_id` 这类服务端状态管理，通常就只应发送新的用户输入，而不是再把完整历史重新回放一次，否则很容易双重管理状态。观测层面，`new_items` 是 SDK 级的丰富运行视图，`raw_responses` 则保留原始模型响应，两者不能互相替代；路由层面，`last_agent` 往往是下一轮最适合继续接管的 agent，而流式模式下 `current_agent` 可以用于实时观察 handoff。最后，审批中断等 pending approvals 会出现在 `interruptions` 中，`to_state()` 则负责导出可恢复的 `RunState`，而 streamed runs 需要在消费完事件流后再安全恢复。因此，成熟系统必须同时设计 answer surface、workflow surface、model surface、continuation surface 和 recovery surface，而不是把 run result 理解成一个字符串字段。

# 常见误答

1. 认为 run result 只要取 `final_output` 就够了
2. 把 `final_output` 的类型当成固定不变，忽略 handoff 影响
3. 一边用服务端 continuation，一边又把完整 `to_input_list()` 手工重放
4. 只记录 `last_response_id`，不保留足够的运行表面
5. 不把 `interruptions` 和 `to_state()` 视为恢复边界的一部分

# 相关样例

1. `examples/python/ai-agent/run_result_surfaces_outline.py`
