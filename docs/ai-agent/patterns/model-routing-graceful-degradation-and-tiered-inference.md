---
kb_id: ai-agent/patterns/model-routing-graceful-degradation-and-tiered-inference
title: Model Routing / Capability Gating / Graceful Degradation / Tiered Inference：先判断能不能做，再判断值不值得做
domain: ai-agent
component: agent-patterns
topic: model-routing-capability-gating-graceful-degradation
difficulty: advanced
status: reviewed
sidebar_position: 30
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
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
tags:
  - ai-agent
  - model-routing
  - capability-gating
  - degradation
  - tiered-inference
  - optimization
---
## 一句话结论

Model Routing / Capability Gating / Graceful Degradation / Tiered Inference：先判断能不能做，再判断值不值得做需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人讲 model routing，会直接落到三句话：

1. 难题用更强模型
2. 简单题用更便宜模型
3. 超时了就降级

这不算错，但还没有进入工程原理层，因为真正的生产问题通常是下面这些：

1. 当前任务需要的到底是更强推理，还是更长上下文、结构化输出、工具能力
2. 降级之后，下游还能不能继续消费同一个输出契约
3. 不同 provider、不同 model、不同 model shape 之间能否互换
4. 实时交互链路和异步离线链路是不是根本就不该共享同一推理层

所以这个主题真正考的不是“你会不会挑模型”，而是“你是否把模型路由理解成带约束的推理分层系统”。

## Capability Gating 为什么先于 Cost Routing

OpenAI 的 models guide 和 compare-models guide 给出的关键信息，不是单纯告诉你哪个模型更强，而是明确暴露了模型之间在下面这些维度上的差异：

1. 支持哪些 features
2. 上下文窗口有多大
3. 最大输出上限有多高
4. rate limits 和价格怎样
5. 哪些场景更适合旗舰模型，哪些场景适合更小模型

这意味着模型路由的第一问永远不是“贵不贵”，而是“能不能做”。

一个成熟的 router 至少要先做两层判断：

1. capability gating：结构化输出、工具调用、长上下文、多模态等能力是否满足
2. contract gating：context window、max output、rate limit、吞吐预算是否满足

只有在这两层都通过之后，质量和成本排序才有意义。因为一个模型即便再便宜，只要缺失关键特性，或者吞吐根本扛不住当前流量，它就不是候选项。

## 为什么 model shape 是工作流合同的一部分

OpenAI Agents SDK 明确区分了 `OpenAIResponsesModel` 和 `OpenAIChatCompletionsModel` 这两类 model shape，并且明确提醒它们支持的 features 和 tools 并不完全相同。

这件事非常关键，因为很多团队会误以为：

1. 只要模型名字能换，工作流就能无感切换
2. Responses 和 Chat Completions 只是底层接口写法不同
3. fallback 只是把请求转发到另一个 endpoint

但从 SDK 文档能直接得出的工程结论是：

1. model shape 不只是 SDK 细节，而是功能合同的一部分
2. 一条 workflow 最好尽量保持单一 model shape
3. 如果必须混用，就要显式核对你依赖的 tools、structured outputs 和运行时行为在两边是否都存在

所以成熟系统在做 fallback 或 provider portability 时，首先要问的不是“能不能换个模型名”，而是“换过去之后合同还在不在”。

## 混用模型、混用 Provider、混用 Shape 是三件不同的事

OpenAI Agents SDK 允许你在 agent 级、run 级或者 provider 级选择不同模型，这说明“多模型系统”本身是官方支持的设计方向。但这里面至少有三层边界必须拆开：

1. 混用不同能力等级的模型
2. 混用不同 provider
3. 混用不同 model shape

这三件事的风险完全不同。

第一层通常是在做任务分工，比如：

1. 小模型做 classification、triage、rewrite
2. 强模型做 hard cases、复杂推理、关键生成

第二层涉及 provider portability，问题会变成：

1. 特性是否一致
2. rate limit 和延迟模型是否一致
3. 错误语义和监控语义是否一致

第三层最危险，因为它直接触碰 workflow contract：

1. tool 接口是否一致
2. structured outputs 是否仍成立
3. tracing、guardrails、结果解析链路是否仍兼容

所以成熟系统允许“混模型”，但不会默认“混 shape 也没问题”。

## Default Model 和 Override Policy 为什么属于治理问题

Agents SDK 文档说明了默认模型和 run 级覆盖策略的存在，这意味着默认模型从来都不是一个无关紧要的空白配置。

如果默认模型没有被当成治理对象，常见后果是：

1. 模型升级后行为漂移，但业务方并不知道为什么
2. token 成本突然变化，却没有被纳入预算治理
3. 某个 feature 在默认模型里不可用，结果只有部分流量失败

所以成熟系统通常会把模型选择拆成三层：

1. default model：作为全局保底配置
2. workflow override：针对特定链路的显式覆盖
3. step-level routing：只在真正必要的步骤做更细粒度分流

这套结构的关键价值是让默认值可审计、覆盖规则可解释、变化影响可回溯。

## Graceful Degradation 为什么首先是 Contract-Compatible Degradation

很多团队把 graceful degradation 理解成“主模型失败了，就换个便宜模型继续跑”。这通常太粗糙。

真正成熟的 degradation 设计，核心不是“还能不能给出一个答案”，而是“降级后这个工作流还能不能以可接受的合同继续运行”。

也就是说，降级策略首先要保护的是下面这些不变量：

1. 输出 schema 仍然成立
2. 关键工具边界仍然成立
3. 控制流仍然可解释
4. 下游消费方仍然知道当前拿到的是哪一层服务

典型的正确降级方式包括：

1. 保留结构化输出，但降低解释粒度
2. 保留检索和证据返回，但减少多跳推理深度
3. 在线链路只给摘要，重分析任务转移到异步层
4. 工具能力不可用时，退回只读建议或人工审批路径

所以 graceful degradation 本质上是在降 service level，而不是随便换一个更便宜模型碰碰运气。

## Tiered Inference 为什么要把 Interactive、Premium、Async 分层

OpenAI 的 latency 和 cost optimization 指南反复强调两件事：

1. 更小的模型通常更快、更便宜
2. 降低请求次数和 token 数，对时延和成本都很关键

这说明大多数成熟系统天然应该做 tiered inference，而不是把所有请求都推到同一模型上。一个常见的三层结构是：

1. interactive tier：面向低时延交互，处理分类、路由、轻量生成、快速回复
2. premium reasoning tier：只为少量高价值步骤调用更强推理能力
3. async or offline tier：处理容忍延迟的批量分析、重计算、长文生成、后台汇总

这种分层的核心收益不是“显得架构复杂”，而是把不同 SLA 的任务放到不同推理层，让在线体验、推理质量和预算控制不再互相伤害。

## 为什么 Flex 和 Batch 不是交互式兜底

OpenAI 的 Flex processing 和 Batch guide 给出了非常明确的边界：

1. Flex 更低成本，但响应更慢，而且资源可能暂时不可用
2. Batch 适合异步处理，有独立速率池，成本更低，但完成窗口最长可到 24 小时

这说明它们更像执行层级，而不是交互式 fallback：

1. Flex 更适合低优先级、容忍波动的后台任务
2. Batch 更适合大量离线作业，而不是用户正在等待的对话回合

所以如果技术复盘官问“怎么做 tiered inference”，很强的一句回答是：

交互路径主要在实时层内路由，超出实时 SLA 的任务要直接下沉到异步层，而不是继续挤压在线路径。

## 一个成熟的模型路由器至少要过五道门

如果要把这个主题答到原理层，至少要把下面五道门讲出来：

1. feature gate：当前任务依赖的 feature 是否存在
2. contract gate：context、max output、rate limit、吞吐边界是否满足
3. governance gate：default model、override policy、provider 选择是否受控
4. specialization gate：哪些步骤值得上强推理，哪些步骤只需要轻量模型
5. degradation gate：失败或预算受限时，降级后工作流合同是否仍成立

这五道门一旦说清，技术复盘官会知道你讲的是一套 routing policy，而不是一句“强的做难题，弱的做简单题”。

## 机制解读

Model routing 的本质不是模型排行榜选型，而是带约束的推理分层。OpenAI 的 models guide 建议复杂推理和编码优先用旗舰模型，而追求时延和成本时可以考虑更小模型；compare-models guide 又明确显示模型之间在 features、context window、max output、pricing 和 rate limits 上都不相同，所以路由的第一步不是看价格，而是先做 capability gating 和 contract gating，确认这个模型到底能不能承接当前工作流。进入 agent 编排层后，OpenAI Agents SDK 允许按 agent、run 或 provider 混用模型，但同时明确提醒要检查 feature differences，并建议单条 workflow 尽量保持单一 model shape，因为 `OpenAIResponsesModel` 和 `OpenAIChatCompletionsModel` 支持的工具与功能并不完全一致。这说明 graceful degradation 不能简单理解成“失败后换个便宜模型”，而必须保证降级后输出 schema、工具边界和下游消费合同仍然成立。再结合 latency、cost、Flex 和 Batch 指南，一个成熟系统通常会把请求拆成 interactive、premium reasoning 和 async/offline 三个推理层，让不同 SLA 的任务落到不同执行层级。真正强的回答顺序应该是：先判能不能做，再判值不值得做，最后才谈怎么优雅降级。

## 易混边界

1. 只按“大模型和小模型”做二元划分
2. 先看成本，再看能力与合同边界
3. 把 Responses 和 Chat Completions 当成完全等价的 shape
4. 降级后不验证 schema、tools 和下游兼容性
5. 把 Flex 或 Batch 当成交互式路径的兜底

## 相关样例

1. `examples/python/ai-agent/model_routing_tiered_inference_outline.py`
