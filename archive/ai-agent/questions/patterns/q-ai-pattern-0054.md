---
id: q-ai-pattern-0054
title: 为什么 Structured Outputs 的难点不是 JSON，而是 refusal 与 schema subset 边界
domain: ai-agent
component: agent-patterns
topic: structured-outputs-refusal-required-fields-schema-subset-boundaries
question_type: principle
difficulty: advanced
status: reviewed
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
related_docs:
  - ai-agent/patterns/structured-outputs-refusals-required-fields-and-schema-subset-boundaries
estimated_minutes: 12
---

# 题目

为什么 Structured Outputs 的难点不是 JSON，而是 refusal 与 schema subset 边界？

# 一句话结论

因为 Structured Outputs 真正定义的是一个受限 schema contract，而 refusal、incomplete 和 unsupported schema 都是这个 contract 之外必须单独处理的边界路径。

# 核心机制

1. refusal 与 incomplete 可能不满足 schema
2. root object、required fields、`additionalProperties: false` 是硬约束
3. schema 大小、嵌套、enum 和 unsupported keyword 都有明确边界

# 标准答案

Structured Outputs 的难点不是 JSON，而是 refusal 与 schema subset 边界，因为 OpenAI 的 Structured Outputs guide 明确说明，即使开启 strict structured outputs，refusal 和 incomplete 仍然可能出现，并且这两种情况都可能不满足你给定的 JSON schema，所以 schema match 只是成功路径而不是唯一结果。再往下，Structured Outputs 接受的也不是任意 JSON Schema：根级必须是 object，顶层不能是 `anyOf`；所有字段和函数参数都必须列入 `required`，optional 需要通过包含 `null` 的 union 来表达；每个 object 都必须设置 `additionalProperties: false`。复杂度上，schema 最多 5000 个 object properties、10 层嵌套、总字符串长度不超过 120000、总 enum 值不超过 1000，而且大枚举还有单属性长度限制。如果在 `strict: true` 下用了不支持的 schema 特性，API 会直接报错，而不是静默降级；同时输出还会保留 schema key 顺序，fine-tuned models 第一次见到某个 schema 还会有额外延迟。因此这道题真正考的是 contract 内外路径、schema 子集和复杂度边界，而不是“模型会返回合法 JSON”。

# 必答点

1. 说明 refusal 与 incomplete 不是 schema 成功路径
2. 说明 root object、required、`additionalProperties: false` 这三条硬约束
3. 说明 schema subset 有大小和关键词限制
4. 说明 unsupported strict schema 会直接报错

# 常见误答

1. 认为开了 Structured Outputs 就不会再出现 contract 外路径
2. 把任意 JSON Schema 直接拿来用
3. 把 optional 字段理解成不写 `required`
4. 忽略 schema 的硬上限和 unsupported keyword
