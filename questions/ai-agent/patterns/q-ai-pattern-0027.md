---
id: q-ai-pattern-0027
title: 为什么说 JSON mode 不等于 Structured Outputs，也不等于稳定的 Agent 契约系统
domain: ai-agent
component: agent-patterns
topic: structured-output-contracts-refusals-and-repair
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/structured-output-schema-contracts-and-validation-repair-loops
estimated_minutes: 12
---

# 题目

为什么说 JSON mode 不等于 Structured Outputs，也不等于稳定的 Agent 契约系统？

# 一句话结论

因为 JSON mode 只保证“像 JSON”，Structured Outputs 才解决“符合 schema”，而稳定的 agent 契约系统还要求明确的 contract 内外边界、受支持的 schema 子集、typed boundary、严格 tool schema 和清晰的 result surface。

# 核心机制

1. json validity is weaker than schema adherence
2. refusal and incomplete are contract-external paths
3. structured outputs accept a constrained JSON Schema subset
4. typed output boundaries and strict tool schemas stabilize orchestration
5. validation and repair sit behind the primary contract

# 标准答案

在 agent 系统里，输出问题本质上不是“能不能 parse”，而是“下游能不能稳定消费”。OpenAI 的 Structured Outputs guide 明确说明，Structured Outputs 会让模型输出可靠匹配给定 schema，而 JSON mode 只保证合法 JSON，不保证字段、类型和嵌套结构都符合预期；同时即使开启 strict structured outputs，应用仍然必须处理 refusal 和 incomplete 两类路径，因为安全拒答或 max tokens 截断都可能导致响应不满足给定 schema。再往下，Structured Outputs 接受的也不是任意 JSON Schema：根对象必须是 object，顶层不能是 `anyOf`；所有字段和函数参数都必须列入 `required`，optional 需要通过包含 `null` 的 union 来表达；每个 object 都必须设置 `additionalProperties: false`；如果在 `strict: true` 下用了不支持的 schema 特性，API 会直接报错，而不是静默降级。进一步看，OpenAI Agents SDK 的 `output_type` 默认是 `str`，但推荐使用 dataclass、Pydantic model 或 TypedDict，把 agent 边界显式类型化；tool 参数侧又默认开启 `strict_json_schema=True`，说明工具调用和最终输出都应该被当成严格契约；results 文档再往下补了一层：`final_output`、`new_items`、`raw_responses` 和 `to_state()` 是不同 result surface，其中 `final_output` 只有在最后一个 agent 定义了 `output_type` 时才是 typed object。真正成熟的系统，会先用 strict structured contract 稳定主边界，再把 validation-repair loop 作为 secondary defense，而不是反过来靠无限修补维持接口。

# 必答点

1. 说清 JSON mode 和 schema adherence 的差别
2. 说明 refusal 与 incomplete 不是 schema 成功路径
3. 说明 root object、required、`additionalProperties: false` 这几条硬约束
4. 提到 `output_type` 是 agent 边界类型定义
5. 说明 repair loop 是补充层，不是主契约

# 常见误答

1. 返回 JSON 就算结构化输出
2. parse 成功就等于可消费
3. 把任意 JSON Schema 直接拿来做 strict schema
4. 认为重试修补可以替代严格契约
