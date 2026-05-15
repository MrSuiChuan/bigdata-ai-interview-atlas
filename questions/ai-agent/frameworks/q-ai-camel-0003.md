---
id: q-ai-camel-0003
title: 多智能体系统为什么比单 Agent 更需要终止语义和人工覆盖
domain: ai-agent
component: camel-ai
topic: production-governance-observability-human-override
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "CAMEL-AI docs, CAMEL Workforce docs, and 实践资料 handy-multi-agent repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - camel-ai-docs
  - camel-ai-workforce-docs
  - practice-handy-multi-agent
claim_ids:
  - practice-p0-claim-0005
  - practice-p0-claim-0006
  - agent-runtime-claim-0006
related_docs:
  - ai-agent/frameworks/camel-ai-production-governance-observability-and-human-override
estimated_minutes: 10
---

# 题目

多智能体系统为什么比单 Agent 更需要终止语义和人工覆盖？

# 一句话结论

因为多智能体的错误不会停留在单个循环里，而会沿着共享产物和角色协作链不断扩散，所以必须有明确终止点和人工接管点。

# 核心机制

1. collaboration trace 要能追踪错误传播。
2. termination rule 要限制无效讨论轮次。
3. escalation policy 要把高风险或反复失败任务交给人。
4. human override 要能修改产物、暂停角色或终止任务。

# 标准答案

多智能体系统比单 Agent 更需要终止语义和人工覆盖，因为它的失败面更大。一个角色的错误可能被后续角色继续引用，一个 manager 的错误决策可能让多个 worker 在错误方向上持续消耗资源。因此系统必须设置最大轮次、冲突阈值、review reject 次数等 termination rule；还要定义 escalation policy，在高风险动作、重复冲突或 reviewer 多次拒绝时切到人工。真正有效的 human override 不只是聊天中给建议，而是能够修改共享产物、停止 workforce 或直接终结任务。

# 必答点

1. 说明错误会沿协作链扩散。
2. 说明 termination rule 的作用。
3. 说明 escalation policy 的触发条件。
4. 说明 human override 必须能作用到任务状态。
5. 说明 trace 是判断何时升级的证据基础。

# 常见误答

1. 认为多智能体会自动互相纠错。
2. 没有最大轮次或失败阈值。
3. 人工只在最后看结果。
4. 没有共享产物级别的接管能力。
