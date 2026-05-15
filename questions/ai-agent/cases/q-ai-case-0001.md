---
id: q-ai-case-0001
title: 如何设计一个 Agentic RAG 全链路知识问答系统，为什么不能只靠一次向量检索
domain: ai-agent
component: agent-cases
topic: agentic-rag-full-stack-case
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料 RAG repositories and existing RAG pattern documents as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - practice-all-in-rag
  - practice-what-is-vs
  - practice-easy-vecdb
claim_ids:
  - case-claim-0001
  - case-claim-0002
  - case-claim-0003
  - case-claim-0004
related_docs:
  - ai-agent/cases/agentic-rag-full-stack-case
estimated_minutes: 15
---

# 题目

如何设计一个 Agentic RAG 全链路知识问答系统，为什么不能只靠一次向量检索？

# 一句话结论

因为生产级 RAG 的可靠性来自入库、索引、召回、重排、证据选择、答案合成、评估和新鲜度治理的完整链路，向量检索只是其中一个环节。

# 核心机制

1. 入库链路决定知识能否被正确检索
2. 查询链路决定问题是否被正确改写、拆解和路由
3. 向量数据库负责候选召回，不负责最终事实判断
4. Agentic RAG 通过动态规划检索和验证步骤处理复杂问题
5. 生产系统必须补评估、权限、新鲜度和证据约束

# 标准答案

设计 Agentic RAG 系统时，不能只说“文档切块、embedding、向量检索、塞给大模型”。完整系统应该分成入库链路和查询链路。入库链路负责文档采集、格式解析、清洗、chunking、metadata 标注、embedding、写入向量库或关键词索引，并处理版本更新、删除同步和 reindex。查询链路先做权限和范围控制，再判断是否需要 query rewrite、query decomposition 或 routing，然后执行向量召回、关键词召回或 hybrid search，接着做去重、reranking、evidence selection，最后基于证据生成答案并返回引用。向量数据库主要负责向量和 metadata 存储、相似度召回和过滤，它不能自动解决问题拆解、证据权威性、冲突处理和答案真实性。Agentic RAG 的价值在于根据问题复杂度动态选择检索策略、调用工具或追加验证步骤。生产级系统还需要 evaluation、freshness、source trust、citation、权限隔离和反馈闭环，否则系统只能算演示链路。

# 必答点

1. 把入库链路和查询链路分开
2. 说明向量数据库的职责边界
3. 说明一次检索在复杂问题上的局限
4. 说明 Agentic RAG 的动态规划价值
5. 补充评估、新鲜度、权限和证据约束

# 常见误答

1. 把 RAG 等同于向量数据库
2. 只讲 embedding，不讲 metadata 和权限过滤
3. 不处理 query rewrite 和 query decomposition
4. 认为有引用就等于答案正确
5. 不设计离线评估和线上反馈
