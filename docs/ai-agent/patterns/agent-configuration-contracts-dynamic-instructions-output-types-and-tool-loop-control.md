---
kb_id: ai-agent/patterns/agent-configuration-contracts-dynamic-instructions-output-types-and-tool-loop-control
title: Agent Configuration Contracts / Dynamic Instructions / Output Types / Tool Loop Control：Agent 不是一堆参数，而是一份会影响运行语义的合同
domain: ai-agent
component: agent-patterns
topic: agent-configuration-contracts-dynamic-instructions-output-types-tool-loop-control
difficulty: advanced
status: reviewed
sidebar_position: 48
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-agents-sdk-agent-ref
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - langgraph-subgraphs-docs
  - autogen-teams-docs
claim_ids:
  - pattern-claim-0236
  - pattern-claim-0237
  - pattern-claim-0238
  - pattern-claim-0239
  - pattern-claim-0240
  - pattern-claim-0241
tags:
  - ai-agent
  - agent-config
  - output-type
  - tools
  - contracts
---
## 一句话结论

Agent Configuration Contracts / Dynamic Instructions / Output Types / Tool Loop Control：Agent 不是一堆参数，而是一份会影响运行语义的合同需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 agent 配置，就会说：

1. 写一段 system prompt
2. 指定要用哪个模型
3. 配一些工具

这类回答的问题在于，它把 agent configuration 理解成“模型前面的元数据”，而不是运行时合同。真正困难的地方在于：

1. 指令是谁定义的，是否能动态随 context 变化
2. 配置是 provider-agnostic，还是只在特定模型路径上可用
3. 输出类型是纯文本，还是结构化对象，还是自定义 schema
4. tool call 之后是继续让 LLM 收尾，还是直接把工具结果当最终输出
5. tool choice 是否会被重置，能否防止工具死循环

这些都不是“参数表”层面的问题，而是 agent 行为语义层面的问题。

## 为什么 instructions 不是静态 system prompt 那么简单

OpenAI Agents SDK 文档明确说，`instructions` 就是 agent 的 system prompt，但它既可以是一个字符串，也可以是一个 callable，根据 run context 和 agent 自身动态生成。

这说明 instruction contract 有两层：

1. 静态合同：这个 agent 长期扮演什么角色
2. 动态合同：这次 run 在当前上下文下应当如何调整行为边界

所以成熟系统不会只问“system prompt 写什么”，还会问：

1. 哪些部分应写死在 agent 身份里
2. 哪些部分应根据 run context 动态生成

换句话说，instructions 不是一段文案，而是角色和情境之间的绑定规则。

## 为什么 prompt 配置会引入 provider 绑定

Agent reference 文档还说明，`prompt` 字段可以把 instructions、tools 以及其它 agent 配置动态放到代码外面，但它只适用于 OpenAI 的 Responses API 路径。

这意味着 `prompt` 字段虽然很强，但它天然带来一个很重要的架构问题：

1. 它提升了配置外置化能力
2. 但同时降低了 provider portability

所以如果技术复盘官问“把 agent 配置移出代码是不是总是更好”，一个成熟的回答应该是：

更灵活，但要意识到 prompt-level config authority 可能绑定到特定 provider 和 model shape，不再是完全可移植合同。

## 为什么 output_type 是输出合同，而不是展示格式

OpenAI Agents SDK 里，`output_type` 默认是 `str`，但可以直接传 dataclass、Pydantic model、TypedDict 等普通 Python 类型；如果要非 strict schema，则要显式用 `AgentOutputSchema(..., strict_json_schema=False)`；如果要完全自定义 JSON schema，则需要 `AgentOutputSchemaBase` 子类。

这背后的原理非常重要：

1. 输出类型不是“前端怎么显示”
2. 而是“系统把什么视为合法 final output”

所以 output_type 决定的不只是解析方式，还决定：

1. 哪些输出会被视为成功完成
2. 下游程序是否可以把结果当结构化对象继续处理
3. 输出 schema authority 是默认严格约束，还是团队自己放宽

这就是为什么 output_type 是 agent contract 的核心组成部分。

## 为什么 tool_use_behavior 其实在定义“工具之后谁收尾”

Agent reference 里，`tool_use_behavior` 支持：

1. `run_llm_again`
2. `stop_on_first_tool`
3. `StopAtTools`
4. callable 返回 `ToolsToFinalOutputResult`

但文档也明确，这套行为只作用于 FunctionTools，hosted tools 仍由 LLM 继续处理。

这说明 tool_use_behavior 真正定义的是：

1. 工具执行后，是否还需要 LLM 再整合一次
2. 工具输出本身能否直接当 final output
3. 哪些工具受这套规则控制，哪些不受

所以如果只回答“工具调用完再让模型总结一下”，就太浅了。更准确的说法是：

tool_use_behavior 在定义工具链和最终答案链之间的接缝语义。

## 为什么 reset_tool_choice 是循环控制，不是小默认值

`reset_tool_choice=True` 是默认配置，官方文档明确说明这样做是为了在工具调用后把 tool choice 重置回默认，避免重复工具循环。

这件事技术复盘中特别值得讲，因为很多工具死循环不是 planner 太差，而是：

1. 工具选择状态没有重置
2. 模型不断在同一控制偏好下重复出招

所以 `reset_tool_choice` 的价值不只是“保持默认行为”，而是在防止局部控制状态跨 step 泄漏，进而形成无穷工具环。

## 为什么 clone 不是“完全复制一个 agent”

`Agent.clone()` 使用的是 `dataclasses.replace`，本质上是浅拷贝。文档明确说明：

1. 如果不覆写，像 `tools`、`handoffs` 这样的列表对象可能仍复用原有内容
2. 即便列表本身重建，里面的 tool function 和 handoff object 也仍然共享

这说明 clone 在工程上更像：

1. 复用一个配置基线
2. 对部分字段做局部覆盖

而不是：

1. 复制出一个完全独立的新合同宇宙

所以如果团队在 clone 后继续原地修改共享对象，很容易出现配置串联副作用。

## 一个成熟的 agent 配置设计至少要管五层

如果要把这个主题答到原理层，至少要讲清楚五层：

1. instruction authority：指令是静态还是动态，谁生成
2. provider authority：哪些配置只在某类模型路径有效
3. output authority：输出合同由默认严格类型、宽松 schema，还是自定义 schema 控制
4. tool-finalization authority：工具之后由谁来收尾，LLM 还是工具结果本身
5. config reuse authority：clone 是复用基线还是隔离实例

这五层不讲清，agent 看起来只是个 dataclass，实际上却会在运行时悄悄改变系统行为。

## 机制解读

Agent 配置不是初始化参数表，而是一份影响运行语义的合同。OpenAI Agents SDK 明确说明，`instructions` 就是 agent 的 system prompt，但既可以是字符串，也可以是基于 run context 和 agent 自身动态生成的 callable，这意味着指令合同既可以是静态身份，也可以是情境化行为边界。`prompt` 字段则能把 instructions、tools 和其它配置外置化，但只适用于 OpenAI 的 Responses API 路径，这说明配置灵活性和 provider portability 之间存在绑定。输出层面，`output_type` 默认是 `str`，但通常可以直接使用 dataclass、Pydantic model 或 TypedDict 作为结构化输出合同；如果要非 strict schema，需要显式使用 `AgentOutputSchema(..., strict_json_schema=False)`，而完全自定义 JSON schema 则需要 `AgentOutputSchemaBase`，这说明 output_type 决定的是系统认可什么样的 final output。工具层面，`tool_use_behavior` 可以选择 `run_llm_again`、`stop_on_first_tool`、`StopAtTools` 或自定义 callable，但它只作用于 FunctionTools，hosted tools 仍由 LLM 继续处理，因此它本质上是在定义工具结果与最终答案之间的衔接语义。控制流层面，`reset_tool_choice=True` 默认开启，用于在工具执行后重置 tool choice，避免进入重复工具循环。最后，`Agent.clone()` 只是基于 `dataclasses.replace` 的浅拷贝，共享对象仍可能被复用，因此 clone 更适合做配置基线复用，而不是完全隔离的新实例。真正成熟的回答，会把 instructions、prompt、output_type、tool_use_behavior、reset_tool_choice 和 clone 一起看成 agent configuration contract，而不是零散参数。

## 易混边界

1. 把 agent 配置理解成 system prompt 加工具列表
2. 忽略 `prompt` 带来的 provider 绑定
3. 把 output_type 当成展示格式，而不是输出合同
4. 不区分 FunctionTools 和 hosted tools 在 `tool_use_behavior` 上的差异
5. 误以为 clone 一定产生完全独立的新 agent

## 相关样例

1. `examples/python/ai-agent/agent_config_contract_outline.py`
