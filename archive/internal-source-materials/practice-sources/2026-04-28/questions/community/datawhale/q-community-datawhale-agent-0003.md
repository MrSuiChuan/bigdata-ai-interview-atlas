---
id: q-community-datawhale-agent-0003
title: 长任务 Agent 为什么需要 Harness Engineering？
domain: community
component: datawhale
topic: harness-engineering
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Datawhale self-harness repository as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-self-harness
claim_ids: []
related_docs:
  - community/datawhale/ai-agent/p0-agent-mainline
estimated_minutes: 12
---

# 题目

长任务 Agent 为什么需要 Harness Engineering？

# 一句话结论

长任务 Agent 的问题不是“能不能生成下一步”，而是任务过程长、状态多、失败点多，所以必须有任务编排、检查点、恢复、日志、评估和人工接管。

# 核心机制

Harness Engineering 把 Agent 从一次性 demo 变成可运行系统。它负责包住模型和工具，提供任务生命周期、状态持久化、异常恢复、可观测性、测试集和人工干预入口。

# 标准答案

长任务 Agent 需要 Harness Engineering，因为长任务会跨越多轮决策和多个工具调用，任何一步都可能失败。如果没有 harness，失败后很难知道执行到哪里、用了什么工具、产生了哪些中间结果、是否可以重试。一个好的 harness 至少要有任务状态机、checkpoint、tool call 记录、错误分类、重试策略、人工接管、评估集和 tracing。面试里要把它讲成可靠性工程，而不是简单的 Agent 外壳。

# 必答点

1. 说明长任务失败点多。
2. 说明 checkpoint 和恢复。
3. 说明工具调用日志和 tracing。
4. 说明人工接管和评估。
5. 说明 harness 是可靠性工程。

# 常见误答

1. 只说多写日志。
2. 只讲 prompt 优化。
3. 不讲状态持久化。
4. 不讲失败恢复边界。

# 延伸追问

1. checkpoint 应该保存哪些状态？
2. 哪些工具调用不能自动重试？
3. 如何评估长任务 Agent 的成功率？
