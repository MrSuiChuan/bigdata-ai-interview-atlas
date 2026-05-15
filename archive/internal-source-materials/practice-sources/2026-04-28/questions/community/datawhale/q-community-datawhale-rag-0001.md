---
id: q-community-datawhale-rag-0001
title: Datawhale RAG 主线里，为什么 RAG 不是“向量库加 LLM”？
domain: community
component: datawhale
topic: rag-system
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale RAG repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-all-in-rag
  - datawhale-llm-universe
claim_ids: []
related_docs:
  - community/datawhale/rag/p0-rag-mainline
estimated_minutes: 10
---

# 题目

Datawhale RAG 主线里，为什么 RAG 不是“向量库加 LLM”？

# 一句话结论

RAG 是一条知识接入和证据使用链路，向量库只是索引和召回的一种实现。高质量回答要覆盖文档治理、切分、检索、重排、上下文拼接、引用、评估和权限。

# 核心机制

RAG 的正确性取决于整个链路：文档是否干净、chunk 是否合理、检索是否召回答案、重排是否过滤噪声、上下文是否被模型正确使用、答案是否有证据支撑。任何一环失败，最终回答都会出问题。

# 标准答案

RAG 不是“向量库加 LLM”。向量库只解决向量索引和相似度召回，不能自动保证文档质量、权限隔离、答案正确性和引用可靠性。完整 RAG 要从数据接入开始，处理清洗、切分、metadata、Embedding、BM25 或向量检索、混合召回、rerank、上下文组装、生成约束、引用和评估。面试里如果只讲向量库，说明还停留在 demo 层；如果能讲清召回失败、重排失败、生成失败分别怎么定位，才算进入工程层。

# 必答点

1. 说明向量库只是 RAG 的一环。
2. 说明文档治理和 chunk。
3. 说明检索、重排和上下文拼接。
4. 说明评估和引用。
5. 说明权限和生产边界。

# 常见误答

1. 只说把文档 embedding 后存进向量库。
2. 不讲 BM25 和混合检索。
3. 不讲权限和增量更新。
4. 不区分召回失败和生成失败。

# 延伸追问

1. chunk 过大或过小分别有什么问题？
2. RAG 答错时你怎么排查？
3. 为什么 Dense Retrieval 不能替代所有检索？
