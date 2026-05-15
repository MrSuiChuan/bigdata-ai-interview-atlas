---
id: q-ai-pattern-0004
title: Memory Architecture 为什么必须把短期上下文、长期记忆、RAG 以及 Write-Read Policy 分开设计
domain: ai-agent
component: agent-patterns
topic: memory-architecture-write-read-policy
question_type: principle
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
related_docs:
  - ai-agent/patterns/memory-architecture
estimated_minutes: 10
---

# 题目

Memory Architecture 为什么必须把短期上下文、长期记忆、RAG 以及 Write-Read Policy 分开设计？

# 一句话结论

因为一个成熟的 memory system 不只要分清当前执行、长期经验沉淀和外部知识接入，还要分清哪些信息值得写入长期层、什么时候读长期层、什么时候根本不该读 memory 而应走 RAG。

# 核心机制

1. short-term execution context
2. long-term retrievable memory
3. external knowledge access through RAG
4. write policy determines what deserves durable storage
5. read policy determines which layer should serve the current task

# 标准答案

一个成熟的 Agent memory architecture 至少要把三层分开：短期上下文负责当前执行和会话延续；长期记忆负责经验、偏好、摘要和反思结果沉淀；RAG 则负责访问外部知识源。更进一步，长期记忆不是“接一个向量库”就结束了，还必须定义 write policy 和 read policy。Write policy 决定哪些信息值得写入长期层、何时升级为长期记忆、何时衰减或遗忘；read policy 决定当前任务到底该读当前上下文、读长期记忆，还是直接走外部 RAG。MemGPT、Generative Agents、OpenAI Sessions、LangGraph durable execution、MemoryBank、LongMem 等资料从不同角度说明了这一点：真正成熟的 Agent 系统不应该把所有历史都塞进上下文，也不应该把所有“记忆”都塞进向量库。

# 必答点

1. short-term vs long-term vs external knowledge
2. not everything belongs in context window
3. RAG is not long-term memory
4. write policy 决定长期记忆质量
5. read policy 决定当前问题是否该读 memory

# 常见误答

1. 把 memory 全部说成聊天历史
2. 把 RAG 当长期记忆方案
3. 把长期记忆等同于“所有聊天记录做 embedding”
4. 只讲存储，不讲遗忘和路由
