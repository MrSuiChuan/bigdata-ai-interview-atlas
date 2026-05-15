---
id: q-ai-semantic-kernel-0005
title: 为什么 Semantic Kernel 的 observability 必须被当成框架层能力，而不是上线后再补的监控
domain: ai-agent
component: semantic-kernel
topic: process-orchestration-observability
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Semantic Kernel docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - semantic-kernel-observability-docs
  - semantic-kernel-process-framework-docs
  - semantic-kernel-agent-orchestration-docs
claim_ids:
  - semantic-kernel-claim-0006
  - semantic-kernel-claim-0008
  - semantic-kernel-claim-0009
related_docs:
  - ai-agent/frameworks/semantic-kernel
  - ai-agent/frameworks/semantic-kernel-process-orchestration-and-observability
estimated_minutes: 8
---

# 题目

为什么 Semantic Kernel 的 `observability` 必须被当成框架层能力，而不是上线后再补的监控？

# 一句话结论

因为它要观察的不只是一次模型调用，而是 Plugin、Agent Orchestration、Process Framework 这些分层对象如何共同运行；如果 observability 不在框架层，企业系统就很难解释链路和责任。

# 这题想考什么

这题考的是你能不能把 Semantic Kernel 的企业属性讲到运行和治理层，而不是只停在插件与 Agent 能力列表。

# 回答主线

1. 先讲 Semantic Kernel 的分层。
2. 再讲为什么每一层都需要被观测。
3. 最后讲 OpenTelemetry 兼容的意义。

# 参考作答

Semantic Kernel 不是单体 Agent SDK，而是 `Kernel + Plugins + Agent Framework / Orchestration + Process Framework` 的分层体系。这样一来，系统运行时要观察的对象就不只是模型输出，还包括哪个 plugin 被调用、哪条 orchestration 路径被选中、哪个 process step 卡住、哪次 pause/resume 出了问题。

因此 observability 必须是框架层能力，而不是业务上线后自己补几行日志。官方把它和 OpenTelemetry 兼容的 logs、metrics、traces 作为正式能力，是因为企业运行真正关心的是跨层责任链。没有这一层，Semantic Kernel 的中间件价值就很难完全成立。

# 现场判断抓手

1. 能把 observability 和分层结构绑定起来讲。
2. 能说明 plugin / process / orchestration 都需要观测。
3. 能讲出 OpenTelemetry 的平台化意义。

# 常见误区

1. 把 observability 理解成普通日志。
2. 只讲 Agent，不讲 process 与 plugin 层。
3. 认为观测是业务团队自己的事，与框架无关。

# 追问

1. 为什么 Process Framework 的 pause/resume 特别依赖观测？
2. orchestration 一旦处于 experimental 阶段，为什么 observability 更重要？
3. 中间件和普通 Agent SDK 在观测诉求上有什么本质差异？
