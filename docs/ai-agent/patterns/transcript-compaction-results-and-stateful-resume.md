---
kb_id: ai-agent/patterns/transcript-compaction-results-and-stateful-resume
title: Transcript Continuation / Compaction / Result Surfaces / Stateful Resume：长对话系统真正难的不是装得下，而是删什么、留什么、怎么从正确状态继续
domain: ai-agent
component: agent-patterns
topic: transcript-compaction-results-stateful-resume
difficulty: advanced
status: reviewed
sidebar_position: 19
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-conversation-state-guide
  - openai-compaction-guide
  - openai-agents-sdk-sessions
  - openai-agents-sdk-results
claim_ids:
  - pattern-claim-0141
  - pattern-claim-0142
  - pattern-claim-0143
  - pattern-claim-0144
  - pattern-claim-0145
  - pattern-claim-0146
  - pattern-claim-0205
  - pattern-claim-0206
  - pattern-claim-0207
  - pattern-claim-0208
  - pattern-claim-0209
  - pattern-claim-0210
tags:
  - ai-agent
  - compaction
  - continuation
  - results
  - resume
  - sessions
---
## 一句话结论

Transcript Continuation / Compaction / Result Surfaces / Stateful Resume：长对话系统真正难的不是装得下，而是删什么、留什么、怎么从正确状态继续需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲长对话，就会回答：

1. 历史太长就做摘要
2. 下一轮继续把摘要塞进去
3. 需要恢复时再把最后结果拿出来

这类回答最大的问题是把 transcript continuation、compaction、result surfaces 和 stateful resume 全混成了一件事。

## Transcript Continuation 和 Execution Continuation 不是同一件事

可以先把这两件事硬拆开：

1. transcript continuation：下一轮对话该带哪些历史
2. execution continuation：被打断的 run 应该如何从同一条执行链继续

它们都在处理“连续性”，但不是同一个层次。前者偏文本与上下文窗口，后者偏运行态与恢复边界。

## `previous_response_id`、Conversation 和 Sessions 在回答什么

OpenAI conversation-state guide 提供 durable conversations 和 `previous_response_id` 两种服务端续链方式。

其中：

1. `previous_response_id` 让客户端只传新 turn
2. 但之前链路里的输入 token 仍然会计费
3. 所以它减轻的是客户端管理成本，不是自动消除上下文代价

OpenAI Agents SDK sessions 又是另一层：

1. 会在每次 run 前自动注入已存历史
2. run 后自动写回新 items
3. 恢复 interrupted run 时需要同一个 session 实例或 backing store

这解释该组件必须先选定主要续链机制，而不能同时把 transcript ownership 分给多个层。

## Compaction 不是普通摘要，而是受控状态压缩

OpenAI 的 compaction guide 说明 compaction 会生成一个 opaque encrypted compaction item，保留关键 prior state 和 reasoning。

这说明 compaction 不只是“把旧聊天概括一下”，而是：

1. 对上下文窗口做受控压缩
2. 保留足够继续推理所需的状态
3. 形成一个新的规范输入边界

如果你自己维护 input-array chaining，可以删除最近 compaction item 之前的更早内容；但如果用的是 `previous_response_id` 链式续接，就不应该手动 prune。也就是说，trimming 是否安全，完全取决于 continuation ownership。

## `to_input_list()`、`final_output`、`new_items`、`to_state()` 为什么不能混成一个“结果”

OpenAI Agents SDK results 把 run 结果拆成多层表面：

1. `final_output`
2. `new_items`
3. `last_agent`
4. `raw_responses`
5. `to_state()`

这些 surface 的用途完全不同：

1. `final_output` 适合给业务层消费
2. `new_items` 适合观察这次 run 新增了什么 agent / tool / handoff 事件
3. `raw_responses` 适合低层调试和模型行为复盘
4. `to_state()` 适合把当前状态继续交给后续 run 或恢复流程

所以结果对象从来不是“最后一句话”。

## `final_output` 为什么不是稳定单一类型

官方文档明确说明：

1. `final_output` 可能是字符串
2. 也可能是最后执行 agent 的 typed output 对象
3. 如果 run 在最终结果前被中断，`final_output` 还可能是 `None`

这意味着 `final_output` 的类型其实受最后完成任务的 agent 合同影响，而 handoff 又会改变最后完成任务的是谁。所以“最终输出类型”本身就是工作流问题。

## 本地 Transcript 重放、服务端续链和 Stateful Resume 为什么一定要分开

Results 文档里的 `to_input_list()` 很适合做本地 transcript continuation，但如果系统已经在用 `conversation_id` 或 `previous_response_id` 这类服务端状态管理，通常就不该再整份重放历史，否则会造成双重状态管理。

另一方面，`to_state()` 对应的不是 transcript 重放，而是 execution snapshot。它回答的是：

1. 如果当前 run 被审批或其他机制中断
2. 我如何从同一条执行链继续

所以：

1. `to_input_list()` 偏 transcript continuation
2. `to_state()` 偏 stateful resume

这两者绝对不能混成一个“下一轮继续输入”。

## 流式模式下，为什么恢复边界更敏感

如果使用 streamed run，官方还提醒应该先把 `stream_events()` 消费完，再去检查 interruptions 和恢复。

这说明真正的恢复边界不是“模型最后说了什么”，而是：

1. 当前 run 停在了哪里
2. 待处理 interruption 是什么
3. 可恢复状态快照是不是已经完整

如果在事件流还没收完时就急着恢复，系统很容易拿到半完整状态。

## 一个成熟的结果与恢复设计至少要拆成五层

如果要把这个主题答到原理层，至少要把这五层表面说出来：

1. answer surface：用户最终看到什么
2. workflow surface：这轮发生了哪些 agent / tool / handoff 事件
3. model surface：原始模型响应是什么
4. continuation surface：下一轮输入应该怎么构造
5. recovery surface：如果被中断，如何从同一个 run 继续

少一层都可能让系统在产品化时掉链子。

## 机制解读

长对话系统必须区分 Transcript Continuation、Compaction、Result Surfaces 和 Stateful Resume，因为它们解决的是不同层次的连续性问题。OpenAI 的 conversation-state guide 提供 durable conversations 和 `previous_response_id` 两种服务端续链方式，其中 `previous_response_id` 让客户端只传新 turn，但历史 token 仍按输入计费，这说明它减轻的是客户端管理成本，而不是自动消除上下文代价；OpenAI Agents SDK 的 sessions 又会在每次 run 前自动注入已存历史、run 后自动写回新 items，因此系统必须先选定 transcript ownership。再往下，compaction guide 说明 compaction 会生成一个 opaque encrypted compaction item，保留关键 prior state 和 reasoning，它不是普通摘要，而是受控状态压缩；如果你用的是 `previous_response_id` 链式续接，就不应该手工 prune。结果层面，Agents SDK results 把 `final_output`、`new_items`、`raw_responses`、`last_agent` 和 `to_state()` 分别暴露出来，说明 run result 不是一个字符串字段；其中 `final_output` 可能是字符串、typed object，甚至在提前中断时是 `None`。最后，`to_input_list()` 适合本地 transcript continuation，`to_state()` 对应的则是 execution snapshot 和 stateful resume，两者不能混成一个“下一轮继续输入”。真正成熟的系统，会把 transcript continuation、上下文压缩、结果表面和恢复边界分开设计，而不是笼统说“做个摘要继续聊”。

## 易混边界

1. 把上下文压缩和执行恢复当成同一件事
2. 以为 `previous_response_id` 自动省掉所有历史成本
3. sessions 和服务端续链机制一起叠加使用
4. 只看 `final_output`，忽略 `new_items`、`raw_responses` 和 `to_state()`
5. 不看 continuation ownership 就随意删前文
