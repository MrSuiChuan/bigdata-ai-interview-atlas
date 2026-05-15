---
id: q-llm-foundation-0040
title: 为什么 LLM 应用上线后必须记录模型版本、Prompt 版本、检索 Trace 和失败样本，而不是只看用户满意度
domain: llm-foundations
component: llm-application-development
topic: observability-permission-online-iteration
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Datawhale llm-cookbook, llm-universe, and evaluation docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-llm-cookbook
  - practice-llm-universe
  - openai-evaluation-best-practices
claim_ids:
  - llm-foundation-claim-0009
  - llm-foundation-claim-0010
  - llm-foundation-claim-0012
related_docs:
  - llm-foundations/llm-application-development-path-api-prompt-rag-eval
  - llm-foundations/llm-application-development-observability-permission-and-online-iteration
estimated_minutes: 10
---

# 题目

为什么 LLM 应用上线后必须记录模型版本、Prompt 版本、检索 Trace 和失败样本，而不是只看用户满意度？

# 一句话结论

因为大模型应用的很多故障只能靠链路证据定位，满意度只能告诉你“出问题了”，却不能告诉你“问题到底出在哪一层”。

# 标准答案

LLM 应用不是单点模型输出，而是模型、Prompt、检索、工具和解析共同组成的链路。上线后如果不记录模型版本、Prompt 版本、检索 Trace 和失败样本，就很难复现问题，也无法判断故障是来自模型升级、Prompt 改动、检索漂移还是解析失败。用户满意度只能提供最终感受，不能提供可操作证据。真正的可维护系统，需要让每次失败都能被还原成一条带上下文、带版本、带证据的样本，进而进入回归和修复闭环。

# 必答点

1. 说明 LLM 应用是多层链路
2. 说明满意度不能定位根因
3. 说明版本和 trace 对复现的重要性
4. 说明失败样本要回流回归集
5. 说明可观测性是长期迭代前提

# 常见误答

1. 只看用户评分就认为足够
2. 不记录 Prompt 和模型版本
3. 不保留检索证据
4. 失败后靠人回忆问题

# 追问

1. 一个最小 trace 至少该记录哪些字段？
2. 为什么失败样本比成功样本更有修复价值？
3. 多租户系统里为什么还要记录权限检查结果？
