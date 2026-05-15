---
kb_id: ai-agent/patterns/structured-outputs-refusals-required-fields-and-schema-subset-boundaries
title: "Structured Outputs / Refusal / Schema Subset 边界：最容易答错的不是 JSON，而是哪些情况根本不在 contract 里"
domain: ai-agent
component: agent-patterns
topic: structured-outputs-refusal-required-fields-schema-subset-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 54
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-structured-outputs-guide
claim_ids:
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
  - refusal
  - json-schema
  - schema-subset
---

# 一句话结论

Structured Outputs 真正难的不是“让模型吐 JSON”，而是你必须清楚哪些情况属于 schema 内成功路径，哪些情况是 refusal、incomplete 或 unsupported schema 这种明确的 contract 外路径。

# 为什么这题很容易答浅

很多人一讲 Structured Outputs，就会回答：

1. 给模型一个 schema
2. 返回结构化 JSON
3. 然后就可以安全解析

这套说法最大的问题是把 Structured Outputs 误解成“JSON 解析增强版”，却没有看到它其实是一个严格受限的 contract system。

真正的高频坑至少包括：

1. refusal 会不会满足 schema
2. max tokens 截断后会不会仍然满足 schema
3. schema 能不能随便用任意 JSON Schema 特性
4. optional 字段怎么表达
5. 多余字段怎么处理
6. schema 太大、太深、枚举太多会发生什么

面试里如果这些边界说不清，通常说明对 Structured Outputs 的理解还停留在“好 parse 一点”。

# Refusal 和 Incomplete 都不是“坏的 schema match”，而是 contract 外路径

OpenAI Structured Outputs guide 明确提醒：

1. 即使开启 Structured Outputs
2. refusal 仍然可能发生
3. 如果达到 max tokens 等限制，响应也可能 incomplete
4. 这两种情况都可能不满足你给定的 JSON schema

这个点极其关键，因为它说明 Structured Outputs 不是“只要开了 strict 就不会出边界分支”，而是：

1. 正常成功路径：返回满足 schema 的结果
2. 拒答路径：模型因为安全原因 refusal
3. 不完整路径：输出被截断或未完成

所以成熟系统不会写成“拿到响应就直接反序列化”，而会先判断：

1. 是不是 refusal
2. 是否 incomplete
3. 只有在成功路径下，才把它当成 schema-adherent output

# Root Schema 不是任意 JSON Schema，顶层必须是 object，且不能是 `anyOf`

这是另一个特别高频的误答点。

官方文档明确写了：

1. root level object 必须是 object
2. 顶层不能使用 `anyOf`
3. 但嵌套层的 `anyOf` 可以存在
4. 前提是每个嵌套 schema 也都落在受支持子集里

这对很多从 Zod 或类型系统自动生成 schema 的工程非常重要，因为一类常见模式是：

1. 直接用 discriminated union
2. 结果在根级生成 `anyOf`
3. 以为这只是 JSON Schema 的一种正常写法
4. 实际上在 Structured Outputs strict 模式下直接不成立

所以这题讲到原理层，不能只说“schema 要规范”，而要明确指出：

Structured Outputs 接受的是一个受限子集，不是通用 JSON Schema 全集。

# “可选字段”不是随便省略，而是必须显式建模

OpenAI 文档对 required field 的要求写得非常硬：

1. 所有字段都必须放在 `required`
2. 函数参数也一样
3. 如果想表达 optional
4. 应该用包含 `null` 的 union 去模拟

这意味着在 Structured Outputs 语义里：

1. “字段可能不存在”不是首选表达
2. 更推荐“字段一定存在，但值可能是 null”

这跟很多普通 JSON API 的思路是不同的。

面试官如果问“Structured Outputs 下 optional field 怎么建模”，最强回答不是“有些字段不填就行”，而是：

所有字段都必须 required，optional 应当用 `type: ["string", "null"]` 这类 union with null 来表达。

# `additionalProperties: false` 不是建议，而是进入 strict contract 的门票

文档明确说明：

1. 每个 object 都必须设置 `additionalProperties: false`
2. 因为 Structured Outputs 只支持生成 schema 里明确声明的 key/value
3. 不设置这个字段，就不算进入官方要求的 strict object contract

这层约束非常重要，因为它意味着：

1. 你不能把“可能出现的额外字段”留给模型自由发挥
2. 下游也不应该依赖“多返回几个字段无所谓”

所以 Structured Outputs 的 object 设计逻辑是：

1. 先枚举清楚允许的字段
2. 再显式禁止未声明字段
3. 最后由系统保证输出只落在这个闭集里

# Schema 大小和复杂度有明确上限，超过就不是“效果差”，而是 schema 本身不成立

这也是很容易被忽略的地方。

官方文档给了明确上限：

1. 总 object properties 最多 5000 个
2. 最多 10 层嵌套
3. 所有 property 名、definition 名、enum 值、const 值的总字符串长度不能超过 120000
4. 全部 enum value 总数最多 1000
5. 单个 string enum 如果超过 250 个值，总枚举字符串长度不能超过 15000

这说明 schema 复杂度不是“写得再大一点模型也许还能凑合”，而是平台有明确 contract boundary。

如果你的系统把一个巨大的业务对象、几十个状态机分支、海量枚举一起塞进一个 Structured Outputs schema，问题不只是模型更难生成，而是你已经撞到了 schema subset 的硬边界。

# Unsupported Schema 不会被悄悄降级，而会直接报错

文档里还有一条非常关键：

1. 如果你开启 `strict: true`
2. 但传入了不受支持的 JSON Schema
3. API 会直接报错

并且官方还列出了一批当前不支持的关键词，例如：

1. `allOf`
2. `not`
3. `dependentRequired`
4. `dependentSchemas`
5. `if` / `then` / `else`

以及 fine-tuned models 额外不支持的一些关键词。

这说明 Structured Outputs 不是“尽量遵守 schema”，而是在 strict 模式下把 schema 本身也纳入了验证边界。

# 还有两个很容易忽略、但工程上很实用的细节

官方文档还给了两条非常值得面试里补出来的细节：

1. 输出 key 的顺序会按照 schema key 顺序生成
2. fine-tuned model 第一次见到某个 schema 会有额外延迟，之后同 schema 不再有这部分开销；其他模型没有这项限制

第一条说明 Structured Outputs 不只是类型约束，连结果形状的展示顺序都更可预测，这对 UI 渲染、审计比对和稳定序列化都很有价值。

第二条说明 schema 不是完全零成本的，尤其在 fine-tuned 模型上，schema 处理本身就是运行时开销的一部分。

# 面试里怎么把 Structured Outputs 讲到原理层

一个比较完整的结构通常是：

1. 先说明 Structured Outputs 保证的是 schema adherence，不是所有情况下都能给出 schema match
2. 再指出 refusal 和 incomplete 是 contract 外路径
3. 然后讲 root object、required fields、`additionalProperties: false` 这三条基础形状约束
4. 再补 schema 大小、嵌套、enum 和 unsupported keyword 的硬边界
5. 最后说明 key ordering 与首请求 schema latency 这些工程细节

这样回答，就不是“我知道可以返回 JSON”，而是在讲一个可验证、可限制、可预估开销的结构化输出系统。

# 标准面试答案

Structured Outputs 的本质不是让模型更容易吐 JSON，而是把输出限制在一个官方明确支持的 schema 子集里，因此真正要讲清楚的是 contract 内外边界。OpenAI 的 Structured Outputs guide 明确提醒，即使开启 strict structured outputs，应用仍然必须处理 refusal 和 incomplete 两类路径，因为安全拒答或 max tokens 截断都可能导致响应不满足给定 schema；也就是说，schema match 只是成功路径，refusal 与 incomplete 都是 contract 外状态。再往下，schema 本身也不是任意 JSON Schema：根对象必须是 object，顶层不能是 `anyOf`；所有字段或函数参数都必须是 `required`，如果想表达 optional，应该用带 `null` 的 union；每个 object 都必须设置 `additionalProperties: false`，因为该特性只支持生成 schema 里显式声明的键。复杂度方面，文档还规定 schema 最多 5000 个 object properties、最多 10 层嵌套、总字符串大小不超过 120000 字符、总 enum 值不超过 1000，而且大 enum 还有单属性长度上限；如果在 `strict: true` 下用了不支持的 JSON Schema 特性，API 会直接报错，而不是静默降级。最后，Structured Outputs 还保留 schema key 顺序，同时 fine-tuned models 第一次见到某个 schema 会有额外延迟。因此成熟回答必须同时讲成功路径、拒答路径、schema 子集约束和复杂度边界，而不是把它简化成“模型会返回合法 JSON”。

# 常见误答

1. 认为开了 Structured Outputs 就不会再遇到 refusal 或 incomplete
2. 把顶层 `anyOf` 当成普通 JSON Schema 用法直接搬过来
3. 以为 optional 字段可以直接不写 `required`
4. 忘记给每个 object 设 `additionalProperties: false`
5. 认为 unsupported schema 只是效果变差，不会真正报错

# 相关样例

1. `examples/python/ai-agent/structured_output_subset_outline.py`
