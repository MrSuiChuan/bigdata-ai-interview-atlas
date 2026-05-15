---
id: q-ai-mcp-0005
title: 为什么 MCP 集成首先是控制平面与最小权限暴露设计，而不只是协议接入
domain: ai-agent
component: mcp
topic: mcp-tool-filtering-approval-local-hosted-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agents-sdk-mcp
  - openai-agents-sdk-human-in-the-loop
claim_ids:
  - pattern-claim-0268
  - pattern-claim-0269
  - pattern-claim-0270
  - pattern-claim-0271
  - pattern-claim-0272
  - pattern-claim-0273
  - pattern-claim-0274
related_docs:
  - ai-agent/protocols/mcp-tool-filtering-approval-and-local-vs-hosted-boundaries
estimated_minutes: 12
---

# 题目

为什么 MCP 集成首先是控制平面与最小权限暴露设计，而不只是协议接入？

# 一句话结论

因为同样叫接 MCP，真正决定系统行为的是谁管理连接与调用、失败怎么暴露、哪些工具能被模型看到、以及敏感工具调用如何审批恢复。

# 核心机制

1. Hosted MCP 与 Local MCP 的控制回路归属不同
2. `mcp_config` 控制 strict schema 转换与错误暴露方式
3. tool filtering、approval 和 `_meta` 注入共同构成最小权限边界

# 标准答案

MCP 集成首先是控制平面与最小权限暴露设计，而不只是协议接入，因为 OpenAI Agents SDK 明确把 Hosted MCP 和 Local MCP 分成两类控制语义。`HostedMCPTool` 让 Responses API 代表模型去调用公网可达的服务器，整个工具 round-trip 进入 OpenAI infrastructure，模型直接列远程工具并调用，而且 hosted server 不加入 `mcp_servers`；而 `MCPServerStreamableHttp`、`MCPServerSse`、`MCPServerStdio` 则把 transport、list_tools、call_tool、缓存和重试都留在应用自己手里。进一步，`Agent.mcp_config` 还能控制 schema 与失败边界，比如 `convert_schemas_to_strict` 只是 best-effort 地把 MCP schema 收紧，而 `failure_error_function` 决定失败是回给模型可见错误文本还是直接抛异常，且 server 级 formatter 可以覆盖 agent 级设置。安全与最小权限方面，官方又提供了三套关键机制：第一，approval，Hosted MCP 通过 `tool_config["require_approval"]` 和可选 `on_approval_request` 配置，本地 MCP 也支持 `require_approval`；human-in-the-loop 文档进一步说明审批会把 run 暂停到 `RunResult.interruptions`，再通过 `result.to_state()`、`state.approve(...)` 或 `state.reject(...)` 恢复，所以审批本质上是 pause-resume 控制流。第二，tool filtering，既支持静态 allow/block list，也支持拿到 `ToolFilterContext` 的动态过滤，后者能看到 `run_context`、`agent` 和 `server_name`，因此可以按 agent 与 run 做 least privilege exposure。第三，`tool_meta_resolver` 可以把 tenant ID、trace context 之类的 `_meta` 注入到每次 `call_tool()`，把模型参数与系统侧元数据分开治理。所以成熟回答必须从 control plane、error boundary、approval flow 和 least privilege 四层一起讲，而不是只说“MCP 是统一工具协议”。

# 必答点

1. 说明 Hosted MCP 与 Local MCP 的控制回路归属不同
2. 说明 `mcp_config` 会影响 strict schema 与错误暴露方式
3. 说明 approval 是 pause-resume 语义
4. 说明 tool filtering 与 `_meta` 注入属于最小权限和上下文边界设计

# 常见误答

1. 把 Hosted MCP 与 Local MCP 只说成地址不同
2. 不知道 MCP 失败还能决定是回文本还是抛异常
3. 把审批理解成普通确认框
4. 不知道 MCP 工具可以做动态过滤和 `_meta` 注入
