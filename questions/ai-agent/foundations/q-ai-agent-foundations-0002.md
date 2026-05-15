---
id: q-ai-agent-foundations-0002
title: Tool Schema、Observation 与 Run State 为什么必须拆成三层
domain: ai-agent
component: agent-foundations
topic: tool-schema-observation-run-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs and 实践资料 hello-agents repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - openai-agents-sdk-tracing
  - practice-hello-agents
claim_ids:
  - practice-p0-claim-0001
  - agent-runtime-claim-0002
  - agent-runtime-claim-0005
related_docs:
  - ai-agent/foundations/tool-schema-observation-and-run-state-boundaries
estimated_minutes: 12
---

# 题目

Tool Schema、Observation 与 Run State 为什么必须拆成三层？

# 一句话结论

因为它们解决的是三个不同问题：Schema 负责动作可验证，Observation 负责结果可继续推理，Run State 负责执行过程可控。

# 核心机制

1. Tool Schema 定义工具合同与参数校验
2. Observation 把原始结果整理成下一轮决策证据
3. Run State 保存 step、预算、最近错误等控制信息
4. 三层混在一起会同时损坏执行、推理和恢复

# 标准答案

从零做 Agent 时，Tool Schema、Observation 和 Run State 必须拆开。Tool Schema 的职责是定义工具名称、参数类型、副作用和失败语义，让运行时知道模型提出的动作能不能执行；Observation 的职责是把工具执行后的结果整理成结构化反馈，让模型在下一轮根据事实继续推理；Run State 的职责是记录本次执行处于第几步、还剩多少预算、最近一次错误是什么、是否需要暂停或审批。如果把三者混在一起，常见结果是模型参数无法校验、工具结果回写成噪声日志、系统状态只能靠聊天历史推断，最终既不稳定也无法排障。

# 必答点

1. 说明三层各自承担什么职责
2. 说明 Schema 不等于自然语言描述
3. 说明 Observation 不等于原始日志
4. 说明 Run State 不等于 Transcript
5. 说明三者混淆会带来什么后果

# 常见误答

1. 认为工具只要有名字就够了
2. 把原始日志直接喂给模型
3. 用聊天历史代替运行状态
4. 不讲参数校验和失败语义
