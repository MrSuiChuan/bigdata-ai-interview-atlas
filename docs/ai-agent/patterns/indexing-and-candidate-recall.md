---
kb_id: ai-agent/patterns/indexing-and-candidate-recall
title: Indexing / Candidate Recall：很多 RAG 失败，其实死在生成之前
domain: ai-agent
component: agent-patterns
topic: indexing-candidate-recall
difficulty: advanced
status: reviewed
sidebar_position: 11
version_scope: Official docs and primary papers as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-retrieval-guide
  - dpr-paper
  - rag-paper
claim_ids:
  - pattern-claim-0034
  - pattern-claim-0035
  - pattern-claim-0036
  - pattern-claim-0037
tags:
  - ai-agent
  - rag
  - indexing
  - recall
---
## 一句话结论



Indexing 决定语料以什么结构进入检索系统，Candidate Recall 决定后续生成阶段有没有机会看到真正有用的证据。很多 RAG 表面上像“模型回答不行”，本质上其实是“有用证据从来没有进入候选集”。

## 为什么很多人把 indexing 讲得太轻

最常见的表述是：

1. 上传文档
2. 做 embedding
3. 存进向量库

这只描述了动作，没有讲清 indexing 的本质。

真正应该讲的是：

1. 检索系统如何把文本预先变成可搜索结构
2. 什么结构更有利于召回相关证据
3. 为什么 candidate recall 是生成质量的天花板

## Indexing 到底是什么

Indexing 本质上是把原始语料转换成“以后能被高效找回来的表示”。

在 OpenAI Retrieval guide 里，文件加入 vector store 后会自动经历：

1. chunked
2. embedded
3. indexed

这说明 indexing 并不是“存一下文本”，而是预先把文本转换成可供后续检索的结构化搜索资产。

## DPR 为什么是关键背景

Dense Passage Retrieval 这篇论文之所以关键，是因为它把现代 dense retrieval 的一个核心框架讲得非常清楚：

1. 用 dual-encoder 分别表示 question 和 passage
2. 让二者在向量空间里学会匹配
3. 通过向量相似性做 passage retrieval

这件事的重要性在于，它让检索不再只依赖稀疏关键词重合，而可以学习更语义化的召回方式。

更关键的是，DPR 在 open-domain QA 上相对强 BM25 基线，在 top-20 passage retrieval accuracy 上带来了 9% 到 19% 的绝对提升。这说明：

1. retrieval 结构本身会显著改变候选覆盖能力
2. 如果召回层升级，生成质量往往会被一起抬高
3. 反过来，召回层弱，再强的生成模型也救不回来缺失的证据

## Candidate Recall 为什么是上限问题

这一点是技术复盘中最值钱的表述之一。

生成模型只能使用它看到的候选证据。于是：

1. 没被索引成可检索结构的内容，基本等于不存在
2. 被索引了但没有被召回进候选集，生成阶段仍然用不到
3. 候选集本身质量差，再好的 reranker 或 generator 也只能在坏集合里挑更好的坏答案

所以 candidate recall 不是一个次要指标，而是系统上限。

## 为什么 indexing 不是只看向量模型

很多回答会把问题简化成：

1. 换更强 embedding 模型
2. 召回就会更好

这仍然太浅。

因为 indexing 还受到这些因素影响：

1. chunk 粒度
2. overlap 策略
3. 文档清洗是否保留了有效语义边界
4. 元数据是否完整
5. 是否把真正有价值的文本单元送进索引，而不是把模板、噪声和重复内容一起塞进去

所以 indexing 是“表示设计 + 文本切分 + 元数据组织 + 检索结构构建”的综合问题。

## 高质量知识表达应该怎么说

最好的讲法通常是：

1. indexing 定义可检索资产的结构
2. retrieval 决定候选覆盖
3. candidate recall 是下游生成效果的上限

如果技术复盘官继续进一步分析，你还可以补一句：

RAG 里很多所谓 hallucination，并不只是模型乱说，也可能是系统根本没把正确证据送到生成阶段。

## 机制解读

Indexing 的本质，是把原始语料预先转换成可被高效检索的结构，例如 chunk、embedding 和索引条目。OpenAI Retrieval guide 明确说明文件加入 vector store 后会自动被 chunk、embed 和 index。DPR 则说明 dense retrieval 如何通过 dual-encoder 学到 question 和 passage 的语义匹配，并在 open-domain QA 上相对 BM25 明显提升 top-20 passage retrieval accuracy。这意味着在 RAG 系统里，indexing 和 retrieval 共同决定了 candidate recall，而 candidate recall 又决定了生成阶段能否看到正确证据。因此，很多看上去是“回答质量问题”的故障，真正根因其实在生成之前的索引和召回层。

## 易混边界

1. 把 indexing 讲成“把文档存到向量库里”
2. 只看 embedding 模型，不看 chunk 和元数据组织
3. 认为生成模型足够强就能弥补召回缺陷
4. 不理解 candidate recall 是系统上限

## 相关样例

1. `examples/python/ai-agent/indexing_candidate_recall_outline.py`
