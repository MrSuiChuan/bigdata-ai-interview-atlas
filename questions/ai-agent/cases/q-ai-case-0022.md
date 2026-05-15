---
id: q-ai-case-0022
title: 心理健康 Agent 为什么不能把量表、自评结果或模型输出自由解释成诊断结论
domain: ai-agent
component: ai-mental-health-agent
topic: mental-health-agent-safety-escalation
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
  - ai-agent/cases/mental-health-agent-safety-escalation-case
estimated_minutes: 10
---

# 题目

心理健康 Agent 为什么不能把量表、自评结果或模型输出自由解释成诊断结论？

# 一句话结论

因为这类系统的安全边界是支持、筛查和升级，而不是代替专业判断，自由解释会把产品案例越界成高风险医疗判断。

# 标准答案

心理健康 Agent 可以辅助记录和风险筛查，但不能把量表结果、用户自评或模型生成内容自由解释成诊断结论。原因在于：量表本身只是结构化输入之一，模型也只是概率生成系统，这两者都不足以支撑临床级判断。更安全的方式是把这些结果作为支持性记录或风险参考，并在高风险时触发更严格的流程或人工升级，而不是让模型直接下结论。

# 必答点

1. 说明系统不是临床判断主体
2. 说明量表和模型输出都不足以形成诊断
3. 说明边界在支持、筛查和升级
4. 说明需要更受控的解释策略

# 常见误答

1. 把量表分数直接当诊断
2. 让模型自由解释心理状态
3. 不讲边界控制
4. 不讲风险升级

# 追问

1. 固定模板解释比自由生成更安全吗？
2. 哪些场景必须升级而不是继续解释？
