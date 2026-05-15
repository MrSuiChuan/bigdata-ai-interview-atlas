---
kb_id: ai-agent/patterns/interactive-turns-background-jobs-and-state-compaction-boundaries
title: "Interactive Turns / Background Jobs / State Compaction Boundaries：长任务系统最怕的不是慢，而是状态到底归谁管"
domain: ai-agent
component: agent-patterns
topic: interactive-turns-background-jobs-state-compaction-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 41
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-background-mode-guide
  - openai-conversation-state-guide
  - openai-compaction-guide
  - openai-agents-sdk-sessions
claim_ids:
  - pattern-claim-0194
  - pattern-claim-0195
  - pattern-claim-0196
  - pattern-claim-0197
  - pattern-claim-0198
tags:
  - ai-agent
  - background-mode
  - conversation-state
  - sessions
  - compaction
---

# 一句话结论

长任务 agent 最容易做错的，不是“要不要后台执行”，而是没有先定义好状态权威归属。`background=true`、conversation objects、session memory、compaction 都是在解决连续性，但它们解决的连续性层次不同；如果混着用，很容易出现重复存状态、错误裁剪或恢复边界不清。

# 为什么这题很容易答浅

很多人一讲长任务，就会说：

1. 慢任务放后台
2. 对话太长就做压缩
3. 需要记忆就开 session

这类回答的问题在于，它把几种完全不同的机制当成了同一种“上下文延续手段”。但实际上这几类机制分别在回答不同问题：

1. background mode 解决的是时延等级和异步执行
2. conversation state 解决的是服务端会话连续性
3. session 解决的是 SDK 侧跨 run 历史注入与保存
4. compaction 解决的是长上下文如何安全缩并

如果不先定义状态到底由哪一层当权威，系统很容易出现：

1. 既在服务端存 conversation，又在客户端重复回放完整历史
2. 既用 `previous_response_id`，又自己手工 prune 上下文，导致状态漂移
3. 把不适合存储的数据扔进 background mode，结果和 ZDR 约束直接冲突

所以这题真正考的是：你能不能把“异步执行”和“状态连续性”拆开设计。

# 为什么 background mode 不是另一个线程池开关

OpenAI background mode 文档说明得非常明确：开启 `background=true` 后，响应会异步执行，客户端在 `queued` 或 `in_progress` 时应该轮询，必要时可以调用 cancel，而且重复 cancel 是幂等的。

这说明 background mode 解决的是：

1. 一次响应不适合占用同步交互通道
2. 客户端和服务端要围绕 response status 做状态观察
3. 长任务取消不是靠断开连接，而是显式取消语义

所以 background mode 的核心不是“扔后台跑”，而是把长任务变成一个可观察、可取消、可异步取结果的 response lifecycle。

# 为什么 background streaming 仍然不是免费午餐

文档还进一步说明，background response 可以同时 `stream=true`，而且事件有 `sequence_number` 可用于断流后续接。但这里有几个很容易忽视的边界：

1. 只有创建时就开启 `stream=true` 才能走这条路
2. background mode 依赖存储返回数据以支持后续轮询或续流
3. 它大约保留 10 分钟，不兼容 ZDR，而且要求 `store=true`

这几条放在一起，直接告诉我们一个工程事实：

background mode 同时是异步机制，也是数据保留机制。

所以如果你的系统有严格零数据保留要求，就不能想当然地把所有长任务都改成 background。

# 为什么 conversation continuity 和 billing continuity 不是一回事

OpenAI conversation state 文档里非常值得讲的一点是：Conversations API 可以把对话持续成一个 durable object，跨 session、设备或 jobs 继续；但如果你选择 `previous_response_id` 链式延续，历史输入 token 仍然会作为输入计费。

这说明两个经常被混为一谈的概念其实不同：

1. continuity：系统能不能继续这段对话
2. billing footprint：继续这段对话时，历史 token 是不是还算输入

所以面试里如果被问“为什么有了 previous_response_id 仍然要关心成本”，最强的一句回答就是：

因为连续性不等于免费上下文，延续历史和历史 token 计费是两条不同语义线。

# 为什么 session 是 SDK 侧状态权威，而不是模型自动记住

OpenAI Agents SDK 的 sessions 文档说明，session 会在每次 run 前自动取回历史并 prepend 到输入里，每次 run 后自动保存新生成项；如果是 interrupted run，要恢复则必须用同一个 session 实例或同一 backing store；同时还可以通过 `RunConfig.session_input_callback` 自定义历史和本次输入的合并方式。

这说明 session 的本质不是“记忆开关”，而是：

1. 一套明确的历史读写边界
2. 一套跨 run 的状态注入策略
3. 一套恢复时必须对齐的 backing store 约束

所以 session 一旦用了，它就已经开始承担一部分 state authority，而不是一个无害的小缓存。

# 为什么 compaction 最怕“双重裁剪”

OpenAI compaction 指南区分了两种模式：

1. server-side compaction：服务端在阈值触发时自动发出加密的 opaque compaction item
2. standalone `/responses/compact`：显式做一次无状态压缩，返回的窗口就是下一次调用的规范上下文

这两种模式最重要的不是实现差别，而是谁来负责“压缩后的真相”。

如果你走 server-side compaction，并且通过 `previous_response_id` 持续会话，官方明确建议不要自己再手工 prune。因为这时服务端已经在维护 compaction 边界，你再在客户端删一次，等于双重裁剪，最容易导致：

1. 服务端以为某段历史仍存在
2. 客户端却把它删掉了
3. 最后上下文连续性和可解释性同时漂移

而 standalone compaction 则相反，它给你的返回窗口就是下一次请求的 canonical next context，这时状态权威明确回到了你手里。

# 成熟系统为什么一定要先选 state authority

把这些机制串起来，成熟系统通常会先回答一个问题：

到底谁是这条对话或任务的状态权威？

候选通常有三种：

1. 服务端 conversation / previous_response_id 链
2. SDK session backing store
3. 客户端自己维护的 compacted context

这三者不是不能组合，但不能同时都当权威。否则就会出现：

1. 同一段历史有三份真相
2. 恢复失败时不知道该相信哪一层
3. 成本、保留策略和压缩策略彼此打架

所以强工程实践通常是：

1. 先定义 latency class：前台交互还是后台长任务
2. 再定义 state authority：服务端、SDK session，还是客户端压缩窗口
3. 最后再定义 compaction 和恢复策略

# 标准面试答案

长任务 agent 的关键不只是把慢请求放后台，而是先定义异步执行边界和状态权威边界。OpenAI background mode 文档说明，`background=true` 会让响应异步执行，客户端应在 `queued` 和 `in_progress` 状态期间轮询，并可通过 cancel endpoint 取消，而且重复 cancel 是幂等的；如果创建时同时设置 `stream=true`，还可以基于 `sequence_number` 做后台流式续接。但同一份文档也明确指出 background mode 依赖存储响应数据，大约保留 10 分钟，要求 `store=true`，且不兼容 ZDR，这意味着 background 不只是时延优化手段，也引入了数据保留边界。连续性层面，Conversations API 把对话作为 durable object 跨 session、设备和 jobs 延续，而 `previous_response_id` 虽然能继续历史，但历史输入 token 仍按输入计费，所以连续性和成本语义并没有合并。SDK 侧的 sessions 又是另一层：它会在每次 run 前自动取回并 prepend 历史、在每次 run 后写入新项，恢复 interrupted run 时需要同一个 session 实例或 backing store，还可通过 `session_input_callback` 自定义历史与新输入的合并方式，说明 session 本身就是一层状态权威。最后，compaction 又区分 server-side 和 standalone 两种模式：前者在阈值达到时自动产生 opaque compaction item，配合 `previous_response_id` 使用时不应再手工 prune；后者 `/responses/compact` 返回的窗口则是下一次调用的规范上下文，适合由客户端自己掌握状态。因此，真正成熟的设计不会把 background、conversation、session、compaction 都当成“延续上下文的几个小功能”，而是先明确 latency class，再明确 state authority，最后再决定谁负责压缩和恢复。

# 常见误答

1. 认为 background mode 只是“异步跑一下”，不涉及数据保留约束
2. 以为有 `previous_response_id` 就不会再为历史 token 付费
3. 把 session 当成无状态缓存，不把它视为状态权威的一部分
4. 一边用 server-side compaction，一边自己手工 prune 上下文
5. 同时让 conversation、session 和客户端压缩窗口都当“真相来源”

# 相关样例

1. `examples/python/ai-agent/background_state_authority_outline.py`
