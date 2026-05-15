---
id: q-ai-practice-rag-framework-01
title: "可复用 RAG 管线：为什么不能说成“向量库加模型”？"
domain: ai-agent
component: agent-patterns
topic: rag-framework
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-wow-rag
claim_ids: []
related_docs:
  - ai-agent/patterns/rag-engineering-production-practice
estimated_minutes: 10
---

# 题目

可复用 RAG 管线：为什么不能说成“向量库加模型”？

# 一句话结论

可复用 RAG 管线要覆盖数据治理、检索、重排、生成、引用、权限和评估，向量库只是索引与召回的一部分。

# 核心机制

RAG 的目标是让模型基于可追溯证据回答。向量检索只解决候选片段召回，不能保证片段正确、权限正确、版本正确或答案忠实。

# 标准答案

回答可复用 RAG 管线时，要先画出完整链路：文档解析、清洗、切分、embedding、索引、召回、rerank、上下文组装、生成、引用和评估。向量库负责相似片段召回，但答案正确性还依赖数据质量、metadata filter、重排、prompt 约束和离线评估。

# 必答点

1. 说明完整 RAG 链路
2. 说明向量库职责边界
3. 说明 metadata 和权限过滤
4. 说明 rerank 与上下文组装
5. 说明评估和引用一致性

# 常见误答

1. 只讲 embedding
2. 不看召回片段
3. 不做权限过滤
4. 不做评估集

# 延伸追问

1. 什么时候需要 hybrid search？
2. 召回正确但答案错怎么排查？
3. 如何评估引用是否对应证据？

