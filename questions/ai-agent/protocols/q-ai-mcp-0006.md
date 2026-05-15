---
id: q-ai-mcp-0006
title: 为什么 MCP 极简开发的重点不是跑通一个工具，而是理解 Host、Client、Server 和能力边界
domain: ai-agent
component: mcp
topic: mcp-lite-development-integration-boundaries
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "MCP official docs and 实践资料 MCP repositories as verified on 2026-04-26"
last_verified_at: "2026-04-26"
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
related_docs:
  - ai-agent/protocols/mcp-lite-development-and-integration-boundaries
estimated_minutes: 10
---

# 题目

为什么 MCP 极简开发的重点不是跑通一个工具，而是理解 Host、Client、Server 和能力边界？

# 一句话结论

因为跑通工具只能证明协议链路能工作，真正决定系统能否安全集成的是 host-client-server 架构、transport/data layer 分离，以及 tools、resources、prompts 的治理边界。

# 核心机制

1. MCP 是集成协议，不是完整 Agent 框架
2. Host、Client、Server 分别承担用户应用、协议连接和能力暴露职责
3. stdio 与 Streamable HTTP 是 transport 选择，不等于能力语义
4. Tools、Resources、Prompts 的控制权和风险完全不同

# 标准答案

MCP 极简开发不能只停留在“定义一个工具并让模型调用”。MCP 官方文档把它定位为连接 AI assistant 与外部系统的开放标准，采用 host-client-server 架构：Host 是用户实际使用的 AI 应用或开发环境，Client 是 Host 内部维护的协议连接对象，Server 暴露 tools、resources、prompts 等 primitives。MCP data layer 基于 JSON-RPC 2.0，并和 transport 分离，stdio 和 Streamable HTTP 只是不同传输方式，不应该改变工具、资源和提示词的语义。三类 primitives 也不能混淆：Tool 是可执行动作，要考虑参数校验、审批、副作用和幂等；Resource 是可读上下文，要考虑 URI、范围、权限和缓存；Prompt 是用户可选择的工作流模板，要考虑参数化和复用。实践资料 的 `mcp-lite-dev` 适合做最小上手代码，`llm-protocols-guide` 适合补学习路径，但协议事实仍要以 MCP 官方文档为准。生产系统还必须补能力过滤、最小权限、审计、错误语义和 transport security。

# 必答点

1. 说明 MCP 是协议层，不是完整 Agent 运行时
2. 说明 Host、Client、Server 的职责边界
3. 说明 transport 和 data layer 分离
4. 区分 tools、resources、prompts
5. 说明 demo 到生产还需要权限、审批和审计治理

# 常见误答

1. 把 MCP 等同于工具调用框架
2. 只讲 server 暴露 tool，不讲 host 和 client
3. 把 resource 当成另一种 tool
4. 不区分 stdio 和 Streamable HTTP 的部署含义
5. 忽略最小权限和能力过滤
