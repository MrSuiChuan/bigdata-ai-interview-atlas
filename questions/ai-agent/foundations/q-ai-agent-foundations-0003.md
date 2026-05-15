---
id: q-ai-agent-foundations-0003
title: Session、Memory、Checkpoint 为什么不能统一叫“记忆”
domain: ai-agent
component: agent-foundations
topic: session-memory-checkpoint-stop-policy
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs, LangGraph persistence docs, Microsoft Agent Framework docs, and 实践资料 hello-agents repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-agents-sdk-sessions
  - langgraph-persistence-docs
  - microsoft-agent-framework-conversations
  - practice-hello-agents
claim_ids:
  - practice-p0-claim-0002
  - agent-runtime-claim-0003
  - agent-runtime-claim-0009
related_docs:
  - ai-agent/foundations/session-memory-checkpoint-and-stop-policy
estimated_minutes: 12
---

# 题目

Session、Memory、Checkpoint 为什么不能统一叫“记忆”？

# 一句话结论

因为它们解决的是不同层级的连续性问题：Session 负责会话延续，Memory 负责跨轮可复用信息，Checkpoint 负责执行恢复。

# 核心机制

1. Session 保持当前对话连续
2. Memory 保留少量值得长期复用的信息
3. Checkpoint 保存可恢复执行边界
4. 混成一个词后就答不清状态放哪、谁负责恢复、恢复到什么粒度

# 标准答案

在 Agent 基础原理里，Session、Memory、Checkpoint 不能统一叫“记忆”，因为它们在运行时承担完全不同的职责。Session 更偏当前 thread 的历史连续性，让系统知道前面聊了什么；Memory 更偏跨轮或跨任务保留的少量可复用信息，例如偏好、事实或稳定知识；Checkpoint 则是执行恢复边界，解决中断后从哪里继续的问题。如果把三者都笼统称为 memory，就会答不清哪些信息该进上下文、哪些信息应落盘、哪些状态是恢复时必须读取的控制信息。

# 必答点

1. 说明三层职责不同
2. 说明 Session 不等于恢复
3. 说明 Memory 不应永久保存所有试错
4. 说明 Checkpoint 关注执行边界
5. 说明状态粒度和恢复粒度不同

# 常见误答

1. 把 memory 理解成模型自己记住了
2. 把聊天历史等同 checkpoint
3. 不讲状态落盘和恢复语义
4. 认为所有信息都应该长期保存
