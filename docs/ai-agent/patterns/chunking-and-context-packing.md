---
kb_id: ai-agent/patterns/chunking-and-context-packing
title: Chunking / Context Packing：切块不是预处理细节，而是证据能否被用到的前提
domain: ai-agent
component: agent-patterns
topic: chunking-context-packing
difficulty: advanced
status: reviewed
sidebar_position: 10
version_scope: Official docs and primary papers as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-retrieval-guide
  - lost-in-the-middle-paper
claim_ids:
  - pattern-claim-0031
  - pattern-claim-0032
  - pattern-claim-0033
tags:
  - ai-agent
  - rag
  - chunking
  - context-packing
---
## 一句话结论

Chunking / Context Packing：切块不是预处理细节，而是证据能否被用到的前提需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易答偏

很多人一听到 chunking，就只会回答：

1. 把文档切成小块
2. 方便做向量检索

这当然不算错，但远远不够深入。

更高质量的回答，至少要讲清三层：

1. 为什么切块粒度会改变可检索性
2. 为什么长上下文不等于不需要切块设计
3. 为什么把块检索回来以后，放进 prompt 的顺序仍然会影响结果

## Chunking 到底在定义什么

Chunking 真正定义的，是“什么东西算一个可检索证据单元”。

如果切得太粗，常见问题是：

1. 一块里混了太多主题，语义中心不稳定
2. 关键信息被埋在很长文本的中间位置
3. 一次命中一个 chunk，却把大量无关上下文一并带进来

如果切得太细，也会出问题：

1. 上下文断裂，证据无法自解释
2. 检索召回的是碎片，而不是完整证据单元
3. 生成时需要额外拼接多个碎片，增加误读概率

所以 chunking 不是越大越好，也不是越细越好，而是在定义“最小可自洽证据单元”。

## OpenAI Retrieval 默认值能说明什么

OpenAI Retrieval guide 给出了很有代表性的工程默认：

1. 默认 chunk size 是 800 tokens
2. 默认 overlap 是 400 tokens
3. 可配置范围是 100 到 4096 tokens
4. overlap 不能超过 chunk size 的一半

这组默认值很值得技术复盘中拿来解释，因为它说明了两件事：

1. chunking 是一个受约束的工程参数，不是随手拍脑袋
2. overlap 的作用是减少信息在边界处被切断的风险，但 overlap 也不是越大越好，因为它会放大冗余和索引成本

同时也要主动补一句边界：

这是官方产品默认，不是行业机制解读。

## 为什么长上下文也不能把 chunking 问题抹掉

很多人会说：

1. 现在模型上下文都很长了
2. 那就少切一点，甚至整篇丢进去

这类回答最容易失真。

Lost in the Middle 论文给了一个非常关键的提醒：

1. 相关信息在长上下文的中间位置时，模型利用它的能力可能明显下降
2. 相比之下，位于开头或结尾的信息往往更容易被模型有效使用

这意味着什么？

1. 上下文窗口变长，不等于模型对每个位置都同样敏感
2. 如果关键信息被埋在超长 chunk 的中段，检索命中了也不代表生成一定能稳定利用
3. 所以 chunking 和 context packing 的目标之一，就是别把关键证据埋进“长但不好用”的上下文里

## Context Packing 在解决什么问题

检索结束以后，系统还要决定：

1. 哪些 chunk 进入 prompt
2. 进入几个
3. 按什么顺序摆放
4. 是否做摘要压缩或证据重组

这就是 context packing。

它处理的不是“能不能找到”，而是“找到了以后怎么喂给模型”。

在这一步，常见错误是：

1. 只按分数排序后机械拼接
2. 不考虑块之间是否重复
3. 不考虑最关键证据是否被夹在中间
4. 不区分背景材料和直接证据

所以成熟系统通常会进一步做：

1. 去重
2. 证据优先级排序
3. 压缩与摘要
4. 让最核心的支持证据处在更容易被模型利用的位置

## 高质量回答应该讲到的原理层

如果技术复盘官进一步分析“chunking 为什么重要”，更深一层的答法不是“因为方便向量化”，而是：

1. chunking 定义了索引的基本检索单元
2. packing 定义了生成时的证据呈现结构
3. 长上下文模型仍然存在位置敏感问题，因此不能把超长上下文当成粗暴替代方案

这一层一讲出来，答案就从“会做 RAG”变成“理解 RAG 的失败点在哪里”。

## 机制解读

Chunking 的本质不是把文档切碎，而是定义什么样的文本单元可以被稳定索引、检索和理解。切得过粗会把关键信息埋在冗长文本中，切得过细又会破坏证据自洽性。OpenAI Retrieval guide 给出的默认 chunk size 和 overlap 说明 chunking 本身就是受约束的工程参数。更重要的是，Lost in the Middle 说明长上下文并不保证模型能同样有效地利用每个位置的信息，尤其当关键证据处于中间位置时，效果可能下降。因此，RAG 里不仅要设计 chunking，还要设计 context packing，让真正关键的证据单元既能被检索到，又能以更适合模型利用的方式进入上下文。

## 易混边界

1. 认为 chunking 只是 ingestion 阶段的小实现
2. 认为上下文窗口够长就不需要认真切块
3. 只讲 chunk size，不讲 overlap 和边界断裂
4. 只讲召回，不讲 retrieval 之后的 context packing

## 相关样例

1. `examples/python/ai-agent/chunking_context_packing_outline.py`
