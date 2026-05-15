---
id: q-ai-case-0032
title: Agentic RAG 为什么必须引入 Query Planner，而不能所有问题都直接检索
domain: ai-agent
component: agent-cases
topic: query-planning-tool-routing-multi-stage-retrieval
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale RAG practice repositories and evaluation guidance as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-all-in-rag
  - practice-what-is-vs
  - practice-easy-vecdb
  - openai-agent-evals-guide
claim_ids:
  - case-claim-0001
  - case-claim-0002
  - case-claim-0003
  - case-claim-0004
related_docs:
  - ai-agent/cases/agentic-rag-query-planning-tool-routing-and-multi-stage-retrieval
estimated_minutes: 10
---

# 题目

Agentic RAG 为什么必须引入 Query Planner，而不能所有问题都直接检索？

# 一句话结论

因为复杂问题首先需要被识别和拆解，检索只是执行层，不是决策层。

# 标准答案

复杂知识问答经常包含对比、拆分、跨域查询、权限过滤、结构化字段查找等要求。如果系统不先判断问题类型，而是把原问题原封不动送去检索，就容易出现只召回了部分证据、走错数据入口、或把需要数据库查询的问题误当成纯文本搜索。Query Planner 的作用，就是在检索之前判断是否需要改写、拆解、路由或工具调用。它决定的是检索策略，而不是最终答案文本，因此不能被一次普通检索替代。

# 必答点

1. 检索不是决策层
2. 复杂问题可能要拆解和改写
3. Planner 决定是否调用工具和走哪条路
4. 否则系统会同质化处理所有问题

# 常见误答

1. top-k 调大就行
2. 检索本身会自动理解问题结构
3. 认为 Planner 只是多余的一轮模型调用
4. 不区分问题理解和证据查找
