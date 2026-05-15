---
id: q-ai-pattern-0058
title: Agentic Workflow 为什么不是让模型更自由，而是建立可控闭环
domain: ai-agent
component: agentic-ai
topic: agentic-workflows-reflection-tool-use-autonomy
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "DeepLearning.AI Agentic AI course page and 实践资料 agentic-ai repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - deeplearning-ai-agentic-ai-course
  - practice-agentic-ai
  - practice-agent-tutorial
  - openai-agents-sdk-tools
claim_ids:
  - practice-p2-claim-0001
related_docs:
  - ai-agent/patterns/agentic-workflows-reflection-tool-use-and-autonomy
estimated_minutes: 12
---

# 题目

Agentic Workflow 为什么不是让模型更自由，而是建立可控闭环？

# 一句话结论

因为 Agentic Workflow 的核心是目标、计划、工具、观察、反思、状态更新和终止条件组成的反馈控制系统。

# 标准答案

Agentic Workflow 不是让模型自由发挥，而是建立可控执行闭环。系统先定义目标和上下文，再生成计划，通过 tool use 调用外部能力，把工具结果整理成 observation，随后用 reflection 检查结果是否满足目标、是否有错误和遗漏，并决定继续、修正、暂停还是结束。Tool use 必须有 schema、权限、副作用和失败语义；autonomy 要分级，从只读建议到后台主动执行，每一级都需要更强的预算、审批、checkpoint、trace 和回滚。自主性越强，运行时约束越不能弱。

# 必答点

1. 说明目标、计划、工具、观察、反思、状态和终止
2. 说明 Reflection 是反馈控制，不是再问一遍模型
3. 说明 Tool Use 是安全边界
4. 说明 Autonomy 要分级
5. 说明预算、审批、checkpoint 和 trace

# 常见误答

1. 把 Agentic AI 等同于自动干活
2. 不讲终止条件
3. 不讲工具权限
4. 认为 Reflection 一定提升质量
5. 不讲高自主性的回滚和审计

