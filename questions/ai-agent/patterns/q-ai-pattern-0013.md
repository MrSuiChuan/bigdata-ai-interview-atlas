---
id: q-ai-pattern-0013
title: Query Rewrite、HyDE、Routing、Decomposition 为什么必须分开讲
domain: ai-agent
component: agent-patterns
topic: query-rewrite-routing-decomposition
question_type: system_design
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - hyde-paper
  - rag-paper
  - openai-retrieval-guide
  - azure-agentic-retrieval-overview
  - azure-vector-query-filters
claim_ids:
  - pattern-claim-0019
  - pattern-claim-0020
  - pattern-claim-0021
  - pattern-claim-0041
  - pattern-claim-0042
  - pattern-claim-0043
  - pattern-claim-0044
related_docs:
  - ai-agent/patterns/query-rewrite-routing-and-decomposition
estimated_minutes: 11
---

# 题目

Query Rewrite、HyDE、Routing、Decomposition 为什么必须分开讲？

# 一句话结论

因为 rewrite 在优化单条 query 表达，HyDE 在构造更像文档的检索表示，routing 在选择检索路径，decomposition 在把复杂问题拆成多条可检索子任务，它们解决的是不同层次的问题。

# 核心机制

1. rewrite improves a single query representation
2. HyDE uses a hypothetical document as retrieval hint, not evidence
3. routing selects retrieval path or corpus
4. decomposition expands one complex query into multiple focused searches

# 标准答案

高级检索系统里，Rewrite、HyDE、Routing 和 Decomposition 必须分层理解。OpenAI Retrieval guide 里的 `rewrite_query=true` 只是在优化单条 query 的表达，并不会自动选择新索引路径或生成多查询计划；HyDE 则更进一步，它先生成一篇假想相关文档，再用该文档表示去检索真实语料，但假想文档本身不是最终证据；Routing 负责决定问题应进入哪个知识域、索引或检索器；Decomposition 则像 Azure agentic retrieval 那样，把复杂问题拆成多条更聚焦的子查询，并行执行后再统一重排和 grounding。因此，这四者分别属于表达优化、检索表示扩展、路径决策和多查询规划，不能混成一句“改写 query”。

# 必答点

1. rewrite 不等于 HyDE，也不等于 routing
2. routing 不等于 filtering
3. decomposition 解决复杂问题的多意图覆盖
4. HyDE 的 hypothetical document 不是最终证据

# 常见误答

1. 把四者统称为 query 改写
2. 认为复杂问题一次向量检索就够了
3. 把 routing 和 filtering 混为一谈
4. 把 HyDE 假想文档当成 citation 依据
