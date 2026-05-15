---
id: q-ai-agent-0007
title: 从零实现一个 Agent 为什么不能只写 Prompt，而要设计运行循环
domain: ai-agent
component: agent-foundations
topic: from-scratch-agent-runtime-loop
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs and 实践资料 hello-agents repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - openai-agents-sdk-sessions
  - openai-agents-sdk-tracing
  - practice-hello-agents
claim_ids:
  - practice-p0-claim-0001
  - practice-p0-claim-0002
related_docs:
  - ai-agent/foundations/from-scratch-agent-runtime-loop-and-learning-path
estimated_minutes: 12
---

# 题目

从零实现一个 Agent，为什么不能只写 Prompt，而要设计运行循环？

# 一句话结论

因为 Agent 的本质是一套可控运行时：模型只产生下一步意图，运行循环负责工具校验、执行、observation 回写、状态管理、终止控制和可观测性。

# 核心机制

1. 模型输出是候选决策，不是已经执行的事实
2. Tool schema 是模型意图和真实动作之间的接口合同
3. Observation 是下一轮推理输入，不是普通日志
4. State 要区分 transcript、run state、session memory 和 durable state
5. 终止条件负责限制 step、预算、失败、安全和人工介入

# 标准答案

从零实现 Agent 不能只写 Prompt，因为 Prompt 只能影响模型生成，不能保证动作执行的正确性和安全性。一个最小 Agent 运行循环应该先把任务、上下文和工具说明交给模型；模型输出 final answer 或 tool call；运行时解析 tool call，根据 tool schema 校验工具名称和参数；工具执行后把结果整理成 observation 回写给模型；状态层保存 transcript、run state、session memory 和需要恢复的 durable state；最后由终止条件控制最大 step、预算、失败次数、安全策略和人工审批。这样 Agent 才能从“模型生成文本”变成“可执行、可调试、可恢复、可审计”的系统。

# 必答点

1. 说明模型调用和工具执行不是同一层责任
2. 说明 tool schema 的参数校验和副作用边界
3. 说明 observation 会影响下一轮决策
4. 说明状态不能等同于聊天历史
5. 说明终止条件是运行时合同
6. 说明 tracing 对复现和排障的重要性

# 常见误答

1. 只说 Agent 是 LLM 加工具
2. 认为 Prompt 写得好就能保证工具调用安全
3. 不讲参数校验、权限和失败语义
4. 把 memory 当成无限追加上下文
5. 没有 max steps、成本预算和安全中断

