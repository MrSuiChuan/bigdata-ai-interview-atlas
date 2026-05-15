---
id: q-ai-harness-engineering-0003
title: 为什么长任务 Agent 的副作用控制要靠幂等键和 Operation Log，而不是统一自动重试
domain: ai-agent
component: harness-engineering
topic: harness-state-machine-checkpoints-idempotency
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Official long-running agent docs and 实践资料 self-harness repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - microsoft-agent-framework-checkpoints
  - openai-agents-sdk-run-state
  - practice-self-harness
claim_ids:
  - practice-p0-claim-0004
  - agent-runtime-claim-0008
related_docs:
  - ai-agent/patterns/agent-harness-state-machine-checkpoints-and-idempotency
estimated_minutes: 14
---

# 题目

为什么长任务 Agent 的副作用控制要靠幂等键和 Operation Log，而不是统一自动重试？

# 一句话结论

因为外部写操作不是普通推理错误，统一自动重试会把网络抖动、已提交未确认和真正失败混成一类，最后放大重复执行风险。

# 核心机制

1. tool_call_id 和 idempotency key 负责识别同一动作
2. operation log 记录已发起、已确认、未知结果等状态
3. replay policy 负责恢复时的继续、跳过和重放
4. retry 只适用于明确可重试错误

# 标准答案

长任务 Agent 的外部副作用必须靠幂等键和 operation log 控制，而不是统一自动重试。原因在于副作用工具的失败并不只有一种：有的是参数错误，有的是网络超时，有的是外部系统已经提交但本地尚未收到确认。如果把这些错误全都交给通用 retry，就很容易重复发消息、重复退款或重复建单。更合理的设计是：为每次副作用调用生成稳定 tool_call_id 和 idempotency key，在 operation log 中记录提交状态和外部回执，再根据 replay policy 判断恢复时该继续、跳过还是人工确认。这样系统才能在 at-least-once 执行现实下把重复风险降到可控。

# 必答点

1. 说明副作用失败类型并不单一
2. 说明 tool_call_id 和 idempotency key 的作用
3. 说明 operation log 至少要记录提交状态
4. 说明 replay policy 和 retry policy 不是一回事
5. 说明 exactly-once 不是默认前提

# 常见误答

1. 认为所有工具都可以自动重试
2. 不区分已提交未确认和真正失败
3. 没有 operation log
4. 认为幂等只靠外部系统自己处理
