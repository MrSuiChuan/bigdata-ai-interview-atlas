---
id: q-ai-wow-agent-0001
title: 评估 wow-agent 这类跨平台 Agent 框架时为什么不能只看支持哪些模型
domain: ai-agent
component: wow-agent
topic: cross-platform-agent-framework
question_type: tradeoff
difficulty: intermediate
status: reviewed
version_scope: "实践资料 wow-agent repository, OpenAI Agents SDK docs, and MCP docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-wow-agent
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - mcp-introduction
claim_ids:
  - practice-p0-claim-0007
  - practice-p0-claim-0008
related_docs:
  - ai-agent/frameworks/wow-agent-cross-platform-agent-framework
estimated_minutes: 10
---

# 题目

评估 wow-agent 这类跨平台 Agent 框架时，为什么不能只看支持哪些模型？

# 一句话结论

因为“支持多个模型”只是适配范围，真正决定框架质量的是模型差异、工具协议、运行循环、状态恢复、协议边界和治理能力是否被清晰抽象。

# 核心机制

1. 模型适配要处理消息、tool calling、streaming、结构化输出和错误语义。
2. 工具适配要处理 schema、参数校验、副作用、审批和 MCP 等协议边界。
3. 运行循环要处理 step、预算、失败、重试和终止。
4. 状态层要区分 transcript、run state、memory 和 checkpoint。
5. 治理层要提供 tracing、日志、成本、延迟和权限审计。

# 标准答案

评估 wow-agent 这类跨平台 Agent 框架时，不能只看它支持哪些模型或平台。多模型适配要处理消息格式、tool calling、streaming、结构化输出、token 限制和错误语义；工具适配要有 schema、参数校验、副作用标注、审批和 MCP 等标准化能力；运行循环要能控制 step、预算、失败重试和 final answer；状态层要区分 transcript、run state、session memory、长期知识和 checkpoint；治理层要能看到每次模型决策、工具调用、参数、结果、成本、延迟和安全事件。实践资料 的 wow-agent 可以作为跨平台 Agent 框架学习案例，但生产落地还要补充恢复、权限、幂等和可观测性验证。

# 必答点

1. 说明跨平台不等于 API 包装。
2. 说明模型适配层和工具适配层的差异。
3. 说明运行循环需要预算和终止控制。
4. 说明状态不能全部塞进上下文。
5. 说明生产治理要覆盖 trace、权限、成本和失败恢复。

# 常见误答

1. 只列出支持的模型名称。
2. 把插件、协议和业务工具混为一谈。
3. 不讲工具副作用和审批。
4. 不讲 checkpoint 和恢复。
5. 不区分教学框架和生产框架。
