---
id: q-ai-case-0015
title: RAG 与 memory、fine-tuning、搜索引擎的边界应该怎么讲
domain: ai-agent
component: rag
topic: rag-system-components-retrieval-grounding-boundaries
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "RAG 论文、检索资料与实践材料 as verified on 2026-04-24 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - rag-paper
  - openai-retrieval-guide
  - practice-what-is-vs
claim_ids:
  - pattern-claim-0001
  - pattern-claim-0003
  - pattern-claim-0018
related_docs:
  - ai-agent/cases/rag-system-components-retrieval-and-grounding-boundaries
  - ai-agent/cases/rag-freshness-permission-conflict-and-evaluation-governance
estimated_minutes: 12
---

# 题目

RAG 与 memory、fine-tuning、搜索引擎的边界应该怎么讲？

# 一句话结论

RAG 负责把外部知识检索并约束生成，memory 负责会话或长期状态连续性，fine-tuning 负责改模型参数，搜索引擎负责找文档而不负责把证据组织成可引用答案。

# 核心机制

1. RAG 改的是外部证据链，不是模型参数
2. memory 解决的是持续状态，不是共享知识召回
3. fine-tuning 改模型行为与参数，适合能力迁移而非知识即时更新
4. 搜索引擎找到文档后，RAG 还要做 grounding、生成和引用

# 标准答案

讲 RAG 边界时，首先要强调它的核心是“外部知识检索加证据约束生成”。RAG 通过索引、检索、重排和上下文组装，把非参数化知识送进生成过程，因此更适合处理知识更新、外部资料引用和回答可追溯；memory 则主要解决会话连续性、用户偏好和长期状态，不负责替代共享知识库；fine-tuning 通过修改模型参数改善某类任务行为或风格，但不适合承担频繁知识更新；搜索引擎主要负责找文档，RAG 还要继续完成 evidence selection、grounding、answer synthesis 和 citation。把这些边界讲清，才能说明为什么不同问题要选不同技术组合。

# 必答点

1. 说明 RAG 不改模型参数
2. 说明 memory 解决状态连续性
3. 说明 fine-tuning 更适合能力迁移而不是即时知识更新
4. 说明搜索引擎和 RAG 的责任边界不同
5. 说明 RAG 的关键价值在证据约束和可追溯性

# 常见误答

1. 认为 memory 就是 RAG
2. 认为 fine-tuning 可以替代所有知识更新
3. 把搜索引擎和 RAG 说成完全一样
4. 不讲证据链和引用能力
