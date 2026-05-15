---
id: q-ai-pattern-0018
title: 为什么复杂问题不能只打一发检索，而要引入 Multi-Hop、Iterative 或 Graph Retrieval
domain: ai-agent
component: agent-patterns
topic: multi-hop-iterative-graph-retrieval
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Primary papers and official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - ircot-paper
  - self-rag-paper
  - graphrag-paper
  - graphrag-local-search-docs
  - graphrag-global-search-docs
  - graphrag-drift-search-docs
claim_ids:
  - pattern-claim-0066
  - pattern-claim-0067
  - pattern-claim-0068
  - pattern-claim-0069
  - pattern-claim-0070
  - pattern-claim-0071
  - pattern-claim-0072
related_docs:
  - ai-agent/patterns/multi-hop-iterative-and-graph-retrieval
estimated_minutes: 10
---

# 题目

为什么复杂问题不能只打一发检索，而要引入 Multi-Hop、Iterative 或 Graph Retrieval？

# 一句话结论

因为复杂问题的下一步检索目标经常依赖于前一步已经推导出的中间结论，one-shot retrieve-and-read 很容易在这类问题上失效。

# 核心机制

1. retrieval target evolves with intermediate reasoning
2. iterative retrieval is different from single-query rewrite
3. graph retrieval supports global aggregation beyond point lookup

# 标准答案

复杂问题不能只靠一次检索，因为后续该搜什么往往取决于前面已经推导出的中间结论。IRCoT 明确指出 one-step retrieve-and-read 对 multi-step QA 不够用，并通过把 retrieval 和 chain-of-thought 交错执行显著提升了 retrieval 与 QA 效果。Self-RAG 则进一步说明 retrieval 可以按需触发，并且 retrieved passages 与 generation 都需要 critique。GraphRAG 走的是另一条路线，它通过 entity graph 和 community summaries 让系统既能做 local entity reasoning，也能做面向整个语料库的 global summarization，DRIFT search 则结合全局概览与局部细化。因此，复杂 retrieval 的关键不是“再搜一次”，而是让检索与推理共同演化。

# 必答点

1. one-shot retrieval 在复杂问题上有结构性不足
2. iterative retrieval 不等于 query rewrite
3. graph retrieval 适合 global sensemaking 与结构化聚合
4. local / global / DRIFT 的边界要分清

# 常见误答

1. 把 multi-hop 说成多轮聊天
2. 把 graph retrieval 理解成图数据库同义词
3. 把 iterative retrieval 简化成多次改写 query