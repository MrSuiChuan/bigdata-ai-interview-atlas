---
id: q-ai-microsoft-agent-framework-0007
title: Microsoft Agent Framework 里 workflow 和 agent 的边界为什么特别重要
domain: ai-agent
component: microsoft-agent-framework
topic: workflow-boundary
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Microsoft Agent Framework docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - microsoft-agent-framework-workflows
claim_ids:
  - microsoft-agent-framework-claim-0003
  - microsoft-agent-framework-claim-0004
  - microsoft-agent-framework-claim-0005
related_docs:
  - ai-agent/frameworks/microsoft-agent-framework-workflows-state-observability
estimated_minutes: 7
---

# 题目

Microsoft Agent Framework 里 workflow 和 agent 的边界为什么特别重要？

# 一句话结论

因为它直接决定哪些路径应该预定义、哪些节点允许模型动态决策。

# 核心机制

1. workflow 是预定义执行逻辑
2. agent 是 LLM 驱动的动态执行单元
3. executors 和 edges 让 workflow 有明确路径模型

# 标准答案

Microsoft Agent Framework 把 workflow 和 agent 分得很清楚：workflow 负责预定义执行路径，agent 负责带 LLM 的动态决策。这个区分对企业系统尤其重要，因为不是所有路径都应该交给模型自由规划。通过 executors 和 edges，workflow 可以把模型节点、工具节点、审批节点和外部系统节点纳入统一控制路径中，因此它解决的是系统可控性问题，而不是单纯的多步骤组织问题。

# 必答点

1. predefined path vs dynamic reasoning
2. executors and edges
3. controllability

# 常见误答

1. 认为 workflow 只是多几步 Prompt
2. 认为有了 agent 就不需要 workflow