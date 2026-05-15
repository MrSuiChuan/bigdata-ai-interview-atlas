---
id: q-ai-pattern-0033
title: 为什么 Tool Failure 不能简单理解成重试问题，而必须先定义 Failure Semantics 和 Idempotency
domain: ai-agent
component: agent-patterns
topic: tool-failure-semantics-idempotency-side-effect-recovery
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - langgraph-durable-execution-docs
  - langgraph-interrupts-docs
  - langgraph-functional-api-overview-docs
  - openai-computer-use-guide
claim_ids:
  - pattern-claim-0147
  - pattern-claim-0148
  - pattern-claim-0149
  - pattern-claim-0150
  - pattern-claim-0151
related_docs:
  - ai-agent/patterns/tool-failure-semantics-idempotency-and-side-effect-recovery
estimated_minutes: 10
---

# 题目

为什么 Tool Failure 不能简单理解成重试问题，而必须先定义 Failure Semantics 和 Idempotency？

# 一句话结论

因为系统没拿到成功响应，不代表外部副作用没发生；只要真实世界可能已经被改变，恢复策略就不能再靠“再试一次”解决。

# 核心机制

1. external side effects may already have happened before local recovery logic knows it
2. replay safety depends on idempotent side-effect boundaries
3. approval-before-action is often safer than compensating after failure

# 标准答案

Tool failure 不能只看本地异常，因为 agent 连接的是外部世界，真正的问题是副作用可能已经发生。LangGraph durable execution 的关键就在于把非确定性和有副作用的操作包进 tasks 或 nodes，让恢复时优先读取已记录结果，而不是默认重放；如果一个节点里包含多个 side effects，文档还建议把它们拆成多个独立 task，因为粗粒度步骤在部分失败后很难安全恢复。LangGraph interrupts 又进一步说明，恢复时节点会从头执行，因此 `interrupt()` 之前的 side effects 必须幂等，或者放到 interrupt 之后再执行。Functional API overview 也明确建议把 API calls 放进 idempotent task 中，以便恢复时重用已完成结果。对于购买、认证、 destructive 或难回滚动作，OpenAI computer use guide 的启发是：比起事后补偿，更安全的模式往往是 approval-before-action。真正成熟的 tool recovery 设计，必须先定义 failure semantics、side-effect boundary 和 idempotency，再谈 retry 策略。

# 必答点

1. 先区分本地失败和外部副作用是否已发生
2. 说明多个 side effects 不应塞进一个大步骤
3. 说明 `interrupt()` 恢复时节点会重跑
4. 说明高风险动作更适合审批前置

# 常见误答

1. 没拿到成功响应就默认重试
2. 不给外部动作设计幂等键或存在性检查
3. 把 durable execution 理解成自动撤销副作用
4. 在审批点之前就执行真实写操作