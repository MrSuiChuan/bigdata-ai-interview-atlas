---
id: q-ai-pattern-0006
title: 为什么高级 RAG 常常要做 Query Rewrite 或 HyDE，而不是把原问题直接拿去检索
domain: ai-agent
component: agent-patterns
topic: query-rewrite-hyde
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - hyde-paper
  - rag-paper
claim_ids:
  - pattern-claim-0019
  - pattern-claim-0020
  - pattern-claim-0021
related_docs:
  - ai-agent/patterns/query-rewrite-and-hyde
estimated_minutes: 7
---

# 题目

为什么高级 RAG 常常要做 Query Rewrite 或 HyDE，而不是把原问题直接拿去检索？

# 一句话结论

因为原始用户问题未必适合直接映射到语料空间，Query Rewrite 和 HyDE 解决的是 retrieval-side 的表示错位问题，而不是替代真实证据来源。

# 核心机制

1. query transformation improves retrieval entry
2. HyDE generates a hypothetical document representation
3. real evidence must still come from retrieved corpus documents

# 标准答案

高级 RAG 引入 Query Rewrite 或 HyDE，主要是因为用户原问题往往过短、过口语化，或者与目标文档表达方式不一致，不一定适合直接进入 dense retrieval。普通 rewrite 会把 query 改写成更接近语料表达的形式；HyDE 则更进一步，先生成一篇假想相关文档，再用该文档表示去检索真实语料。HyDE 的关键边界是，假想文档不是最终证据，真正进入生成阶段的仍然应该是检索回来的真实文档，因此它属于 retrieval-side optimization，而不是答案本身。

# 必答点

1. 原始 query 不一定适合直接检索
2. HyDE 是假想文档表示，不是最终证据
3. rewrite 和 HyDE 都属于 retrieval-side query transformation

# 常见误答

1. 把 HyDE 说成先让模型把答案写出来
2. 认为改写后就不需要真实检索
3. 把假想文档当 citation 依据