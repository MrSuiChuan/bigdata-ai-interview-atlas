---
id: q-ai-case-0029
title: AI 编程 Agent 的计划为什么必须细化到文件、步骤和验证动作，而不能只写“修一下 bug”
domain: ai-agent
component: ai-coding-workflow
topic: context-loading-plan-diff-scope-control
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Datawhale smart-dev repository, Roo Code docs, and MCP docs as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-smart-dev
  - roo-code-docs
  - openai-agents-sdk-tracing
claim_ids:
  - practice-p1-claim-0012
related_docs:
  - ai-agent/cases/ai-coding-workflow-context-loading-plan-diff-and-scope-control
estimated_minutes: 10
---

# 题目

AI 编程 Agent 的计划为什么必须细化到文件、步骤和验证动作，而不能只写“修一下 bug”？

# 一句话结论

因为抽象计划无法约束系统行为，也无法在失败时支持根因定位。

# 标准答案

AI 编程 Agent 的计划不只是给人看的说明，而是控制执行顺序和边界的控制面。若计划只写“修一下 bug”，系统就不知道应该先读哪些文件、改哪个对象、用什么命令验证、哪些路径绝不能碰。计划细化到文件、步骤和验证动作之后，系统才能做到三件事：限制上下文、限制 patch 范围、在失败时判断问题出在理解、实现还是验证层。没有这种粒度，后面的 diff 和 trace 都难以解释。

# 必答点

1. 计划是控制面，不是装饰
2. 要覆盖读、改、验三个动作
3. 要能支撑范围约束
4. 要能支撑失败定位

# 常见误答

1. 计划写个大概就行
2. patch 出来再看改没改对
3. 只计划改动，不计划验证
4. 不把计划和 trace 关联起来
