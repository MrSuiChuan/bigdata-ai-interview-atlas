---
kb_id: ai-agent/patterns/query-rewrite-and-hyde
title: "Query Rewrite / HyDE：为什么高级 RAG 不能只拿原问题直接检索"
domain: ai-agent
component: agent-patterns
topic: query-rewrite-hyde
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: "Primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - hyde-paper
  - rag-paper
claim_ids:
  - pattern-claim-0019
  - pattern-claim-0020
  - pattern-claim-0021
tags:
  - ai-agent
  - rag
  - query-rewrite
  - hyde
---

# 一句话结论

Query Rewrite 解决的是“用户怎么问”和“语料怎么写”之间的表达错位；HyDE 是更激进的一种 query transformation，它先生成一篇假想相关文档，再把这篇文档映射到真实语料空间里做 dense retrieval，但最终可用的证据仍然必须来自真实语料库。

# 为什么这题很容易答浅

很多人会把它讲成一句很模糊的话：

1. 把问题改写一下，检索会更准
2. 或者让模型先写一版答案，再去搜

这两种说法都不够到原理层。

真正应该讲清的是：

1. 为什么原始 query 可能不适合直接做 dense retrieval
2. HyDE 生成出来的文档为什么不是最终证据
3. query rewrite 到底改变的是“检索入口”，不是“事实来源”

# Query Rewrite 到底在修什么

在 RAG 里，检索不是理解问题这么简单，而是把问题映射到语料空间里去找相邻内容。

如果用户原问题存在下面这些情况，检索质量就会明显受影响：

1. 问题过短，只暴露了意图，没有暴露足够上下文
2. 用户语言和文档语言不一致，比如用户说口语，文档写术语
3. 问题本身像目标描述，不像文档会出现的自然表述

所以 query rewrite 的本质不是“把问题换种说法”，而是把 query 改写成更接近可检索语料表达的形式。

# HyDE 的核心机制

HyDE 的完整逻辑可以拆成四步：

1. 先拿用户问题，让语言模型生成一篇“如果我已经找到了答案，相关文档可能会怎么写”的假想文本
2. 再把这篇假想文本交给 dense encoder 编码，而不是直接编码原始短 query
3. 用编码结果去语料库里检索真实文档邻居
4. 最终进入生成阶段的，是检索回来的真实文档，不是那篇假想文本本身

这就是 HyDE 和普通 rewrite 最大的不同：

1. 普通 rewrite 更像改写查询字符串
2. HyDE 更像先把 query 扩展成一个“文档态表示”再检索

# 为什么 HyDE 不是“让模型先编答案”

这是最关键的边界。

HyDE 论文明确提醒了一件事：

1. 假想文档可能包含错误细节
2. 但 dense retrieval 的 bottleneck 会把检索重新约束到真实语料邻域

所以 HyDE 可以理解为：

1. 让模型帮你构造更适合检索的表示
2. 不是让模型直接替代证据来源

面试里如果你能主动补这一句，答案层次会明显更高：

HyDE 生成的是 retrieval hint，不是 evidence。

# 它和普通 RAG 的关系

原始 RAG 论文的关键贡献，是把参数内知识和外部可检索知识分开。HyDE 并没有改变这个边界，它只是优化了“怎么把 query 接入 retrieval”这一步。

所以从系统结构上看，HyDE 仍然属于：

1. 检索前处理层
2. recall 优化层
3. query transformation 层

而不是：

1. 事实校验层
2. 最终答案层
3. 长期记忆层

# 什么场景下它价值最大

HyDE 通常更适合这些场景：

1. zero-shot dense retrieval，没有现成标注数据可训查询重写器
2. 用户问题很短，但目标文档往往是长文本表达
3. 领域术语和用户表达差异很大
4. 需要先把需求描述扩展成“像文档一样”的语义表示

# 什么场景下不要夸大它

HyDE 也不是万能药。至少有三类问题不能只靠它：

1. 强结构化过滤，例如时间、租户、权限、标签筛选
2. 必须精确命中编号、主键、报错码、配置项名的 keyword 检索
3. 检索后仍然需要 reranker、citation 或 grounding 约束的高风险问答

也就是说，HyDE 更偏 recall 强化，不等于整条 RAG 链路都解决了。

# 一个高质量面试回答应该补到哪一层

如果要把这道题答到“原理级”，至少要补四件事：

1. query rewrite 解决的是 query representation mismatch
2. HyDE 用的是 hypothetical document，不是直接拿原 query 编码
3. hypothetical document 不是证据，证据仍来自真实语料检索结果
4. 它本质属于 retrieval-side optimization，不是生成侧自我修正

# 标准面试答案

高级 RAG 之所以常常引入 Query Rewrite 或 HyDE，是因为原始用户问题未必适合直接进入检索空间。普通 rewrite 会把 query 改写成更接近语料表达的形式，而 HyDE 更进一步，它先让模型生成一篇假想相关文档，再用这篇文档的表示去做 dense retrieval。HyDE 的关键原理不是“让模型先写答案”，而是“先构造一个更像目标文档的检索表示”。根据 HyDE 论文，假想文档可能带有错误细节，但真正进入生成阶段的应当是检索回来的真实语料，因此它仍然属于 retrieval-side query transformation，而不是事实来源本身。

# 常见误答

1. 把 HyDE 说成“模型先回答，再把回答发给用户”
2. 认为 rewrite 之后就不需要真实检索
3. 把假想文档当作 citation 或 grounding 证据
4. 把 query rewrite 和 memory 写入混为一谈

# 相关样例

1. `examples/python/ai-agent/hyde_query_rewrite_outline.py`