---
id: q-llm-foundation-0006
title: RAG 为什么不是向量库加大模型，完整链路应该怎么讲
domain: llm-foundations
component: rag-foundations
topic: embedding-knowledge-base-retrieval-rerank-eval
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "RAG paper, retrieval docs, 实践资料 RAG courses, and evaluator docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - rag-paper
  - openai-retrieval-guide
  - azure-rag-evaluators
  - practice-all-in-rag
  - practice-llm-universe
claim_ids:
  - llm-foundation-claim-0010
  - llm-foundation-claim-0013
related_docs:
  - llm-foundations/rag-embedding-knowledge-base-and-retrieval-foundations
estimated_minutes: 10
---

# 题目

RAG 为什么不是“向量库加大模型”？完整 RAG 链路应该怎么讲？

# 一句话结论

RAG 是从文档接入、清洗、切分、Embedding、索引、召回、rerank、prompt 组装、生成到评估的完整证据链路，向量库只是其中一环。

# 标准答案

RAG 的目标是把外部知识作为可检查证据接入 LLM。完整链路包括文档接入、清洗去噪、chunk 切分、metadata 构建、Embedding、向量或混合索引、权限过滤、候选召回、rerank、token budget 裁剪、prompt 组装、答案生成、引用校验和评估。Embedding 只表示语义相似，不等于事实正确；向量库只负责检索候选，不负责判断答案是否被证据支撑。因此 RAG 的质量取决于文档质量、切分策略、召回与排序、权限、上下文组织和评估闭环。

# 必答点

1. 说明 RAG 是外部知识接入机制
2. 说明文档清洗、chunk、metadata 的作用
3. 说明 Embedding 相似不等于事实正确
4. 说明召回和 rerank 的分工
5. 说明要评估检索层和生成层

# 常见误答

1. 把 RAG 等同于向量数据库
2. 认为 top_k 越大越好
3. 不讲权限过滤和文档版本
4. 只看最终答案，不看目标证据是否召回
5. 认为有引用就一定事实正确

# 追问

1. RAG 答错时如何定位问题？
2. 为什么关键词检索仍然重要？
3. chunk 太大和太小分别有什么问题？
4. 如何评估引用是否支撑答案？
