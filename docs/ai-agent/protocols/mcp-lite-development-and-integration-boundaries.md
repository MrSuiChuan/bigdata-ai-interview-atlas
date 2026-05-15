---
kb_id: ai-agent/protocols/mcp-lite-development-and-integration-boundaries
title: MCP Lite Development / Integration Boundaries：极简开发真正要学的是协议边界，而不是只跑通一个工具
domain: ai-agent
component: mcp
topic: mcp-lite-development-integration-boundaries
difficulty: intermediate
status: reviewed
sidebar_position: 6
version_scope: MCP official docs and 实践资料 MCP repositories as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - mcp-introduction
  - mcp-architecture
  - mcp-server-concepts
  - practice-mcp-lite-dev
  - practice-llm-protocols-guide
claim_ids:
  - mcp-claim-0001
  - mcp-claim-0002
  - mcp-claim-0004
  - mcp-claim-0005
  - mcp-claim-0006
  - mcp-claim-0010
  - mcp-claim-0011
  - mcp-claim-0012
tags:
  - ai-agent
  - mcp
  - protocol
  - integration
  - tools
---
## 一句话结论

MCP Lite Development / Integration Boundaries：极简开发真正要学的是协议边界，而不是只跑通一个工具需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题容易理解停留在表层

很多人学 MCP，会先做一个最小 demo：

1. 定义一个工具
2. 启动一个 MCP server
3. 让客户端发现并调用

这能帮助入门，但技术复盘中不够。真正应该回答的是：

1. MCP 解决的是哪个集成问题
2. Host、Client、Server 各自负责什么
3. stdio 和 Streamable HTTP 属于哪一层
4. Tool、Resource、Prompt 为什么不能混成一个能力池
5. 极简 demo 到生产集成之间还差哪些治理能力

### 极简 demo 真正证明了什么
它只证明协议最小回路已经打通，即 Host/Client 能发现一个 Server 暴露的能力并完成一次成功调用。它并不证明权限边界、错误语义、工具过滤和审计链已经成立。

## MCP 首先是集成协议，不是 Agent 框架

MCP 官方文档把它定位为连接 AI assistant 和外部系统的开放标准。它解决的是上下文和能力接入标准化问题。

这意味着 MCP 不直接负责：

1. 选择使用哪个大模型
2. 定义完整 Agent 规划策略
3. 管理多轮业务状态
4. 替你做工具审批和权限策略

它更像一层标准化接口，让不同 host 可以用一致方式连接不同 server 暴露的能力。

## Host、Client、Server 的边界

MCP 采用 host-client-server 架构：

1. Host 是用户实际使用的 AI 应用或开发环境
2. Client 是 host 内部维护的协议连接对象
3. Server 暴露工具、资源、提示词等能力

这个边界很重要。因为很多错误设计会把 Server 当成完整业务应用，或者把 Client 当成工具执行者。

更准确的理解是：

1. Host 负责用户交互、策略和上下文组织
2. Client 负责和某个 MCP server 维持协议连接
3. Server 负责暴露能力和响应协议请求

## Transport 和 Data Layer 要分开

MCP 官方架构文档把 transport 和 data layer 分开。data layer 基于 JSON-RPC 2.0，包含生命周期管理、server features 和消息交换模式；transport 则可以是 stdio 或 Streamable HTTP 等机制。

技术复盘中这点很关键，因为它决定部署方式：

1. stdio 更适合本地进程集成
2. Streamable HTTP 更适合远程或服务化集成
3. transport 变化不应该改变工具、资源、提示词这些 data layer 语义

所以极简开发不能只学“怎么启动一个进程”，还要知道这个进程和 host 之间到底走的是哪层协议。

## Tools、Resources、Prompts 不是同一种能力

MCP server 可以暴露 tools、resources、prompts 三类 primitives。它们的治理含义不同：

1. Tool 更接近可执行动作，通常要考虑参数校验、审批、副作用和幂等
2. Resource 更接近可读上下文，重点是 URI、范围、权限、缓存和订阅
3. Prompt 更接近用户可选择的工作流模板，重点是参数化和复用

所以极简开发要先把三类能力分清。否则生产里很容易出现：

1. 把只读资源做成高权限工具
2. 把 prompt 模板当成自动执行动作
3. 把所有能力一次性暴露给模型，导致权限面失控

## 实践资料 mcp-lite-dev 适合怎么导入

实践资料 的 `mcp-lite-dev` 适合作为“最小可运行开发路径”的补充材料。它在当前系统里应该承担两类作用：

1. 给 MCP 练习题提供实现侧案例
2. 给后续样例代码提供最小 server/client 参考

但协议语义仍然以官方 MCP 文档为准。也就是说，实践资料 仓库适合讲“怎么上手”，官方文档负责证明“协议到底是什么”。

## 从 demo 到生产还差什么

一个 MCP demo 通常只证明“能调用”。生产系统还需要补：

1. capability filtering：不同用户和场景看到不同能力
2. approval policy：高风险工具调用需要审批
3. least privilege：server 暴露最小必要能力
4. audit log：记录谁在什么上下文下调用了什么
5. error semantics：工具失败、超时、参数错误如何返回
6. transport security：远程连接时的认证、授权和网络安全
7. lifecycle management：server 初始化、能力发现、版本变化如何处理

### 为什么“能调用”离“可上线”还差很远
因为一旦进入真实环境，MCP 接入面对的不只是协议正确性，还要面对租户隔离、敏感工具审批、上下文污染、工具结果可信度和长连接稳定性。极简开发的价值是帮我们认清这些缺口，而不是让人误以为“把 demo 包装一下就能进生产”。

## 机制解读

MCP 极简开发不能只停留在“写一个工具并让模型调用”。MCP 是连接 AI assistant 和外部系统的开放标准，采用 host-client-server 架构：Host 是用户使用的 AI 应用，Client 是 host 内部和某个 server 维持连接的协议对象，Server 暴露 tools、resources、prompts 等 primitives。MCP data layer 基于 JSON-RPC 2.0，并把 transport 和 data layer 分开，stdio 与 Streamable HTTP 属于不同 transport 选择，不应该改变工具、资源、提示词的语义。极简 demo 能帮助理解发现和调用流程，但生产集成还必须补 capability filtering、approval policy、least privilege、audit log、错误语义、transport security 和生命周期管理。实践资料 的 `mcp-lite-dev` 适合提供上手代码，`llm-protocols-guide` 适合提供学习路径，但协议事实仍要以官方 MCP 文档为准。

### 极简开发这一页真正想建立的能力
不是让读者多记住几个 server 示例，而是建立一种判断力：看到一个能运行的 demo 时，能立刻指出它在审批、权限、错误处理和治理层面还缺什么。只有这种判断力建立起来，后续扩展到真实业务系统时才不会高估 demo 的完成度。

## 易混边界

1. 把 MCP 当成完整 Agent 框架
2. 只会写 tool demo，不讲 host-client-server 边界
3. 把 transport 和 data layer 混为一谈
4. 混淆 tools、resources、prompts
5. 忽略审批、权限、审计和最小暴露面
