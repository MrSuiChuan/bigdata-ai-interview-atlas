---
id: q-ai-pattern-0044
title: 为什么 Subgraph 设计首先是状态合同设计，而不是流程复用设计
domain: ai-agent
component: agent-patterns
topic: subgraphs-private-state-shared-state-composition-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - langgraph-subgraphs-docs
claim_ids:
  - pattern-claim-0211
  - pattern-claim-0212
  - pattern-claim-0213
  - pattern-claim-0214
  - pattern-claim-0215
  - pattern-claim-0216
  - pattern-claim-0217
related_docs:
  - ai-agent/patterns/subgraphs-private-state-shared-state-and-composition-boundaries
estimated_minutes: 12
---

# 题目

为什么 Subgraph 设计首先是状态合同设计，而不是流程复用设计？

# 一句话结论

因为 subgraph 是否能安全组合，取决于父图和子图共享什么状态、隐藏什么状态、如何持久化以及谁来提供恢复基础设施，而不是只取决于流程能不能拆开。

# 核心机制

1. direct node 与 wrapper invocation 的分界由 state schema 决定
2. private state 与 shared state 要分层
3. persistence mode 决定子图是短生命任务、长生命角色还是纯函数组件

# 标准答案

Subgraph 设计首先是状态合同设计，因为 LangGraph 官方文档明确指出，父图和子图如果共享 state keys，可以把编译好的 subgraph 直接作为节点加入父图；如果状态 schema 不同，或者需要做显式状态转换，则应在 wrapper node 内调用子图。这说明组合方式的分界首先取决于 state contract 是否对齐，而不是代码能不能复用。进一步，在多 agent 场景里，官方把“子图在 node 内调用、每个 agent 维护自己的私有 message history，再把结果映回父图”作为常见模式，这说明 private state 和 shared collaboration state 不能随便混在一个大状态对象里。持久化层面，`checkpointer=None` 表示默认的 per-invocation persistence，适合大多数独立 subagent request；`checkpointer=True` 开启 per-thread persistence，适合需要跨调用记忆的长生命 subagent；`checkpointer=False` 则让子图成为 stateless 组件，不支持 pause/resume、durable execution 和 inspectable checkpoints。与此同时，父图自身还必须有 checkpointer，子图的 interrupts、state inspection 和 per-thread memory 才能真正工作。官方还提醒，同一个 stateful subgraph instance 在一个 node 中多次调用会因为共享 checkpoint namespace 产生冲突，因此这类场景更适合 per-invocation persistence。也就是说，subgraph 真正的设计中心不是流程拆分，而是共享状态、私有状态、持久化模式和可观测性边界的统一设计。

# 必答点

1. 说明 direct node 和 wrapper 的分界来自 state schema 是否对齐
2. 说明多 agent 常常需要私有局部历史
3. 说明 `None`、`True`、`False` 三种 checkpointer 模式含义不同
4. 说明父图 checkpointer 和 checkpoint namespace 冲突这两个工程边界

# 常见误答

1. 把 subgraph 当成普通代码复用单元
2. 不区分共享状态和私有状态
3. 以为子图自己开持久化就足够
4. 把 stateful subgraph 当成纯函数重复复用
