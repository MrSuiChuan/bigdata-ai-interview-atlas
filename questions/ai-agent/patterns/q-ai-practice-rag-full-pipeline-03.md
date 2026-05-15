---
id: q-ai-practice-rag-full-pipeline-03
title: "RAG 全链路：RAG 答错时应该按什么链路排查？"
domain: ai-agent
component: agent-patterns
topic: rag
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-all-in-rag
claim_ids: []
related_docs:
  - ai-agent/patterns/rag-engineering-production-practice
estimated_minutes: 12
---

# 题目

RAG 全链路：RAG 答错时应该按什么链路排查？

# 一句话结论

不要第一反应换模型，应该从知识是否存在、解析、切分、索引、召回、重排、上下文和生成约束逐层定位。

# 核心机制

RAG 错误可能发生在任何一层。排障必须把最终答案拆回证据链，看正确证据是否存在、是否被召回、是否被放入上下文、是否被模型忠实使用。

# 标准答案

排查RAG 全链路时，先确认知识库中是否有答案，再检查解析是否丢字段、切分是否破坏语义、索引是否是最新版本、metadata filter 是否误过滤。接着看 top-k 召回和 rerank 结果，确认正确证据是否进入上下文。最后检查 prompt 是否要求基于证据回答，以及模型是否在无证据时拒答。

# 必答点

1. 先确认知识存在
2. 检查解析和切分
3. 检查索引版本和过滤条件
4. 检查召回与重排
5. 检查生成约束和拒答

# 常见误答

1. 直接换大模型
2. 只看最终答案
3. 不保存召回片段
4. 不区分检索错和生成错

# 延伸追问

1. 如何保存每次检索 trace？
2. metadata filter 误杀怎么发现？
3. 召回片段太多如何压缩？

