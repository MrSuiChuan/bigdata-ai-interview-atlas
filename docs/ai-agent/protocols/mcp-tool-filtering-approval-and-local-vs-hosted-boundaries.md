---
kb_id: ai-agent/protocols/mcp-tool-filtering-approval-and-local-vs-hosted-boundaries
title: MCP Tool Filtering / Approval / Local vs Hosted：同样叫接 MCP，真正分水岭是执行控制权、暴露边界和审批责任
domain: ai-agent
component: mcp
topic: mcp-tool-filtering-approval-local-hosted-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 4
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
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
tags:
  - ai-agent
  - mcp
  - protocol
  - approval
  - tool-filter
  - hosted-mcp
---
## 一句话结论

MCP Tool Filtering / Approval / Local vs Hosted：同样叫接 MCP，真正分水岭是执行控制权、暴露边界和审批责任需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 MCP，就会回答：

1. MCP 是统一工具协议
2. agent 接上 MCP server 就能调工具
3. 本地、远程其实差不多

这类回答的问题很大，因为它把“协议统一”误以为“运行时语义一致”。

官方文档实际上在反复强调：同样是 MCP，至少要分清四层边界：

1. 执行是在 OpenAI 基础设施侧，还是你的应用侧
2. 工具失败是回给模型文本，还是直接抛异常
3. 哪些工具可以暴露给模型
4. 敏感工具调用需要谁审批、审批结果如何恢复执行

如果这些边界答不出来，技术复盘官一般会默认你只懂协议名词，不懂工程集成。

## 先选 Hosted 还是 Local，本质上是在选谁拥有控制平面

OpenAI Agents SDK 的 MCP 文档给出了一张非常明确的选择矩阵：

1. 如果希望 Responses API 代表模型去调用公网可达的 MCP server，用 `HostedMCPTool`
2. 如果你自己管理网络连接，可以用 `MCPServerStreamableHttp`
3. 如果是旧式 HTTP SSE，使用 `MCPServerSse`
4. 如果是本地子进程，通过 stdin/stdout 通信，用 `MCPServerStdio`

这说明 Hosted 与 Local 的区别不是“地址写法不同”，而是控制平面的归属不同。

Hosted MCP 的语义非常明确：

1. 整个 tool round-trip 进入 OpenAI infrastructure
2. 你的代码不负责列工具和逐次调用
3. `HostedMCPTool` 把 server metadata 转发给 Responses API
4. 模型直接列远程工具并调用
5. 这种 server 不加入 `mcp_servers`

相对地，Local MCP 语义是：

1. 连接由你的应用维护
2. list_tools / call_tool 在你的侧发生
3. 你可以控制缓存、重试、过滤、审批和 `_meta`

所以如果技术复盘官问“Hosted MCP 和本地 MCP 的本质区别是什么”，最强回答不是“一个远程一个本地”，而是：

一个把工具控制回路托管给平台，一个把控制回路保留在应用自己手里。

### 这类选择最终会反映到审计和隔离方式上
一旦执行控制平面不同，工具调用的可见证据、网络边界、故障回传位置和多租户隔离责任也会一起变化。因此 Hosted 与 Local 的选择，不只是开发便利性问题，而是整个治理模型的前置选择。

## `Agent.mcp_config` 真正控制的是 schema 边界和失败暴露方式

很多人只会把 MCP 看成 transport 问题，但官方文档还明确给了 agent 级别的 `mcp_config`：

1. `convert_schemas_to_strict`
2. `failure_error_function`

这里有两个关键点：

1. `convert_schemas_to_strict` 只是 best-effort，不保证所有 schema 都能被严格化
2. `failure_error_function` 决定 MCP 工具失败是变成模型可见的错误文本，还是直接以异常暴露
3. 如果某个 server 自己配置了 failure formatter，它会覆盖 agent 级别的设置

这意味着 MCP 集成不是单纯“把工具暴露出去”，而是还要定义：

1. 工具 schema 尽量被收紧到什么程度
2. 失败时是让模型看见并继续推理，还是直接把错误抛回应用层

技术复盘中如果能把这层讲出来，深度会明显上一个台阶。

### schema 和 failure 其实定义了“模型看到的世界”
schema 决定模型能以多严格的结构组织输入，failure 处理方式则决定失败是留在系统侧还是暴露给模型继续推理。二者共同影响工具调用时的推理边界，而不只是一个配置细节。

## Approval 不是附加功能，而是高风险 MCP 工具的执行门控

MCP 文档和 human-in-the-loop 文档把审批机制讲得很清楚。

Hosted MCP 侧：

1. 在 `tool_config["require_approval"]` 里配置审批策略
2. 可以用 `"always"`、`"never"`，也可以按工具名做映射
3. 若希望在 Python 里做决策，可提供 `on_approval_request`

Local MCP 侧：

1. `MCPServerStdio`
2. `MCPServerSse`
3. `MCPServerStreamableHttp`

这三类都支持 `require_approval`，而且支持多种表达：

1. `"always"` / `"never"`
2. `True` / `False`
3. 每工具映射
4. 分组对象，比如哪些永远审批、哪些永不审批

这说明审批并不是“UI 上点一下确认”，而是 MCP 运行时的一部分控制语义。

更进一步，human-in-the-loop 文档说明审批触发后：

1. 中断会出现在 `RunResult.interruptions`
2. 需要通过 `result.to_state()` 拿到可恢复状态
3. 再用 `state.approve(...)` 或 `state.reject(...)`
4. 然后以原始 top-level run 继续恢复

所以真正成熟的回答应该是：

审批是 pause-resume control flow，而不是简单弹窗确认。

### 为什么这会直接影响系统设计
只要审批是暂停恢复语义，运行时就必须保存可恢复状态、记录中断原因，并在批准或拒绝后继续原始 run，而不是重新发起一轮新任务。否则审批链和执行链就会断裂。

## Tool Filtering 不是优化项，而是 Least Privilege 的正面实现

MCP 文档单独拿出一节讲 tool filtering，这非常值得在技术复盘中展开。

因为一旦一个 server 上工具很多，真正的问题就变成：

1. 模型是否看到了不该看到的危险工具
2. 某类 agent 是否被暴露了超出职责范围的能力
3. 多租户场景里，是否所有 run 都看见同一批工具

官方给了两类过滤方式。

静态过滤：

1. 用 `create_static_tool_filter()`
2. 可以给 allow list
3. 也可以给 block list
4. 如果同时提供，先 allow，再从剩余结果中 block

动态过滤：

1. 提供一个 callable
2. 它接收 `ToolFilterContext`
3. 可同步也可异步
4. 根据上下文决定某个工具是否暴露

更关键的是，`ToolFilterContext` 暴露：

1. 当前 `run_context`
2. 请求工具的 `agent`
3. `server_name`

这说明 MCP 过滤不是“静态工具白名单”这么简单，而是可以做成按 agent、按 run、按 server 的上下文化最小权限暴露。

### 过滤层越精细，越能避免把危险能力提前暴露给模型
最小权限真正有效的时机，不是在危险工具已经被模型选中之后，而是在能力发现阶段就把不该出现的工具排除掉。过滤做得越前，审批压力和误调用概率通常越低。

## `_meta` 注入才是多租户和链路上下文真正容易被忽视的边界

MCP 文档里还有一个很关键但容易被忽视的点：`tool_meta_resolver`。

它允许你在每次 `call_tool()` 前注入 `_meta`，文档给的例子就是：

1. tenant ID
2. trace context

为什么这点重要？

因为很多人以为 MCP 工具调用只有“参数 JSON”，但真实工程里往往还有另一层隐式上下文：

1. 当前租户是谁
2. 审计链路怎么串
3. 请求来自哪个应用模块

`tool_meta_resolver` 正是在告诉你，这些信息不一定应该混进模型可见参数，而是应该走独立的 per-call metadata 通道。

### 把系统元数据和模型参数分开，是治理上的必要隔离
如果租户标识、trace 上下文、策略标签都混进模型可见输入，不仅会污染工具语义，还会让审计和权限判断难以稳定复用。独立 `_meta` 通道的价值，正在于把这层控制信息留在系统侧。

## 技术复盘中怎么把 MCP 集成讲到原理层

比较完整的回答结构通常是：

1. 先按 execution locus 区分 Hosted MCP 和 Local MCP
2. 再说明 `mcp_config` 控制 strict schema 转换和失败暴露方式
3. 然后解释审批其实是 pause-resume 的控制流，而不是附加按钮
4. 再说明 tool filtering 是 least privilege 的核心机制
5. 最后补 `_meta` 注入，说明真实工程里除了模型参数，还有调用侧上下文边界

这样就把 MCP 从“一个协议名词”讲成了“一个可治理的工具接入平面”。

## 机制解读

MCP 集成真正难的不是把协议连通，而是先把执行控制权、工具暴露边界和审批责任设计清楚。OpenAI Agents SDK 的 MCP 文档给出了非常明确的选择矩阵：如果希望 Responses API 代表模型去调用公网可达的服务器，就用 `HostedMCPTool`；如果连接和调用由应用自己管理，则用 `MCPServerStreamableHttp`、`MCPServerSse` 或 `MCPServerStdio`。这不是简单的“远程和本地”区别，而是控制平面归属不同。Hosted MCP 会把整个工具 round-trip 交给 OpenAI 基础设施，`HostedMCPTool` 只转发 server metadata，模型直接列远程工具并调用，而且 hosted server 不加入 `mcp_servers`；而本地 MCP 则由应用自己负责 list_tools、call_tool、缓存、重试、过滤和元数据注入。再往下，`Agent.mcp_config` 还能控制 schema 和错误边界，比如 `convert_schemas_to_strict` 只是 best-effort 的 strict schema 转换，而 `failure_error_function` 决定 MCP 工具失败是回给模型可见文本还是直接抛异常，且 server 级配置可以覆盖 agent 级配置。敏感工具调用上，Hosted MCP 通过 `tool_config["require_approval"]` 配审批策略，并可用 `on_approval_request` 在 Python 中决策；本地 MCP 也支持 `require_approval`，而 human-in-the-loop 文档进一步说明审批会把 run 暂停到 `RunResult.interruptions`，然后通过 `result.to_state()`、`state.approve(...)` / `state.reject(...)` 恢复，这说明审批本质上是 pause-resume 控制流。权限暴露方面，MCP 提供静态和动态 tool filtering：静态过滤支持 allow/block list，且先 allow 后 block；动态过滤拿到 `ToolFilterContext`，其中包含 `run_context`、`agent` 和 `server_name`，可以按 agent、按 run 做最小权限暴露。最后，`tool_meta_resolver` 允许把 tenant ID、trace context 之类的 per-call `_meta` 注入到 MCP 请求里，说明真实工程中还要把模型可见参数与系统侧元数据分开治理。所以成熟回答必须同时覆盖 execution locus、schema/failure boundary、approval flow、least privilege 和 metadata propagation，而不是只说“MCP 是统一工具协议”。

## 易混边界

1. 把 Hosted MCP 和 Local MCP 只说成“远程地址不同”
2. 不知道 `mcp_config` 还能控制 strict schema 和错误暴露方式
3. 把审批理解成 UI 弹窗，而不是暂停恢复语义
4. 不知道 MCP 工具可以做静态和动态过滤
5. 忽略 `_meta` 注入这类系统侧上下文边界

## 相关样例

1. `examples/python/ai-agent/mcp_filter_approval_boundary_outline.py`
