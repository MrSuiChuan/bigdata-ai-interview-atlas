---
id: q-ai-pattern-0042
title: 为什么工具系统必须先做 Strict JSON Schema 和参数面最小化
domain: ai-agent
component: agent-patterns
topic: tool-schema-strict-json-schema-argument-surface-minimization
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-function-schema
  - openai-agents-sdk-strict-schema
claim_ids:
  - pattern-claim-0199
  - pattern-claim-0200
  - pattern-claim-0201
  - pattern-claim-0202
  - pattern-claim-0203
  - pattern-claim-0204
related_docs:
  - ai-agent/patterns/tool-schema-strict-json-schema-and-argument-surface-minimization
estimated_minutes: 10
---

# 题目

为什么工具系统必须先做 Strict JSON Schema 和参数面最小化？

# 一句话结论

因为 tool call 的本质不是“模型写一段参数文本”，而是“结构化合同把模型输出可靠地变成真实函数调用”，而 strict schema 和参数面最小化正是在保护这层合同。

# 核心机制

1. schema 是执行合同，不是注释
2. strict schema 用来前移结构性错误
3. runtime context 必须和 model-visible arguments 隔离

# 标准答案

工具系统必须先做 strict schema 和参数面最小化，因为 tool call 最终要落到真实函数调用上。OpenAI Agents SDK 的 `FuncSchema` 同时维护参数的 Pydantic model、JSON schema，以及把验证结果还原成 `(args, kwargs)` 的逻辑，这说明 schema 不是写给人看的文档，而是把“模型生成参数”和“函数真实执行”连接起来的执行合同。进一步，官方文档明确指出 `strict_json_schema=True` 是默认且强烈推荐的，因为这会提升生成正确 JSON 输入的概率，而 `ensure_strict_json_schema()` 会把 schema 调整为 OpenAI API 所期望的严格标准，避免宽松结构把错误拖到运行时。与此同时，运行时 context 不能混进模型可见参数里：`RunContextWrapper` 可以存在，但必须是首参数，并且不会暴露到 schema 中；如果出现在非首位，SDK 会直接报错。这说明工具输入天然分成模型可控参数和系统注入上下文两层。再加上 `function_schema()` 可从 docstring 提取语义描述，`to_call_args()` 会按照 Python 调用规则恢复位置参数、`*args`、`**kwargs` 和 keyword-only 参数，成熟的工具契约设计必须同时保证结构严格、语义清晰、参数面最小且调用语义保真。

# 必答点

1. 说明 schema 本质是执行合同
2. 说明 strict schema 的价值是减少结构歧义和修补成本
3. 说明 runtime context 必须从模型可见参数中隔离
4. 说明最终还要落到真实 Python 调用语义

# 常见误答

1. 把 schema 当成普通参数说明
2. 认为 strict 与否只是编码风格问题
3. 让模型看见不该控制的运行时参数
4. 只关心验证，不关心实际调用还原
