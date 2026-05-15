---
id: q-ai-agent-0002
title: tool use 为什么不是把函数名和参数塞进 Prompt 就够了
domain: ai-agent
component: agent-runtime
topic: execution-loop
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Official AI agent docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-tools
  - mcp-server-concepts
claim_ids:
  - agent-runtime-claim-0002
  - openai-agents-claim-0004
  - mcp-claim-0007
related_docs:
  - ai-agent/foundations/execution-loop-and-tool-use
estimated_minutes: 6
---

# 题目

tool use 为什么不是把函数名和参数塞进 Prompt 就够了？

# 一句话结论

因为真实工具调用需要结构化 schema、运行时执行、结果回送和边界控制，而不是让模型自由编动作文本。

# 核心机制

1. 工具有结构化输入契约
2. 运行时负责执行与回送结果
3. 调用边界还涉及 tracing、权限和错误处理

# 标准答案

真正的 tool use 不是让模型在 Prompt 里随便拼函数名和参数，而是把工具做成结构化运行时能力。OpenAI function tools 和 MCP tools 都体现了这一点：工具有明确 schema，运行时负责调用、校验和回传结果，再进入下一轮执行循环。所以工具调用本质上是受控的系统动作，而不是文本技巧。

# 必答点

1. schema
2. runtime execution
3. tool result 回送执行循环

# 常见误答

1. 说成“输出 JSON 就等于工具调用”
2. 忽略验证和边界控制