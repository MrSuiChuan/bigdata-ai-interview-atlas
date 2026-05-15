---
id: q-ai-pattern-0031
title: 为什么 Prompt Injection 的防线核心不是 system prompt，而是最小权限和审批边界
domain: ai-agent
component: agent-patterns
topic: prompt-injection-least-privilege-tool-boundary
question_type: security
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-safety-best-practices
  - openai-computer-use-guide
  - openai-agents-sdk-mcp
claim_ids:
  - pattern-claim-0136
  - pattern-claim-0137
  - pattern-claim-0138
  - pattern-claim-0139
  - pattern-claim-0140
related_docs:
  - ai-agent/patterns/prompt-injection-least-privilege-and-tool-permission-boundaries
estimated_minutes: 10
---

# 题目

为什么 Prompt Injection 的防线核心不是 system prompt，而是最小权限和审批边界？

# 一句话结论

因为真正的风险不在于模型看到了恶意文本，而在于不可信内容能否借模型触达高权限工具；所以必须先收缩工具暴露面、再加审批门和隔离环境，而不是只靠 prompt 约束。

# 核心机制

1. untrusted content can indirectly influence tool decisions
2. least privilege reduces exposed action surface
3. approval and isolation bound high-risk execution

# 标准答案

Prompt injection 的风险本质，不是模型会不会被一句话“骗到”，而是不可信内容是否有机会通过模型触达高权限动作。OpenAI 的 safety best practices 指南建议 moderation、human oversight，以及通过约束输入和缩小输出范围来降低风险，这说明关键在于收缩 attack surface，而不是继续堆 system prompt。更危险的是 indirect injection：OpenAI 的 computer use guide 明确指出网页内容应被视为 untrusted input，并建议在隔离浏览器或 VM 中运行，限制本地访问，同时维护 domain 和 action allow list，并对购买、认证、destructive、hard-to-reverse 行为保持 human in the loop。工具暴露层面，OpenAI Agents SDK 的 MCP 文档又提供了 `tool_filter` 和 `require_approval` 两道边界，前者控制哪些工具默认可见，后者控制哪些调用即使可见也不能直接执行。真正成熟的系统，会把 prompt injection 处理成不可信输入边界、最小权限工具暴露、审批门和执行环境隔离的联合设计，而不是把希望寄托在一句“忽略恶意指令”上。

# 必答点

1. 先讲 indirect injection，不只讲用户直接输入
2. 说明 least privilege 比事后检测更基础
3. 说明 `tool_filter` 和审批门是不同边界
4. 提到隔离浏览器或 VM 这类环境隔离

# 常见误答

1. 以为写更强的 system prompt 就够了
2. 不区分文本风险和工具风险
3. 给 agent 暴露过多工具再事后拦截
4. 不给高风险动作设置 human in the loop