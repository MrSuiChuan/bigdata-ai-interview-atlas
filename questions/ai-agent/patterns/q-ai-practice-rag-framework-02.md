---
id: q-ai-practice-rag-framework-02
title: "可复用 RAG 管线：Chunk 设计如何影响召回和生成质量？"
domain: ai-agent
component: agent-patterns
topic: rag-framework
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-wow-rag
claim_ids: []
related_docs:
  - ai-agent/patterns/rag-engineering-production-practice
estimated_minutes: 10
---

# 题目

可复用 RAG 管线：Chunk 设计如何影响召回和生成质量？

# 一句话结论

Chunk 决定检索粒度和上下文完整性，过小会切断证据，过大会引入噪声并增加成本。

# 核心机制

切分策略要结合文档结构、标题层级、表格、代码块、overlap、metadata 和问题类型设计，不能所有资料一刀切。

# 标准答案

在可复用 RAG 管线中，Chunk 设计要平衡召回粒度、语义完整性和 token 成本。FAQ 可以按问答对切，技术文档应保留标题层级，表格和代码块要避免被切碎。overlap 能缓解边界问题，但过大会造成重复召回。正确做法是用评估集比较不同 chunk size、overlap 和结构化切分策略。

# 必答点

1. 说明 chunk 大小权衡
2. 说明 overlap 的收益和代价
3. 说明结构化切分
4. 说明 metadata 继承
5. 说明用评估集验证

# 常见误答

1. 认为 chunk 越小越好
2. 忽略标题和表格结构
3. overlap 设置过大
4. 不做实验对比

# 延伸追问

1. PDF 表格如何切分？
2. 代码文档如何切分？
3. 如何发现答案被切碎？

