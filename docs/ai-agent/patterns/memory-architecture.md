---
kb_id: ai-agent/patterns/memory-architecture
title: Memory Architecture / Write-Read Policy：短期上下文、长期记忆、RAG 为什么必须分层
domain: ai-agent
component: agent-patterns
topic: memory-architecture-write-read-policy
difficulty: advanced
status: reviewed
sidebar_position: 4
version_scope: Primary papers and official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - memgpt-paper
  - generative-agents-paper
  - memorybank-paper
  - longmem-paper
  - openai-agents-sdk-sessions
  - langgraph-durable-execution-docs
  - rag-paper
claim_ids:
  - pattern-claim-0013
  - pattern-claim-0014
  - pattern-claim-0015
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
  - architecture
  - policy
  - state
---
## 一句话结论

Memory Architecture / Write-Read Policy：短期上下文、长期记忆、RAG 为什么必须分层需要从对象、链路、边界和证据四个角度理解。

## 为什么 memory 题很容易失真

因为大家常常把下面这些东西混成一个词：

1. 会话历史
2. 任务状态
3. 长期知识或经验记忆
4. 长期用户偏好
5. 外部知识库

这会导致回答时边界全乱。

## Memory Architecture 先要分什么层

结合 MemGPT、Generative Agents、OpenAI Sessions、LangGraph durable execution 和 LongMem，可以先把 memory 视角分成三层：

1. 短期执行上下文层：保存当前会话、当前状态、当前动作所需信息
2. 长期可检索记忆层：保存可复用的偏好、经验、摘要、反思结果
3. 外部知识访问层：访问新鲜事实、文档知识、企业资料，这更接近 RAG

这个分层非常关键，因为它对应三种不同问题：

1. 系统现在正在做什么
2. 系统过去学到了什么
3. 系统外部世界里有什么最新知识

## 短期上下文层

最典型的是：

1. 当前会话历史
2. 当前执行状态
3. 当前任务中的局部变量

OpenAI Sessions 和 LangGraph 的 durable execution 都更接近这一层，虽然粒度不同。

这层的重点是：

1. 让任务能接着跑
2. 让系统知道自己现在在哪

## 长期记忆层

MemGPT、Generative Agents、MemoryBank 和 LongMem 都给了很重要的启发：

1. 不是所有信息都该一直塞在上下文窗口里
2. 更合理的做法是分层存储、按需检索
3. 高价值经验或摘要应经过提炼再进入更稳定的记忆层

这说明长期记忆本质上是一种选择性保留和检索机制。

## Write Policy 为什么比“接一个向量库”更重要

很多系统失败，不是因为没有 memory store，而是因为没有 write policy。

Write policy 真正回答的是：

1. 哪些信息值得写进去
2. 什么时候升级为长期记忆
3. 什么时候应该衰减、覆盖或遗忘

MemoryBank 的价值就在这里。它不是把所有记忆等权处理，而是引入受遗忘曲线启发的机制，根据时间和重要性调整记忆强度。这意味着长期记忆从一开始就不是“全量追加日志”，而是“有选择的保留系统”。

## 什么信息适合写入长期记忆

更成熟的回答会主动区分“原始对话”与“高价值抽象”。

更适合写入长期记忆的通常包括：

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

## Read Policy 解决的是另一半问题

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

## Reflection 与 Memory 为什么耦合

如果系统会产生：

1. 失败经验
2. 高层总结
3. 用户偏好
4. 任务中学到的稳定规律

这些都比原始聊天记录更适合进入长期记忆层。

所以 reflection 往往是长期记忆的重要入口。

## RAG 为什么不是长期记忆本身

这是高频误区。

RAG 更偏：

1. 外部知识接入
2. grounding
3. 更新鲜事实查询

Memory architecture 更偏：

1. 会话连续性
2. 用户/任务经验沉淀
3. 任务状态恢复

因此，RAG 和 Memory 常常会共存，而不是互相替代。

## 为什么“向量库 + embedding”不等于 memory architecture

向量库只是存储和检索的一种技术实现，它并不自动给你：

1. 分层边界
2. 写入策略
3. 读取策略
4. 遗忘策略
5. 状态恢复策略

所以“我们有个向量库，已经做了长期记忆”这类回答，在技术复盘中通常是不够的。

## 一个成熟的分层回答通常至少包含

1. short-term execution context
2. long-term retrievable memory
3. external knowledge access through RAG
4. write policy
5. read policy

这五层分开，系统设计才会清晰。

## 机制解读

Memory Architecture 的重点，是把短期执行上下文、长期记忆和外部知识访问分层，并为长期层显式定义 write policy 与 read policy。短期层负责会话历史和当前任务状态，让系统能继续执行；长期层负责沉淀经验、偏好、高价值摘要和反思结果，并在需要时按需检索回来；RAG 层则负责访问更新鲜、可替换的外部知识源。MemGPT、Generative Agents、OpenAI Sessions 和 LangGraph durable execution 从不同角度说明了分层必要性，MemoryBank 说明长期记忆需要选择性保留和遗忘机制，LongMem 说明长期历史读取本身也应当通过独立 memory bank 检索完成。因此，成熟系统不应该把所有“记忆”都塞进一次上下文，也不应该把“接了向量库”当成长期记忆设计本身。

## 易混边界

1. 把 memory 全部等同于聊天记录
2. 把 RAG 说成长期记忆方案
3. 只讲存储，不讲 write policy 和 read policy
4. 认为所有历史都应该永久写入长期记忆
5. 不区分短期状态、长期经验和外部知识访问

## 相关样例

1. `examples/python/ai-agent/memory_tiers_outline.py`
2. `examples/python/ai-agent/memory_write_read_policy_outline.py`
