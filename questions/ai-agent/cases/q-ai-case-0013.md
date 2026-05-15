---
id: q-ai-case-0013
title: 为什么从 RAG Demo 走向真实系统时，新鲜度、权限和冲突知识必须单列治理层
domain: ai-agent
component: rag
topic: rag-freshness-permission-conflict-evaluation-governance
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "检索治理资料、评估资料与实践材料 as verified on 2026-04-25 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-llm-universe
  - azure-query-time-acl-rbac
  - azure-change-delete-detection
  - openai-evaluation-best-practices
claim_ids:
  - practice-p2-claim-0006
  - pattern-claim-0074
  - pattern-claim-0157
  - pattern-claim-0175
related_docs:
  - ai-agent/cases/rag-freshness-permission-conflict-and-evaluation-governance
  - ai-agent/cases/rag-application-learning-path-wow-rag-and-llm-universe
estimated_minutes: 12
---

# 题目

为什么从 RAG Demo 走向真实系统时，新鲜度、权限和冲突知识必须单列治理层？

# 一句话结论

因为真实知识库不是静态样例集合，而是持续变化、带权限边界且可能互相冲突的证据系统，不单列治理层就无法保证回答可信。

# 核心机制

1. 新鲜度决定索引里的证据是不是当前有效版本
2. 权限决定谁能看到哪些证据
3. 冲突治理决定多个来源不一致时怎么处理
4. 评估闭环决定这些规则是否长期生效

# 标准答案

RAG Demo 往往只有一个用户、少量文档和静态样例，因此很容易掩盖治理问题。但真实系统面对的是持续更新的知识资产。新鲜度问题要求系统知道旧文档何时失效、新文档何时生效；权限问题要求系统在索引和查询两端都带上可过滤元数据；冲突知识问题要求系统在多个来源不一致时按版本、信任级或业务规则显式处理；最后还要把这些规则做成评估样例，否则每次改索引、改 prompt、改检索逻辑都可能重新越界或回归。单靠向量相似度无法解决这些问题，所以治理层必须单列设计。

# 必答点

1. 说明真实知识库是动态系统
2. 说明权限控制需要元数据和过滤策略
3. 说明冲突知识必须有显式规则
4. 说明治理规则必须进入评估集
5. 说明 Demo 不能自动证明治理已经成立

# 常见误答

1. 认为更新文档后重建一次索引就够了
2. 把权限控制留给前端显示层
3. 让模型自行判断冲突内容
4. 不把治理问题放进评估闭环
