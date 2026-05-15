---
id: q-ai-camel-0002
title: CAMEL Workforce 如何用 Task Router 和 Shared Artifact 防止多个 Agent 各说各话
domain: ai-agent
component: camel-ai
topic: workforce-task-routing-shared-artifacts
question_type: system-design
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
related_docs:
  - ai-agent/frameworks/camel-ai-workforce-task-routing-and-shared-artifacts
estimated_minutes: 12
---

# 题目

CAMEL Workforce 如何用 Task Router 和 Shared Artifact 防止多个 Agent 各说各话？

# 一句话结论

关键是让任务路由、共享产物和验收链显式存在，而不是让所有 Agent 共享同一堆聊天记录后自由发挥。

# 核心机制

1. Task Router 决定任务发给谁。
2. Worker 只拿到完成当前子任务所需的最小上下文。
3. Shared Artifact 保存正式中间结果。
4. Manager / Reviewer 负责收敛和验收。
5. 输出必须有 owner，而不是没有责任归属。

# 标准答案

要让 CAMEL Workforce 可控，首先要有 Task Router，把不同类型的子任务派给最合适的 worker；其次要让 worker 的结果进入共享产物仓，而不是只留在聊天消息里；然后通过 Manager 判断是否要补做、重派或汇总，最后由 Reviewer 根据验收规则做通过或打回。这样一来，多智能体协作的关键状态就从“谁说了什么”转成“哪个共享产物在什么状态、由谁负责、是否通过验收”，从而降低各说各话和错误扩散的风险。

# 必答点

1. 说明 Task Router 的作用。
2. 说明 Shared Artifact 比纯对话更稳定。
3. 说明 Manager / Reviewer 的收敛角色。
4. 说明上下文最小化原则。
5. 说明输出 owner 和验收链。

# 常见误答

1. 所有 Agent 都看完整需求。
2. 只靠聊天消息传递结果。
3. 没有明确 owner。
4. 没有验收与打回机制。
