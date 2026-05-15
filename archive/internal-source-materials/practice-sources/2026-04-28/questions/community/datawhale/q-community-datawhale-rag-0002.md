---
id: q-community-datawhale-rag-0002
title: 企业知识库 RAG 召回不准时应该怎么排查？
domain: community
component: datawhale
topic: rag-troubleshooting
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Datawhale RAG repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-all-in-rag
  - datawhale-wow-rag
claim_ids: []
related_docs:
  - community/datawhale/rag/p0-rag-mainline
estimated_minutes: 12
---

# 题目

企业知识库 RAG 召回不准时应该怎么排查？

# 一句话结论

要按链路排查：先看问题是否能被文档回答，再看文档解析、chunk、metadata、Embedding、索引、召回、重排和权限过滤，最后才看生成模型。

# 核心机制

RAG 错误常被误判成模型幻觉，但很多时候是检索链路没有给模型正确证据。排查时要把“没有文档”“文档切坏了”“召回不到”“召回到但被过滤”“召回到但模型没用”分开。

# 标准答案

企业知识库 RAG 召回不准，不能一上来调 prompt。第一步确认知识库里是否有答案，第二步看文档解析和清洗是否丢内容，第三步看 chunk 是否破坏语义，第四步看 metadata 和权限过滤是否把正确文档过滤掉，第五步看 Embedding 和检索策略是否适合问题类型，第六步看 rerank 是否把正确结果排上来，最后看生成阶段是否正确引用上下文。每一步都应该有可观测指标，比如 top-k 命中文档、召回分数、rerank 分数、引用片段和人工标注评估集。

# 必答点

1. 按 RAG 链路排查。
2. 区分数据问题、检索问题、重排问题和生成问题。
3. 说明权限过滤和 metadata。
4. 说明评估集和指标。
5. 不把所有问题归因于模型。

# 常见误答

1. 只调 prompt。
2. 只换 Embedding 模型。
3. 不看 top-k 原始召回。
4. 不做离线评估。

# 延伸追问

1. 怎么构建 RAG 评估集？
2. 权限过滤会怎样影响召回？
3. 混合检索什么时候有价值？
