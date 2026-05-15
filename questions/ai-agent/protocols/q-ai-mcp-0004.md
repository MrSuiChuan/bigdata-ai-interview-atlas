---
id: q-ai-mcp-0004
title: 为什么设计 MCP 集成时必须先分清 tools、resources、prompts 和执行边界
domain: ai-agent
component: mcp
topic: mcp-capability-taxonomy-control-loci-least-privilege-exposure
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - mcp-server-concepts
  - mcp-resources
  - mcp-prompts
  - openai-agents-sdk-mcp
claim_ids:
  - pattern-claim-0180
  - pattern-claim-0181
  - pattern-claim-0182
  - pattern-claim-0183
  - pattern-claim-0184
  - pattern-claim-0185
  - pattern-claim-0186
related_docs:
  - ai-agent/protocols/mcp-capability-taxonomy-control-loci-and-least-privilege-exposure
estimated_minutes: 12
---

# 题目

为什么设计 MCP 集成时必须先分清 tools、resources、prompts 和执行边界？

# 一句话结论

因为 MCP 里最关键的不是“有哪些能力”，而是“谁控制这些能力、它们会不会产生动作，以及它们最终暴露给 agent 的是不是原始能力全集”。

# 核心机制

1. 能力类型决定控制权归属
2. 工具执行边界不同于只读上下文边界
3. 最小权限暴露要落在 server、adapter、runtime 三层

# 标准答案

设计 MCP 集成时必须先分清 tools、resources、prompts，因为它们对应三种不同的控制语义。MCP 官方 server concepts 文档明确说明，tools 是 model-controlled functions，带 JSON Schema 输入约束，通过 `tools/list` 和 `tools/call` 发现与执行，并且可能需要用户同意，所以它本质上是动作执行入口；resources 则是 application-driven 的上下文源，带 URI 和 MIME type，可被列出、读取、订阅，更适合承载只读上下文而不是副作用动作；prompts 是 user-controlled 的模板，通过 `prompts/list` 和 `prompts/get` 发现与展开，可以引用工具和资源，但本质是工作流脚手架。这个分类一旦混淆，审批、缓存和最小权限就会一起混乱。进一步，OpenAI Agents SDK 的 MCP 文档说明，接入方式首先取决于工具调用发生在哪里：`HostedMCPTool` 是由 Responses API 去调用公网可达的 MCP server，而 Streamable HTTP、SSE、stdio 等 transport 是由你的进程自己连 server，这说明 hosted 和 local 的区别首先是执行权与网络边界，不是语法便利性。与此同时，SDK 还支持静态和动态 tool filtering、`list_tools()` 缓存以及 always/never/per-tool/group 级别的审批策略，说明 server 暴露出来的原始能力面和最终让 agent 看见的能力面可以不一样。真正成熟的 MCP 设计，必须先回答能力分类、控制权归属、执行位置和暴露子集四个问题，再谈具体调用。

# 必答点

1. 说明 tools、resources、prompts 三类能力的控制方不同
2. 说明 tool 更接近动作入口，resource 更接近上下文入口
3. 说明 Hosted MCP 和本地 transport 的区别首先是执行权边界
4. 说明最小权限暴露不能只靠 server 端一次性配置

# 常见误答

1. 把三类能力统称为“外部工具”
2. 认为 resource 只是只读版 tool
3. 认为 Hosted MCP 只是更方便的调用方式
4. 忽略 client/runtime 对能力过滤和审批的二次治理
