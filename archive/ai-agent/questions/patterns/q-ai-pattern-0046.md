---
id: q-ai-pattern-0046
title: 为什么模型路由必须先做 Capability Gating，再谈成本和时延
domain: ai-agent
component: agent-patterns
topic: model-capability-gating-provider-portability-feature-compatibility
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-models-guide
  - openai-compare-models-guide
  - openai-agents-sdk-models
claim_ids:
  - pattern-claim-0224
  - pattern-claim-0225
  - pattern-claim-0226
  - pattern-claim-0227
  - pattern-claim-0228
  - pattern-claim-0229
related_docs:
  - ai-agent/patterns/model-capability-gating-provider-portability-and-feature-compatibility
estimated_minutes: 12
---

# 题目

为什么模型路由必须先做 Capability Gating，再谈成本和时延？

# 一句话结论

因为模型差异不只是强弱和价格差异，还包括 endpoints、features、上下文、输出上限、rate limits、provider 和 model shape 合同差异；不能做的模型，再便宜也没意义。

# 核心机制

1. capability 和 contract 先于 cost routing
2. model shape 是功能合同，不是 SDK 细节
3. 可以混模型，但不能忽略 feature compatibility

# 标准答案

模型路由必须先做 capability gating，因为模型之间首先差在能力合同而不是价格档位。OpenAI 的 models 和 compare-models 页面明确给出每个模型支持的 endpoints、features、context window、max output、knowledge cutoff、pricing 和 rate limits，这意味着在路由前必须先判断当前任务所需能力是否满足，而不是简单按“大模型/小模型”分流。OpenAI Agents SDK 又把这个问题扩展到 model shape：官方推荐 OpenAI-only 应用优先用字符串模型名和默认 provider，走 `OpenAIResponsesModel` 主路径，同时也支持较旧的 `OpenAIChatCompletionsModel`；文档还明确建议尽量在同一 workflow 中保持单一 model shape，因为 Responses 和 Chat Completions 的 feature 和 tool 支持不同。如果要混模型或 provider，SDK 提供 `Agent.model`、`RunConfig(model_provider=...)` 和 `Model` 实现这几种入口，但混用前提是确保所有需要的能力在两边都存在。与此同时，默认模型本身也要纳入治理，因为未显式指定时会落到默认模型，文档当前写的是兼容性和低时延优先的 `gpt-4.1`，高质量优先时推荐 `gpt-5.5`。所以成熟的路由顺序应该是：先 capability 与 contract gating，再做成本、时延和多模型专业化优化。

# 必答点

1. 说明模型差异不仅是质量和价格
2. 说明 feature support、context、max output、rate limits 都是硬边界
3. 说明 Responses 和 Chat Completions shape 不是完全等价
4. 说明 default model 也属于治理问题

# 常见误答

1. 只按大模型和小模型二分
2. 忽略功能支持和合同差异
3. 混 model shapes 却不检查兼容性
4. 把默认模型当成无关紧要的留空项
