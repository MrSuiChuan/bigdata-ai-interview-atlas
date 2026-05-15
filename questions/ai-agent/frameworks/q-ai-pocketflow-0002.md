---
id: q-ai-pocketflow-0002
title: PocketFlow 如何用 Shared State、Branch 与 Loop Guard 表达一个可控的 Agent Loop
domain: ai-agent
component: pocketflow
topic: state-branching-retry-agent-loop
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "PocketFlow docs, PocketFlow GitHub repository, LangGraph overview docs, and 实践资料 easy-pocket repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - pocketflow-docs
  - pocketflow-github
  - practice-easy-pocket
  - langgraph-overview-docs
claim_ids:
  - practice-p1-claim-0006
  - agent-runtime-claim-0004
  - agent-runtime-claim-0005
related_docs:
  - ai-agent/frameworks/pocketflow-state-branching-retry-and-agent-loop
estimated_minutes: 12
---

# 题目

PocketFlow 如何用 Shared State、Branch 与 Loop Guard 表达一个可控的 Agent Loop？

# 一句话结论

关键是把规划、分支判断、工具执行、状态更新和停止条件拆开，而不是把所有控制逻辑塞进一个大节点里。

# 核心机制

1. Shared State 保存最小必要信息。
2. Branch Node 决定是否进入工具节点或结束。
3. Retry Policy 只对安全节点生效。
4. Loop Guard 负责预算与重复错误检测。
5. Terminal Node 明确成功、失败和人工接管出口。

# 标准答案

用 PocketFlow 设计 Agent Loop 时，建议让 Plan Node 负责生成动作建议，Branch Node 读取状态后决定是否允许继续执行，Tool Node 负责外部动作，Observation 再回写 Shared State，Loop Guard 根据最大轮次、重复错误和目标达成情况判断是否停止。这样 Flow 的控制结构是显式可查的，问题定位也更容易。真正难的地方不是画出循环，而是让状态字段、分支条件和重试策略彼此解耦。

# 必答点

1. 说明 Shared State 不能混杂控制字段和业务结果。
2. 说明 Branch 与 Tool Node 的职责不同。
3. 说明 Retry 不能对所有节点一刀切。
4. 说明 Loop Guard 的必要性。
5. 说明成功、失败和人工接管出口。

# 常见误答

1. 把状态全部塞进单个字符串。
2. 所有判断都交给模型。
3. 对副作用节点默认自动重试。
4. 没有退出条件。
