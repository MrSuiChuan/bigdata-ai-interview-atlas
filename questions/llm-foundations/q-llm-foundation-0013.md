---
id: q-llm-foundation-0013
title: LLM 安全为什么不能只靠 system prompt
domain: llm-foundations
component: llm-safety
topic: prompt-injection-permission-sandbox-human-approval-red-team
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OWASP LLM Top 10 and OpenAI prompt injection article as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - owasp-llm-top10-2025
  - openai-prompt-injection-blog
claim_ids:
  - llm-foundation-claim-0025
  - llm-foundation-claim-0026
related_docs:
  - llm-foundations/llm-safety-prompt-injection-permission-and-red-team
estimated_minutes: 10
---

# 题目

LLM 安全为什么不能只靠 system prompt？应该怎么设计防护？

# 一句话结论

system prompt 可以降低风险，但不是安全边界；生产系统要靠权限、沙箱、参数校验、人工审批、审计、红队和评估闭环控制风险。

# 标准答案

Prompt Injection 可以通过用户输入或外部内容诱导模型忽略系统规则，导致敏感信息泄露、错误工具调用或未授权动作。因为模型把系统指令、用户输入、检索内容和工具结果都放在上下文里处理，提示词本身不能形成可靠隔离。系统设计上，RAG 要在检索阶段做权限过滤，工具调用要最小权限、参数校验、操作分级和高风险人工审批，代码或浏览器执行要放入沙箱，输出要做结构校验和敏感信息检查，所有关键动作要有审计日志。红队样本要回流评估集持续回归。

# 必答点

1. 说明 Prompt Injection 风险
2. 说明 system prompt 不是安全边界
3. 说明 RAG 权限要在检索阶段做
4. 说明工具调用要最小权限和审批
5. 说明沙箱、审计、红队和回归

# 常见误答

1. 认为 system prompt 足够防攻击
2. 让模型自己判断权限
3. RAG 权限过滤放在生成后
4. 工具调用没有参数校验
5. 红队样本不进入评估集

# 追问

1. 直接注入和间接注入有什么区别？
2. 沙箱能解决什么，不能解决什么？
3. 工具为什么要做操作分级？
4. 红队样本如何长期复用？
