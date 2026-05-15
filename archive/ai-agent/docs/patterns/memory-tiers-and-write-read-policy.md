---
kb_id: ai-agent/patterns/memory-tiers-and-write-read-policy
title: "Memory Tiers / Write-Read Policy：长期记忆不是把聊天记录全部塞进向量库"
domain: ai-agent
component: agent-patterns
topic: memory-tiers-write-read-policy
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: "Primary papers and official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - memgpt-paper
  - generative-agents-paper
  - memorybank-paper
  - longmem-paper
  - openai-agents-sdk-sessions
  - rag-paper
claim_ids:
  - pattern-claim-0013
  - pattern-claim-0014
  - pattern-claim-0016
  - pattern-claim-0017
  - pattern-claim-0018
  - pattern-claim-0027
  - pattern-claim-0028
  - pattern-claim-0029
  - pattern-claim-0030
tags:
  - ai-agent
  - memory
  - memory-tiers
  - policy
---

# 一句话结论

长期记忆设计真正难的，不是“要不要接向量库”，而是先把 memory tiers、write policy 和 read policy 定义清楚：什么该进入短期上下文，什么该沉淀为长期记忆，什么根本应该交给外部知识检索层处理。

# 为什么很多 memory 回答一上来就偏了

因为大家很容易把下面这些东西统称为“记忆”：

1. 会话历史
2. 当前任务状态
3. 长期用户偏好
4. 历史经验总结
5. 外部知识库

这样一混，系统设计很快就会失真。面试里一旦把所有东西都说成“放进向量库”，通常说明还没真正进入架构层。

# Memory Tiers 先分什么层

结合 MemGPT、Generative Agents、OpenAI Sessions 和 LongMem，可以先把 memory 视角分成三层：

1. 短期执行上下文层：保存当前会话、当前状态、当前动作所需信息
2. 长期可检索记忆层：保存可复用的偏好、经验、摘要、反思结果
3. 外部知识访问层：访问新鲜事实、文档知识、企业资料，这更接近 RAG

这个分层非常关键，因为它对应三种不同问题：

1. 系统现在正在做什么
2. 系统过去学到了什么
3. 系统外部世界里有什么最新知识

# Write Policy 为什么比“存储介质”更重要

很多系统失败，不是因为没有 memory store，而是因为没有 write policy。

Write policy 其实在回答：

1. 哪些信息值得写进去
2. 什么时候升级为长期记忆
3. 什么时候应该衰减、覆盖或遗忘

MemoryBank 的价值就在这里。它不是把所有记忆等权处理，而是引入受遗忘曲线启发的机制，根据时间和重要性调整记忆强度。这意味着长期记忆从一开始就不是“全量追加日志”，而是“有选择的保留系统”。

# 什么信息适合写入长期记忆

一个更成熟的回答会主动区分“原始对话”与“高价值抽象”：

1. 稳定的用户偏好
2. 多轮任务中反复复用的事实
3. 失败后的反思总结
4. 高价值事件摘要
5. 后续任务仍然有用的长期约束

而下面这些通常不应无差别永久写入：

1. 每一句寒暄
2. 一次性临时指令
3. 没有复用价值的中间噪声

所以 write policy 的核心，不是“写得越多越好”，而是“写进去的东西以后还值不值得再读回来”。

# Read Policy 解决的是另一半问题

即使你已经把长期记忆存好了，如果 read policy 不清楚，系统仍然会很差。

Read policy 回答的是：

1. 当前问题需要读取哪一层信息
2. 什么时候读当前会话上下文就够了
3. 什么时候要读长期偏好与经验
4. 什么时候必须额外走外部 RAG 检索

LongMem 和 MemGPT 的共同启发是：

1. 不要把所有历史都塞回上下文窗口
2. 应该按当前问题的需求检索相关历史
3. 长期记忆读取本身也需要路由策略

# 为什么“向量库 + embedding”不等于 memory architecture

向量库只是存储和检索的一种技术实现，它并不自动给你：

1. 分层边界
2. 写入策略
3. 读取策略
4. 遗忘策略
5. 状态恢复策略

所以“我们有个向量库，已经做了长期记忆”这类回答，在面试里通常是不够的。

成熟答案至少要补到：

1. 写什么
2. 何时写
3. 何时读
4. 从哪一层读
5. 什么时候不要读 memory，而是去读外部知识

# 为什么它必须和 RAG 分开

这也是高频追问。

RAG 更偏：

1. 新鲜事实接入
2. 外部知识 grounding
3. 可替换知识源访问

长期记忆更偏：

1. 用户偏好沉淀
2. 历史经验复用
3. 会话连续性和状态延续

所以 memory tiers 的 read policy，天然要把“读历史自己”与“查外部世界”区分开。这正是 pattern-claim-0030 和 pattern-claim-0018 的边界。

# 面试里最值钱的回答方式

如果你想把这道题答到很强，可以按下面顺序：

1. 先分 tiers，不要把短期上下文、长期记忆、RAG 混成一层
2. 再讲 write policy，说明长期记忆一定是选择性写入和带衰减的
3. 最后讲 read policy，说明不是所有问题都该读长期记忆，也不是所有问题都该走外部检索

这会让你的回答从“有个 memory store”升级成“有一套 memory architecture”。

# 标准面试答案

Memory Tiers 和 Write-Read Policy 的核心，是先把短期执行上下文、长期可检索记忆和外部知识访问分层，然后分别定义哪些信息该写入、如何衰减、以及当前问题该读哪一层。MemGPT 提醒我们长期 memory 本质上是分层管理问题，Generative Agents 说明高价值记忆往往要经过反思和摘要再参与规划，MemoryBank 则进一步展示了基于时间和重要性的选择性保留机制，LongMem 说明长期历史读取本身应当通过独立 memory bank 检索完成。因此，长期记忆绝不是把聊天记录全部塞进向量库，而是“分层、筛选、衰减、按需读取”的系统设计问题。RAG 则主要解决外部知识 grounding，与长期记忆不是同一个层次。

# 常见误答

1. 把长期记忆说成“所有聊天记录做 embedding”
2. 只讲存储，不讲 write policy 和 read policy
3. 把 RAG 当成用户长期记忆方案
4. 认为 memory 读取一定比当前上下文更优先
5. 完全不考虑遗忘、衰减和摘要提升

# 相关样例

1. `examples/python/ai-agent/memory_write_read_policy_outline.py`