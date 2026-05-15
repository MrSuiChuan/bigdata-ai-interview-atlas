---
id: q-ai-practice-agent-generic-agent-01
title: "GenericAgent 运行边界：为什么它不能被简化成一次模型调用？"
domain: ai-agent
component: generic-agent
topic: runtime-loop-tool-contract-memory-loading
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "GenericAgent repository, OpenAI context engineering guides, and 实践资料 hello-generic-agent repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - generic-agent-github
  - practice-hello-generic-agent
  - openai-conversation-state-guide
claim_ids:
  - practice-p1-claim-0005
  - agent-runtime-claim-0002
  - agent-runtime-claim-0003
related_docs:
  - ai-agent/frameworks/generic-agent-runtime-loop-tool-contracts-and-memory-loading
estimated_minutes: 10
---

# 题目

GenericAgent 为什么不能被简化成一次模型调用？

# 一句话结论

因为 GenericAgent 的本质是带状态、带工具合同、带停止条件的多步运行时，而不是单次文本生成。

# 核心机制

1. loop state 管理多步任务推进。
2. tool contract 约束模型能做什么以及怎么做。
3. memory loading 决定本轮上下文来自哪里。
4. observation 要写回状态，供后续步骤继续推理。
5. stop condition 决定何时结束、降级或转人工。

# 标准答案

回答 GenericAgent 的运行边界时，不能只描述 prompt 或工具函数。应该先说明 GenericAgent 是带状态和控制循环的系统，再解释工具调用只是外部动作接口。生产系统还要处理参数校验、权限、超时、重试、幂等、人工接管和评估回归。这样才能把“通用 Agent”从一次模型调用上升成正式运行时。

# 必答点

1. 说明 Agent 是运行时系统而不是单次问答。
2. 说明 tool contract 的作用。
3. 说明状态、循环和停止条件。
4. 说明失败恢复和人工接管。
5. 说明 memory loading 不是无条件追加历史。

# 常见误答

1. 只说模型会调用 API。
2. 把 ReAct prompt 等同于完整 Agent。
3. 不讲工具副作用和权限。
4. 不讲 trace、评估与停止条件。
