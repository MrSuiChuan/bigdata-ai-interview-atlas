---
id: q-ai-case-0034
title: Agentic RAG 的线上治理为什么必须有 Trace、Failure Replay 和回归集，而不能只看用户反馈
domain: ai-agent
component: agent-cases
topic: online-evaluation-observability-failure-replay
difficulty: advanced
question_type: system-design
status: reviewed
version_scope: "Datawhale RAG practice repositories and evaluation guidance as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-all-in-rag
  - openai-agent-evals-guide
  - openai-evaluation-best-practices
  - openai-agents-sdk-tracing
claim_ids:
  - case-claim-0004
related_docs:
  - ai-agent/cases/agentic-rag-online-evaluation-observability-and-failure-replay
estimated_minutes: 12
---

# 题目

Agentic RAG 的线上治理为什么必须有 Trace、Failure Replay 和回归集，而不能只看用户反馈？

# 一句话结论

因为用户反馈只能告诉你“错了”，但不能稳定告诉你“哪一层错了、修复后是否真的解决了整类问题”。

# 标准答案

Agentic RAG 的失败点分布在 planner、router、retriever、evidence aggregator 和 answer synthesis 等多个层级。用户反馈最多只能说明结果不好，无法直接支撑根因定位。Trace 的作用是保存链路中间对象和关键决策；Failure Replay 的作用是把一次线上故障变成可重复执行的样本；回归集的作用是让后续模型、索引、路由或规则变更时，能够验证这类问题是否再次出现。没有这三层，团队往往只能凭印象修 bug，修完也不知道是否真的修好了。

# 必答点

1. 用户反馈只能说明结果，不足以定位根因
2. Trace 用于中间链路可观测
3. Replay 用于故障可复现
4. 回归集用于长期防回归

# 常见误答

1. 看用户投诉就够了
2. 只保留最终答案日志
3. 修一次不沉淀样本
4. 不把线上故障转成回归资产
