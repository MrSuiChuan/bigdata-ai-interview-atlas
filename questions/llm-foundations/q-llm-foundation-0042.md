---
id: q-llm-foundation-0042
title: 为什么 RAG 系统必须同时治理文档新鲜度、权限过滤和引用支撑，而不是只调 top_k 或 embedding 模型
domain: llm-foundations
component: rag-foundations
topic: freshness-permission-citation-failure-localization
question_type: principle
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

为什么 RAG 系统必须同时治理文档新鲜度、权限过滤和引用支撑，而不是只调 `top_k` 或 embedding 模型？

# 一句话结论

因为 RAG 的可信度不只来自召回相关内容，还来自“证据是否最新、是否允许当前用户看到、是否真的支撑结论”这三层同时成立。

# 标准答案

调 `top_k` 或 embedding 模型只能改善候选召回的一部分问题，但 RAG 的长期可靠性取决于更完整的治理链。文档新鲜度决定系统是不是在用最新政策回答问题；权限过滤决定系统会不会把不该暴露的内容召回进上下文；引用支撑决定答案里的结论是不是被真实证据支持。只盯召回参数，会让系统在 demo 上看起来不错，但在真实业务里仍然可能出现过期答案、越权答案和“有引用但不支撑”的伪可信回答。

# 必答点

1. 说明召回只是 RAG 一环
2. 说明新鲜度对时效知识的重要性
3. 说明权限过滤必须前移到检索层
4. 说明引用支撑不等于有引用编号
5. 说明治理层决定长期可信度

# 常见误答

1. 认为换 embedding 就能解决大部分问题
2. 不讲索引刷新和文档版本
3. 不讲权限过滤
4. 有引用就默认可信

# 追问

1. 文档更新后为什么索引延迟会直接伤害可信度？
2. 权限为什么不能只在前端页面上控制？
3. citation grounding 通常应该检查什么？
