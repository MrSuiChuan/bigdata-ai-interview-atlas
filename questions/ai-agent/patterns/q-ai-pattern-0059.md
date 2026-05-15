---
id: q-ai-pattern-0059
title: Agent Skills、Tools、MCP、Subagents 的区别是什么
domain: ai-agent
component: agent-skills
topic: agent-skills-tools-mcp-subagents
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Anthropic docs, Claude blog, DeepLearning.AI course page, and 实践资料 agent-skills repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - anthropic-agent-skills-docs
  - anthropic-skills-explained-blog
  - deeplearning-ai-agent-skills-course
  - practice-agent-skills-with-anthropic
  - mcp-server-concepts
claim_ids:
  - practice-p2-claim-0002
  - practice-p2-claim-0003
related_docs:
  - ai-agent/patterns/agent-skills-tools-mcp-and-subagents
estimated_minutes: 12
---

# 题目

Agent Skills、Tools、MCP、Subagents 的区别是什么？

# 一句话结论

Skill 是能力包，Tool 是动作接口，MCP 是协议边界，Subagent 是委派执行主体。

# 标准答案

Skill 是可复用能力包，可以包含 instructions、scripts、resources 和领域知识，解决“什么时候加载什么能力”的问题；Tool 是具体动作接口，解决“如何用参数 schema 安全执行外部动作”的问题；MCP 是协议边界，解决 host、client、server 如何暴露 tools、resources、prompts 的问题；Subagent 是委派执行主体，拥有独立 instructions、上下文、工具和输出合同。四者可以组合，但不能混用。成熟系统要分别管理 Skill 版本、Tool 权限、MCP Server 信任边界和 Subagent 验收标准。

# 必答点

1. 说明 Skill 是能力包
2. 说明 Tool 是可执行接口
3. 说明 MCP 是协议，不是具体业务工具
4. 说明 Subagent 是委派主体
5. 说明版本、权限、信任和验收边界

# 常见误答

1. 全部叫插件
2. 把 Skill 当 Tool
3. 把 MCP 当 Agent 框架
4. 不讲 Subagent 输出验收
5. 不讲安全边界

