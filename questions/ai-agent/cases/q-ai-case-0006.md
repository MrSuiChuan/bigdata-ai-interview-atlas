---
id: q-ai-case-0006
title: RAG 学习路径为什么不能停在上传文档问答 Demo
domain: ai-agent
component: rag
topic: rag-application-learning-path
question_type: system-design
difficulty: intermediate
status: reviewed
version_scope: "实践资料 wow-rag and llm-universe repositories as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - practice-wow-rag
  - practice-llm-universe
claim_ids:
  - practice-p2-claim-0006
related_docs:
  - ai-agent/cases/rag-application-learning-path-wow-rag-and-llm-universe
estimated_minutes: 10
---

# 题目

RAG 学习路径为什么不能停在上传文档问答 Demo？

# 一句话结论

因为可靠 RAG 要覆盖文档处理、检索质量、知识库工程、权限隔离、部署和验证迭代。

# 标准答案

RAG 学习不能停在上传文档问答 Demo。第一阶段要跑通文档加载、切分、Embedding、向量入库、检索、Prompt 和生成；第二阶段要优化检索质量，关注 chunk、top_k、reranker、metadata filter 和查询改写；第三阶段要处理知识库工程，包括复杂格式、版本更新、权限隔离、增量索引和过期内容；第四阶段要建立验证集，用标准问题、期望答案、引用文档、拒答样例、权限样例和冲突样例证明系统质量。能问答不等于可靠 RAG。

# 必答点

1. 说明 Demo 链路
2. 说明检索质量优化
3. 说明知识库工程
4. 说明权限和时效
5. 说明验证集和迭代

# 常见误答

1. 上传文档就叫 RAG
2. 只讲向量库
3. 不检查检索证据
4. 不做验证集
5. 不讲权限隔离

