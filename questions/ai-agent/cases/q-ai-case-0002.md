---
id: q-ai-case-0002
title: 设计 AI 心理健康 Agent 时为什么不能只优化共情话术
domain: ai-agent
component: ai-mental-health-agent
topic: mental-health-agent-safety-escalation
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料 resonant-soul repository, WHO guidance, OpenAI safety guide, and 988 Lifeline website as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - practice-resonant-soul
  - camel-ai-docs
  - who-ai-health-ethics-governance
  - openai-safety-best-practices
  - lifeline-988-official
claim_ids:
  - practice-p1-claim-0009
related_docs:
  - ai-agent/cases/mental-health-agent-safety-escalation-case
estimated_minutes: 15
---

# 题目

设计 AI 心理健康 Agent 时，为什么不能只优化共情话术？

# 一句话结论

因为心理健康场景属于高风险场景，系统必须处理风险分级、危机升级、人工介入、隐私治理、量表边界和审计，而不是只追求模型回复温柔。

# 标准答案

AI 心理健康 Agent 不能只优化共情话术。普通支持层可以做情绪记录、日记整理、放松训练和非诊断陪伴；风险识别层要识别自伤、伤人、危机语言和紧急求助；升级层要在高风险场景停止普通生成，引导专业支持或当地紧急服务，并在条件允许时转人工；隐私治理层要控制数据保存、访问权限、脱敏、删除和第三方模型接触范围。量表结果只能作为记录和风险参考，不能让模型自由解释成临床诊断。成熟系统还要用高风险召回率、误升级率、隐私泄露、不当医疗建议率和人工介入延迟评价。

# 必答点

1. 说明不是 AI 医生或治疗师
2. 说明普通陪伴和危机风险必须分层
3. 说明危机场景要升级到专业支持或紧急服务
4. 说明心理数据隐私治理
5. 说明量表解释不能由模型自由发挥
6. 说明安全评价指标

# 常见误答

1. 只调 Prompt 让模型更温柔
2. 不做风险分级
3. 不设计转人工
4. 不讲隐私和数据删除
5. 把量表结果当诊断

