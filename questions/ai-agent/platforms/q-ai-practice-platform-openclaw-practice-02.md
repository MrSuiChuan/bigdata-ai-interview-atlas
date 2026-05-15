---
id: q-ai-practice-platform-openclaw-practice-02
title: "平台化 Agent 实践：如何在工作流和 Agent 之间做取舍？"
domain: ai-agent
component: agent-platforms
topic: agent-platform
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-hand-on-openclaw
claim_ids: []
related_docs:
  - ai-agent/platforms/ai-application-platform-engineering-practice
estimated_minutes: 10
---

# 题目

平台化 Agent 实践：如何在工作流和 Agent 之间做取舍？

# 一句话结论

确定步骤和高风险动作适合 Workflow，开放探索和动态决策适合 Agent，生产系统经常两者混合。

# 核心机制

Workflow 提供确定性和审计，Agent 提供灵活性。把所有步骤交给模型会降低可控性，把所有步骤写死又会降低适应性。

# 标准答案

在平台化 Agent 实践里，先判断任务是否固定、风险是否高、是否需要审批。如果步骤固定，例如数据同步、通知、审核，优先 Workflow。如果任务需要动态检索、选择工具或多轮探索，可以在受限范围内使用 Agent。常见架构是外层 Workflow 控制关键节点，内层 Agent 处理开放子任务。

# 必答点

1. 用确定性和风险做判断
2. 说明 Workflow 的审计优势
3. 说明 Agent 的灵活优势
4. 说明混合架构
5. 说明审批和预算限制

# 常见误答

1. 所有任务都 Agent 化
2. 所有节点都写死
3. 不讲审批
4. 不讲成本和延迟

# 延伸追问

1. 高风险节点如何人工审批？
2. 如何限制 Agent 工具范围？
3. 如何评价混合架构效果？

