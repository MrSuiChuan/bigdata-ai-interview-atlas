---
id: q-ai-pattern-0001
title: RAG Agent 为什么解决的是知识 grounding，而不是长期记忆
domain: ai-agent
component: agent-patterns
topic: rag-agent
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Primary papers as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - rag-paper
claim_ids:
  - pattern-claim-0001
  - pattern-claim-0002
  - pattern-claim-0003
  - pattern-claim-0018
related_docs:
  - ai-agent/patterns/rag-agent
estimated_minutes: 6
---

# 题目

RAG Agent 为什么解决的是知识 grounding，而不是长期记忆？

# 一句话结论

因为它的核心是外部知识检索与生成结合，而不是持续保存用户经验、任务状态或长期偏好。

# 核心机制

1. parametric memory + non-parametric memory
2. retrieval-conditioned generation
3. external knowledge refresh instead of long-term state persistence

# 标准答案

RAG Agent 的核心是把外部检索结果并入生成过程，让模型在回答时获得更新鲜、更可替换的知识来源。这解决的是 grounding 和知识新鲜度问题，而不是长期保存任务经验、用户偏好或会话状态。长期记忆更偏 memory architecture；RAG 更偏知识访问层。

# 必答点

1. external knowledge access
2. not long-term memory system
3. knowledge update without retraining

# 常见误答

1. 把 RAG 说成长期记忆方案
2. 认为检索 = 记住