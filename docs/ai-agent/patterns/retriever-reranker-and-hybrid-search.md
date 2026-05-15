---
kb_id: ai-agent/patterns/retriever-reranker-and-hybrid-search
title: Retriever / Reranker / Hybrid Search：召回、精排、混合检索为什么要拆开讲
domain: ai-agent
component: agent-patterns
topic: retriever-reranker-hybrid-search
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: Primary papers and official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - rag-paper
  - colbertv2-paper
  - openai-file-search-docs
claim_ids:
  - pattern-claim-0022
  - pattern-claim-0023
  - pattern-claim-0024
  - pattern-claim-0025
tags:
  - ai-agent
  - retrieval
  - reranker
  - hybrid-search
---
## 一句话结论

Retriever / Reranker / Hybrid Search：召回、精排、混合检索为什么要拆开讲需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题常常被讲乱

最常见的错误是把检索系统只讲成一个框：

1. 用户提问
2. 向量搜索
3. 返回前几个结果

这会把三个本来应该分开的设计问题混成一句话：

1. 候选找不找得到
2. 候选排不排得准
3. 不同检索信号怎么融合

真正成熟的回答，必须把 recall 和 precision 的边界拆开。

## Retriever 解决什么问题

Retriever 关注的是召回覆盖，也就是：

1. 相关材料能不能先被找进候选集
2. 候选池里是否已经包含了后续生成所需的关键证据

在这一层，目标不是排得最完美，而是尽量别漏掉真正有用的文档。

所以 retriever 的典型特点是：

1. 速度优先
2. 覆盖优先
3. 可以接受一定量噪声，只要不要把关键材料漏掉

## Reranker 解决什么问题

Reranker 的任务不是扩大候选池，而是在已有候选里重新判断谁更相关。

如果说 retriever 回答的是“找不找得到”，那 reranker 回答的是“谁应该排在最前面”。

ColBERTv2 很适合用来解释这一层的原理，因为它没有把 query 和 document 压成单一向量，而是保留 token-level late interaction。这样做的意义是：

1. 可以做更细粒度的相关性匹配
2. 对长文档里的局部证据更敏感
3. 更适合高精度排序或高质量 retrieval

但代价也很清楚：

1. 表示更复杂
2. 存储更重
3. 通常不如粗召回阶段那样便宜

这也是为什么很多系统会把更重的匹配放在第二阶段，而不是一开始就全量跑。

## Hybrid Search 解决什么问题

Hybrid Search 不是 rerank，也不是某一种模型，而是召回阶段的信号融合策略。

官方 File Search 文档明确写到，它会同时使用 vector search 和 keyword search。这个信息很重要，因为它说明：

1. 语义相近不一定覆盖精确术语
2. 精确关键词命中也不一定覆盖同义表达
3. 真实生产检索往往不能只押注一种信号

所以 hybrid 的价值在于：

1. 让 recall 更稳
2. 减少单一路径漏召回
3. 给后续 reranker 提供更有质量的候选池

## 为什么成熟系统常是两阶段甚至三阶段

一个高质量检索链路，通常不是“一步出答案”，而是：

1. 先做 coarse retrieval，保证 recall
2. 再做 reranking，提升 precision
3. 最后才进入 grounded generation 或 citation 输出

这也是 pattern-claim-0025 的核心：

1. recall 阶段负责别漏
2. precision 阶段负责别乱排
3. generation 阶段负责别乱说

这三个问题不能用一个动作替代。

## 技术复盘中最值钱的区分句

你可以用一句很清楚的话来区分三者：

1. retriever 决定找不找得到
2. reranker 决定排不排得准
3. hybrid search 决定召回不要只相信单一信号

如果再进一步，你可以补一句：

高风险问答系统里，hybrid 往往服务于 recall，reranker 服务于 precision，而 grounded generation 服务于最终答案约束。

## 常见边界误判

1. 把 hybrid search 说成 reranker
2. 认为 reranker 可以替代召回层
3. 认为只要 embedding 模型够强，就不需要 keyword search
4. 不区分候选覆盖和最终排序

## 机制解读

Retriever、Reranker 和 Hybrid Search 解决的是检索链路中不同层次的问题。Retriever 负责先把可能相关的文档召回进候选集，重点是 recall；Reranker 负责对候选集做更高精度的相关性判断，重点是 precision；Hybrid Search 则是在召回阶段融合 semantic 与 keyword 等不同信号，减少单一路径漏检。ColBERTv2 说明了为什么高精度排序常常需要 token-level late interaction，而 OpenAI File Search 则说明实际生产系统往往会把 vector search 和 keyword search 结合起来。因此，一个成熟的 RAG 或 Agent 检索层往往不是单步检索，而是“召回扩覆盖、精排提精度、生成做 grounding”的分层结构。

## 易混边界

1. 把 retriever 和 reranker 说成同一种模型名字差异
2. 把 hybrid 讲成“多向量就是 hybrid”
3. 只会说向量检索，不会讲 keyword signal 的价值
4. 认为 reranker 越重越好，不考虑系统成本和延迟

## 相关样例

1. `examples/python/ai-agent/retriever_reranker_hybrid_outline.py`
