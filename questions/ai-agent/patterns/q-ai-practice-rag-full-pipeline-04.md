---
id: q-ai-practice-rag-full-pipeline-04
title: "RAG 全链路：如何设计 RAG 评估指标？"
domain: ai-agent
component: agent-patterns
topic: rag
question_type: system-design
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

RAG 全链路：如何设计 RAG 评估指标？

# 一句话结论

RAG 评估要分层：检索看证据命中，生成看答案忠实，安全看权限边界，工程看延迟和成本。

# 核心机制

只评估最终答案会掩盖问题来源。必须把 query、标准证据、召回片段、引用、最终答案和人工判定关联起来。

# 标准答案

设计RAG 全链路评估时，先构建问题集和标准证据。检索层用 Recall@k、MRR、正确文档命中率；重排层看正确证据是否进入 top-n；生成层看答案正确性、引用一致性和拒答正确性；安全层看越权召回；工程层看 P95 延迟、成本和索引更新时间。

# 必答点

1. 有问题集和标准证据
2. 检索层指标明确
3. 生成层评估忠实性
4. 安全层评估越权
5. 工程层评估延迟和成本

# 常见误答

1. 只用人工随便问
2. 只看 BLEU 或相似度
3. 没有标准证据
4. 不评估拒答

# 延伸追问

1. 如何标注标准证据？
2. 引用一致性怎么判断？
3. 线上反馈如何进入评估集？

