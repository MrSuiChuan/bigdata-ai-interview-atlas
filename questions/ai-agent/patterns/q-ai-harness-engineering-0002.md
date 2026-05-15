---
id: q-ai-harness-engineering-0002
title: 为什么 Harness 的 Checkpoint 不能只是“定时保存变量”
domain: ai-agent
component: harness-engineering
topic: harness-state-machine-checkpoints-idempotency
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official long-running agent docs and 实践资料 self-harness repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - langgraph-persistence-docs
  - microsoft-agent-framework-checkpoints
  - practice-self-harness
claim_ids:
  - practice-p0-claim-0003
  - practice-p0-claim-0004
related_docs:
  - ai-agent/patterns/agent-harness-state-machine-checkpoints-and-idempotency
estimated_minutes: 12
---

# 题目

为什么 Harness 的 Checkpoint 不能只是“定时保存变量”？

# 一句话结论

因为长任务恢复依赖的是语义恢复点，而不是随机时间点的内存快照；只有把副作用提交状态、待执行动作和运行状态一起保存，恢复才有意义。

# 核心机制

1. Checkpoint 要绑定语义边界
2. Operation Log 要记录副作用提交状态
3. 恢复要区分继续、跳过还是重放
4. 状态机决定哪些等待状态可以安全暂停

# 标准答案

Harness 的 checkpoint 不能只是定时保存变量，因为长任务 Agent 面对的不是纯计算，而是会调用外部工具、进入等待审批、跨进程恢复的执行链路。真正有价值的 checkpoint 应该绑定明确语义边界，例如“副作用工具执行前”“副作用已提交但未确认”“等待人工审批”。同时还要配合 operation log 保存 tool_call_id、idempotency key、外部回执和当前 run state。只有这样，恢复时系统才能判断应该继续、跳过还是重放，而不是把已经执行过的高风险动作再次执行一遍。

# 必答点

1. 说明 checkpoint 要绑定语义边界
2. 说明要保存副作用执行证据
3. 说明 operation log 和 idempotency key 的关系
4. 说明等待审批和等待外部事件也是正式状态
5. 说明恢复不是简单从上次内存继续

# 常见误答

1. 把 checkpoint 当缓存
2. 只保存 transcript 不保存副作用状态
3. 不讲 tool_call_id 或 idempotency key
4. 不讲跳过和重放决策
