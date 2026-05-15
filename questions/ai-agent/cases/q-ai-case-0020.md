---
id: q-ai-case-0020
title: 心理健康 Agent 为什么要把普通支持、风险分诊和人工升级拆成不同层，而不是交给一个模型自由发挥
domain: ai-agent
component: ai-mental-health-agent
topic: risk-triage-safe-completion-human-escalation
question_type: system-design
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
  - ai-agent/cases/mental-health-agent-safety-escalation-case
  - ai-agent/cases/mental-health-agent-risk-triage-safe-completion-and-human-escalation
estimated_minutes: 12
---

# 题目

心理健康 Agent 为什么要把普通支持、风险分诊和人工升级拆成不同层，而不是交给一个模型自由发挥？

# 一句话结论

因为高风险场景里最重要的是先判断风险和控制边界，而不是先生成一段听起来很温柔的话。

# 标准答案

心理健康 Agent 如果把所有任务都交给一个模型自由发挥，很容易出现高风险请求仍然被当成普通聊天处理的情况。更安全的设计是分层：普通支持层只做非诊断性的记录和陪伴，风险分诊层负责识别危机、自伤伤人线索和紧急风险，人工升级层负责在中高风险时停止开放式生成并转入更受控的后续流程。这样做的目的不是降低模型自由度，而是避免系统在高风险场景里越界。

# 必答点

1. 说明高风险场景不能只靠普通对话
2. 说明风险分诊层的职责
3. 说明人工升级层的职责
4. 说明分层设计的安全价值

# 常见误答

1. 认为共情话术最重要
2. 不单独做风险分诊
3. 不设计人工升级
4. 让主模型自己判断一切

# 追问

1. 为什么风险识别最好独立于主生成模型？
2. 何时应该进入安全完成而不是继续对话？
