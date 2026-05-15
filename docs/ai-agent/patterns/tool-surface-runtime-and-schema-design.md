---
kb_id: ai-agent/patterns/tool-surface-runtime-and-schema-design
title: Tool Surface / Runtime / Schema Design：工具系统真正难的不是会不会调，而是谁执行、谁暴露参数面、谁承担副作用
domain: ai-agent
component: agent-patterns
topic: tool-surface-runtime-schema-design
difficulty: advanced
status: reviewed
sidebar_position: 24
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-agents-sdk-tools
  - openai-agents-sdk-guardrails
  - openai-agents-sdk-function-schema
  - openai-agents-sdk-strict-schema
claim_ids:
  - pattern-claim-0199
  - pattern-claim-0200
  - pattern-claim-0201
  - pattern-claim-0202
  - pattern-claim-0203
  - pattern-claim-0204
  - pattern-claim-0261
  - pattern-claim-0262
  - pattern-claim-0263
  - pattern-claim-0264
  - pattern-claim-0265
  - pattern-claim-0266
  - pattern-claim-0267
tags:
  - ai-agent
  - tools
  - schema
  - runtime
  - hosted-tools
  - execution-boundary
---
## 一句话结论

Tool Surface / Runtime / Schema Design：工具系统真正难的不是会不会调，而是谁执行、谁暴露参数面、谁承担副作用需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一说 tool use，就会把答案收缩成两句话：

1. agent 可以调工具
2. 工具有 function calling、web search、file search 之类

这类回答只是在念工具名，没有回答任何原理问题。真正的工程问题至少有四个：

1. 工具是在 OpenAI 侧执行，还是在你自己的进程里执行
2. 模型是一开始就看见全部工具，还是按需延迟加载
3. tool call 的参数面到底有多大、是否足够严格
4. 工具副作用、审批、可观测性和安全边界到底归谁负责

## 五类工具的分类，本质上就是执行控制权的分类

OpenAI Agents SDK 在 tools 文档里明确把工具分成五类：

1. hosted OpenAI tools
2. local/runtime execution tools
3. function tools
4. agents as tools
5. experimental Codex tool

这套分类不是文档目录整理，而是在告诉你：

1. 有些工具的执行回路由 OpenAI 承担
2. 有些工具的执行回路由你的应用进程承担
3. 有些是普通函数调用
4. 有些是把一个 agent 包装成可调用能力

所以工具分类其实是在回答“控制权落在哪”。

## Hosted vs Local Runtime，真正区别是执行位置和责任边界

官方文档对这层边界写得很直白：

1. hosted OpenAI tools 运行在 OpenAI servers，并且与模型在同侧
2. local/runtime execution tools 运行在你的环境里
3. `ComputerTool` 和 `ApplyPatchTool` 总是在本地环境
4. `ShellTool` 可以本地执行，也可以运行在 hosted container

这意味着同样叫“工具”，它们的治理含义并不一样。

如果工具在 OpenAI 侧执行，你要关注的是：

1. 模型族是否支持这类 hosted capability
2. 暴露了哪些 hosted surface
3. 返回了什么结果面

如果工具在你自己的环境里执行，你要关注的是：

1. 本地权限
2. 环境副作用
3. 沙箱边界
4. 超时、错误和审批

## Hosted Search Tools 真正区别的不是名字，而是参数面

文档明确写了：

1. `FileSearchTool` 支持 `filters`、`ranking_options`、`include_search_results`
2. `WebSearchTool` 支持 `filters`、`user_location`、`search_context_size`

这意味着：

1. file search 更偏内部语料与排序控制
2. web search 更偏外部检索范围与搜索上下文控制

成熟回答不会只说“一个搜文件，一个搜网页”，而会补一句：

二者都属于 hosted retrieval surface，但控制项不同，所以服务的不是同一种检索边界。

## Tool Search 解决的不是“找工具”，而是工具参数面的爆炸问题

`ToolSearchTool` 的核心价值，不是让模型“更聪明地搜工具”，而是让模型不要在一开始就背上巨大的工具 schema 面。

官方文档写得很明确：

1. 它让 Responses models 在运行时按需加载工具
2. 适合大量 function tools、namespace groups、hosted MCP servers 的场景
3. 目标是减少 tool-schema token 开销

这说明 `ToolSearchTool` 解决的是 schema surface explosion，而不是单纯的工具发现功能。

如果工具很多，全部一次性暴露给模型，典型问题会立刻出现：

1. token 开销升高
2. 模型选错工具概率上升
3. 同名或近义工具之间冲突更高
4. prompt 和 tool schema 挤占上下文预算

## Deferred Loading 是有约束的，不是想开就开

文档还给出一组关键约束：

1. deferred-loading function tools 必须配合且只配合一个 `ToolSearchTool()`
2. 可搜索的 surface 包括 `@function_tool(defer_loading=True)`
3. 也包括 `tool_namespace(...)`
4. 还包括 deferred 的 `HostedMCPTool`
5. 标准 `Runner` 不会自动执行 client-executed tool search 模式

所以 tool search 不是“加个配置自动变聪明”，而是一套运行时装配机制。

## Strict JSON Schema 和参数面最小化，为什么必须跟运行时设计一起讲

工具系统要想稳定，不能只讲执行位置，还要讲参数契约。

OpenAI Agents SDK 的 `FuncSchema` 同时维护：

1. 参数的 Pydantic model
2. JSON schema
3. 把验证结果还原成 `(args, kwargs)` 的逻辑

这说明 schema 不是写给人看的文档，而是把“模型生成参数”和“函数真实执行”连接起来的执行合同。

进一步，官方文档明确指出：

1. `strict_json_schema=True` 是默认且强烈推荐的
2. `ensure_strict_json_schema()` 会把 schema 调整为 OpenAI API 期望的严格标准

这意味着 strict schema 的核心作用是：

1. 避免字段名、字段类型、必填项在模型侧随意漂移
2. 让 tool calling 更接近稳定 RPC，而不是“让模型猜一个参数对象”
3. 让失败更早暴露在参数边界，而不是拖到工具执行阶段

## 参数面最小化，为什么比“描述更详细”更重要

真正成熟的工具设计，不是给模型暴露更多参数，而是暴露更少、更干净、更必要的参数。

因为一旦参数面过大，系统会同时遇到三个问题：

1. schema token 开销增加
2. 模型更容易填错字段或给出不合规组合
3. 审批、审计和 guardrail 很难覆盖全部输入空间

所以参数面最小化的目标是：

1. 模型只看见它需要控制的参数
2. 系统侧上下文和敏感元数据不要混进模型可见 schema
3. 业务不变量尽量编码到 strict schema 或运行时校验里

## Runtime Context 为什么必须和 Model-Visible Arguments 隔离

`RunContextWrapper` 可以存在，但必须是首参数，并且不会暴露到 schema 中；如果出现在非首位，SDK 会直接报错。

这件事非常重要，因为它说明工具输入天然分成两层：

1. 模型可控参数
2. 系统注入上下文

如果把这两层混在一起，常见后果是：

1. 模型看见不该控制的运行时参数
2. 审批和审计分不清哪些值来自用户、哪些值来自系统
3. 参数 schema 变大，决策噪声增加

## `Agent.as_tool()` 的价值，不是为了多 Agent，而是压缩能力面

`Agent.as_tool()` 支持：

1. `max_turns`
2. `run_config`
3. `hooks`
4. `previous_response_id`
5. `conversation_id`
6. `session`
7. `needs_approval`
8. `parameters`
9. `input_builder`
10. `include_input_schema`

这说明 `Agent.as_tool()` 的本质不是“再套一层 agent”，而是把一个复杂能力打包成受控的 callable surface。这和 handoff 那种完整接管式委托是两种完全不同的设计思路。

## 技术复盘中怎么把工具系统讲到原理层

一个更完整的回答结构通常是：

1. 先用五类工具说明控制权和执行位置
2. 再区分 hosted 和 local/runtime 的责任边界
3. 然后补充 hosted search tools 的参数面差异
4. 再讲 `ToolSearchTool` 如何降低 schema token 和工具暴露面
5. 最后说明 strict schema、参数面最小化和 runtime context 隔离是执行合同的一部分

这样回答，技术复盘官会感觉你在讲一套工具运行时，而不是在背 SDK API 名称。

## 机制解读

Tool system 的核心不是“会不会调工具”，而是执行位置、参数暴露面和运行时治理边界。OpenAI Agents SDK 明确把工具分成 hosted OpenAI tools、local/runtime execution tools、function tools、agents as tools 和 experimental Codex tool 五类，这套分类本质上是在区分控制权与执行位置。比如 hosted tools 运行在 OpenAI servers，并且文档明确它们面向 `OpenAIResponsesModel`，包括 `WebSearchTool`、`FileSearchTool`、`CodeInterpreterTool`、`HostedMCPTool`、`ImageGenerationTool` 和 `ToolSearchTool`；而 local/runtime tools 在应用自己的环境执行，`ComputerTool` 与 `ApplyPatchTool` 总是在本地，`ShellTool` 则可以本地或 hosted container。进一步看，`FileSearchTool` 与 `WebSearchTool` 不只是名字不同，它们的参数面也不同，前者支持 `filters`、`ranking_options`、`include_search_results`，后者支持 `filters`、`user_location`、`search_context_size`，说明它们服务的是不同的检索控制边界。再往下，`ToolSearchTool` 的价值不是简单“查找工具”，而是让 Responses model 运行时按需加载 function tools、namespace 或 hosted MCP servers，从而减少大的 tool-schema token 开销；而且 deferred loading 还有硬约束，必须配且只配一个 `ToolSearchTool()`。同时，工具契约本身也必须严格：`strict_json_schema=True` 是默认且强烈推荐的，`FuncSchema` 负责把模型参数输出连接到真实 Python 调用语义，而 `RunContextWrapper` 又要求运行时上下文与模型可见参数隔离。真正成熟的工具系统设计，必须把执行位置、副作用责任、工具暴露面、strict schema 和参数面最小化一起考虑，而不是把它理解成“多接几个 function calling”。

## 易混边界

1. 把所有工具都说成 function calling
2. 不区分 hosted 与 local/runtime
3. 把 `ToolSearchTool` 只理解成查找工具
4. 让模型看见不该控制的运行时参数
5. 认为 strict schema 只是编码风格问题
