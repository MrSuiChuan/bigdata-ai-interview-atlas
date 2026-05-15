---
id: q-ai-pattern-0032
title: 为什么长对话系统必须区分 Transcript Continuation、Compaction、Result Surfaces 和 Stateful Resume
domain: ai-agent
component: agent-patterns
topic: transcript-compaction-results-stateful-resume
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/transcript-compaction-results-and-stateful-resume
estimated_minutes: 12
---

# 题目

为什么长对话系统必须区分 Transcript Continuation、Compaction、Result Surfaces 和 Stateful Resume？

# 一句话结论

因为它们分别解决的是文本历史延续、长上下文压缩、运行结果分层暴露和执行状态恢复四件不同的事；把这些都混在一起，系统就会既控不住成本，也控不住恢复语义。

# 核心机制

1. transcript continuation and execution continuation solve different problems
2. compaction preserves state differently from plain summarization
3. result surfaces and recovery surfaces are different contracts
4. continuation ownership determines whether trimming is safe

# 标准答案

长对话系统里最容易被混淆的是四件事：对话历史如何续、长上下文如何压、一次 run 结束后有哪些结果表面可以继续消费，以及暂停后的运行如何恢复。OpenAI 的 conversation-state guide 提供 durable conversations 和 `previous_response_id` 两种服务端续链方式，其中 `previous_response_id` 让客户端只传新 turn，但之前链路里的输入 token 仍然会计费，这说明它减轻的是客户端管理成本，而不是自动消除上下文代价。另一边，OpenAI Agents SDK 的 sessions 会在每次 run 前自动注入已存历史、run 后自动写回新 items，因此系统必须先选定主要 transcript ownership。再往下，OpenAI 的 compaction guide 说明 compaction 会生成一个 opaque encrypted compaction item，保留关键 prior state 和 reasoning；如果你自己维护 input-array chaining，可以删除最近 compaction item 之前的更早内容，但如果用的是 `previous_response_id` 链式续接，就不应该手动 prune。结果层面，Agents SDK results 又把 `final_output`、`new_items`、`raw_responses`、`last_agent` 和 `to_state()` 分别对应到答案消费、工作流观测、模型复盘和执行恢复。真正成熟的系统，会先区分 transcript continuation 和 execution continuation，再分清 result surfaces 与 recovery surfaces，最后才设计 compaction 与 trimming，而不是笼统说“做个摘要继续聊”。

# 必答点

1. 区分 transcript continuation 和 execution continuation
2. 说明 compaction item 不是普通摘要
3. 说明 `final_output` 不等于完整 run result
4. 说明 `to_input_list()` 和 `to_state()` 不是同一种 continuation
5. 说明 trimming 是否安全取决于 continuation ownership

# 常见误答

1. 把上下文压缩和执行恢复当成同一件事
2. 以为 `previous_response_id` 自动省掉所有历史成本
3. 只看 `final_output`，忽略其他结果表面
4. 把 transcript 重放和 stateful resume 混成一个输入流程
5. 不看续链归属就随意删前文
