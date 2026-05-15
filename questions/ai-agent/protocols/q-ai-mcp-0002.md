---
id: q-ai-mcp-0002
title: MCP 里的 tools、resources、prompts 为什么必须分清
domain: ai-agent
component: mcp
topic: primitives
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "MCP docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - mcp-server-concepts
  - mcp-resources
  - mcp-prompts
claim_ids:
  - mcp-claim-0006
  - mcp-claim-0007
  - mcp-claim-0008
  - mcp-claim-0009
related_docs:
  - ai-agent/protocols/mcp-architecture-and-primitives
estimated_minutes: 7
---

# 题目

MCP 里的 tools、resources、prompts 为什么必须分清？

# 一句话结论

因为它们映射的是动作、上下文和模板入口三种完全不同的系统责任。

# 核心机制

1. tool 是可执行动作
2. resource 是可读取上下文
3. prompt 是参数化模板入口

# 标准答案

在 MCP 里，tools、resources、prompts 是不同原语。tool 对应可执行能力，resource 对应带 URI 身份的可读取上下文，prompt 则对应可参数化的提示模板入口。把三者分清很重要，因为它直接影响权限边界、缓存策略、UI 呈现和系统理解。如果把它们全都叫工具，系统责任就会混乱。

# 必答点

1. action vs context vs template
2. server concepts taxonomy
3. system responsibility difference

# 常见误答

1. 把 resources 也说成工具
2. 认为 prompts 只是普通字符串