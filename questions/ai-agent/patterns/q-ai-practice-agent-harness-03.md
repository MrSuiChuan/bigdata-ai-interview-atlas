---
id: q-ai-practice-agent-harness-03
title: "长任务 Harness：什么时候用固定 Workflow，什么时候用自主 Agent？"
domain: ai-agent
component: agent-patterns
topic: harness-engineering
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-self-harness
claim_ids: []
related_docs:
  - ai-agent/foundations/agent-runtime-production-practice
estimated_minutes: 10
---

# 题目

长任务 Harness：什么时候用固定 Workflow，什么时候用自主 Agent？

# 一句话结论

步骤稳定、风险高、需要审批的任务优先用 Workflow；目标开放、步骤不确定、需要动态探索的任务才适合自主 Agent。

# 核心机制

Workflow 的优势是可控、可审计、可预测；Agent 的优势是灵活和自适应。工程设计常见做法是外层 Workflow 固定风险边界，内层 Agent 处理开放子任务。

# 标准答案

讨论长任务 Harness时，应先判断任务的不确定性和风险。如果业务流程固定，例如审批、报表生成、标准客服，可以用 Workflow。若任务需要动态选择工具、多轮探索或处理未知路径，可以引入 Agent。生产系统常采用混合架构：关键节点由 Workflow 控制，Agent 只在受限工具和预算内执行。

# 必答点

1. 说明 Workflow 和 Agent 的能力边界
2. 结合任务确定性和风险判断
3. 说明混合架构
4. 说明成本、延迟和可审计性
5. 说明失败和人工审批策略

# 常见误答

1. 认为 Agent 一定比 Workflow 高级
2. 所有任务都让模型自由规划
3. 不讲风险和审批
4. 只比较框架名字

# 延伸追问

1. 高风险工具如何加审批？
2. 如何限制 Agent 的预算？
3. 工作流节点失败后如何恢复？

