---
id: q-ai-pattern-0011
title: 为什么说很多 RAG 的问题其实不在生成，而在 indexing 和 candidate recall
domain: ai-agent
component: agent-patterns
topic: indexing-candidate-recall
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-retrieval-guide
  - dpr-paper
  - rag-paper
claim_ids:
  - pattern-claim-0034
  - pattern-claim-0035
  - pattern-claim-0036
  - pattern-claim-0037
related_docs:
  - ai-agent/patterns/indexing-and-candidate-recall
estimated_minutes: 8
---

# 题目

为什么说很多 RAG 的问题其实不在生成，而在 indexing 和 candidate recall？

# 一句话结论

因为生成模型只能使用进入候选集的证据，而 indexing 和 retrieval 决定了正确证据是否有机会进入候选集。

# 核心机制

1. indexing turns raw corpus into retrievable assets
2. dense retrieval changes candidate coverage
3. candidate recall sets the upper bound for generation

# 标准答案

RAG 里很多看起来像“模型回答不好”的问题，实际根因是正确证据从来没有被做成可检索结构，或者没有被召回进候选集。OpenAI Retrieval guide 明确说明文件加入 vector store 后会自动被 chunk、embed 和 index；DPR 说明 dense retrieval 通过 dual-encoder 学习 question 和 passage 的语义匹配，并显著提升 top-20 retrieval accuracy。由此可以看出，indexing 和 candidate recall 决定了下游生成能否看到正确证据，因此它们往往是回答质量的上限问题，而不是边缘问题。

# 必答点

1. indexing 不是简单存文档
2. candidate recall 决定生成上限
3. generator 无法使用未被召回的证据

# 常见误答

1. 把问题都归咎于模型幻觉
2. 只谈 embedding 模型，不谈索引结构和 chunk 设计
3. 认为生成模型足够强就能补召回缺陷