---
id: q-ai-langgraph-0006
title: 为什么说 LangGraph 的 checkpoint、thread、interrupt 是核心原语
domain: ai-agent
component: langgraph
topic: persistence-hitl
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "LangGraph docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - langgraph-persistence-docs
  - langgraph-human-in-the-loop-docs
claim_ids:
  - langgraph-claim-0003
  - langgraph-claim-0004
  - langgraph-claim-0006
  - langgraph-claim-0007
related_docs:
  - ai-agent/frameworks/langgraph-persistence-and-human-in-the-loop
estimated_minutes: 8
---

# 题目

为什么说 LangGraph 的 checkpoint、thread、interrupt 是核心原语？

# 一句话结论

因为它们共同定义了长运行任务如何暂停、恢复、追踪和人工介入。

# 核心机制

1. checkpoint 保存每一步可恢复状态
2. thread 组织一串 checkpoint 历史
3. interrupt 提供 pause/resume 语义

# 标准答案

LangGraph 的核心不是 graph 本身，而是围绕 persistence 展开的状态语义。checkpoint 让任务每一步都有可恢复状态，thread 把这些状态组织成一条执行历史，interrupt 则让系统可以在关键节点暂停、等待人工处理，再继续执行。因此，human-in-the-loop、time travel、fault tolerance 和恢复能力，本质上都建立在这套原语之上。

# 必答点

1. recoverable state
2. execution history
3. pause and resume semantics

# 常见误答

1. 把 checkpoint 讲成缓存
2. 把 human-in-the-loop 讲成 UI 交互问题