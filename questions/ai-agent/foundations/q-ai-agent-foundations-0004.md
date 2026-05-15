---
id: q-ai-agent-foundations-0004
title: 为什么 Stop Policy 不是异常处理细节，而是最小 Agent 的运行时合同
domain: ai-agent
component: agent-foundations
topic: session-memory-checkpoint-stop-policy
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs, LangGraph persistence docs, Microsoft Agent Framework docs, and 实践资料 hello-agents repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-agents-sdk-sessions
  - langgraph-persistence-docs
  - openai-agents-sdk-tracing
  - practice-hello-agents
claim_ids:
  - practice-p0-claim-0002
  - agent-runtime-claim-0008
related_docs:
  - ai-agent/foundations/from-scratch-agent-runtime-loop-and-learning-path
  - ai-agent/foundations/session-memory-checkpoint-and-stop-policy
estimated_minutes: 14
---

# 题目

为什么 Stop Policy 不是异常处理细节，而是最小 Agent 的运行时合同？

# 一句话结论

因为 Agent 要决定的不只是“出错了怎么办”，还包括“什么时候继续、什么时候暂停、什么时候结束、什么时候转人工”，这本身就是运行控制。

# 核心机制

1. Stop Policy 要覆盖 final answer、预算耗尽、重复错误、无进展、审批等待
2. 异常处理只覆盖失败路径，Stop Policy 覆盖全部运行路径
3. 没有 Stop Policy，while loop 很容易变成成本黑洞

# 标准答案

Stop Policy 不是异常处理细节，而是最小 Agent 的运行时合同。异常处理解决的是工具失败、网络错误、权限错误等局部问题；Stop Policy 解决的是整个系统在每一轮之后如何做控制决策，包括是否已经得到 final answer、是否达到了最大步数、是否连续没有新信息、是否应该等待人工审批、是否预算已经耗尽。没有这层合同，Agent 虽然可能能跑，但很容易反复调用同一个工具、在无进展状态下继续消耗 token，或者越过本该暂停的安全边界。

# 必答点

1. 区分异常处理和停止合同
2. 说明 Stop Policy 至少覆盖哪些信号
3. 说明无进展检测的重要性
4. 说明等待审批也属于正式暂停状态
5. 说明没有 Stop Policy 的直接后果

# 常见误答

1. 把 stop 写成单纯 max_steps 判断
2. 只讲工具异常不讲预算和无进展
3. 不讲审批等待和外部事件
4. 认为模型自己会决定何时停
