---
id: q-ai-case-0035
title: 当 Agentic RAG 回答不完整时，为什么要先拆 Planner、Router、Aggregator，再怀疑生成模型
domain: ai-agent
component: agent-cases
topic: online-evaluation-observability-failure-replay
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Datawhale RAG practice repositories and evaluation guidance as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-all-in-rag
  - openai-agent-evals-guide
  - openai-agents-sdk-tracing
claim_ids:
  - case-claim-0004
related_docs:
  - ai-agent/cases/agentic-rag-query-planning-tool-routing-and-multi-stage-retrieval
  - ai-agent/cases/agentic-rag-online-evaluation-observability-and-failure-replay
estimated_minutes: 10
---

# 题目

当 Agentic RAG 回答不完整时，为什么要先拆 Planner、Router、Aggregator，再怀疑生成模型？

# 一句话结论

因为很多不完整回答的根因出在前面的证据获取与收敛链，而不是最后的语言生成层。

# 标准答案

Agentic RAG 的回答不完整，常见根因是问题没有被正确拆解、错误路由导致漏查关键数据、或多路证据在聚合时被错误去重或预算裁掉。如果直接把问题归因给生成模型，就会跳过真正负责“找到并准备证据”的前置链路。成熟的排障顺序是先查 Planner 是否识别出完整意图，再查 Router 是否选对数据入口，再查 Aggregator 是否正确保留了关键证据，最后才判断模型综合是否有问题。

# 必答点

1. 说明前置链路决定证据是否完整
2. 先查 Planner
3. 再查 Router 和 Aggregator
4. 最后才看生成模型

# 常见误答

1. 回答不完整就是模型不行
2. 不区分检索控制面和生成层
3. 只看最终答案不看 Trace
4. 没有回放样本就调整 prompt
