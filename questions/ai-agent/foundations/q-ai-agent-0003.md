---
id: q-ai-agent-0003
title: session、checkpoint、memory 在 Agent 系统里为什么不能混着讲
domain: ai-agent
component: agent-runtime
topic: state-memory
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official AI agent docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-sessions
  - langgraph-persistence-docs
  - microsoft-agent-framework-conversations
claim_ids:
  - agent-runtime-claim-0003
  - agent-runtime-claim-0009
  - langgraph-claim-0003
  - microsoft-agent-framework-claim-0006
related_docs:
  - ai-agent/foundations/memory-state-and-sessions
estimated_minutes: 7
---

# 题目

session、checkpoint、memory 在 Agent 系统里为什么不能混着讲？

# 一句话结论

因为它们解决的是不同层级的状态问题：会话历史、执行恢复和可序列化会话状态不是一回事。

# 核心机制

1. session history 解决多轮上下文
2. checkpoint 解决中间执行恢复
3. serialized state 解决跨进程和长期恢复

# 标准答案

在 Agent 系统里，memory 不是一个含糊词。OpenAI Sessions 更偏自动维护对话历史；LangGraph persistence 的 checkpoint 和 thread 更偏执行状态与恢复；Microsoft Agent Framework 的 AgentSession 则强调 conversation context 和可序列化恢复。如果把它们都叫 memory，就会答不清状态到底放哪、谁负责恢复、恢复到什么粒度。

# 必答点

1. history vs checkpoint vs serialized state
2. 运行时状态而非模型记忆
3. 恢复粒度不同

# 常见误答

1. 把 memory 理解成模型自己记住了
2. 把 checkpoint 和聊天历史当成一层东西