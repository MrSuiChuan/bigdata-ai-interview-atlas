---
kb_id: ai-agent/patterns/query-routing-and-decomposition
title: "Query Routing / Decomposition：复杂问题为什么不能只打一发检索"
domain: ai-agent
component: agent-patterns
topic: query-routing-decomposition
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-retrieval-guide
  - azure-agentic-retrieval-overview
  - azure-vector-query-filters
claim_ids:
  - pattern-claim-0041
  - pattern-claim-0042
  - pattern-claim-0043
  - pattern-claim-0044
tags:
  - ai-agent
  - rag
  - routing
  - decomposition
---

# 一句话结论

复杂问题的 retrieval 往往不是“把原问题直接搜一次”就够了。Query Rewrite 解决的是单条 query 的表达优化，Query Routing 解决的是“这类问题该走哪条检索路径”，Query Decomposition 解决的是“一个复杂问题是否应该拆成多条更可检索的子问题”。

# 为什么这一题特别容易讲乱

因为很多人会把三件完全不同的事混成一个词：

1. rewrite
2. routing
3. decomposition

结果就是听上去都像“改一下 query”，但其实层次完全不同。

# Rewrite 在解决什么

OpenAI Retrieval guide 里提供了 `rewrite_query=true`，并且会把改写后的查询暴露在 `search_query` 字段里。

这说明 rewrite 的定位很清楚：

1. 它仍然是一条 query
2. 只是把这条 query 改写得更适合 search
3. 它并没有替你决定新的索引路径，也没有自动拆成多任务计划

所以 rewrite 更像“单路检索入口优化”。

# Routing 在解决什么

Routing 关心的是另一层问题：

1. 这个问题应该查哪个知识域
2. 应该走哪个 retriever
3. 应该查哪个租户、哪个区域、哪个索引
4. 是否需要先走规则路径，再走语义路径

也就是说，routing 是 retrieval architecture 的决策层。

它决定的不是 query 怎么写，而是 query 应该被送去哪条路。

# Decomposition 在解决什么

Azure AI Search 的 agentic retrieval 文档给了一个很好的官方例子：

1. 系统会用 LLM 把复杂问题拆成更聚焦的子查询
2. 子查询可以并行执行
3. 每条子查询的结果会被语义重排
4. 最终响应还会返回 grounding data、source references 和 activity/query plan

这说明 decomposition 不是语法改写，而是把一个复杂问题变成多条更可检索、更可覆盖的检索任务。

# 为什么复杂问题不能只打一发检索

因为很多复杂问题天然包含多个检索维度，例如：

1. 同时问原理和对比
2. 同时问历史背景和当前实现
3. 同时要求多个组件交叉解释
4. 同时带时间、范围、权限或产品域限制

如果只打一发大而混的 query，常见后果是：

1. 每个子意图都表达不充分
2. 检索器只抓到其中一部分
3. 返回结果混杂、覆盖不完整
4. 生成阶段基于不完整材料做过度综合

# Routing 和 Filtering 为什么还要分开

这是非常高频的混淆点。

可以这样记：

1. routing 决定走哪条检索路
2. filtering 决定在这条路里允许搜哪些对象

举例来说：

1. 先 route 到“Kafka 知识库”
2. 再 filter 到“2024 之后、中文、生产文档、租户 A”

所以 routing 是路径选择，filtering 是范围约束。

# 一个成熟系统里的典型顺序

更工程化的链路通常像这样：

1. 判断问题是否需要 rewrite
2. 判断是否需要 route 到特定索引或知识域
3. 判断是否需要 decomposition 成多条子查询
4. 每条子查询再带自己的 filter 与 retrieval 参数
5. 最终把多路结果统一重排、去重、grounding

这比“用户问题直接进一次向量检索”高出不止一个层次。

# 标准面试答案

复杂 RAG 或 Agent 检索系统里，Query Rewrite、Query Routing 和 Query Decomposition 需要严格分开。Rewrite 只是把单条 query 改写得更适合搜索，OpenAI Retrieval guide 里的 `rewrite_query=true` 就属于这一层；Routing 决定问题应该被送到哪个知识域、索引或检索路径；Decomposition 则是在复杂问题上把一个大 query 拆成多条更聚焦的子查询。Azure AI Search 的 agentic retrieval 明确说明系统可以利用 LLM 做 query decomposition、并行执行子查询、语义重排结果，并返回 grounding data 和 query plan。因此，高级检索不是简单“搜一次”，而是一个包含 rewrite、routing、decomposition、filtering 和 reranking 的多阶段决策过程。

# 常见误答

1. 把 rewrite、routing、decomposition 统称为“改写 query”
2. 认为复杂问题只要 embedding 模型强就能一次搜好
3. 把 routing 和 filtering 当成同一件事
4. 不理解 query plan 是一种显式的检索控制结构

# 相关样例

1. `examples/python/ai-agent/query_routing_decomposition_outline.py`