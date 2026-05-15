---
id: q-ai-case-0021
title: 为什么心理健康 Agent 在高风险态下更需要“安全完成”而不是“继续多聊几轮看看”
domain: ai-agent
component: ai-mental-health-agent
topic: risk-triage-safe-completion-human-escalation
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale resonant-soul repository, WHO guidance, OpenAI safety guide, and 988 Lifeline website as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-resonant-soul
  - who-ai-health-ethics-governance
  - openai-safety-best-practices
  - lifeline-988-official
claim_ids:
  - practice-p1-claim-0009
related_docs:
  - ai-agent/cases/mental-health-agent-risk-triage-safe-completion-and-human-escalation
estimated_minutes: 10
---

# 题目

为什么心理健康 Agent 在高风险态下更需要“安全完成”而不是“继续多聊几轮看看”？

# 一句话结论

因为高风险场景下继续开放式生成可能延迟专业支持、扩大误导，安全完成的核心是约束和转交，而不是继续展开。

# 标准答案

在高风险心理健康场景里，系统最重要的任务不是保持对话流畅，而是降低错误引导和延迟升级的风险。继续多聊几轮会让模型不断生成新的解释和建议，增加越界内容的概率，也可能让用户错过更合适的人工或专业支持。安全完成策略的目标，是在识别出高风险后使用更受限、更经过审核的输出方式结束当前自动生成，并把后续交给更合适的支持链路。

# 必答点

1. 说明高风险态和普通聊天不同
2. 说明继续开放式生成的风险
3. 说明安全完成的目标是约束和转交
4. 说明这不是体验优化而是安全控制

# 常见误答

1. 先继续安慰看看
2. 认为多聊可以提高判断准确率
3. 不区分高风险态和普通态
4. 把安全完成理解成“语气更柔和”

# 追问

1. 安全完成和人工升级是什么关系？
2. 哪些高风险样本最容易在普通聊天模式下被漏掉？
