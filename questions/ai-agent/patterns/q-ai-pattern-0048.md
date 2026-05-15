---
id: q-ai-pattern-0048
title: 为什么 Agent 配置必须被当成运行合同，而不是初始化参数表
domain: ai-agent
component: agent-patterns
topic: agent-configuration-contracts-dynamic-instructions-output-types-tool-loop-control
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-agent-ref
claim_ids:
  - pattern-claim-0236
  - pattern-claim-0237
  - pattern-claim-0238
  - pattern-claim-0239
  - pattern-claim-0240
  - pattern-claim-0241
related_docs:
  - ai-agent/patterns/agent-configuration-contracts-dynamic-instructions-output-types-and-tool-loop-control
estimated_minutes: 12
---

# 题目

为什么 Agent 配置必须被当成运行合同，而不是初始化参数表？

# 一句话结论

因为 `instructions`、`prompt`、`output_type`、`tool_use_behavior`、`reset_tool_choice` 这些配置会直接改变指令权威、输出合同、工具循环和配置复用语义，不只是初始化时填几个字段。

# 核心机制

1. `instructions` 和 `prompt` 决定行为合同与配置权威
2. `output_type` 决定系统接受什么 final output
3. `tool_use_behavior`、`reset_tool_choice`、`clone` 决定运行与复用边界

# 标准答案

Agent 配置必须被当成运行合同，因为它直接影响 agent 的行为和控制流。OpenAI Agents SDK 明确说 `instructions` 就是 system prompt，但它既可以是字符串，也可以是基于 run context 和 agent 实例动态生成的 callable，因此它不只是静态文案，而是角色和情境的绑定规则。`prompt` 字段还允许把 instructions、tools 和其它配置外置化，但只适用于 OpenAI Responses API 路径，这说明配置权威和 provider portability 之间存在绑定。输出层面，`output_type` 默认是 `str`，但通常可以用 dataclass、Pydantic model 或 TypedDict；如果要非 strict schema 或自定义 schema，则必须显式改用 `AgentOutputSchema` 或 `AgentOutputSchemaBase`，说明 `output_type` 定义的是 final output 合同。工具层面，`tool_use_behavior` 可以选择让 LLM 继续收尾、在第一个工具后停止，或交给自定义逻辑，但它只作用于 FunctionTools，hosted tools 仍由 LLM 处理；`reset_tool_choice=True` 默认开启，则是在防止工具调用后进入重复循环。最后，`Agent.clone()` 只是浅拷贝配置基线，共享对象仍可能继续被复用，因此 clone 不是完全隔离的新实例。真正成熟的理解，是把这些字段看成 agent runtime contract 的组成部分，而不是初始化时随手填的配置项。

# 必答点

1. 说明 `instructions` 可以是动态 callable
2. 说明 `prompt` 外置配置会引入 provider 绑定
3. 说明 `output_type` 是输出合同，不是展示格式
4. 说明 `tool_use_behavior`、`reset_tool_choice`、`clone` 会改变运行语义

# 常见误答

1. 把 agent 配置简化成 system prompt 和工具列表
2. 不区分 provider-independent config 和 Responses-only config
3. 把 `output_type` 当成解析小细节
4. 误以为 clone 一定完全隔离
