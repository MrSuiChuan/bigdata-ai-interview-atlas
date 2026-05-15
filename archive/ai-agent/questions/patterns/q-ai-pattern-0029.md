---
id: q-ai-pattern-0029
title: 为什么同一对话 Thread 必须先定义 Concurrent Run Policy，而不能默认谁先发消息谁赢
domain: ai-agent
component: agent-patterns
topic: concurrent-runs-double-texting-thread-consistency
question_type: operations
difficulty: advanced
status: reviewed
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
related_docs:
  - ai-agent/patterns/concurrent-runs-double-texting-and-thread-consistency
estimated_minutes: 10
---

# 题目

为什么同一对话 Thread 必须先定义 Concurrent Run Policy，而不能默认谁先发消息谁赢？

# 一句话结论

因为 thread 是状态一致性边界，不是简单消息列表；只要同一 thread 可能出现重叠执行，就必须先定义排队、拒绝、打断还是回滚，否则状态和副作用都会撕裂。

# 核心机制

1. thread is the consistency boundary for stateful conversations
2. concurrent admission needs explicit policy
3. interrupt and rollback have different state semantics

# 标准答案

对话型 agent 的并发问题，本质上是 thread consistency 问题。LangGraph Platform 的 use-threads 文档说明 thread 会跨 runs 持续保存和更新状态，并且线程本身有 `idle`、`busy`、`interrupted`、`error` 等状态，这意味着 thread 不是单纯聊天记录，而是状态归属和并发控制边界。基于这个边界，double-texting guide 给出四种典型策略：默认 enqueue 会把同一 thread 上的新 run 排队，优先保证串行一致性；reject 会明确拒绝重叠执行，reject-concurrent guide 返回 `409 Conflict`；interrupt 会保留旧 run 到中断点的进度并插入新输入，但文档同时提醒 partial tool calls 需要额外处理；rollback 则把旧进展整体作废，把新输入视为从初始状态重新开始。再往下，interrupts 文档说明恢复依赖 `Command(resume=...)`，而包含 `interrupt()` 的节点在恢复时会从节点开头重跑，所以中断前的操作必须是幂等的。成熟系统不能靠“谁先发消息谁赢”处理并发，而必须先定义 thread 级 admission policy、side-effect policy 和 resume semantics。

# 必答点

1. 先把 thread 讲成一致性边界
2. 说明 enqueue、reject、interrupt、rollback 的差别
3. 提到 interrupt 可能遇到 partial tool calls
4. 提到 `interrupt()` 恢复时节点会重跑，前置步骤要幂等

# 常见误答

1. 把 thread 当成纯消息容器
2. 不区分打断和回滚
3. 认为 interrupt 一定天然安全
4. 允许同一 thread 上多个 run 随意并发写状态