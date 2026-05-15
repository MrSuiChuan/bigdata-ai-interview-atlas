---
kb_id: ai-agent/patterns/structured-output-schema-contracts-and-validation-repair-loops
title: Structured Outputs / Schema Contracts / Refusals / Repair Loops：稳定的 Agent 契约不是 JSON，而是受限且可验证的 contract system
domain: ai-agent
component: agent-patterns
topic: structured-output-contracts-refusals-and-repair
difficulty: advanced
status: reviewed
sidebar_position: 27
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-structured-outputs-guide
  - openai-agents-sdk-agent-ref
  - openai-agents-sdk-results
  - openai-agents-sdk-function-schema
  - openai-agents-sdk-strict-schema
claim_ids:
  - pattern-claim-0113
  - pattern-claim-0114
  - pattern-claim-0115
  - pattern-claim-0116
  - pattern-claim-0117
  - pattern-claim-0118
  - pattern-claim-0275
  - pattern-claim-0276
  - pattern-claim-0277
  - pattern-claim-0278
  - pattern-claim-0279
  - pattern-claim-0280
  - pattern-claim-0281
  - pattern-claim-0282
tags:
  - ai-agent
  - structured-outputs
  - schema
  - refusal
  - validation
  - repair-loop
---
## 一句话结论

Structured Outputs / Schema Contracts / Refusals / Repair Loops：稳定的 Agent 契约不是 JSON，而是受限且可验证的 contract system需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲结构化输出，就会说：

1. 让模型返回 JSON
2. 解析失败就重试
3. 成功了就继续往下跑

这种回答太浅，因为它把问题理解成“文本怎么好解析”，而没有理解成“系统边界怎么稳定”。真正的核心问题其实是：

1. 下游是按自然语言猜字段，还是按契约消费字段
2. 如果 schema 漂了，错误会在入口被发现，还是会在后续步骤放大
3. 输出是“给人看”的，还是“给另一个 agent、工具或流程节点用”的
4. refusal、incomplete、unsupported schema 这种情况是否被当成独立边界处理
5. 当输出不满足 contract 时，系统是 repair、degrade，还是 fail fast

所以这个主题真正考的是接口设计和 contract boundary，而不是提示词技巧。

## JSON Mode 为什么不等于稳定契约

OpenAI 的 Structured Outputs guide 给了一条非常关键的边界：

1. Structured Outputs 解决的是“输出匹配给定 schema”
2. JSON mode 只解决“输出是合法 JSON”
3. JSON mode 不保证 schema adherence

这意味着下面这些问题在 JSON mode 下仍然可能出现：

1. 字段缺失
2. 字段类型不对
3. 枚举值漂移
4. 嵌套结构不符合预期
5. 业务约束根本没有满足

也就是说，JSON mode 只是“语法上能 parse”，并不等于“语义上可消费”。

## Structured Outputs 真正解决了什么

Structured Outputs 的价值，不是让输出更“规范”，而是把 LLM 输出从自由文本拉进 schema-driven interface。它带来几个本质变化：

1. 下游消费方不再靠 prompt 猜字段
2. 错误更容易在边界处暴露
3. 字段级约束可以前移，而不是在业务深处补救
4. refusal、空结果、部分字段缺失等情况更容易被系统化处理

所以它的本质价值是：

把模型输出从 loosely formatted text 提升成 machine-consumable contract。

## Refusal 和 Incomplete 都是 Contract 外路径

官方文档明确提醒：

1. 即使开启 Structured Outputs，refusal 仍然可能发生
2. 如果达到 max tokens 等限制，响应也可能 incomplete
3. 这两种情况都可能不满足你给定的 JSON schema

这个点极其关键，因为它说明 Structured Outputs 不是“只要开了 strict 就不会出边界分支”，而是：

1. 成功路径：返回满足 schema 的结果
2. 拒答路径：模型因为安全原因 refusal
3. 不完整路径：输出被截断或未完成

所以成熟系统不会写成“拿到响应就直接反序列化”，而会先判断是不是 refusal / incomplete，再决定能不能把它当成 schema-adherent output。

## 受支持的是 JSON Schema 子集，不是 JSON Schema 全集

这又是另一个特别高频的误答点。官方文档明确写了：

1. root level object 必须是 object
2. 顶层不能使用 `anyOf`
3. 但嵌套层的 `anyOf` 可以存在
4. 前提是每个嵌套 schema 也都落在受支持子集里

这对很多从类型系统自动生成 schema 的工程很重要，因为常见模式是：

1. 直接用 discriminated union
2. 结果在根级生成 `anyOf`
3. 以为这只是 JSON Schema 的一种正常写法
4. 实际上在 strict 模式下直接不成立

所以这个主题讲到原理层，不能只说“schema 要规范”，而要明确指出：Structured Outputs 接受的是一个受限子集，不是通用 JSON Schema 全集。

## Required Fields 和 `additionalProperties: false` 为什么是硬约束

OpenAI 文档对 required field 的要求写得非常硬：

1. 所有字段都必须放在 `required`
2. 函数参数也一样
3. 如果想表达 optional，应该用包含 `null` 的 union 去模拟

同时，每个 object 都必须设置 `additionalProperties: false`，因为 strict contract 只支持生成 schema 中显式声明的键。

这意味着 Structured Outputs 的 object 设计逻辑是：

1. 先枚举清楚允许的字段
2. 再显式禁止未声明字段
3. 如果想表达 optional，就显式建模为 “字段存在但值可为 `null`”

这和很多普通 JSON API“字段可能缺失也无所谓”的思路是不同的。

## Schema 大小和复杂度也有明确上限

官方文档给了明确边界：

1. 总 object properties 最多 5000 个
2. 最多 10 层嵌套
3. 所有 property 名、definition 名、enum 值、const 值总字符串长度不超过 120000
4. 全部 enum value 总数最多 1000
5. 单个 string enum 如果超过 250 个值，还有额外长度限制

这说明 schema 复杂度不是“写得再大一点模型也许还能凑合”，而是平台有明确 contract boundary。你把巨大业务对象、海量枚举和复杂状态机一次性塞进一个 schema，问题不只是模型更难生成，而是 schema 本身可能就不成立。

## Unsupported Strict Schema 不会静默降级

文档还给了一个很关键的边界：

1. 如果你开启 `strict: true`
2. 但传入了不受支持的 JSON Schema
3. API 会直接报错

并且官方列出了一批当前不支持的关键词，例如：

1. `allOf`
2. `not`
3. `dependentRequired`
4. `dependentSchemas`
5. `if` / `then` / `else`

这说明 Structured Outputs 不是“尽量遵守 schema”，而是在 strict 模式下把 schema 本身也纳入了验证边界。

## `output_type`、Strict Tool Schema 和 Result Surface 共同定义编排边界

OpenAI Agents SDK 的 agent reference 对这一点讲得很清楚：

1. 如果不传 `output_type`，默认输出是 `str`
2. 更推荐传入 dataclass、Pydantic model 或 TypedDict 等常规 Python 类型
3. 一旦提供 `output_type`，模型会按 structured outputs 方式产出结果

这说明 `output_type` 不只是 SDK 方便开发的小功能，而是在定义 agent 的对外契约是什么。与此同时，function schema reference 默认把 `strict_json_schema=True` 打开，并明确建议这样做，说明 tool parameter schema 和 final output schema 都应该被当成严格契约。

结果层面，results 文档又把 run 结果拆成：

1. `final_output`
2. `new_items`
3. `last_agent`
4. `raw_responses`
5. `to_state()`

这说明“结构化输出”不能只看最后一层字段，还要看整个 result surface 的可恢复性和可观测性。

## Validation-Repair Loop 什么时候仍然需要

看到 Structured Outputs 之后，有些人会误以为 repair loop 没用了。这也不对。validation-repair 仍然有典型场景：

1. 上游不是 strict structured outputs，只能拿到宽松 JSON 或文本
2. 需要兼容多个模型或 provider，输出契约强度不同
3. 业务约束比 JSON schema 更复杂，还需要二次校验
4. 某些字段可以自动修复，而不是直接整体失败
5. 希望区分 parse error、schema error、business rule error 三类问题

也就是说，repair loop 更像 contract boundary 后面的 secondary defense，而不是 primary contract 本身。

## 一个成熟的输出契约链路通常会分四层

如果想把这个主题答到原理层，一个很完整的结构通常是：

1. generation contract：优先用 strict structured outputs 或 `output_type` 约束生成边界
2. schema validation：校验字段、类型、枚举和嵌套结构
3. business validation：校验跨字段规则、权限、预算、状态机约束
4. repair or fail policy：决定哪些错误自动修复，哪些错误直接拒绝继续

这四层一讲出来，回答就从“返回 JSON”升级成了“输出契约体系”。

## 机制解读

在 agent 系统里，结构化输出的本质不是让文本更好解析，而是把模型输出定义成可被下游稳定消费的 schema contract。OpenAI 的 Structured Outputs guide 明确区分了 Structured Outputs 和 JSON mode：前者可靠匹配给定 schema，后者只保证合法 JSON，并不保证字段和类型符合预期；同时即使开启 strict structured outputs，应用仍然必须处理 refusal 和 incomplete 两类路径，因为安全拒答或 max tokens 截断都可能导致响应不满足给定 schema。再往下，Structured Outputs 接受的也不是任意 JSON Schema：根对象必须是 object，顶层不能是 `anyOf`；所有字段和函数参数都必须列入 `required`，optional 需要通过包含 `null` 的 union 来表达；每个 object 都必须设置 `additionalProperties: false`；如果在 `strict: true` 下用了不支持的 schema 特性，API 会直接报错，而不是静默降级。进一步看，OpenAI Agents SDK 的 `output_type` 默认是 `str`，但推荐使用 dataclass、Pydantic model 或 TypedDict，把 agent 边界显式类型化；tool 参数侧又默认开启 `strict_json_schema=True`，说明工具调用和最终输出都应该被当成严格契约；results 文档再往下补了一层：`final_output`、`new_items`、`raw_responses` 和 `to_state()` 是不同 result surface，其中 `final_output` 只有在最后一个 agent 定义了 `output_type` 时才是 typed object。真正成熟的系统，会先用 strict structured contract 稳定主边界，再把 validation-repair loop 作为 secondary defense，而不是反过来靠无限修补维持接口。

## 易混边界

1. 把 JSON mode 等同于 schema contract
2. 认为开了 Structured Outputs 就不会再遇到 refusal 或 incomplete
3. 以为 optional 字段可以直接不写 `required`
4. 不给 object 设置 `additionalProperties: false`
5. 把 repair loop 当成 strict contract 的替代品

## 相关样例

1. `examples/python/ai-agent/structured_output_contract_repair_loop_outline.py`
2. `examples/python/ai-agent/structured_output_subset_outline.py`
