---
id: q-ai-wow-agent-0002
title: wow-agent 中 Tool Adapter 和 Permission Boundary 为什么必须分开设计
domain: ai-agent
component: wow-agent
topic: tool-adapter-runtime-loop-permission-boundaries
question_type: system-design
difficulty: advanced
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
  - agent-runtime-claim-0002
related_docs:
  - ai-agent/frameworks/wow-agent-tool-adapter-runtime-loop-and-permission-boundaries
estimated_minutes: 12
---

# 题目

wow-agent 中 Tool Adapter 和 Permission Boundary 为什么必须分开设计？

# 一句话结论

因为一个负责“模型怎样理解和调用工具”，另一个负责“当前环境是否允许执行这个动作”，两者解决的是不同层次的问题。

# 核心机制

1. Tool Adapter 暴露统一 schema 和失败语义。
2. Permission Boundary 约束不同环境下的能力范围。
3. Approval Gate 承接高风险动作的人机分界。
4. Failure Channel 把不同错误返回给 runtime loop。

# 标准答案

Tool Adapter 的职责是把平台能力包装成模型可理解的工具接口，包括名称、参数 schema、副作用标注和失败类型；Permission Boundary 的职责则是根据当前平台、目录、网络、租户和风险规则判断这个动作在当前环境中是否允许执行。前者解决“怎么表达能力”，后者解决“能不能执行能力”。如果把两者混在一起，模型会把工具存在误解成工具可用，系统也更容易出现越权执行和错误重试。

# 必答点

1. 说明 Tool Adapter 与 Permission Boundary 的职责差异。
2. 说明 schema 和风险标注。
3. 说明审批与高风险动作。
4. 说明 failure channel 和 loop 的关系。
5. 说明混在一起会导致越权和误重试。

# 常见误答

1. 认为工具能暴露就说明能执行。
2. 所有权限都交给 prompt。
3. 不讲审批。
4. 不区分参数错误和权限错误。
