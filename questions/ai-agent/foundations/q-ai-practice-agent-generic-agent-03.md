---
id: q-ai-practice-agent-generic-agent-03
title: "GenericAgent 什么时候适合替代固定 Workflow，什么时候不适合？"
domain: ai-agent
component: generic-agent
topic: runtime-loop-tool-contract-memory-loading
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "GenericAgent repository, OpenAI context engineering guides, and 实践资料 hello-generic-agent repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - generic-agent-github
  - practice-hello-generic-agent
claim_ids:
  - practice-p1-claim-0005
  - agent-runtime-claim-0010
related_docs:
  - ai-agent/frameworks/generic-agent-runtime-loop-tool-contracts-and-memory-loading
estimated_minutes: 10
---

# 题目

GenericAgent 什么时候适合替代固定 Workflow，什么时候不适合？

# 一句话结论

目标开放、步骤不确定、需要动态选择工具时适合 GenericAgent；步骤固定、风险高、审批重的链路更适合 Workflow。

# 核心机制

1. Workflow 强在确定性和审计。
2. GenericAgent 强在动态规划与经验复用。
3. 高风险外部动作要由外层流程约束。
4. 混合架构通常比全自主更稳。

# 标准答案

讨论 GenericAgent 的使用边界时，应先判断任务的不确定性和风险。如果业务流程固定，例如标准审批、定时报表、规则明确的同步任务，优先用 Workflow。如果任务需要动态检索、工具选择、多轮探索或依赖技能沉淀，就更适合 GenericAgent。生产系统常见做法是外层 Workflow 控制关键边界，GenericAgent 只在受限预算、受限工具和受限上下文里承担开放子任务。

# 必答点

1. 说明 Workflow 和 Agent 的能力边界。
2. 结合任务确定性和风险判断。
3. 说明混合架构。
4. 说明成本、延迟和可审计性。
5. 说明失败和人工审批策略。

# 常见误答

1. 认为 Agent 一定比 Workflow 高级。
2. 所有任务都让模型自由规划。
3. 不讲风险、预算和审批。
4. 只比较框架名字。
