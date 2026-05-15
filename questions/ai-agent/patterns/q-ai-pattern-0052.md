---
id: q-ai-pattern-0052
title: 为什么 Tool System 的核心不是会不会调工具，而是执行位置、工具暴露面与 Schema 契约设计
domain: ai-agent
component: agent-patterns
topic: tool-surface-runtime-schema-design
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/tool-surface-runtime-and-schema-design
estimated_minutes: 13
---

# 题目

为什么 Tool System 的核心不是会不会调工具，而是执行位置、工具暴露面与 Schema 契约设计？

# 一句话结论

因为工具能力真正影响系统稳定性的，不是工具名本身，而是它在哪执行、谁承担副作用、模型在当前回合看见了多大的工具 schema 面，以及这些参数是不是被严格 contract 约束。

# 核心机制

1. SDK 五类工具对应不同执行控制权
2. hosted tools 与 local/runtime tools 的责任边界不同
3. `ToolSearchTool` 用于延迟加载大工具面，降低 schema token 开销
4. strict schema 与参数面最小化决定 tool call 能不能稳定落成真实函数调用

# 标准答案

Tool system 的核心不是“会不会调工具”，而是执行位置、工具暴露面和运行时契约设计，因为 OpenAI Agents SDK 明确把工具分成 hosted OpenAI tools、local/runtime execution tools、function tools、agents as tools 和 experimental Codex tool 五类，这套分类本质上是在区分控制权与执行位置。比如 hosted tools 运行在 OpenAI servers，并且文档明确它们面向 `OpenAIResponsesModel`，包括 `WebSearchTool`、`FileSearchTool`、`CodeInterpreterTool`、`HostedMCPTool`、`ImageGenerationTool` 和 `ToolSearchTool`；而 local/runtime tools 在应用自己的环境执行，`ComputerTool` 与 `ApplyPatchTool` 总是在本地，`ShellTool` 则可以本地或 hosted container。进一步看，`FileSearchTool` 与 `WebSearchTool` 不只是名字不同，它们的参数面也不同，前者支持 `filters`、`ranking_options`、`include_search_results`，后者支持 `filters`、`user_location`、`search_context_size`，说明它们服务的是不同的检索控制边界。再往下，`ToolSearchTool` 的价值不是简单“查找工具”，而是让 Responses model 运行时按需加载 function tools、namespace 或 hosted MCP servers，从而减少大的 tool-schema token 开销；而且 deferred loading 还有硬约束，必须配且只配一个 `ToolSearchTool()`。同时，工具参数面本身也必须严格：`FuncSchema` 负责把模型参数输出连接到真实 Python 调用，`strict_json_schema=True` 是默认且强烈推荐的，而 `RunContextWrapper` 又要求运行时上下文与模型可见参数隔离。这说明这道题的本质不是 API 记忆，而是执行位置、副作用责任、工具暴露面和 schema contract 的共同治理。

# 必答点

1. 说明五类工具反映的是控制权分类
2. 说明 hosted tools 与 local/runtime tools 的执行位置不同
3. 说明 `ToolSearchTool` 解决的是大工具面的延迟加载问题
4. 说明 deferred loading 有明确运行时约束
5. 说明 strict schema 与参数面最小化是在保护执行合同

# 常见误答

1. 把所有工具都说成 function calling
2. 不区分 hosted 与 local/runtime
3. 把 `ToolSearchTool` 只理解成查找工具
4. 让模型看见不该控制的运行时参数
5. 不知道大工具面本身会带来 schema token 和决策噪声问题
