---
id: q-ai-semantic-kernel-0002
title: Semantic Kernel 里 plugin、agent orchestration、process framework 为什么不能混着讲
domain: ai-agent
component: semantic-kernel
topic: process-orchestration-observability
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Semantic Kernel docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - semantic-kernel-plugins-docs
  - semantic-kernel-agent-orchestration-docs
  - semantic-kernel-process-framework-docs
  - semantic-kernel-observability-docs
claim_ids:
  - semantic-kernel-claim-0004
  - semantic-kernel-claim-0006
  - semantic-kernel-claim-0007
  - semantic-kernel-claim-0008
  - semantic-kernel-claim-0009
related_docs:
  - ai-agent/frameworks/semantic-kernel-process-orchestration-and-observability
estimated_minutes: 8
---

# 题目

Semantic Kernel 里 plugin、agent orchestration、process framework 为什么不能混着讲？

# 一句话结论

因为它们分别对应能力接入、Agent 协调和确定性流程层，系统责任完全不同。

# 核心机制

1. plugin 负责包装能力
2. orchestration 负责多 Agent 协调模式
3. process framework 负责状态化、事件驱动、可暂停恢复的流程

# 标准答案

在 Semantic Kernel 里，plugin 是能力接入层，负责把 native code、OpenAPI、MCP 等外部能力统一包装给 AI 使用；agent orchestration 负责多 Agent 协调模式，但官方也明确它仍处于 experimental 阶段；process framework 则更偏确定性业务流程，强调 process、step、state、事件驱动和 pause/resume。把三者分开讲，才能把 Semantic Kernel 的分层讲清楚。

# 必答点

1. capability vs coordination vs deterministic process
2. experimental orchestration boundary
3. observability as enterprise layer

# 常见误答

1. 把 orchestration 和 process framework 说成同一层
2. 忽略 experimental 状态
3. 只讲插件不讲运行和观测