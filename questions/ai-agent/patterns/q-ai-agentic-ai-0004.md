---
id: q-ai-agentic-ai-0004
title: 什么情况下应该把 Agentic 系统降级为固定 Workflow 或人工审批
domain: ai-agent
component: agentic-ai
topic: agentic-evals-reliability-human-override
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "DeepLearning.AI Agentic AI course page and 实践资料 agentic-ai repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - deeplearning-ai-agentic-ai-course
  - practice-agentic-ai
claim_ids:
  - practice-p2-claim-0001
  - agent-runtime-claim-0006
  - agent-runtime-claim-0007
related_docs:
  - ai-agent/patterns/agentic-evals-reliability-and-human-override
estimated_minutes: 15
---

# 题目

什么情况下应该把 Agentic 系统降级为固定 Workflow 或人工审批？

# 一句话结论

当任务路径高度稳定、工具副作用高风险、证据不足或系统连续无进展时，应优先降级为固定 Workflow 或人工审批，而不是继续扩大自主权。

# 核心机制

1. 任务确定性决定是否需要动态规划
2. 风险等级决定是否必须审批
3. 无进展和重复错误决定是否应该停止自主执行
4. Fallback Mode 决定降级后的运行形态

# 标准答案

是否使用 Agentic，而不是固定 Workflow 或人工审批，关键取决于任务的不确定性和风险边界。若任务步骤稳定、规则明确、风险高，例如支付、删库、权限变更、法务审批，就更适合固定 Workflow 或人工把关；若任务需要探索、检索、跨工具分析，且主要是只读或低风险写操作，才适合给 Agentic 更多自主权。线上运行时，一旦出现高风险工具请求、重复错误、预算耗尽、无新 Observation、证据冲突或人工接管率持续上升，系统就应切换到 fallback mode，例如固定流程、只读模式或人工处理，而不是继续让模型自由尝试。

# 必答点

1. 说明任务确定性和风险等级是核心判断维度
2. 说明高风险写操作通常需要审批
3. 说明无进展和重复错误是强降级信号
4. 说明 fallback mode 的几种形态
5. 说明不能把降级视为失败而应视为治理手段

# 常见误答

1. 认为 Agentic 一定比 Workflow 高级
2. 高风险任务也让模型自由决策
3. 不讲 fallback mode
4. 不讲人工接管率和证据冲突
