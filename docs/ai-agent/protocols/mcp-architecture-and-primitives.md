---
kb_id: ai-agent/protocols/mcp-architecture-and-primitives
title: MCP 架构与原语：host、client、server、tools、resources、prompts 应该怎么讲
domain: ai-agent
component: mcp
topic: architecture-primitives
difficulty: advanced
status: reviewed
sidebar_position: 2
version_scope: MCP docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - mcp-architecture
  - mcp-server-concepts
  - mcp-resources
  - mcp-prompts
claim_ids:
  - mcp-claim-0002
  - mcp-claim-0004
  - mcp-claim-0005
  - mcp-claim-0006
  - mcp-claim-0007
  - mcp-claim-0008
  - mcp-claim-0009
tags:
  - ai-agent
  - mcp
  - architecture
  - tools
---
## 一句话结论

MCP 不能只被概括成一句“开放协议”。它真正有价值的地方，在于把宿主、连接对象、服务端能力、消息语义和传输机制分层定义清楚，让不同 AI 应用可以用一致方式接入外部工具和上下文。

## Host、Client、Server 三层关系

官方架构文档给出的关系非常关键：

1. `host` 是最终承载 AI 应用的主体
2. `client` 负责和某个 MCP server 建立连接
3. `server` 负责暴露能力

这个划分说明，MCP 不是“应用直接连所有能力”那么粗糙，而是有明确连接边界。

### Host 为什么不是简单的 UI 外壳
Host 不只是把用户问题转给模型的界面层。它还负责组织会话、决定接入哪些 server、如何处理审批、哪些资源进入上下文，以及工具结果如何再反馈给用户。因此 Host 通常是协议之外最重要的策略承载点。

### Client 为什么要被独立出来
Client 的存在说明“使用能力”和“暴露能力”之间需要一个稳定的连接层。这个连接层负责维护与单个 server 的协议交互，而不是让上层应用自己拼接所有消息细节。把 Client 独立出来后，Host 才能在不感知具体 transport 细节的前提下管理多个 MCP server。

## 为什么 Data Layer 和 Transport Layer 要分开

官方文档明确把两层分开：

1. data layer 负责 JSON-RPC 2.0 消息与协议语义
2. transport layer 负责连接和传输机制

这带来一个很重要的工程收益：

1. 上层能力语义不用跟传输绑定死
2. 本地 `stdio` 和远程 `Streamable HTTP` 可以在同一协议模型下存在

所以 MCP 的设计不是“某种传输方案”，而是“协议语义和传输机制分层”。

### 分层之后带来的工程意义
这种分层让协议语义可以保持稳定，而部署形态可以按本地子进程、服务化接口或受控网关分别演进。也就是说，变更 transport 不应迫使 tools、resources、prompts 的语义一起变化，这正是协议标准化的核心收益。

## 三类原语为什么必须分清

### 1. Tools

工具是可执行能力。

它代表：

1. 某件动作可以被调用
2. 可能触发外部副作用
3. 更像 API 行为

### 2. Resources

资源是可读取上下文。

它代表：

1. 有 URI 身份
2. 可被客户端读取并放入模型上下文
3. 更像受控数据访问

### 3. Prompts

提示模板是用户可控的模板化入口。

它代表：

1. 服务端可以暴露推荐的提示结构
2. 调用方可以按参数检索和使用
3. 它既不是执行动作，也不是单纯数据文件

## 为什么这三类原语不能混用

因为它们映射的是完全不同的系统责任：

1. `tool` 是动作
2. `resource` 是上下文
3. `prompt` 是模板入口

如果全都叫工具，后面权限、审计、缓存和 UI 呈现都会混乱。

### 三类原语分别对应三套治理重点
Tool 的重点是参数校验、副作用、审批和幂等；Resource 的重点是 URI 寻址、读取范围、缓存与订阅；Prompt 的重点则是参数化模板、可复用交互入口和用户显式选择。如果不把它们分开，后续系统几乎不可能建立精细化的权限和审计边界。

## 机制解读

MCP 的架构可以从三层来回答：host 承载 AI 应用，client 负责与某个 MCP server 建立连接，server 负责暴露能力；协议层又分 data layer 与 transport layer，前者基于 JSON-RPC 2.0 定义消息语义，后者处理诸如 stdio 和 Streamable HTTP 的连接机制；在能力层，MCP 进一步区分 tools、resources 和 prompts，分别对应可执行动作、可读取上下文和参数化提示模板。把这三层一起讲出来，MCP 的结构就比较完整了。

再往前走一步，MCP 的真正意义还在于它把“能力如何描述”和“能力由谁控制”分离了出来。Host 决定接入哪些 server，Client 决定如何建立连接，Server 决定暴露哪些 primitives，而运行时再决定哪些能力真正对模型可见。只有把这几层都放进同一幅图里，MCP 才不再只是一个抽象名词，而是一套可以落地治理的协议结构。

## 本页结论
理解 MCP 架构与原语，关键不在于背出 Host、Client、Server 和 tools、resources、prompts 这几个词，而在于知道这些对象为什么必须分层、每一层负责什么、以及一旦混用会在哪些治理面出问题。

## 易混边界

1. 只会说 MCP 是开放协议，不会讲拓扑结构
2. 把 resources 和 tools 混成一个概念
3. 把 transport 误讲成协议全部内容

## 相关样例

1. `examples/python/ai-agent/mcp_minimal_server_outline.py`
