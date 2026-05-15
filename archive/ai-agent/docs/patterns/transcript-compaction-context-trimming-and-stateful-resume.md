---
kb_id: ai-agent/patterns/transcript-compaction-context-trimming-and-stateful-resume
title: "Transcript Compaction / Context Trimming / Stateful Resume：长对话真正难的不是装得下，而是删什么、留什么、怎么从正确状态继续"
domain: ai-agent
component: agent-patterns
topic: transcript-compaction-context-trimming-stateful-resume
difficulty: advanced
status: reviewed
sidebar_position: 32
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
tags:
  - ai-agent
  - compaction
  - context-trimming
  - resume
  - sessions
---

# 一句话结论

长对话系统最核心的问题，不是“能不能把全部历史塞进去”，而是“应该保留哪种状态、由谁管理续链、哪些历史可以被安全压缩、恢复时该从 transcript 继续还是从 execution state 继续”。

# 为什么这题很容易答浅

很多人一讲长上下文管理，就会说：

1. 超长了就截断
2. 或者做个 summary
3. 然后再继续问

这种说法太粗，因为它只把问题看成“窗口不够大”。

真正的工程问题其实是：

1. 被删掉的是原始证据，还是已经沉淀过的稳定状态
2. 续链靠完整 transcript、服务端 conversation state，还是本地 session memory
3. 被压缩的是聊天历史，还是工作流执行状态
4. 恢复时应该从文本上下文继续，还是从暂停时的运行快照继续

所以这题考的不是“怎么缩短上下文”，而是“怎么维持正确状态”。

# 先区分 transcript continuation 和 execution continuation

这是最容易被混淆的一层。

在 agent 系统里，继续一次任务通常至少有两种完全不同的意思：

1. transcript continuation：延续对话历史，让模型知道前面聊了什么
2. execution continuation：延续一个被中断、审批、暂停或失败后的运行状态

这两种 continuation 不应该混为一谈。

因为：

1. transcript continuation 关心的是上下文语义连续性
2. execution continuation 关心的是工作流状态、工具进度和恢复点

如果把这两件事混成一种“继续会话”，系统会很难设计正确的恢复逻辑。

# `previous_response_id` 和 conversations 更像服务端 transcript continuation

OpenAI 的 conversation-state guide 提供了两种很关键的服务端续链方式：

1. durable conversations
2. `previous_response_id` 链式续接

其中 `previous_response_id` 的价值在于：

1. 客户端只需要提交新的 turn
2. 服务端知道它接在哪个历史响应后面
3. 适合做服务端管理的 threaded continuation

但这里有一个非常值钱的边界：

1. 即便客户端不重新传整段历史
2. 之前链路里的输入 token 仍然会按输入 token 计费

这说明 `previous_response_id` 解决的是客户端管理负担，不是自动消除上下文成本。

# Sessions 不是 `previous_response_id` 的同义词

OpenAI Agents SDK 的 sessions 文档又提供了另一条续链路径：

1. session 会在本地或会话后端保存运行历史
2. 每次 run 前自动注入已存储的历史
3. 新 items 会在 run 后自动写回

更关键的是，文档明确说：

1. sessions 不能和 `conversation_id`
2. 不能和 `previous_response_id`
3. 也不能和 `auto_previous_response_id`

一起使用。

这条边界特别重要，因为它说明：

1. continuation mechanism 不是可以无限叠加的
2. 你必须选一种主要续链机制
3. 否则状态归属会变得不清楚

也就是说，先选 continuation owner，比“多加几层记忆”更重要。

# Compaction 为什么不是普通摘要

OpenAI 的 compaction guide 很适合拿来讲原理层，因为它强调：

1. server-side compaction 会在上下文增长时生成 compaction item
2. 这个 item 是 opaque encrypted state
3. 它的目标是保留关键 prior state 和 reasoning，同时缩小上下文规模

这和简单 summary 最大的区别在于：

1. 普通摘要更像人为写一段简写文本
2. compaction 更像系统维护的状态载体
3. 它保留的是“足以续链的关键状态”，而不只是“前面说了什么”

所以 compaction 的本质不是压缩字数，而是 state-preserving context management。

# Context Trimming 为什么不能乱删

OpenAI compaction guide 给了一个非常重要的边界：

1. 如果你采用 stateless input-array chaining
2. 那么可以删除最近 compaction item 之前的更早内容
3. 但如果你使用 `previous_response_id` 链式续接
4. 就不应该手动 prune

这条边界特别值钱，因为它说明 trimming 是否安全，取决于你把 continuation ownership 放在哪里：

1. 服务端持有续链状态时，客户端乱删会破坏语义假设
2. 客户端自己维护输入数组时，才需要自己承担裁剪责任

所以不能一看到上下文长了，就默认“删前面的”。

# Results surfaces 决定“从哪里继续”

OpenAI Agents SDK 的 results guide 又把 continuation surface 讲得更细：

1. `to_input_list()` 适合把本地 transcript 重放给下一次调用
2. `last_response_id` 适合接回服务端 `previous_response_id` 续链
3. `to_state()` 适合保存暂停或中断后的运行状态，再恢复执行

这三个 surface 很关键，因为它们分别对应三种不同的继续方式：

1. local replay
2. server-managed threaded continuation
3. resumable execution snapshot

如果面试官问“resume 怎么设计”，一个成熟回答一定会先追问：

1. 你要恢复的是对话语义，还是工作流执行点

# 一个成熟的长对话系统至少要回答五个问题

如果你想把这题答到原理层，通常至少要回答：

1. continuation owner：续链状态由服务端、session backend 还是客户端 transcript 持有
2. state type：保留的是文本历史、压缩状态，还是运行快照
3. trimming boundary：哪些历史可以安全裁掉，哪些不能动
4. cost boundary：续链后 token 账单是否真的下降
5. resume semantics：恢复的是文本上下文，还是暂停执行点

这五个问题一讲出来，回答就从“做个摘要”升级成了“对话状态管理设计”。

# 标准面试答案

长对话系统的关键不是把全部历史一直塞给模型，而是清楚地区分 transcript continuation 和 execution continuation。OpenAI 的 conversation-state guide 提供了 durable conversations 和 `previous_response_id` 两类服务端续链方式，其中 `previous_response_id` 让客户端只传新 turn，但之前链路里的输入 token 仍然会计费，说明它主要减轻的是客户端管理负担，而不是天然降低成本。另一边，OpenAI Agents SDK 的 sessions 会在每次 run 前自动注入已存历史、run 后自动写回新 items，但文档明确说 sessions 不能和 `conversation_id`、`previous_response_id` 或 `auto_previous_response_id` 混用，这意味着系统必须先选定主要续链机制。再往下，OpenAI 的 compaction guide 说明 compaction 会生成一个 opaque encrypted compaction item，用来保留关键 prior state 和 reasoning；如果你自己维护 input-array chaining，可以删除最近 compaction item 之前的更早内容，但如果用的是 `previous_response_id` 链式续接，就不应该手动 prune。最后，Agents SDK results 又把 `to_input_list()`、`last_response_id` 和 `to_state()` 分别对应到本地 transcript 重放、服务端 threaded continuation 和执行快照恢复。成熟系统真正要设计的是 continuation owner、state type、trimming boundary 和 resume semantics，而不是简单做个摘要。

# 常见误答

1. 把 transcript continuation 和 execution continuation 混为一谈
2. 以为 `previous_response_id` 自动降低所有上下文成本
3. 把 sessions 和 `previous_response_id` 同时叠加使用
4. 不区分 compaction item 和普通摘要
5. 不看 continuation ownership 就随意裁剪历史

# 相关样例

1. `examples/python/ai-agent/transcript_compaction_stateful_resume_outline.py`