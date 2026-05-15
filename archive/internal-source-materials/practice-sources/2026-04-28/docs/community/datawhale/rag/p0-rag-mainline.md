---
kb_id: community/datawhale/rag/p0-rag-mainline
title: "Datawhale P0 RAG 主线整理"
domain: community
component: datawhale
topic: p0-rag-mainline
difficulty: advanced
status: reviewed
sidebar_position: 1
version_scope: "Datawhale RAG repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-all-in-rag
  - datawhale-wow-rag
  - datawhale-llm-universe
  - datawhale-what-is-vs
  - datawhale-easy-vecdb
claim_ids: []
---

# 一句话定位

Datawhale RAG 主线适合整理成“文档进入系统、被检索、被重排、被模型使用、被评估和优化”的完整链路。面试不能把 RAG 讲成“向量库加 LLM”。

# 核心链路

1. 文档接入：格式解析、清洗、去重、权限和元数据。
2. 切分：chunk 大小、重叠、标题层级、语义完整性。
3. 表征：Embedding 模型、稀疏检索、密集检索和混合检索。
4. 索引：向量库、倒排索引、过滤条件、增量更新。
5. 召回：top-k、metadata filter、query rewrite、多路召回。
6. 重排：reranker、规则过滤、业务排序。
7. 生成：上下文拼接、引用、拒答、格式控制。
8. 评估：召回率、答案正确性、引用命中、幻觉率、延迟和成本。

# 项目到面试知识点映射

| Datawhale 项目 | 适合转化的知识点 | 面试题方向 |
| --- | --- | --- |
| all-in-rag | RAG 全链路和生产优化 | “RAG 为什么不是向量库加模型？” |
| wow-rag | RAG 框架和应用实践 | “如何设计可复用 RAG 框架？” |
| llm-universe | 大模型应用和知识库问答 | “企业知识库问答怎么落地？” |
| what-is-vs | 向量检索和 RAG 实践 | “Dense Retrieval 不能替代什么？” |
| easy-vecdb | 向量数据库基础 | “向量库在 RAG 中负责什么，不负责什么？” |

# 面试必须讲清的原理

1. RAG 的关键不是“能检索”，而是检索结果是否覆盖真实答案。
2. Embedding 相似不等于答案正确，召回和生成之间还有重排、过滤和引用约束。
3. BM25、Dense Retrieval、Hybrid Search 适合不同问题，不应该单押一种。
4. RAG 幻觉不只来自模型，也来自文档脏数据、召回错误和上下文拼接错误。
5. 企业 RAG 必须处理权限、版本、增量更新和评估闭环。

# 常见误区

1. 只讲向量库，不讲文档治理。
2. 只讲 Embedding，不讲稀疏检索和混合检索。
3. 只看答案，不看引用和证据。
4. 不区分检索失败和生成失败。
5. 没有离线评估集，只靠人工试问。

# 需要官方交叉复核的点

1. 向量数据库具体索引能力和过滤语义。
2. Embedding API 参数、维度和模型版本。
3. Rerank 模型能力和调用方式。
4. 企业知识库平台权限和数据隔离行为。

# 后续拆分任务

1. 把 all-in-rag 拆成文档处理、检索、重排、评估四个整理页。
2. 把 what-is-vs 和 easy-vecdb 融合成“向量检索与向量库边界”。
3. 把 RAG 题目补充到 AI Agent 和 LLM 题库。
