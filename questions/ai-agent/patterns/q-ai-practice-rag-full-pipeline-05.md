---
id: q-ai-practice-rag-full-pipeline-05
title: "RAG 全链路：如何处理权限、版本和知识更新？"
domain: ai-agent
component: agent-patterns
topic: rag
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-all-in-rag
claim_ids: []
related_docs:
  - ai-agent/patterns/rag-engineering-production-practice
estimated_minutes: 10
---

# 题目

RAG 全链路：如何处理权限、版本和知识更新？

# 一句话结论

生产 RAG 必须把权限、版本和更新时间写入 metadata，并在检索前后都做约束。

# 核心机制

知识正确不代表用户有权访问，旧版本正确不代表当前有效。权限过滤、版本控制和增量索引是生产系统和 demo 的分水岭。

# 标准答案

在RAG 全链路中，文档入库时就要写入租户、部门、角色、版本、生效时间和来源。检索时先按权限和版本过滤，再做召回和重排。文档更新要支持增量索引、旧版本下线和回滚。生成答案时应带引用和版本信息，避免把过期资料当成当前事实。

# 必答点

1. metadata 包含权限和版本
2. 检索前做权限过滤
3. 支持增量更新和旧版本下线
4. 答案带引用和版本
5. 监控越权和过期知识

# 常见误答

1. 只在前端控制权限
2. 不同租户共用无过滤索引
3. 旧文档不下线
4. 答案不展示证据

# 延伸追问

1. 多租户向量库怎么设计？
2. 旧版本召回怎么排查？
3. 权限变化后索引如何同步？

