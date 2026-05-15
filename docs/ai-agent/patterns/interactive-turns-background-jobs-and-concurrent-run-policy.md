---
kb_id: ai-agent/patterns/interactive-turns-background-jobs-and-concurrent-run-policy
title: Interactive Turns / Background Jobs / Concurrent Run Policy：长任务系统最怕的不是慢，而是状态到底归谁管、并发到底怎么裁决
domain: ai-agent
component: agent-patterns
topic: interactive-turns-background-jobs-concurrent-run-policy
difficulty: advanced
status: reviewed
sidebar_position: 18
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-background-mode-guide
  - openai-conversation-state-guide
  - openai-compaction-guide
  - openai-agents-sdk-sessions
  - langgraph-double-texting-docs
  - langgraph-use-threads-docs
  - langgraph-interrupt-concurrent-docs
  - langgraph-reject-concurrent-docs
  - langgraph-interrupts-docs
claim_ids:
  - pattern-claim-0124
  - pattern-claim-0125
  - pattern-claim-0126
  - pattern-claim-0127
  - pattern-claim-0128
  - pattern-claim-0129
  - pattern-claim-0194
  - pattern-claim-0195
  - pattern-claim-0196
  - pattern-claim-0197
  - pattern-claim-0198
tags:
  - ai-agent
  - background-jobs
  - concurrency
  - sessions
  - threads
  - state
---
## 一句话结论

Interactive Turns / Background Jobs / Concurrent Run Policy：长任务系统最怕的不是慢，而是状态到底归谁管、并发到底怎么裁决需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲长任务，就会说：

1. 慢任务放后台
2. 有状态就加 session
3. 历史长了做 compaction

这些话都不算错，但没有进入架构层。真正的问题是：

1. background 解决的是异步执行，还是统一状态来源
2. thread / conversation / session 谁才是状态权威
3. 同一 thread 上出现重叠 run 时，是排队、拒绝、打断还是回滚
4. compaction 到底是在谁的状态面上发生

## 第一步不是选机制，而是先定义状态权威

长任务系统最关键的第一问是：

1. 哪一层保存最终真相
2. 哪几层只是协作层

常见候选层包括：

1. 服务端 conversation
2. SDK session
3. thread / workflow state
4. 客户端 compaction 后的窗口

如果没有先定主状态权威，常见后果是：

1. 同一份历史被多层重复持有
2. 多层都在做裁剪和续链
3. 恢复时分不清该信谁

## Background Jobs 解决的是异步执行，不等于统一状态来源

OpenAI background mode 文档说明：

1. `background=true` 用于异步长任务执行
2. 客户端在 `queued` 和 `in_progress` 期间轮询
3. 可显式 cancel
4. 如果同时 `stream=true`，还可以基于 `sequence_number` 做续流

但同一文档也说明：

1. background 依赖存储结果
2. 结果大约保留 10 分钟
3. 要求 `store=true`
4. 不兼容 ZDR

所以 background 首先是时延和保留策略边界，而不是统一状态真相层。

## Conversation / Session / Thread 为什么不能混着讲

这三个词在工程里很容易被乱用，但职责不同。

1. conversation 更像服务端持久续链对象
2. session 更像 SDK 维护的历史注入与写回层
3. thread 更像状态型工作流的一致性边界

OpenAI conversation-state guide 说明 durable conversations 和 `previous_response_id` 都可以做服务端续链；但 `previous_response_id` 虽然能只传新 turn，历史 token 仍按输入计费，所以它解决的是客户端管理成本，不是上下文免费。SDK sessions 则会在每次 run 前自动 prepend 历史、run 后自动写回新 items，恢复 interrupted run 时还需要同一个 session 实例或 backing store。

这说明 conversation、session、thread 不是同一层对象，不能全叠在一起当“有状态”。

## Thread 是一致性边界，不是简单消息列表

LangGraph Platform 的 use-threads 文档说明 thread 会跨 runs 持续保存和更新状态，并且线程本身有 `idle`、`busy`、`interrupted`、`error` 等状态。这意味着 thread 不是单纯聊天记录，而是状态归属和并发控制边界。

只要同一 thread 可能出现重叠执行，就必须先定义 concurrent run policy，否则状态和副作用都会撕裂。

## Concurrent Run Policy 为什么必须先于产品交互设计

double-texting guide 给出四种典型策略：

1. enqueue：新 run 排队，优先保证串行一致性
2. reject：明确拒绝重叠执行
3. interrupt：保留旧 run 到中断点的进度并插入新输入
4. rollback：把旧进展整体作废，新输入从初始状态重新开始

这四种策略的语义完全不同：

1. enqueue 偏一致性优先
2. reject 偏系统保护优先
3. interrupt 偏交互响应优先
4. rollback 偏状态纯净优先

所以不能靠“谁先发消息谁赢”处理并发，必须先定义 admission policy、side-effect policy 和 resume semantics。

## 为什么 interrupt 不等于天然安全

LangGraph interrupts 文档说明恢复依赖 `Command(resume=...)`，而包含 `interrupt()` 的节点在恢复时会从节点开头重跑。

这意味着：

1. interrupt 前的操作必须是幂等的
2. partial tool calls 需要额外处理
3. 如果节点里已经产生副作用，恢复时可能重复执行

所以 interrupt 是一种强交互能力，但不是“免费安全”的默认策略。

## 为什么 compaction 最怕双重裁剪

compaction 解决的是长上下文窗口管理问题，但如果你已经在用服务端 conversation、`previous_response_id` 或 session，再叠一层客户端手工删历史，就很容易出现双重裁剪。

成熟系统必须先回答：

1. 谁拥有 continuation ownership
2. compaction 是在哪一层发生
3. 哪一层负责把压缩后的结果视为规范输入窗口

如果这三点不清楚，就会出现：

1. 你以为自己在省 token，实际却删掉了恢复必需信息
2. 你以为后台任务能续跑，实际被 compaction 切断了上下文
3. 你以为 session 会注入完整历史，结果历史在其他层被剪掉了

## 一个成熟的长任务系统通常按什么顺序设计

更稳的设计顺序通常是：

1. 先定状态权威：conversation、session、thread、compacted window 只能有一个主真相
2. 再定 admission policy：同一 thread 遇到重叠 run 是 enqueue、reject、interrupt 还是 rollback
3. 再定 background policy：哪些任务下沉后台、保留多久、是否可续流
4. 再定 compaction ownership：由哪一层负责压缩、哪一层禁止二次裁剪
5. 最后才是 UI 与产品交互形态

## 机制解读

长任务 Agent 必须先定义状态权威，再决定 background、session、conversation、thread 和 compaction 的分工，因为这些机制都在处理“连续性”，但处理的是不同层次的连续性。OpenAI background mode 文档说明，background 解决的是异步长任务执行、轮询、取消和续流边界，而不是统一状态来源；conversation-state guide 又说明 durable conversations 和 `previous_response_id` 负责服务端续链，但 `previous_response_id` 并不会让历史 token 免费；Agents SDK sessions 则在 run 前自动注入历史、run 后自动写回新 items，会成为另一层状态权威。与此同时，LangGraph Platform 的 use-threads 文档说明 thread 是状态一致性边界，并且同一 thread 出现重叠执行时必须先定义 enqueue、reject、interrupt 或 rollback 这类 concurrent run policy；interrupts 文档又提醒恢复时节点会重跑，因此中断前的步骤必须幂等。再往下，compaction 解决的是长上下文裁剪边界，如果不先定义 continuation ownership，就很容易出现双重裁剪和恢复语义混乱。真正成熟的长任务系统，会先决定谁维护真相、同一 thread 是否允许重叠执行、被打断后从哪里恢复，然后再谈后台执行、session 注入和 compaction 策略，而不是把这些机制全部叠起来。

## 易混边界

1. 把 background、session、thread、compaction 都当成“上下文延续小功能”
2. 不先定义哪一层状态是最终真相
3. 允许同一 thread 上多个 run 随意并发写状态
4. 认为 interrupt 一定天然安全，忽略 partial tool calls 和幂等要求
5. 在多层续链机制上同时做裁剪，导致双重 compaction
