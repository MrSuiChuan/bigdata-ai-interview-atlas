---
kb_id: ai-agent/patterns/tool-schema-strict-json-schema-and-argument-surface-minimization
title: "Tool Schema / Strict JSON Schema / Argument Surface Minimization：工具是否好用，先看暴露给模型的参数面是不是干净"
domain: ai-agent
component: agent-patterns
topic: tool-schema-strict-json-schema-argument-surface-minimization
difficulty: advanced
status: reviewed
sidebar_position: 42
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
tags:
  - ai-agent
  - tools
  - schema
  - strict-json-schema
  - contracts
---

# 一句话结论

Tool 调用是否稳定，往往不是模型“聪不聪明”的问题，而是你给它的参数面是不是一个干净、严格、没有混入运行时杂质的可执行契约。

# 为什么这题很容易答浅

很多人一讲 tool schema，就会说：

1. 给工具写参数说明
2. 定义一下 JSON Schema
3. 模型按 schema 生成参数

这类回答的问题在于，它把 schema 当成“文档”而不是“执行合同”。真正成熟的系统关心的不是“写没写描述”，而是：

1. schema 能不能和真实调用语义一一对应
2. 模型看见的参数里有没有混入不该看见的运行时参数
3. schema 是不是足够 strict，能减少歧义输入
4. 验证后的数据如何稳定还原成 Python 函数真实调用形式

如果这几层不讲，面试答案就还停留在“工具有参数”这个水平。

# 为什么 tool schema 本质上是执行合同

OpenAI Agents SDK 的 `FuncSchema` 不是一份静态 JSON 描述而已。它同时保存：

1. 参数的 Pydantic model
2. 从 model 导出的 JSON schema
3. 把验证结果还原成 `(args, kwargs)` 的调用逻辑

这说明 schema 不是写给人看的备注，而是把“模型生成参数”连接到“真实 Python 函数被调用”这一步的中间合同。真正的关键在于：

1. 模型生成的是 schema-compatible data
2. 运行时验证的是 model-level contract
3. 执行时落地的是 Python call semantics

所以如果面试官问“为什么 tool schema 不能只靠 prompt 约定”，一个很强的回答就是：

因为工具调用最终不是语言任务，而是结构化数据到真实函数调用的映射问题，必须有可验证、可执行、可还原的合同层。

# 为什么 strict JSON Schema 不是锦上添花，而是稳定性前提

OpenAI Agents SDK 文档明确说 `strict_json_schema=True` 是默认值，而且强烈推荐，因为它会提高生成正确 JSON 输入的概率。`ensure_strict_json_schema()` 还会把 schema 调整成 OpenAI API 期望的 strict 标准。

这件事非常重要，因为 tool 调用失败很多时候不是“模型完全不会做”，而是：

1. schema 边界太松
2. 可选性和结构歧义太多
3. 运行时再靠修补逻辑兜底

一旦 schema 不 strict，常见后果就是：

1. 模型填出模棱两可的结构
2. 本地验证通过方式和远端理解方式不一致
3. 工具层被迫承担大量 repair 工作

所以 strict schema 的价值，不只是“更规范”，而是把错误尽量前移到结构层，而不是事后修参数。

# 为什么参数面最怕混进运行时上下文

OpenAI Agents SDK 还明确规定：如果工具函数要拿 `RunContextWrapper`，它必须是第一个参数，而且不会暴露到模型可见的 schema 里；如果 `RunContextWrapper` 或 `ToolContext` 出现在非首参数位置，还会直接抛 `UserError`。

这背后的原理特别值得面试里讲清楚：

1. 模型可见参数和运行时可见参数必须分层
2. 模型不该决定运行时 context 的注入方式
3. 隐藏参数如果散落在 schema 里，会把合同边界搞乱

换句话说，工具设计里有两条不同的输入通道：

1. model-visible arguments：模型可以决定和填写
2. runtime-only context：系统注入、模型不应控制

如果这两条通道不隔离，最后最容易出现权限穿透和参数污染。

# 为什么 docstring 质量会直接影响工具调用质量

`function_schema()` 支持自动识别 docstring 风格，并提取函数描述和参数描述；同时也允许显式覆写 name 和 description。

这说明 tool schema 的“语义层”并不是无关紧要。因为对模型来说：

1. JSON Schema 解决结构约束
2. description 解决语义判别

很多工具误调用并不是结构错，而是模型没分清什么时候该用这个工具、某个参数到底表达什么。成熟系统通常会把：

1. 参数命名
2. 函数描述
3. 参数描述

一起视为 tool contract 的组成部分，而不是“可写可不写”的注释。

# 为什么“验证通过”还不等于“调用语义正确”

`FuncSchema.to_call_args()` 的另一个高价值点是：它会按 Python 原生规则把验证后的数据恢复成调用参数，包括：

1. 普通 positional args
2. `*args`
3. `**kwargs`
4. `*args` 之后的 keyword-only parameters

这一步很关键，因为很多系统只关注“JSON 长什么样”，却没继续追问：

1. 这个 JSON 最后如何落到真实函数签名
2. 变长参数和 keyword-only 参数是否被正确保真
3. schema 语义和实际调用语义有没有错位

如果 schema 看起来很漂亮，但最后还原出来的 `(args, kwargs)` 和真实函数期待的不一致，那么整个工具链仍然是不可靠的。

# 一个成熟的工具契约设计至少要守住五层边界

如果要把这题答到原理层，至少要把这五层讲出来：

1. 结构边界：输入是否由 strict schema 严格约束
2. 语义边界：描述、参数含义、命名是否足够清楚
3. 权限边界：运行时 context 是否被隔离在模型可见参数之外
4. 还原边界：验证结果能否稳定映射成真实函数调用
5. 维护边界：schema 变更是否会改变模型行为和工具兼容性

这五层一旦缺一层，tool calling 就会从“结构化调用”退化成“猜测式调用”。

# 标准面试答案

Tool schema 的本质不是参数文档，而是模型输出到真实函数调用之间的执行合同。OpenAI Agents SDK 的 `FuncSchema` 同时维护参数的 Pydantic model、从该 model 导出的 JSON schema，以及把验证后数据还原成 `(args, kwargs)` 的逻辑，这说明工具调用不是只靠 prompt 提示，而是靠结构化合同把“模型生成参数”和“Python 函数真实执行”连接起来。进一步，官方文档明确指出 `strict_json_schema=True` 是默认且强烈推荐的，因为 strict schema 能提升模型生成正确 JSON 输入的概率，而 `ensure_strict_json_schema()` 会把 schema 调整为 OpenAI API 期望的严格标准，这本质上是在前移错误边界。与此同时，运行时 context 和模型可见参数必须严格分层：`RunContextWrapper` 可以作为工具参数存在，但必须放在首参数位置，而且不会暴露给模型；如果出现在非首位，SDK 会直接报错，这说明运行时注入和模型决策是两条不同输入通道。再加上 `function_schema()` 能从 docstring 中抽取函数描述和参数描述，以及 `to_call_args()` 会按照 Python 调用语义恢复位置参数、`*args`、`**kwargs` 和 keyword-only 参数，成熟的工具契约设计必须同时保证结构严格、语义清楚、上下文隔离和调用语义保真，而不是只写一份看起来像 JSON Schema 的说明文档。

# 常见误答

1. 把 schema 当成注释或对模型的提示词补充
2. 认为 strict schema 只是风格问题，不影响稳定性
3. 把运行时 context 和模型可见参数混在一起
4. 只关注验证是否通过，不关注最终 `(args, kwargs)` 是否正确
5. 认为 docstring 和参数描述对 tool calling 没什么实际影响

# 相关样例

1. `examples/python/ai-agent/tool_schema_strictness_outline.py`
