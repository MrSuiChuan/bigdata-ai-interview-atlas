---
id: q-ai-pattern-0030
title: 为什么 Model Routing 必须先做 Capability Gating，再谈 Graceful Degradation 和 Tiered Inference
domain: ai-agent
component: agent-patterns
topic: model-routing-capability-gating-graceful-degradation
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-models-guide
  - openai-compare-models-guide
  - openai-agents-sdk-models
  - openai-latency-optimization-guide
  - openai-cost-optimization-guide
  - openai-flex-processing-guide
  - openai-batch-guide
claim_ids:
  - pattern-claim-0130
  - pattern-claim-0131
  - pattern-claim-0132
  - pattern-claim-0133
  - pattern-claim-0134
  - pattern-claim-0135
  - pattern-claim-0224
  - pattern-claim-0225
  - pattern-claim-0226
  - pattern-claim-0227
  - pattern-claim-0228
  - pattern-claim-0229
related_docs:
  - ai-agent/patterns/model-routing-graceful-degradation-and-tiered-inference
estimated_minutes: 12
---

# 题目

为什么 Model Routing 必须先做 Capability Gating，再谈 Graceful Degradation 和 Tiered Inference？

# 一句话结论

因为模型路由首先是在判断“这个模型和这个 model shape 能不能完成当前工作流”，只有候选集合成立之后，质量、时延、成本和降级策略才有讨论空间。

# 核心机制

1. capability 与 contract gating 先于 cost routing
2. model shape 是工作流合同的一部分，不是 SDK 细节
3. graceful degradation 的前提是降级后 workflow contract 仍成立
4. tiered inference 要把在线、强推理和异步离线路径分层

# 标准答案

Model routing 不能只理解成“大模型做复杂题、小模型做简单题”，因为真实系统里的路由先受能力合同约束，再受质量和成本约束。OpenAI 的 models guide 建议复杂推理和编码任务优先考虑旗舰模型，而追求更低时延和成本时可以考虑更小模型；compare-models guide 又明确给出模型之间在 features、context window、max output、pricing 和 rate limits 上的差异，这意味着路由的第一步必须是 capability gating 和 contract gating，而不是先做价格排序。进入编排层后，OpenAI Agents SDK 虽然允许按 agent、run 或 provider 混用模型，但同时明确提醒要检查 feature differences，并建议单条 workflow 尽量保持单一 model shape，因为 `OpenAIResponsesModel` 和 `OpenAIChatCompletionsModel` 支持的功能和 tools 并不完全相同。这说明 graceful degradation 不能粗暴理解成“失败后换个便宜模型”，而必须保证降级后 structured outputs、工具能力、控制流和下游消费合同仍然成立。再结合 latency、cost、Flex 和 Batch 指南，一个成熟系统通常会把推理拆成 interactive、premium reasoning 和 async/offline 三层，让不同 SLA 的任务走不同执行层，而不是把所有压力都塞进同一条交互链路。

# 必答点

1. 先讲 capability gating 和 contract gating
2. 明确指出 feature compatibility、context window 和 rate limit 都属于硬边界
3. 说明 Responses 与 Chat Completions 不是完全等价的 model shape
4. 说明 graceful degradation 的本质是 contract-compatible degradation
5. 说明 Flex 和 Batch 更像异步层，不是交互兜底

# 常见误答

1. 只按“大模型/小模型”做二元划分
2. 不检查结构化输出、工具能力和上下游合同兼容性
3. 把 provider 混用和 shape 混用当成同一件事
4. 降级后不验证 schema、tool 和 tracing 语义是否还成立
5. 把离线执行层误当成交互路径补救手段