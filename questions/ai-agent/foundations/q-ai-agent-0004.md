---
id: q-ai-agent-0004
title: handoff、agent-as-tool、workflow 的边界应该怎么回答
domain: ai-agent
component: agent-runtime
topic: orchestration
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official AI agent docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - openai-agents-sdk-handoffs
  - openai-agents-sdk-tools
  - microsoft-agent-framework-workflows
claim_ids:
  - agent-runtime-claim-0004
  - openai-agents-claim-0005
  - openai-agents-claim-0006
  - microsoft-agent-framework-claim-0003
related_docs:
  - ai-agent/foundations/handoffs-workflows-and-multi-agent
estimated_minutes: 8
---

# 题目

handoff、agent-as-tool、workflow 的边界应该怎么回答？

# 一句话结论

核心看三件事：控制权是否转移、结果是否返回原 Agent、路径是不是预定义。

# 核心机制

1. agent-as-tool 调用后控制权返回原 Agent
2. handoff 是正式交接后续处理权
3. workflow 更偏系统预定义路径控制

# 标准答案

agent-as-tool 是主 Agent 把另一个 Agent 当能力调用，结果返回后控制权仍在主 Agent；handoff 则是当前 Agent 把后续执行正式交给另一个 Agent；workflow 则不是“另一个 Agent”，而是系统以更确定性的路径控制任务推进。面试里只要抓住控制权、返回路径和是否预定义这三点，通常就不会讲混。

# 必答点

1. control ownership
2. return semantics
3. deterministic workflow boundary

# 常见误答

1. 把 handoff 说成高级工具调用
2. 把 workflow 说成只是固定顺序多 Agent