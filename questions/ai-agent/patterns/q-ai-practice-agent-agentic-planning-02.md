---
id: q-ai-practice-agent-agentic-planning-02
title: "Agentic 规划与行动：如何设计可恢复、可观测的执行链路？"
domain: ai-agent
component: agent-patterns
topic: agentic-workflow
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-agentic-ai
claim_ids: []
related_docs:
  - ai-agent/foundations/agent-runtime-production-practice
estimated_minutes: 12
---

# 题目

Agentic 规划与行动：如何设计可恢复、可观测的执行链路？

# 一句话结论

可恢复和可观测的关键是把每一步决策、工具参数、工具结果、中间状态和停止原因记录下来，并用 checkpoint 支持续跑。

# 核心机制

执行链路至少包含任务状态机、tool call 记录、错误分类、重试策略、人工接管、trace 回放和评估指标。缺少这些能力，系统只能演示，不能稳定运行。

# 标准答案

设计Agentic 规划与行动的执行链路时，可以把任务拆成创建、规划、执行、检查、恢复和完成几个阶段。每个阶段都要写入状态和 trace。工具调用前做 schema 校验和权限判断，调用后记录结果、耗时和异常。失败时根据错误类型决定重试、降级、回滚或交给人工。最后用固定任务集评估任务成功率、人工接管率、延迟和成本。

# 必答点

1. 任务生命周期清晰
2. checkpoint 保存关键状态
3. 工具调用有参数校验和审计
4. 错误分类对应恢复策略
5. 指标能支撑回归评估

# 常见误答

1. 只说加日志
2. 没有状态持久化
3. 所有错误都自动重试
4. 没有人工接管入口

# 延伸追问

1. checkpoint 应该保存哪些字段？
2. 哪些工具不能自动重试？
3. trace 如何支持问题复现？

