---
id: q-ai-pocketflow-0003
title: 为什么 PocketFlow 不把模型、向量库、权限和持久化全部做成内置能力
domain: ai-agent
component: pocketflow
topic: pocketflow-node-flow-orchestration
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "PocketFlow docs, PocketFlow GitHub repository, LangGraph overview docs, and 实践资料 easy-pocket repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - pocketflow-docs
  - pocketflow-github
  - practice-easy-pocket
  - langgraph-overview-docs
claim_ids:
  - practice-p1-claim-0006
  - agent-runtime-claim-0010
related_docs:
  - ai-agent/frameworks/pocketflow-node-flow-and-minimal-orchestration
  - ai-agent/frameworks/pocketflow-production-boundaries-observability-and-recovery
estimated_minutes: 10
---

# 题目

为什么 PocketFlow 不把模型、向量库、权限和持久化全部做成内置能力？

# 一句话结论

因为它的定位是极简编排骨架，核心价值是把控制结构抽象出来，而不是替业务方做完所有运行时和平台化责任。

# 核心机制

1. 抽象越小，越容易理解 Node / Flow 原理。
2. 不绑死模型和存储，原型适配更灵活。
3. 运行时治理能力由外层系统按需补齐。
4. 代价是恢复、权限、观测和审批都要自己设计。

# 标准答案

PocketFlow 不把所有能力都内置，是因为它的设计目标是极简编排框架，而不是全栈 Agent 平台。它通过 Node、Flow、State 和 Transition 把控制结构直接暴露出来，让使用者先看清 Agent / Workflow / RAG 的共同骨架。如果进一步把模型路由、向量库、权限壳、持久化和审批全都塞进去，就会掩盖这种最小抽象。它的代价也很明确：生产使用时，团队必须额外补恢复、幂等、观测和治理能力。

# 必答点

1. 说明 PocketFlow 的定位是最小编排骨架。
2. 说明不绑定模型和存储的价值。
3. 说明运行时治理要由外层系统补齐。
4. 说明它适合教学和原型，不代表天然适合生产。
5. 说明这是抽象层次差异，不是简单的好坏比较。

# 常见误答

1. 认为缺能力就是框架做得差。
2. 把极简框架误判成完整平台。
3. 不讲生产责任转移到哪里。
4. 只比较支持多少模型。
