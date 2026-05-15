---
kb_id: ai-agent/patterns/multi-hop-iterative-and-graph-retrieval
title: Multi-Hop / Iterative / Graph Retrieval：复杂问题为什么不能只打一发向量检索
domain: ai-agent
component: agent-patterns
topic: multi-hop-iterative-graph-retrieval
difficulty: advanced
status: reviewed
sidebar_position: 18
version_scope: Primary papers and official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
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
tags:
  - ai-agent
  - rag
  - multi-hop
  - iterative-retrieval
  - graphrag
---
## 一句话结论

Multi-Hop / Iterative / Graph Retrieval：复杂问题为什么不能只打一发向量检索需要从对象、链路、边界和证据四个角度理解。

## 为什么这一题非常能区分深浅

浅层回答通常只会说：

1. 多跳就是多搜几次
2. 图检索就是把知识做成图

这两句都不能算错，但都没有打到原理层。

真正要讲清的是：

1. 为什么 one-shot retrieve-and-read 会失效
2. iterative retrieval 和普通 rewrite 的边界是什么
3. graph retrieval 到底解决的是“跨结构聚合”还是“单点命中”

## Multi-Hop 的本质不是“多轮聊天”，而是检索依赖链

IRCoT 论文里有一句非常值得记住的话：

1. what to retrieve depends on what has already been derived
2. what has already been derived depends on what was previously retrieved

这句话几乎可以当作 multi-hop retrieval 的标准定义。

它说明：

1. 当前检索 query 不是静态给定的
2. 下一步该搜什么，取决于前面已经得到的中间结论
3. 所以复杂问题不是“把原问题表达得更好”就结束了，而是要允许检索和推理相互驱动

这就是为什么复杂问题不能只打一发向量检索。

## IRCoT 为什么重要

IRCoT 的贡献不只是“多检索几次”，而是把 retrieval 和 CoT 交错起来。

它做的事情可以抽象成：

1. 先生成一小步 reasoning
2. 用这一小步 reasoning 引导下一轮 retrieval
3. 再用新检索到的内容继续推进 reasoning
4. 重复这个过程，直到形成最终答案

这和普通 retrieve-then-read 的差别非常大。

IRCoT 论文报告：

1. retrieval 最多提升 21 个点
2. 下游 QA 最多提升 15 个点

这说明 multi-hop retrieval 不是样式问题，而是结果上可验证的结构改进。

## Iterative Retrieval 和 Query Rewrite 的边界

很多人会把 iterative retrieval 和 rewrite 混成一个概念。

其实两者差别很大：

1. query rewrite 还是单条检索入口优化
2. iterative retrieval 则是在检索过程中不断生成新的检索意图

换句话说：

1. rewrite 是把原问题换种搜法
2. iterative retrieval 是让系统在过程中不断决定“下一步该搜什么”

所以 iterative retrieval 更接近 planning inside retrieval，而不是 prompt polishing。

## Self-RAG 为什么是另一条路线

Self-RAG 进一步说明，系统不一定要固定“先搜后答”，它可以：

1. 按需决定是否 retrieval
2. 对 retrieved passage 做 critique
3. 对自己的 generation 也做 critique

这带来一个很重要的架构启发：

1. retrieval 可以是条件触发的
2. retrieval 结果不是天然可信，还需要批判性判断
3. generation 也不是最后一步，而可能反过来要求补检索或修正

所以 Self-RAG 把 retrieval 推进到了“可反思、可回退”的层次。

## 为什么 Graph Retrieval 不是普通向量检索的替代词

GraphRAG 论文给出的核心观察非常重要：

1. baseline RAG 很难回答面向整个语料库的 global questions
2. 例如“这批资料的主要主题是什么”
3. 因为这类问题本质上不是单点检索，而是 query-focused summarization

GraphRAG 的解决方法不是仅仅换一个 retriever，而是改造索引结构：

1. 先从语料中抽取 entity knowledge graph
2. 再对实体社区做 community summaries
3. 查询时根据问题类型走 local 或 global 的 context-building 路线

这说明 graph retrieval 更像“语料结构化和聚合推理层”，而不只是另一种 embedding 搜索。

## GraphRAG Local / Global / DRIFT 应该怎么区分

这是特别适合技术复盘进一步分析的一组边界。

## Local Search

GraphRAG local search 的关键是：

1. 用 query 找到相关实体
2. 沿着实体把 relationships、community reports、text units 一起拉出来
3. 再做 ranking 和 filtering
4. 把它们压到单个 context window 中回答

所以 local search 更偏：

1. 特定实体
2. 局部关系
3. 可定位细节

## Global Search

Global search 处理的是 whole-dataset reasoning。

它用 community reports 做 map-reduce：

1. map 阶段对不同 report 批次生成中间观点
2. reduce 阶段聚合高价值点
3. 再产出最终答案

而且官方文档明确提到：

1. 越低层的 community hierarchy 报告越细
2. 响应会更全面
3. 但时间和 LLM 资源成本也更高

所以 global search 天然带着质量与成本的权衡。

## DRIFT Search

DRIFT Search 则是在 local 和 global 之间做桥接：

1. 先从 semantically relevant community reports 形成 broad initial answer
2. 再生成 follow-up questions
3. 再用 local search 细化检索与回答

所以 DRIFT 更像：

1. 先广后深
2. 先全局感知，再局部钻取
3. 用 follow-up questions 做分层探索

## 一个高质量答案的结构

如果技术复盘被问“多跳检索和图检索到底解决什么”，最好的结构通常是：

1. 先指出 one-shot retrieval 在复杂问题上失效
2. 再讲 iterative retrieval 如何把中间推理结果变成下一轮 query
3. 再讲 graph retrieval 为什么适合 global sensemaking 和结构化聚合
4. 最后补上 local/global/DRIFT 的边界

## 机制解读

复杂问题不能只靠一次向量检索，因为后续该搜什么往往取决于前面已经推导出的中间结论。IRCoT 明确指出 one-step retrieve-and-read 对 multi-step QA 不够用，并通过把 retrieval 和 chain-of-thought 交错执行显著提升了 retrieval 与 QA 效果。Self-RAG 则进一步说明 retrieval 可以按需触发，并且 retrieved passages 与 generation 都需要被 critique。GraphRAG 走的是另一条路线，它不是单纯多搜几次，而是通过 entity graph 和 community summaries 把语料结构化，从而更适合回答面向整个语料库的 global questions。GraphRAG 的 local search 更偏实体与局部关系，global search 更偏 whole-dataset map-reduce 汇总，DRIFT search 则结合全局概览和局部细化。因此，复杂 retrieval 的核心不是“再搜一次”，而是让检索和推理共同演化。

## 易混边界

1. 把 multi-hop 简化成“循环检索几轮”
2. 把 iterative retrieval 和 query rewrite 混为一谈
3. 把 GraphRAG 理解成“图数据库 + LLM”
4. 不区分 local、global、DRIFT 适用的问题类型

## 相关样例

1. `examples/python/ai-agent/multi_hop_iterative_graph_retrieval_outline.py`
