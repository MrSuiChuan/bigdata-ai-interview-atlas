---
id: q-ai-case-0033
title: Agentic RAG 里，为什么“多阶段检索”真正的难点是证据收敛而不是召回更多片段
domain: ai-agent
component: agent-cases
topic: query-planning-tool-routing-multi-stage-retrieval
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "Datawhale RAG practice repositories and evaluation guidance as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-all-in-rag
  - practice-what-is-vs
  - practice-easy-vecdb
  - openai-evaluation-best-practices
claim_ids:
  - case-claim-0004
related_docs:
  - ai-agent/cases/agentic-rag-query-planning-tool-routing-and-multi-stage-retrieval
estimated_minutes: 10
---

# 题目

Agentic RAG 里，为什么“多阶段检索”真正的难点是证据收敛而不是召回更多片段？

# 一句话结论

因为候选变多只会增加噪声，真正决定答案质量的是如何从候选中收敛出可用证据集。

# 标准答案

多阶段检索的表面动作是多查几轮，但系统设计的关键不在“查多少”，而在“最后给生成阶段的证据是否真正相关、可信、互不冲突且预算可控”。如果只追求召回更多片段，往往会把无关内容、重复内容和冲突内容一起塞进上下文，导致模型综合质量下降。Agentic RAG 的核心步骤是 evidence aggregation 和 evidence selection，它们负责去重、重排、冲突处理和预算收敛，因此比单纯提高召回数更关键。

# 必答点

1. 召回更多不等于更准
2. 要讲 evidence aggregation 或 selection
3. 要讲去重、重排、冲突处理
4. 要讲上下文预算约束

# 常见误答

1. top-k 越大越好
2. 只讲召回，不讲收敛
3. 忽略冲突证据
4. 不提上下文预算
