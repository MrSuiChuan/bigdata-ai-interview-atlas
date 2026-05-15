---
id: q-ai-agentic-ai-0002
title: Agentic Workflow 的状态机为什么比 Prompt 技巧更重要
domain: ai-agent
component: agentic-ai
topic: agentic-planning-state-machine-stop-conditions
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "DeepLearning.AI Agentic AI course page and 实践资料 agentic-ai repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - deeplearning-ai-agentic-ai-course
  - practice-agentic-ai
  - practice-agent-tutorial
claim_ids:
  - practice-p2-claim-0001
  - agent-runtime-claim-0008
related_docs:
  - ai-agent/patterns/agentic-planning-state-machine-and-stop-conditions
estimated_minutes: 12
---

# 题目

Agentic Workflow 的状态机为什么比 Prompt 技巧更重要？

# 一句话结论

因为 Prompt 只能影响模型怎么说，状态机才能决定系统现在处于什么阶段、下一步允许做什么、什么时候必须停。

# 核心机制

1. State machine 负责合法状态和合法转移
2. Plan Draft 必须依赖最新 Observation 动态更新
3. Stop Condition 决定继续、暂停、结束或升级人工
4. Waiting 状态建模决定系统能否安全恢复

# 标准答案

在 Agentic 系统里，Prompt 负责影响模型表达和选择，但状态机负责运行时控制。只有状态机才能定义 submitted、running、waiting_for_approval、waiting_for_external_event、retrying、succeeded 等状态，以及这些状态之间的合法转移。Planning 也必须依赖状态机，因为计划不是一次写死的文本，而是随着新 Observation 不断调整的临时结构。没有状态机，系统就无法区分“应该继续规划”“应该等待审批”“应该停下来处理无进展”，最后往往会把所有异常都变成更多轮模型调用。

# 必答点

1. 说明 Prompt 和状态机职责不同
2. 说明 waiting、retrying、running 之类状态的重要性
3. 说明 Stop Condition 是运行时合同
4. 说明 planning 必须依赖最新 observation
5. 说明状态机和恢复语义的关系

# 常见误答

1. 认为 Agentic 只要 Prompt 写好就行
2. 把状态机等同于固定 Workflow
3. 不讲等待审批和外部事件
4. 不讲无进展停止
