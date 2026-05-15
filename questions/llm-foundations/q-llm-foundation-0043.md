---
id: q-llm-foundation-0043
title: RAG 排障时为什么一定要把问题拆到 chunk、retrieval、rerank、Prompt 组装和 generation，而不能只说“模型幻觉”
domain: llm-foundations
component: rag-foundations
topic: embedding-knowledge-base-retrieval-rerank-eval
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "RAG paper, retrieval docs, Datawhale RAG courses, and evaluator docs as verified on 2026-04-27"
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
  - llm-foundations/rag-freshness-permission-citation-and-failure-localization
estimated_minutes: 10
---

# 题目

RAG 排障时为什么一定要把问题拆到 chunk、retrieval、rerank、Prompt 组装和 generation，而不能只说“模型幻觉”？

# 一句话结论

因为 RAG 的错误可能发生在生成之前的任何一层，不拆层就无法知道修复动作到底该落在知识处理、检索排序还是模型输出。

# 标准答案

RAG 不是单一模型调用，而是一条多阶段证据链。答案错误可能来自 chunk 切分破坏上下文，来自 retrieval 没召回目标证据，来自 rerank 没把关键片段排到前面，也可能来自 Prompt 组装时把好证据裁掉，最后才是 generation 阶段没有正确利用证据。如果一律把问题归因为“模型幻觉”，团队就会反复在模型和 Prompt 上盲调，错过真正的根因。只有拆层排障，才知道是该改 chunk、改检索、改 rerank、改 budget 还是改生成约束。

# 必答点

1. 说明 RAG 是多阶段链路
2. 说明错误常发生在生成之前
3. 说明拆层排障能指导修复动作
4. 说明“模型幻觉”是过于笼统的归因
5. 说明应保留候选、排序和最终证据的 trace

# 常见误答

1. 一律把错答归因给模型
2. 不区分召回错和生成错
3. 不看 rerank 和 budget
4. 不保留中间 trace

# 追问

1. 如何判断目标证据是否真的进入了最终 Prompt？
2. chunk 太小和太大分别会造成什么问题？
3. rerank 和 Prompt budget 之间是什么关系？
