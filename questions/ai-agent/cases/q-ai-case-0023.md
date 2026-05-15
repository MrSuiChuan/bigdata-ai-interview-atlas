---
id: q-ai-case-0023
title: 心理健康 Agent 为什么必须做日志脱敏、访问审计和删除治理，而不能只关心回复内容
domain: ai-agent
component: ai-mental-health-agent
topic: privacy-redaction-audit-incident-governance
question_type: governance
difficulty: advanced
status: reviewed
version_scope: "Datawhale resonant-soul repository, WHO guidance, OpenAI safety guide, and 988 Lifeline website as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-resonant-soul
  - who-ai-health-ethics-governance
  - openai-safety-best-practices
  - lifeline-988-official
  - presidio-home
claim_ids:
  - practice-p1-claim-0009
related_docs:
  - ai-agent/cases/mental-health-agent-privacy-redaction-audit-and-incident-governance
estimated_minutes: 10
---

# 题目

心理健康 Agent 为什么必须做日志脱敏、访问审计和删除治理，而不能只关心回复内容？

# 一句话结论

因为这类系统接触的是高敏信息，真正的系统风险往往发生在存储、日志和访问链路，而不是最终回复文本本身。

# 标准答案

心理健康 Agent 处理的通常是高度敏感的个人情绪、关系和危机信息。即使回复内容完全合规，如果系统把原始对话明文记入日志、无法追踪谁访问过数据、无法执行删除请求，整体仍然不安全。日志脱敏可以降低调试链路泄露风险，访问审计可以提供事件复盘证据，删除治理则决定系统能否真正控制高敏数据生命周期。这些对象和回复内容同等重要。

# 必答点

1. 说明场景数据高度敏感
2. 说明日志是风险面
3. 说明访问审计的作用
4. 说明删除治理的重要性
5. 说明安全不只在回答层

# 常见误答

1. 只关注模型说什么
2. 默认原文日志长期保留
3. 不做访问留痕
4. 删除只删主库不删日志

# 追问

1. 审计记录和保存原文有什么区别？
2. 为什么删除请求必须覆盖所有副本？
