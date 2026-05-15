---
kb_id: ai-agent/patterns/concurrent-runs-double-texting-and-thread-consistency
title: "Concurrent Runs / Double Texting / Thread Consistency：同一线程不是谁先发消息谁赢，而是必须先定义并发策略"
domain: ai-agent
component: agent-patterns
topic: concurrent-runs-double-texting-thread-consistency
difficulty: advanced
status: reviewed
sidebar_position: 29
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
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
tags:
  - ai-agent
  - concurrency
  - double-texting
  - threads
  - consistency
---

# 一句话结论

对话型 agent 的一致性边界通常不是单条消息，而是 thread。只要同一 thread 上可能出现并发 run，就必须先定义 admission policy 和 state policy，否则系统就会在“两个都像合法请求”的情况下出现状态撕裂。

# 为什么这题很容易答浅

很多人一讲聊天 agent 并发，就会说：

1. 用户又发了一条消息
2. 那就把新的消息再处理一下

这句话听起来合理，但一旦系统正在执行长链路任务，就立刻会出现问题：

1. 前一个 run 还没结束
2. 新消息已经来了
3. 两个 run 都想读写同一份 thread state
4. 工具调用可能已经执行到一半

这时问题已经不是“再处理一条消息”，而是：

1. 同一个 thread 是否允许并发写入
2. 新消息是排队、拒绝、打断，还是覆盖之前的执行
3. 已经执行一半的工具调用怎么处理
4. 被中断节点恢复时是不是会重放前面的动作

所以这题真正考的是 thread consistency，而不是聊天体验小技巧。

# Thread 是一致性边界，不只是会话容器

LangGraph Platform 的 use-threads 文档明确把 thread 定义成持久化的 conversation container，它的状态会在多次 run 之间被更新，并且线程有明确状态，比如：

1. `idle`
2. `busy`
3. `interrupted`
4. `error`

这条事实特别值钱，因为它说明 thread 不只是“聊天记录盒子”，而是：

1. 状态归属单位
2. 并发控制单位
3. 恢复与运维观察单位

所以当面试官问“为什么同一会话里不能随便并发跑多个 agent turn”，真正的答案不是“容易乱”，而是“同一 thread 的状态需要一致性语义”。

# Double Texting 为什么会变成系统问题

所谓 double texting，不只是用户连续发两条消息这么简单。它背后其实是在问：

1. 当前 thread 已经有 run 在进行时
2. 新输入再次进入
3. 系统准备怎么处理 overlapping runs

如果没有显式策略，常见后果是：

1. 两个 run 互相覆盖状态
2. 一个 run 依据旧上下文继续做出已经过时的决策
3. 工具侧已经产生副作用，但对话侧又用新消息改了任务目标
4. 最终 UI 呈现出的结果和底层状态不一致

所以 double texting 的本质，是 per-thread concurrency policy 问题。

# 为什么默认策略通常是 enqueue

LangGraph Platform 的 double-texting guide 说明，Agent Server 默认 multitask strategy 是 enqueue，也就是：

1. 新 run 不会和当前 run 同时写 thread
2. 它会排队等前一个 run 结束后再执行

这条默认值背后的逻辑很重要：

1. 它优先保证 thread 内串行一致性
2. 用排队换确定性
3. 避免两个 run 同时推进同一份状态

也就是说，enqueue 是最保守、最稳定的 thread serialization 策略。

# Reject 策略解决的是 admission control，不是恢复问题

有些系统不想排队，因为它们宁愿明确告诉用户“当前忙，请稍后再试”，也不愿让任务堆积。

LangGraph 也明确提供 reject 策略，而 reject-concurrent guide 直接返回 `409 Conflict`。

这说明 reject 的核心不是“技术上做不到”，而是：

1. 系统显式不接受 thread 上的重叠执行
2. 把并发冲突暴露成明确协议结果
3. 让上层产品自己决定重试、提示或合并输入

所以 reject 是 admission control policy，而不是异常兜底。

# Interrupt 和 Rollback 为什么不能混着讲

这是最容易答错的一层。

很多人会把“新消息打断旧消息”想成一个统一动作，但 LangGraph 文档明确把 interrupt 和 rollback 分成两种完全不同的语义：

1. interrupt：保留前一个 run 到中断点之前的进度，把 run 状态记为 `interrupted`，再插入新的输入
2. rollback：把之前的进度全部回滚，包括初始输入，也就是把新消息当成一场从初始状态重新开始的 run

这两者区别非常大：

1. interrupt 保留部分历史进展
2. rollback 直接否认先前进展仍然有效
3. interrupt 适合“前面的部分工作还有价值”
4. rollback 适合“前面的目标已经整体失效”

如果面试里能把这句讲清楚，说明你对并发 run 语义是真懂的。

# Interrupt 为什么还牵扯到 tool side effects

interrupt 并不天然安全。LangGraph 的 interrupt-concurrent 文档明确提醒，partial tool calls 可能需要被处理或移除。

这句话特别关键，因为它说明：

1. 中断发生时，系统可能已经执行了一部分动作
2. 这些动作未必与新输入兼容
3. 如果你没有处理 partial side effects，就可能留下半完成状态

换句话说，interrupt 不是“把线程暂停一下”这么简单，而是需要考虑 side-effect boundary。

# 为什么 `interrupt()` 的节点语义会影响并发策略设计

如果继续往下挖到原理层，还要补上一句经常被忽略的话：

LangGraph interrupts 文档说明，恢复时是通过 `Command(resume=...)` 把值送回 `interrupt()`，而包含 `interrupt()` 的节点在恢复时会从节点起点重新执行；因此，`interrupt()` 之前的操作必须是 idempotent 的。

这条边界特别值钱，因为它把“中断恢复”从 UI 体验问题，落到了代码语义问题：

1. 如果节点恢复会重跑
2. 那么中断前的写库、发信、扣费、提交工单等操作就不能随便放
3. 否则一次并发消息打断，可能把前置动作执行两遍

所以 thread consistency 最终一定会落到 node-level idempotence 设计。

# 一个成熟的并发消息策略，至少要回答四个问题

如果你想把这题答到原理层，通常至少要把这四个问题讲出来：

1. consistency boundary：以 message 为单位，还是以 thread 为单位控制并发
2. admission policy：新输入来了，是 enqueue、reject、interrupt，还是 rollback
3. side-effect policy：如果旧 run 已有部分副作用，如何处理
4. resume semantics：中断恢复时节点是否重跑，哪些步骤必须幂等

这四个问题一讲出来，答案就不再是“用户又发了一条消息怎么办”，而是真正的并发控制设计。

# 标准面试答案

对话型 agent 的并发问题，本质上是 thread consistency 问题，而不是消息列表显示问题。LangGraph Platform 的 use-threads 文档把 thread 定义为持久化会话容器，状态会跨 runs 更新，并且线程本身有 `idle`、`busy`、`interrupted`、`error` 等状态，这说明 thread 是状态和并发控制的核心边界。基于这个边界，LangGraph 的 double-texting guide 给出四种典型策略：默认的 enqueue 会把同一 thread 上的新 run 排队，优先保证串行一致性；reject 会直接拒绝重叠执行，reject-concurrent guide 返回 `409 Conflict`；interrupt 会保留先前 run 到中断点的进度，把状态记为 `interrupted`，并插入新输入，但文档同时警告 partial tool calls 需要额外处理；rollback 则回退所有先前进展，把新输入视为从初始状态重新开始。再往下，LangGraph interrupts 文档说明恢复通过 `Command(resume=...)` 完成，而且包含 `interrupt()` 的节点恢复时会从节点起点重跑，因此中断前的操作必须是 idempotent 的。成熟系统必须先定义 thread 级并发策略、side-effect 处理和 resume 语义，才能真正避免状态撕裂。

# 常见误答

1. 把 thread 当成纯聊天记录，不当成一致性边界
2. 不区分 enqueue、reject、interrupt、rollback 的语义差异
3. 以为 interrupt 一定天然安全，不考虑 partial tool calls
4. 忽略 `interrupt()` 恢复时节点会重跑这一事实
5. 让同一 thread 上多个 run 自由并发写状态

# 相关样例

1. `examples/python/ai-agent/concurrent_runs_thread_consistency_outline.py`