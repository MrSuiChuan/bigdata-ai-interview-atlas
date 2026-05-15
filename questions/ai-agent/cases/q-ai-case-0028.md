---
id: q-ai-case-0028
title: AI 编程 Agent 为什么必须把“上下文装载”和“可写范围”拆开设计
domain: ai-agent
component: ai-coding-workflow
topic: context-loading-plan-diff-scope-control
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale smart-dev repository, Roo Code docs, and MCP docs as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-smart-dev
  - roo-code-docs
  - mcp-introduction
  - mcp-server-concepts
claim_ids:
  - practice-p1-claim-0012
related_docs:
  - ai-agent/cases/ai-coding-workflow-context-loading-plan-diff-and-scope-control
estimated_minutes: 10
---

# 题目

AI 编程 Agent 为什么必须把“上下文装载”和“可写范围”拆开设计？

# 一句话结论

因为系统可以需要看很多信息来理解问题，但绝不能因此默认拥有同样大的写权限。

# 标准答案

上下文装载解决的是“让模型看什么”，而可写范围解决的是“让系统改什么”。二者不是一个概念。真实工程里，模型可能需要读取多个目录、测试和文档来理解问题，但真正允许改动的通常只是很小一组文件。如果把读权限和写权限绑定在一起，就会导致读到哪里、就可能改到哪里，越界修改风险非常高。成熟系统会把上下文装载、计划生成和 diff boundary 分开设计，保证信息理解范围可以比修改范围更大，但修改范围始终被显式限制。

# 必答点

1. 读权限和写权限不是同一件事
2. 上下文装载服务理解，不等于授权修改
3. 可写范围要显式约束到文件或对象
4. 否则容易出现越界修改

# 常见误答

1. 看得到就可以改
2. 只要模型足够强就不会越界
3. 不需要计划中的 writable scope
4. 把权限控制等同于模型能力问题
