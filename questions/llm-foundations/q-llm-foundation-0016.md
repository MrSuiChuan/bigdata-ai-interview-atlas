---
id: q-llm-foundation-0016
title: RAG 为什么必须懂信息检索，BM25、Dense Retrieval、Hybrid 和 Rerank 怎么讲
domain: llm-foundations
component: information-retrieval
topic: bm25-dense-hybrid-rerank-query-rewrite-retrieval-eval
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "IR textbook, BM25 docs, DPR, BEIR, RAG sources, and 实践资料 fun-ir metadata as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-fun-ir
  - stanford-ir-book
  - azure-bm25-scoring
  - dpr-paper
  - beir-paper
  - rag-paper
claim_ids:
  - llm-foundation-claim-0030
related_docs:
  - llm-foundations/information-retrieval-bm25-dense-hybrid-and-rag-eval
estimated_minutes: 10
---

# 题目

RAG 为什么必须懂信息检索？BM25、Dense Retrieval、Hybrid 和 Rerank 怎么讲？

# 一句话结论

RAG 的答案上限先受检索约束，BM25 解决词面精确匹配，Dense Retrieval 解决语义召回，Hybrid 组合两者，Rerank 负责精排。

# 标准答案

RAG 不是向量库加模型，而是信息检索和生成的组合。BM25 基于关键词和倒排索引，适合错误码、型号、法规条款、函数名和专有名词；Dense Retrieval 把 query 和 chunk 编码成向量，适合语义相似问题；Hybrid Search 结合关键词和向量，适合企业知识库；Rerank 对候选证据重新排序，让最相关片段进入上下文。评估时要分别看检索命中、排序、引用支撑和最终答案，不能只看回答是否流畅。

# 必答点

1. 说明 RAG 受检索约束
2. 说明 BM25 的精确匹配价值
3. 说明 Dense Retrieval 的语义召回
4. 说明 Hybrid 和 Rerank
5. 说明检索评估和生成评估分开看

# 常见误答

1. 把 IR 等同于向量检索
2. 认为 BM25 过时
3. 向量相似等于答案正确
4. top_k 越大越好
5. 不评估检索

# 追问

1. 错误码为什么适合 BM25？
2. Dense Retrieval 为什么可能漏型号？
3. Rerank 和 Query Rewrite 有什么区别？
