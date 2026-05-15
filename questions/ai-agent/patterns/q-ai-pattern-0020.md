---
id: q-ai-pattern-0020
title: 为什么 RAG 的成本优化和时延优化不能只靠少放几个 token，而要做 Budget 设计
domain: ai-agent
component: agent-patterns
topic: rag-cost-latency-cache-strategy
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-cost-optimization-guide
  - openai-latency-optimization-guide
  - openai-prompt-caching-guide
  - openai-batch-guide
  - openai-flex-processing-guide
claim_ids:
  - pattern-claim-0078
  - pattern-claim-0079
  - pattern-claim-0080
  - pattern-claim-0081
  - pattern-claim-0082
  - pattern-claim-0083
  - pattern-claim-0084
related_docs:
  - ai-agent/patterns/rag-cost-optimization-latency-budget-and-cache-strategy
estimated_minutes: 10
---

# 题目

为什么 RAG 的成本优化和时延优化不能只靠少放几个 token，而要做 Budget 设计？

# 一句话结论

因为真正的成本和时延来自整条链路的请求数、模型选择、输出长度、缓存命中率以及在线/异步路径划分，而不是单个 prompt 的长度本身。

# 核心机制

1. cost and latency are joint system budgets
2. output generation is often the dominant latency cost
3. cache and async routing must be designed into the architecture

# 标准答案

RAG 的成本和时延优化不应该只停留在“少几个 token”，而要按整条链路做预算设计。OpenAI 的 cost optimization guide 明确指出 cost 与 latency 通常是联动的，核心手段包括减少请求、减少 token 和选择更小模型；latency optimization guide 则把优化拆成七个原则，其中生成 token 往往是时延大头，削减输出长度通常比轻微减少输入更有效。对于缓存，prompt caching 只有在 prompt 至少 1024 tokens 且前缀完全匹配时才会命中，因此必须通过“固定前缀前置、动态内容后置、统一 prompt_cache_key”来设计 cache-friendly prompt。与此同时，Batch API 和 Flex processing 说明并不是所有工作都该走在线路径，批量评测、离线 enrichment、后台处理等任务完全可以迁移到更便宜的异步层。真正成熟的 RAG 系统，会先定义 latency budget 和 cost budget，再决定哪些步骤在线、哪些步骤异步、哪些内容可缓存、哪些任务不该默认调用 LLM。

# 必答点

1. cost 与 latency 要一起设计
2. 生成长度常常比轻微减少输入更影响时延
3. prompt caching 依赖稳定前缀结构
4. Batch / Flex 适合异步和低优先级任务

# 常见误答

1. 把优化理解成只缩短 prompt
2. 不定义 latency budget
3. prompt 结构不稳定导致缓存命中很差
4. 所有任务都走同步高优先级路径