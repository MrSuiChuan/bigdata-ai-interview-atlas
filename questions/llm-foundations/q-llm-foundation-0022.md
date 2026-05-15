---
id: q-llm-foundation-0022
title: 直接 Prompt Injection 和间接 Prompt Injection 有什么区别，为什么后者更难防
domain: llm-foundations
component: llm-safety
topic: prompt-injection-permission-sandbox-human-approval-red-team
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OWASP LLM Top 10, OpenAI prompt injection article, and OpenAI safety best practices as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - owasp-llm-top10-2025
  - openai-prompt-injection-blog
  - openai-safety-best-practices
claim_ids:
  - llm-foundation-claim-0025
  - llm-foundation-claim-0026
related_docs:
  - llm-foundations/llm-safety-prompt-injection-permission-and-red-team
estimated_minutes: 10
---

# 题目

直接 Prompt Injection 和间接 Prompt Injection 有什么区别，为什么后者更难防？

# 一句话结论

直接注入来自用户显式输入，间接注入来自网页、文档、邮件、知识库片段或工具返回等外部内容；后者更难防，因为它经常伪装成系统正常要处理的业务数据。

# 标准答案

直接 Prompt Injection 指用户在当前对话里明确塞入恶意指令，例如诱导模型忽略系统规则、泄露提示词或调用工具。间接 Prompt Injection 则发生在模型要处理的外部内容中，例如网页、PDF、RAG 文档、邮件正文或工具输出携带了恶意指令。后者更难防，原因在于这些内容通常本来就属于业务输入的一部分，看起来像正常数据，系统容易把它们无差别放进上下文。防御时不能只靠 system prompt，而要做不可信内容标记、权限隔离、参数校验、输出约束和红队回归，尤其在 RAG 和 Agent 场景里更要把外部内容视为潜在攻击面。

# 必答点

1. 说明直接注入来自用户当前输入
2. 说明间接注入来自外部内容
3. 说明后者更难防因为伪装成正常业务数据
4. 说明不能只靠 system prompt
5. 说明 RAG 和 Agent 场景风险更高

# 常见误答

1. 认为所有注入都来自用户输入
2. 不讲外部文档和工具输出
3. 认为 system prompt 足够解决问题
4. 不讲 RAG 场景的特殊风险

# 追问

1. 为什么知识库文档也可能成为攻击面？
2. 工具返回的日志为什么也可能带注入？
3. 间接注入为什么更适合进红队回归集？
