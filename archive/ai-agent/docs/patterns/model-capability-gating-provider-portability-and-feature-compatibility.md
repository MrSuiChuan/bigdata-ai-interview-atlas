---
kb_id: ai-agent/patterns/model-capability-gating-provider-portability-and-feature-compatibility
title: "Model Capability Gating / Provider Portability / Feature Compatibility：模型路由不能只看贵不贵，还要先看能不能做"
domain: ai-agent
component: agent-patterns
topic: model-capability-gating-provider-portability-feature-compatibility
difficulty: advanced
status: reviewed
sidebar_position: 46
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
tags:
  - ai-agent
  - models
  - routing
  - compatibility
  - providers
---

# 一句话结论

模型选择最常见的误区，是把它理解成“在质量、时延、成本之间三选一”。真正成熟的 agent 路由，第一步不是挑便宜或挑强，而是先做 capability gating，确认这个模型和这个 model shape 到底支不支持你这条工作流需要的特性。

# 为什么这题很容易答浅

很多人一讲 model selection，就会说：

1. 复杂任务用大模型
2. 简单任务用小模型
3. 预算紧张时做降级

这套回答还不够，因为它隐含了一个危险前提：所有模型都只是“能力强弱不同”，但接口形态和特性集大体一样。

官方文档其实清楚说明，模型差异不止在质量上，还体现在：

1. 支持哪些 endpoint
2. 支持哪些功能
3. 上下文窗口多大
4. 最大输出多少
5. rate limit 和价格如何
6. 在 SDK 里走哪种 model shape

所以这题真正考的是：你有没有把模型路由理解成“先验证能不能做，再优化做得值不值”。

# 为什么 capability gating 先于 cost routing

OpenAI 的 models 和 compare-models 页面给出的信息远不只是“哪个模型更强”。它们明确暴露了每个模型的：

1. 支持 endpoint
2. feature support
3. context window
4. max output tokens
5. knowledge cutoff
6. pricing
7. rate limits

这意味着同一个任务是否能成功，不一定先取决于“模型聪不聪明”，而可能先取决于：

1. 上下文能不能塞下
2. 输出上限够不够
3. 所需功能支不支持
4. 当前限流能不能承受

所以成熟系统的顺序通常是：

1. capability gating
2. compatibility gating
3. 质量/时延/成本优化

而不是一上来就按价格档位切模型。

# 为什么 model shape 不只是 SDK 细节

OpenAI Agents SDK 文档明确支持两种开箱即用的 OpenAI 模型接入路径：

1. 推荐的 `OpenAIResponsesModel`
2. 较旧的 `OpenAIChatCompletionsModel`

同时文档也明确建议：OpenAI-only 的应用，优先用默认 provider 和字符串模型名，走 Responses 这条主路径。

这件事特别关键，因为很多团队会把“Responses”和“Chat Completions”当成底层传输差异，但官方已经提醒：

1. 它们支持的 features 不完全一样
2. 工具能力面也不完全一样

所以 model shape 不是实现细节，而是功能合同的一部分。

# 为什么混用模型不等于混用 model shape

Agents SDK 文档还说明：

1. 你可以通过 `Agent.model`
2. 或 `RunConfig(model_provider=...)`
3. 或直接实现 `Model`

来在同一工作流里混用不同模型或 provider。文档甚至明确给出典型思路：便宜快的模型做 triage，强一点的模型做难题。

这说明“混用模型”本身是被鼓励的。但同一份文档也强调：

1. 最好在一个 workflow 里尽量保持单一 model shape
2. 因为 Responses shape 和 Chat Completions shape 的 feature/tool support 不完全相同
3. 如果硬要混，必须确保所有需要的 feature 在两边都可用

这背后的原理是：

你可以混能力等级，但不能忽略接口合同差异。

# 为什么默认模型也是治理问题

Agents SDK 还有一个非常容易被忽视的点：如果 agent 没有显式指定 model，它会落到默认模型；而这个默认模型既可以全局通过 `OPENAI_DEFAULT_MODEL` 控，也可以在某次 run 用 `RunConfig(model=...)` 覆盖。

文档当前还明确写了：

1. 出于兼容性和低时延考虑，默认是 `gpt-4.1`
2. 如果你可用并追求更高质量，推荐 `gpt-5.5`

这说明默认模型从来不是“随便留空”的小细节，而是治理问题。因为一旦默认值变化，就可能出现：

1. 行为漂移
2. 成本漂移
3. 特性支持漂移

所以成熟系统会把 default model 当成配置治理的一部分，而不是隐式常量。

# 为什么官方推荐模型名也不是永恒真理

OpenAI models guide 当前推荐：

1. 复杂推理和编码先从 `gpt-5.5` 开始
2. 更低时延和成本可用 `gpt-5.4-mini`
3. 更轻量可用 `gpt-5.4-nano`

这说明“先选哪一个模型”本身是时点相关的官方建议，而不是架构常量。真正稳的系统做法不是把某个模型名写死在逻辑里，而是把它放到：

1. capability matrix
2. policy config
3. routing rules

中统一治理。

# 一个成熟的模型路由至少要过五道门

如果要把这题答到原理层，至少要把下面五道门说出来：

1. feature gate：这个模型和 shape 是否支持当前工作流需要的能力
2. contract gate：context window、max output、rate limit 是否满足
3. governance gate：默认模型、覆盖规则、provider 选择是否可控
4. specialization gate：是否需要小模型做 triage、大模型做 hard cases
5. portability gate：如果混 provider 或 mixed shapes，会不会产生合同漂移

这五道门里，前两道通常比“贵不贵”更关键。

# 标准面试答案

模型路由不能只看成本和质量，因为模型差异首先体现在能力合同上。OpenAI 的 models 和 compare-models 页面明确展示了每个模型支持的 endpoints、features、context window、max output、knowledge cutoff、pricing 和 rate limits，这意味着路由前必须先做 capability gating，确认当前任务所需的上下文长度、输出长度、功能支持和吞吐约束是否满足，而不是只按“大模型/小模型”二分。OpenAI Agents SDK 进一步把这个问题放大到了 model shape 层面：官方推荐 OpenAI-only 应用优先使用字符串模型名和默认 provider，走 `OpenAIResponsesModel` 这条主路径，同时也支持较旧的 `OpenAIChatCompletionsModel`。文档还明确建议尽量在单一 workflow 中保持同一 model shape，因为 Responses 和 Chat Completions 支持的 features 和 tools 不完全一致；如果混用，就要确认所有需要的能力在两边都存在。与此同时，SDK 也支持在同一工作流中通过 `Agent.model`、`RunConfig(model_provider=...)` 或直接实现 `Model` 来混用模型和 provider，这适合让快而便宜的模型做 triage，让更强的模型处理复杂子任务。默认模型层面，未显式指定时会走默认模型，文档当前说明默认值为兼顾兼容性和低时延的 `gpt-4.1`，同时推荐在可用时优先用 `gpt-5.5` 获取更高质量，这说明 default model 本身也必须纳入治理。真正成熟的模型路由顺序应该是：先做 capability 和 contract gating，再做成本与时延优化，最后再谈多模型专业化。

# 常见误答

1. 只按“大模型/小模型”划分路由
2. 忽略 feature support、context window、max output 等硬边界
3. 把 Responses 和 Chat Completions 当成完全等价的 shape
4. 混 provider 或混 shape 时不检查功能合同
5. 把默认模型当成无关紧要的隐式设置

# 相关样例

1. `examples/python/ai-agent/model_capability_gating_outline.py`
