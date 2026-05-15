---
id: q-llm-foundation-0026
title: 为什么企业 RAG 往往更偏向 Hybrid Retrieval，而不是纯 Dense Retrieval
domain: llm-foundations
component: information-retrieval
topic: bm25-dense-hybrid-rerank-query-rewrite-retrieval-eval
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "IR textbook, BM25 docs, DPR paper, BEIR paper, RAG paper, OpenAI retrieval guide, Azure RAG evaluators, and 实践资料 fun-ir metadata as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - stanford-ir-book
  - azure-bm25-scoring
  - dpr-paper
  - rag-paper
claim_ids:
  - llm-foundation-claim-0030
  - llm-foundation-claim-0013
related_docs:
  - llm-foundations/information-retrieval-bm25-dense-hybrid-and-rag-eval
estimated_minutes: 12
---

# 题目

为什么企业 RAG 往往更偏向 Hybrid Retrieval，而不是纯 Dense Retrieval？

# 一句话结论

因为企业问题通常同时包含自然语言意图和精确词项信号，Hybrid 可以同时利用 BM25 的词面精确匹配和 Dense Retrieval 的语义召回，稳健性通常更高。

# 标准答案

企业 RAG 往往偏向 Hybrid Retrieval，因为真实查询既有语义意图，也常带型号、错误码、版本号、函数名、法规条款和业务术语。纯 Dense Retrieval 在语义相似场景很强，但对精确编号、专有名词和短词项不一定稳定；BM25 则擅长词面精确匹配，但对表达改写和同义说法不够鲁棒。Hybrid 通过并行使用 BM25 和 Dense Retrieval，再结合去重、结果融合和 rerank，能同时覆盖词面和语义两类信号，因此更适合企业知识库这类混合查询分布。

# 必答点

1. 说明企业查询同时有语义和精确词项
2. 说明 BM25 擅长词面匹配
3. 说明 Dense 擅长语义召回
4. 说明 Hybrid 用于兼顾两类信号
5. 说明后面通常还要接 rerank

# 常见误答

1. 认为 BM25 已经过时
2. 认为向量相似就等于任务相关
3. 不讲错误码、型号和专有名词场景
4. 不讲结果融合和 rerank

# 追问

1. 为什么错误码适合 BM25？
2. Dense Retrieval 为什么会召回“语义像但编号不对”的结果？
3. Hybrid 的代价主要增加在哪些阶段？
