---
id: q-ai-pattern-0045
title: 为什么流式 Agent 必须把 token、state diff、checkpoint、approval request 分成不同事件层
domain: ai-agent
component: agent-patterns
topic: event-streaming-taxonomy-state-diffs-progress-signals
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - langgraph-streaming-docs
  - microsoft-agent-framework-workflow-events
claim_ids:
  - pattern-claim-0218
  - pattern-claim-0219
  - pattern-claim-0220
  - pattern-claim-0221
  - pattern-claim-0222
  - pattern-claim-0223
related_docs:
  - ai-agent/patterns/event-streaming-taxonomy-state-diffs-and-progress-signals
estimated_minutes: 12
---

# 题目

为什么流式 Agent 必须把 token、state diff、checkpoint、approval request 分成不同事件层？

# 一句话结论

因为这些流表达的是不同语义：有的是语言输出，有的是状态变化，有的是恢复边界，有的是人机交互请求；如果混成一条流，UI 会很实时，但系统语义会失真。

# 核心机制

1. 稳定事件合同先于“先流出来”
2. 快照流、增量流、token 流、恢复流、请求流的消费逻辑不同
3. 审批请求是正式事件类型，不是附属 UI 提示

# 标准答案

流式 Agent 必须把不同事件层拆开，因为它们解决的问题完全不同。LangGraph streaming 文档说明，v2 使用统一的 `StreamPart` 结构，带稳定的 `type`、`ns`、`data` 字段，而 v1 的输出格式会随着模式数量和是否启用 subgraph streaming 而变化，这说明流系统首先要有稳定事件合同。状态层面，`values` 发完整状态，`updates` 发变更键，而且同一步多个更新会分开发送，所以快照流和 diff 流服务的是不同 UI 与同步策略。语言层面，`messages` 流的是 `(message_chunk, metadata)`，可以来自 graph 的任意部分；`custom` 才适合承载业务进度，因此 token 流和 progress 流不能混用。恢复层面，`checkpoints`、`tasks`、`debug` 事件都依赖 checkpointer，说明它们和普通日志不同，直接关联到可恢复边界和任务生命周期。人机协作层面，Microsoft Agent Framework 把 workflow、executor、superstep、request 等统一建模为 `WorkflowEvent`，其中 `request_info` 常常承载审批负载，说明 approval request 本身就是正式事件类型。成熟的 streaming 设计，必须先按语义拆分事件层，再决定 UI 怎么展示。

# 必答点

1. 说明稳定事件合同的重要性
2. 说明 `values` / `updates` / `messages` / `custom` 的语义差异
3. 说明 checkpoint/task/debug 和普通日志不同
4. 说明审批请求是协议内正式事件，不是附属提示

# 常见误答

1. 把 streaming 简化成 token 实时输出
2. 用模型文本伪装系统进度
3. 不区分快照与增量更新
4. 把 approval request 当成前端层的临时弹窗
