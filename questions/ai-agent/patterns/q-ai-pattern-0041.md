---
id: q-ai-pattern-0041
title: 为什么长任务 Agent 必须先定义状态权威与 Concurrent Run Policy，再决定 background、session 和 compaction
domain: ai-agent
component: agent-patterns
topic: interactive-turns-background-jobs-concurrent-run-policy
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/interactive-turns-background-jobs-and-concurrent-run-policy
estimated_minutes: 12
---

# 题目

为什么长任务 Agent 必须先定义状态权威与 Concurrent Run Policy，再决定 background、session 和 compaction？

# 一句话结论

因为这些机制都在处理“连续性”，但处理的是不同层次的连续性；如果不先决定谁维护真相、同一 thread 上重叠 run 怎么裁决，系统就会出现重复存储、双重裁剪、并发写乱和恢复边界混乱。

# 核心机制

1. background 解决异步执行，不等于统一状态来源
2. conversation、session、thread、compaction 分别承担不同连续性职责
3. thread 是一致性边界，重叠 run 必须有 admission policy
4. 只能有一个主状态权威，其他层做配合而不能同时当真相

# 标准答案

长任务 agent 必须先定义状态权威与 concurrent run policy，因为 `background=true`、conversation state、session、thread 和记忆压缩看起来都在延续上下文，但它们解决的其实不是同一个问题。OpenAI background mode 文档说明，background 用于异步长任务执行，客户端在 `queued` 和 `in_progress` 期间轮询，可显式 cancel，而且如果同时 `stream=true` 还可以基于 `sequence_number` 做续流；但同一文档也说明 background 依赖存储结果，大约保留 10 分钟，要求 `store=true`，不兼容 ZDR，所以它首先是时延和保留策略边界。连续性层面，conversation 或 `previous_response_id` 负责服务端续链，历史 token 仍按输入计费；SDK sessions 又是另一层权威，会在每次 run 前自动取回并 prepend 历史，在 run 后写入新项。与此同时，LangGraph 的 thread 文档说明 thread 是状态一致性边界，同一 thread 出现重叠 run 时必须先决定是 enqueue、reject、interrupt 还是 rollback；interrupts 文档又提醒恢复时节点会重跑，因此中断前的步骤必须幂等。compaction 则进一步定义了上下文缩并边界，如果没有先定义 continuation ownership，就很容易出现双重裁剪。真正成熟的设计会先确定状态真相到底在 conversation、session、thread 还是 compaction window 哪一层，再决定是否走 background、是否允许同一 thread 重叠执行、以及如何压缩与恢复，而不是把这些机制全都叠在一起。

# 必答点

1. 说明 background 是异步执行语义，不是统一记忆语义
2. 说明 `previous_response_id` 的连续性不等于免费上下文
3. 说明 session 本身会成为一层状态权威
4. 说明 thread 是一致性边界，重叠 run 必须先定义 admission policy
5. 说明 compaction 最怕“双重裁剪”

# 常见误答

1. 把 background、session、compaction 都当成“上下文延续小功能”
2. 认为 `previous_response_id` 会天然降低所有历史成本
3. 既用 server-side compaction，又自己删历史
4. 不先定义哪一层状态是最终真相
5. 允许同一 thread 上多个 run 随意并发写状态
