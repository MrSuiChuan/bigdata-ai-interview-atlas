---
kb_id: ai-agent/patterns/tool-categories-hosted-vs-local-runtime-and-tool-search-boundaries
title: "Tool Categories / Hosted vs Local Runtime / Tool Search：工具系统真正难的不是会不会调，而是谁执行、谁承担副作用、谁暴露参数面"
domain: ai-agent
component: agent-patterns
topic: tool-categories-hosted-local-runtime-tool-search-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 52
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-tools
  - openai-agents-sdk-guardrails
claim_ids:
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
  - hosted-tools
  - tool-search
  - execution-boundary
---

# 一句话结论

工具系统最核心的分界从来不是“这个工具能做什么”，而是“这个工具到底在哪执行、谁控制执行回路、模型一开始看见多大的工具参数面”。

# 为什么这题很容易答浅

很多人一说 tool use，就会把答案收缩成两句话：

1. agent 可以调工具
2. 工具有 function calling、web search、file search 之类

这类回答只是在念工具名，没有回答任何原理问题。真正的工程问题至少有三个：

1. 工具是在 OpenAI 侧执行，还是在你自己的进程里执行
2. 模型是一开始就看见全部工具，还是按需延迟加载
3. 工具副作用、审批、可观测性和安全边界到底归谁负责

如果这些问题说不清，“工具越多越强”最后通常会变成“工具越多越乱”。

# 五类工具的分类，本质上就是执行控制权的分类

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
4. 有些是把一个 agent 包装成“可调用能力”

也就是说，工具分类其实是在回答“控制权落在哪”。

# Hosted vs Local Runtime，真正区别是执行位置和责任边界

官方文档对这层边界写得很直白：

1. hosted OpenAI tools 运行在 OpenAI servers，并且与模型在同侧
2. local/runtime execution tools 运行在你的环境里
3. `ComputerTool` 和 `ApplyPatchTool` 总是在本地环境
4. `ShellTool` 可以本地执行，也可以运行在 hosted container

这意味着同样叫“工具”，它们的治理含义并不一样。

如果工具在 OpenAI 侧执行，你要关注的是：

1. 能不能使用该模型族
2. 请求里暴露了哪些 hosted capability
3. 返回了什么结果面

如果工具在你自己的环境里执行，你要关注的是：

1. 本地权限
2. 环境副作用
3. 沙箱边界
4. 超时、错误和审批

这里还有一个基于官方文档的直接推论需要明确标注：执行位置不同，治理手段也必须不同。不能把“hosted tool 的能力暴露”与“本地 shell 的副作用控制”当成一回事。这是从工具类别和运行位置推导出来的工程结论。

# Hosted Tools 为什么不是“内置 function calling”

OpenAI Agents SDK 文档列出的 hosted tools 包括：

1. `WebSearchTool`
2. `FileSearchTool`
3. `CodeInterpreterTool`
4. `HostedMCPTool`
5. `ImageGenerationTool`
6. `ToolSearchTool`

并且文档明确它们是面向 `OpenAIResponsesModel` 的 hosted tool 集合。

这层信息很重要，因为它说明 hosted tools 不是“你自己写个 schema 给模型调”的本地函数，而是平台已经内建的远端能力面。面试里如果有人把 `WebSearchTool` 和 `@function_tool` 说成一类，只能说明他还没有把“工具定义”与“工具执行”区分开。

# 搜索类 Hosted Tool 的真正区别，不是名字，而是参数面和检索控制力

如果要把答案说得更深，不能只念工具名，还要讲参数面。

文档明确写了：

1. `FileSearchTool` 除了 vector store 和结果条数，还支持 `filters`、`ranking_options`、`include_search_results`
2. `WebSearchTool` 支持 `filters`、`user_location`、`search_context_size`

这意味着：

1. file search 更偏内部语料与排序控制
2. web search 更偏外部检索范围与搜索上下文控制

成熟回答不会只说“一个搜文件，一个搜网页”，而会补一句：

二者都属于 hosted retrieval surface，但控制项不同，所以它们服务的不是同一种检索边界。

# Tool Search 解决的不是“找工具”，而是工具参数面的爆炸问题

面试里这个点特别值得讲深。

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

所以强回答应该是：

ToolSearchTool 的本质，是把“工具全集暴露”改成“候选工具按需暴露”。

# Deferred Loading 是有约束的，不是想开就开

文档还给出一组非常关键的约束：

1. deferred-loading function tools 必须配合且只配合一个 `ToolSearchTool()`
2. 可搜索的 surface 包括 `@function_tool(defer_loading=True)`
3. 也包括 `tool_namespace(...)`
4. 还包括 `HostedMCPTool(tool_config={..., "defer_loading": True})`
5. 标准 `Runner` 不会自动执行 client-executed tool search 模式

这组约束很重要，因为它说明 tool search 不是“加个配置自动变聪明”，而是一套运行时装配机制。

如果面试官问“为什么工具多时吞吐和稳定性会一起变差”，一个更有层次的回答就是：

不是只有推理变慢，工具 schema 的暴露面也会变成上下文和决策噪声源，所以需要 namespace 和 deferred loading 去收缩模型当前回合真正看见的工具面。

# `Agent.as_tool()` 的价值，不是为了多 agent，而是为了把 agent 能力压缩成一个可调用面

虽然这篇重点不是 handoff，但 tools 文档对 `Agent.as_tool()` 的定位非常值得一起讲。

它支持：

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

这说明 `Agent.as_tool()` 的本质不是“再套一层 agent”，而是把一个复杂能力打包成受控的 callable surface。

这和“完整 handoff 给另一个 agent 接管对话”是两种完全不同的设计思路。

# 面试里怎么把工具系统讲到原理层

一个更完整的回答结构通常是：

1. 先用五类工具说明控制权和执行位置
2. 再区分 hosted 和 local/runtime 的责任边界
3. 然后补充 hosted search tools 的参数面差异
4. 再讲 `ToolSearchTool` 如何降低 schema token 和工具暴露面
5. 最后说明 `Agent.as_tool()` 是把 agent 压缩成一个调用面，而不是完整接管式委托

这样回答，面试官会感觉你在讲一套工具运行时，而不是在背 SDK API 名称。

# 标准面试答案

Agent 的工具系统不能只按“能不能调用某个能力”来理解，更核心的是执行控制权、参数暴露面和运行时治理边界。OpenAI Agents SDK 把工具分成五类：hosted OpenAI tools、local/runtime execution tools、function tools、agents as tools 和 experimental Codex tool，这套分类本质上是在区分工具在哪执行、谁控制调用回路。比如 hosted tools 运行在 OpenAI 服务器侧，文档明确列出它们面向 `OpenAIResponsesModel`，包括 `WebSearchTool`、`FileSearchTool`、`CodeInterpreterTool`、`HostedMCPTool`、`ImageGenerationTool` 和 `ToolSearchTool`；而 local/runtime tools 则在应用自己的环境里执行，其中 `ComputerTool` 和 `ApplyPatchTool` 总是在本地，`ShellTool` 可以本地或 hosted container。进一步看，`FileSearchTool` 支持 `filters`、`ranking_options`、`include_search_results`，`WebSearchTool` 支持 `filters`、`user_location`、`search_context_size`，所以它们不仅工具名不同，控制参数面也不同。再往下，`ToolSearchTool` 的价值不是“搜工具”，而是让 Responses model 在运行时按需加载 function tools、namespace groups 或 hosted MCP servers，减少巨大的 tool-schema token 开销；而且 deferred loading 不是随便打开就行，文档明确要求这类工具必须配合且只配合一个 `ToolSearchTool()`，可搜索 surface 包括 `@function_tool(defer_loading=True)`、`tool_namespace(...)` 和 deferred 的 `HostedMCPTool`，同时标准 `Runner` 不会自动执行 client-executed tool search 模式。最后，`Agent.as_tool()` 说明 agent 也可以被压缩成一个可调用能力面，并支持 `run_config`、`session`、`needs_approval`、结构化参数等，因此成熟系统设计关心的不是“工具多不多”，而是执行位置、副作用责任和当前回合真正暴露给模型的工具面是否可控。

# 常见误答

1. 把所有工具都说成 function calling
2. 不区分 hosted tool 与本地执行工具
3. 只会念 `WebSearchTool`、`FileSearchTool` 名字，不会讲参数面差异
4. 把 `ToolSearchTool` 理解成普通工具发现，而不是 schema 面控制
5. 认为 `Agent.as_tool()` 等同于 handoff

# 相关样例

1. `examples/python/ai-agent/hosted_tool_surface_outline.py`
