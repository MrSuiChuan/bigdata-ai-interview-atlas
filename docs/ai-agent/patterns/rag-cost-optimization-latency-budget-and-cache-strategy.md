---
kb_id: ai-agent/patterns/rag-cost-optimization-latency-budget-and-cache-strategy
title: RAG Cost Optimization / Latency Budget / Cache Strategy：不是省一点 token，而是做整条链路的预算设计
domain: ai-agent
component: agent-patterns
topic: rag-cost-latency-cache-strategy
difficulty: advanced
status: reviewed
sidebar_position: 20
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
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
tags:
  - ai-agent
  - rag
  - cost
  - latency
  - cache
---
## 一句话结论

RAG Cost Optimization / Latency Budget / Cache Strategy：不是省一点 token，而是做整条链路的预算设计需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易答得像小技巧合集

很多人会说：

1. 缩短 prompt
2. 换小模型
3. 开缓存

这些都对，但如果没有预算视角，就会变成零散技巧，而不是系统设计。

高质量回答应该先回答：

1. 你的在线时延预算是多少
2. 哪一层最耗时、最耗钱
3. 哪些请求路径值得保留重模型
4. 哪些步骤可以批处理、缓存或降级

## Cost 和 Latency 为什么天然耦合

OpenAI 的 cost optimization guide 说得非常直接：

1. cost and latency are typically interconnected
2. 减少 requests 和 tokens 往往也会减少 latency
3. smaller models 往往能降低成本并缩短时延

这句话的重要性在于，它帮我们建立一个基础认知：

1. 成本优化和时延优化不是两套孤立问题
2. 它们经常由同一组结构性决策共同决定

所以在 RAG 里，预算设计通常是 joint budget，而不是分别看。

## Latency Budget 应该怎么拆

Latency optimization guide 给出 7 个原则：

1. Process tokens faster
2. Generate fewer tokens
3. Use fewer input tokens
4. Make fewer requests
5. Parallelize
6. Make your users wait less
7. Don’t default to an LLM

这组原则非常适合转成 RAG 的预算拆分。

一个典型 RAG 请求可以拆成：

1. query rewrite / routing
2. retrieval
3. rerank
4. answer synthesis
5. optional citation check / revision

然后再问：

1. 哪些步骤可以并行
2. 哪些步骤可以合并请求
3. 哪些步骤根本不该默认启用

这就从“调几个参数”升级成“给每一段分配预算”。

## 为什么输出 token 往往比输入 token 更值得先优化

Latency guide 里有一句很实用的经验法则：

1. cutting 50% of output tokens may cut about 50% of latency
2. cutting 50% of input tokens 通常只带来较小收益，除非上下文特别大

这对 RAG 很重要，因为很多团队只会盯：

1. top-k 再减一点
2. prompt 再短一点

但忽略了：

1. 最终回答写太长
2. structured output 太啰嗦
3. citation rendering 太冗长
4. revision pass 输出过多

这些往往才是更大的时延支出。

所以 latency budget 里，生成长度常常比“轻微减少一点上下文”更值得先控。

## Cache Strategy 为什么不只是 KV cache 常识

Prompt caching guide 给了一个非常实用的工程边界：

1. 自动缓存要求 prompt 至少 1024 tokens
2. 命中依赖 exact prefix match
3. 可以把 static content 放前面、dynamic content 放后面
4. `prompt_cache_key` 对共享长前缀请求尤其有帮助
5. 缓存可带来最高 80% latency reduction 和最高 90% input token cost reduction

这组信息特别适合转化成 RAG 设计原则：

1. 固定系统指令、固定 schema、固定 few-shot 示例尽量前置
2. 动态 query、动态检索结果尽量后置
3. 把可共享的长前缀稳定化，才能真正吃到 cache

所以 cache strategy 的本质不是“有无缓存”，而是“prompt 结构是否 cache-friendly”。

## 为什么不是所有路径都该实时跑

这点在成本优化里特别关键。

OpenAI 的 Batch API 和 Flex processing 给出了两条非常清晰的异步路径：

1. Batch API：50% lower costs，适合 24 小时内完成的异步任务
2. Flex processing：更低成本，但更慢、且可能资源暂不可用，适合非生产或低优先级异步任务

这对于 RAG 系统意味着：

1. 离线 embedding / re-embedding
2. 批量评测
3. 离线 citation audit
4. 大规模文档 enrichment
5. 后台 reindex 辅助任务

这些都不该和用户在线问答共用同一条“低延迟高价格”路径。

也就是说，成熟系统会主动分层：

1. online critical path
2. async enrichment path
3. offline evaluation path

## RAG 成本优化最常见的错误

最常见错误不是“不会省”，而是“省错地方”。

例如：

1. 一味压缩 retrieval context，结果 recall 掉太多
2. 保留了超长最终回答，真正大头没降下来
3. 所有任务都走同步高优先级路径
4. prompt 结构乱，导致缓存几乎命不中
5. 所有问题都默认走重 rerank、重 revision、重模型

这类系统往往既慢又贵，而且效果也未必稳定。

## 一个成熟的成本与时延设计应该怎么答

比较完整的回答通常会按这四层：

1. budget definition：定义在线时延与单请求成本上限
2. critical path design：识别必须在线的步骤，合并请求、并行可并行步骤
3. cache-aware prompt design：重构前缀，提升 prompt caching 命中率
4. async/offline offloading：把 batch、flex、离线 eval、reindex 辅助任务移出在线路径

这样回答时，技术复盘官通常会觉得你不是在讲小技巧，而是在讲 production architecture。

## 机制解读

RAG 的成本和时延优化不应该只停留在“少几个 token”，而要按整条链路做预算设计。OpenAI 的 cost optimization guide 明确指出 cost 与 latency 通常是联动的，核心手段包括减少请求、减少 token 和选择更小模型；latency optimization guide 则把优化拆成七个原则，其中生成 token 往往是时延大头，削减输出长度通常比轻微减少输入更有效。对于缓存，prompt caching 只有在 prompt 至少 1024 tokens 且前缀完全匹配时才会命中，因此必须通过“固定前缀前置、动态内容后置、统一 prompt_cache_key”来设计 cache-friendly prompt。与此同时，Batch API 和 Flex processing 说明并不是所有工作都该走在线路径，批量评测、离线 enrichment、后台重建等任务完全可以迁移到更便宜的异步层。真正成熟的 RAG 系统，会先定义 latency budget 和 cost budget，再决定哪些步骤在线、哪些步骤异步、哪些内容可缓存、哪些任务根本不该默认调用 LLM。

## 易混边界

1. 把成本优化理解成单纯“少放几个 chunk”
2. 完全不定义 latency budget
3. 不区分在线 critical path 和异步任务
4. prompt 结构不稳定，导致缓存几乎命不中
5. 所有问题都默认走重模型、重 rerank、重 revision

## 相关样例

1. `examples/python/ai-agent/rag_cost_latency_cache_outline.py`
