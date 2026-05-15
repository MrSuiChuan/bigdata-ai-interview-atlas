---
id: q-ai-pattern-0007
title: Retriever、Reranker、Hybrid Search 三者的分工到底是什么
domain: ai-agent
component: agent-patterns
topic: retriever-reranker-hybrid-search
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Primary papers and official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - rag-paper
  - colbertv2-paper
  - openai-file-search-docs
claim_ids:
  - pattern-claim-0022
  - pattern-claim-0023
  - pattern-claim-0024
  - pattern-claim-0025
related_docs:
  - ai-agent/patterns/retriever-reranker-and-hybrid-search
estimated_minutes: 8
---

# 题目

Retriever、Reranker、Hybrid Search 三者的分工到底是什么？

# 一句话结论

Retriever 负责先把候选找回来，Reranker 负责把候选排得更准，Hybrid Search 负责让召回同时利用多种检索信号而不是只押注一种路径。

# 核心机制

1. recall first
2. precision later
3. semantic plus keyword fusion for robust retrieval

# 标准答案

Retriever 的目标是扩大候选覆盖，尽量别漏掉真正相关的材料；Reranker 的目标是在已有候选里做更细粒度的相关性判断，提升最终排序质量；Hybrid Search 则是在召回阶段融合 semantic 与 keyword 等不同信号，提高 recall 稳定性。ColBERTv2 说明高精度排序为什么常需要 token-level late interaction，OpenAI File Search 说明生产系统会同时使用 vector search 和 keyword search。因此，一个成熟的检索系统通常是“混合召回扩覆盖，精排提升准确性，再进入 grounded generation”的分层结构。

# 必答点

1. retriever 对应 recall
2. reranker 对应 precision
3. hybrid search 对应多信号召回融合

# 常见误答

1. 把 hybrid search 说成 reranker
2. 认为 reranker 可以替代召回层
3. 只会讲向量检索，不会讲 keyword signal 的价值