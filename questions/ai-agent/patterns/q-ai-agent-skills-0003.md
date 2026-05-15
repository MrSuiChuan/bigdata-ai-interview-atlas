---
id: q-ai-agent-skills-0003
title: MCP 已经能暴露 tools、resources、prompts 了，为什么 Skill 系统仍然不能省掉
domain: ai-agent
component: agent-skills
topic: agent-skills-tools-mcp-subagents
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Anthropic docs, Claude blog, DeepLearning.AI course page, and 实践资料 agent-skills repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - anthropic-agent-skills-docs
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

MCP 已经能暴露 tools、resources、prompts 了，为什么 Skill 系统仍然不能省掉？

# 一句话结论

因为 MCP 解决的是外部能力如何被标准化暴露，Skill 解决的是这些能力在什么任务里、以什么上下文和什么约束被装载和使用。

# 核心机制

1. MCP 管协议接入，不替代任务级能力封装
2. Skill 管任务触发条件、资源裁剪、工具边界和使用说明
3. Tool Contract 管真实动作副作用和失败语义
4. Subagent 管独立子任务委派

# 标准答案

即使引入 MCP，Skill 系统也不能省掉，因为两者职责不同。MCP 的重点是让外部 server 以标准协议暴露 tools、resources、prompts，解决的是 host、client、server 如何发现和调用能力。Skill 的重点是把某类任务需要的 instructions、resources、scripts、allowed tools 和边界条件打包成一个可装载能力包，解决的是任务运行时应该装什么、不该装什么、哪些能力可以组合使用。没有 Skill，系统虽然能接入很多 MCP Server，但模型仍然缺少任务级能力组织和约束；没有 MCP，Skill 又很难优雅地接入远程能力。工程上通常是 Skill 决定“该不该用、怎么用”，MCP 决定“从哪里接进来”。

# 必答点

1. 说明 MCP 是协议边界
2. 说明 Skill 是任务级能力包
3. 说明 Tool Contract 和 Subagent 仍有各自边界
4. 说明两者是叠加关系不是替代关系
5. 说明权限和上下文控制仍需要 Skill 层承担

# 常见误答

1. 把 MCP 当成技能系统
2. 认为接入更多 Server 就等于能力更强
3. 不讲任务上下文和装载约束
4. 不讲权限和信任边界
