---
id: q-community-datawhale-rag-0003
title: 向量数据库在 RAG 中负责什么，又不负责什么？
domain: community
component: datawhale
topic: vector-database-boundary
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Datawhale vector search repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-what-is-vs
  - datawhale-easy-vecdb
claim_ids: []
related_docs:
  - community/datawhale/rag/p0-rag-mainline
estimated_minutes: 10
---

# 题目

向量数据库在 RAG 中负责什么，又不负责什么？

# 一句话结论

向量数据库负责向量存储、索引、相似度检索和部分 metadata 过滤，但不负责文档质量、答案正确性、业务权限策略设计和模型是否正确使用证据。

# 核心机制

向量数据库解决的是“如何高效找到相似向量”。它不能理解业务真相，也不能保证检索结果一定能回答问题。RAG 系统还需要文档治理、检索策略、重排、上下文工程、引用和评估。

# 标准答案

向量数据库在 RAG 中主要负责存储 embedding、建立 ANN 索引、按相似度召回候选片段，并支持 metadata 过滤。它不负责原始文档是否可靠，不负责 chunk 是否合理，不负责问题是否需要关键词检索，也不负责模型是否正确使用召回内容。工程上要把向量库看成检索基础设施，而不是 RAG 的全部。选型时才看规模、过滤能力、更新能力、延迟、召回质量、运维成本和生态集成。

# 必答点

1. 说明向量库职责。
2. 说明不负责答案正确性。
3. 说明 metadata filter 和索引能力。
4. 说明和 BM25、rerank、生成层的边界。
5. 说明选型指标。

# 常见误答

1. 认为用了向量库就等于有 RAG。
2. 认为向量相似就等于语义正确。
3. 不讲过滤和增量更新。
4. 不讲和关键词检索的互补。

# 延伸追问

1. ANN 索引为什么可能牺牲召回？
2. metadata filter 什么时候会伤害召回？
3. 向量库选型应该看哪些指标？
