---
id: q-ai-pattern-0009
title: 为什么长期记忆设计必须先定义 Write Policy 和 Read Policy，而不是先上一个向量库
domain: ai-agent
component: agent-patterns
topic: memory-tiers-write-read-policy
question_type: system_design
difficulty: advanced
status: reviewed
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
  - pattern-claim-0017
  - pattern-claim-0018
  - pattern-claim-0027
  - pattern-claim-0028
  - pattern-claim-0029
  - pattern-claim-0030
related_docs:
  - ai-agent/patterns/memory-tiers-and-write-read-policy
estimated_minutes: 9
---

# 题目

为什么长期记忆设计必须先定义 Write Policy 和 Read Policy，而不是先上一个向量库？

# 一句话结论

因为 memory architecture 真正难的是“写什么、何时写、何时读、从哪层读”，而向量库只是其中一种存储实现，不会自动帮你完成分层、选择、衰减和路由。

# 核心机制

1. memory tiers separate short-term context, long-term memory, and external knowledge
2. write policy decides what deserves durable storage
3. read policy decides which layer to consult for the current task

# 标准答案

长期记忆系统不能先从“接一个向量库”开始，因为真正的架构问题是先把短期执行上下文、长期可检索记忆和外部知识访问分层，再定义哪些信息值得写入长期层、如何根据时间和重要性衰减、以及当前问题该从哪一层读取。MemoryBank 说明长期记忆需要选择性保留和遗忘机制，LongMem 说明长期历史读取应通过独立 memory bank 检索完成，MemGPT 和 Generative Agents 则说明高价值记忆往往需要经过反思、摘要或分层管理。因此，向量库只是工具，Write Policy 和 Read Policy 才是长期记忆是否可用的核心。

# 必答点

1. 先分 tiers，再谈存储实现
2. write policy 决定长期记忆质量
3. read policy 决定当前问题该读 memory 还是走 RAG

# 常见误答

1. 把长期记忆说成“所有聊天记录做 embedding”
2. 只讲存储，不讲遗忘和路由
3. 把 RAG 当长期用户记忆方案