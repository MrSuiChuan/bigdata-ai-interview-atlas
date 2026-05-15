---
id: q-ai-wow-agent-0003
title: 什么时候 wow-agent 这种轻量跨平台框架就够了，什么时候应该换更重的运行时
domain: ai-agent
component: wow-agent
topic: production-governance-observability-framework-selection
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "实践资料 wow-agent repository, OpenAI Agents SDK docs, and MCP docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-wow-agent
  - openai-agents-sdk-docs
  - mcp-introduction
claim_ids:
  - practice-p0-claim-0007
  - practice-p0-claim-0008
  - agent-runtime-claim-0010
related_docs:
  - ai-agent/frameworks/wow-agent-production-governance-observability-and-framework-selection
estimated_minutes: 10
---

# 题目

什么时候 wow-agent 这种轻量跨平台框架就够了，什么时候应该换更重的运行时？

# 一句话结论

原型、内部工具和单租户助手场景通常够用；一旦进入长运行、多租户、强审计和高风险动作场景，就要评估更重的运行时或治理壳。

# 核心机制

1. 轻量框架适合原型和结构验证。
2. 重型运行时适合恢复、审计和长任务。
3. 真实分水岭是治理责任，而不是功能列表。
4. 可以先补治理壳，再决定是否换框架。

# 标准答案

wow-agent 这类轻量跨平台框架通常适合做原型验证、内部效率工具和单租户助手，因为它能快速统一模型与工具适配，帮助团队把基本运行链跑起来。但如果系统开始承担长运行任务、多租户隔离、严格审计、频繁高风险工具调用或复杂恢复需求，就应该评估更重的运行时。此时问题不在于框架还能不能继续写，而在于治理壳是否已经重到值得单独框架承接。

# 必答点

1. 说明适合的场景和不适合的场景。
2. 说明治理责任是分水岭。
3. 说明长运行、多租户和强审计需求。
4. 说明可以先补壳再换层。
5. 说明这不是流行度比较，而是阶段判断。

# 常见误答

1. 认为一个框架能包打一切阶段。
2. 不讲多租户和高风险动作。
3. 只按支持模型数量判断。
4. 不区分补壳和换运行时。
