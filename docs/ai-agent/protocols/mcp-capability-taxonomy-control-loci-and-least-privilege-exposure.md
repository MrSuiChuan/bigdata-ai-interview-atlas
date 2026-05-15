---
kb_id: ai-agent/protocols/mcp-capability-taxonomy-control-loci-and-least-privilege-exposure
title: MCP Capability Taxonomy / Control Loci / Least-Privilege Exposure：别把 tools、resources、prompts 混成一个“可调用接口池”
domain: ai-agent
component: mcp
topic: mcp-capability-taxonomy-control-loci-least-privilege-exposure
difficulty: advanced
status: reviewed
sidebar_position: 3
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
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
tags:
  - ai-agent
  - mcp
  - protocol
  - tools
  - resources
  - least-privilege
---
## 一句话结论

MCP Capability Taxonomy / Control Loci / Least-Privilege Exposure：别把 tools、resources、prompts 混成一个“可调用接口池”需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 MCP，就会说：

1. 它是把大模型接到外部工具上的统一协议
2. server 暴露能力，client 调用能力
3. 能列工具、能调用工具、能读资源

这些话都不算错，但还停留在“会背协议名词”的层面。真正难的地方不在于知道 MCP 有哪些对象，而在于知道它们分别是谁在控制：

1. tool 是模型驱动执行，还是应用驱动执行
2. resource 是自动喂给模型，还是应用自己决定读不读、什么时候读
3. prompt 是系统自动触发，还是用户显式选择的工作流模板

如果这三个控制权不拆开，系统就很容易出现两类典型问题：

1. 把本应只做只读上下文注入的 resource 误当成可自主执行的动作入口
2. 把高风险 tool 和低风险 prompt 混在一个暴露面里，最后只能靠粗暴总开关控风险

所以这个主题真正考的是：你有没有把 MCP 看成“能力分类 + 控制语义 + 暴露治理”三层系统，而不只是一个工具协议。

## 先把三类能力的控制权说清楚

### Tool 是 model-controlled execution

MCP server concepts 把 tools 定义成 model-controlled functions。它们是带 JSON Schema 输入约束的单次操作，通过 `tools/list` 发现、通过 `tools/call` 执行，而且文档明确提到工具执行可能需要用户同意。

这句话的关键不是“可以列出来调用”，而是：

1. tool 的默认语义是执行动作
2. tool 的输入必须能被结构化校验
3. tool 是否真的执行，天然要和审批、权限、幂等、副作用设计绑在一起

所以 tool 不是“外部知识入口”，而是“外部动作入口”。

### Resource 是 application-driven context

resources 这层很容易被误判成“另一种 tool”。但 MCP 文档把它定义得很明确：resource 是应用驱动的上下文数据源，带唯一 URI 和 MIME type，可通过列出、读取、订阅等方式访问，还支持 resource templates。

最关键的不是资源能被读，而是“谁决定读”。resource 的控制权主要在 application 侧，而不是模型侧。这意味着：

1. resource 更像可寻址上下文，不是动作命令
2. application 可以决定是否把它纳入上下文窗口
3. resource 适合做只读事实面，而不适合承载高副作用动作

所以如果技术复盘官问“为什么 MCP 要把 resource 独立出来”，一个强回答是：

因为读取上下文和执行动作是两种完全不同的治理问题。前者重点是身份、范围、缓存和订阅；后者重点是参数校验、审批和副作用。

### Prompt 是 user-controlled workflow scaffold

prompts 也不是“另一种 tool”。MCP 文档强调 prompts 是 user-controlled 的模板，通过 `prompts/list` 发现、通过 `prompts/get` 具体化，而且可以引用工具和资源。

这说明 prompt 的本质不是执行，而是“工作流脚手架”：

1. 它帮用户快速装配一类任务的上下文与步骤
2. 它可以参数化，但不是直接对外部世界产生副作用
3. 它更接近可复用交互入口，而不是自动化动作本身

所以成熟系统不会把 prompt 和 tool 统一当成“能力点”，而会把 prompt 视为“显式选用的任务模板”。

## 为什么 Hosted MCP 和本地 MCP 不是实现细节，而是执行权边界

### Hosted MCP 改变的是谁来持有工具调用回路

OpenAI Agents SDK 对 MCP 的设计特别值得技术复盘中讲清楚。它明确把接入方式按“工具调用发生在哪里”来分：

1. `HostedMCPTool`：由 Responses API 代表模型去调用一个公网可达的 MCP server
2. Streamable HTTP / SSE / stdio：由你自己的进程直接连 MCP server，再把能力提供给 agent

这不是 SDK 便利性差异，而是执行权边界差异。

如果走 hosted MCP：

1. 工具往返发生在 OpenAI 基础设施里
2. Python 进程不再负责自己去列举和逐个调用 `mcp_servers`
3. 你需要把 server 设计成可被远程托管执行的公开能力面

如果走本地 transport：

1. 实际连 server 和取能力的是你自己的进程
2. 你更容易结合本地权限、网络环境和审计系统
3. 你也更需要自己做过滤、审批和缓存治理

技术复盘中如果只说“HostedMCPTool 更方便”，就太浅了。更本质的说法是：

Hosted 与 local 的区别首先是执行权和网络边界，不是语法糖。

## 为什么 least-privilege exposure 不能只靠 server 端一次性定义

### 最小权限不是一个点，而是一条暴露链

很多人以为 MCP server 暴露什么，agent 就只能用什么，所以最小权限只在 server 端做一次就够了。但 OpenAI Agents SDK 的 MCP 文档已经说明，client 侧还有一整层治理能力：

1. 静态 tool filtering
2. 动态 tool filtering
3. prompt 访问控制
4. `list_tools()` 缓存
5. `require_approval` 的 always/never/per-tool/group 配置

这说明 least privilege 在 agent 系统里不是一个点，而是一条链：

1. server 定义原始能力面
2. adapter 决定暴露子集
3. runtime 再根据上下文决定某次调用是否需要审批

换句话说，MCP capability catalog 和 agent-visible capability set 不是一回事。

## 一个成熟的 MCP 接入设计至少要回答五个问题

### 这五个问题共同决定系统是否真的可治理

如果想把这个主题答到原理层，至少要把下面五个问题讲清楚：

1. 这项能力到底应该建模成 tool、resource 还是 prompt
2. 调用控制权在 model、application 还是 user 手里
3. 工具调用发生在 OpenAI 托管边，还是你自己的进程边
4. 暴露给 agent 的是否只是 server 原始能力的一个受控子集
5. 高风险 tool 的审批是 server 原生控制，还是 adapter/runtime 二次治理

只要这五个问题里有一个没说清，MCP 集成就很容易越做越乱。

## 机制解读

MCP 设计里最重要的不是“统一接工具”，而是先分清不同能力类型对应的控制语义。官方 server concepts 文档明确区分了三类能力：tools 是 model-controlled functions，带 JSON Schema 输入约束，通过 `tools/list` 和 `tools/call` 发现与执行，可能需要用户同意；resources 是 application-driven 的只读上下文源，带 URI 和 MIME type，可列出、读取和订阅，本质上解决的是上下文寻址与注入问题；prompts 则是 user-controlled 的模板，通过 `prompts/list` 和 `prompts/get` 发现与具体化，可以引用资源和工具，但本质是工作流脚手架而不是动作执行。这个分类一旦搞混，最小权限、审批和缓存都会一起出问题。进一步，OpenAI Agents SDK 对 MCP 的集成说明，首先要看工具调用发生在哪里：`HostedMCPTool` 是由 Responses API 代表模型调用公网可达的 MCP server，而 Streamable HTTP、SSE、stdio 等 transport 是由你的进程直接连 server。这意味着 hosted 和 local 的区别首先是执行权、网络边界和审计边界，不是语法差异。与此同时，SDK 还提供静态和动态 tool filtering、prompt 访问、`list_tools()` 缓存，以及 always/never/per-tool/group 级别的审批配置，说明 server 暴露出来的原始能力面和最终让 agent 看见、能调用的能力面不是一回事。成熟的 MCP 设计必须同时回答能力分类、控制权归属、执行位置、暴露子集和审批策略这五层问题。

真正把这一页读透后，就会明白 MCP 的核心不是“把更多东西暴露给模型”，而是把暴露行为拆成可分类、可裁剪、可审批、可观测的几层结构。只有这样，MCP 接入才能随着系统复杂度上升而继续保持清晰。

## 易混边界

1. 把 tools、resources、prompts 都统称成“可调用能力”
2. 把 resource 当成无副作用的 tool，或者把 prompt 当成自动执行入口
3. 认为 Hosted MCP 只是更方便的 transport，不涉及执行权边界变化
4. 只在 server 端做一次权限控制，不在 client/runtime 侧继续做过滤和审批
5. 不区分“server 能提供什么”和“agent 最终能看到什么”

## 相关样例

1. `examples/python/ai-agent/mcp_capability_boundary_outline.py`
