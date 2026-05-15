---
id: q-ai-harness-engineering-0004
title: Admission Control 和 Human Gate 为什么是 Harness 的核心，而不是外围功能
domain: ai-agent
component: harness-engineering
topic: harness-admission-observability-human-gates
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Official long-running agent docs and 实践资料 self-harness repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-background-mode-guide
  - openai-agents-sdk-human-in-the-loop
  - practice-self-harness
claim_ids:
  - practice-p0-claim-0003
  - agent-runtime-claim-0006
  - agent-runtime-claim-0007
related_docs:
  - ai-agent/patterns/agent-harness-admission-control-observability-and-human-gates
estimated_minutes: 12
---

# 题目

Admission Control 和 Human Gate 为什么是 Harness 的核心，而不是外围功能？

# 一句话结论

因为长任务系统必须先决定“能不能接、谁来执行、何时转人工、谁拥有当前控制权”，这些都属于执行责任层，不是后期再补的 UI 或网关细节。

# 核心机制

1. Admission Policy 控制去重、并发、预算和优先级
2. Human Gate 把审批和补充信息变成正式运行状态
3. Trace 与 Event 要从入口就开始记录
4. 恢复必须沿原 run_id 继续，不能新开匿名任务

# 标准答案

Admission Control 和 Human Gate 之所以是 Harness 核心，是因为它们直接决定长任务能否被稳定接入和安全接管。Admission Policy 负责身份校验、去重、并发限制、预算和优先级，如果这层失控，同一 thread 上的多个 run 可能互相覆盖状态。Human Gate 则把审批、补充资料和风险确认变成正式运行状态，让系统知道什么时候应暂停、谁拥有当前控制权、恢复入口在哪里。它们都不是外围功能，因为一旦设计缺失，后面的 checkpoint、恢复和 tracing 都会失去前提。

# 必答点

1. 说明 admission 不只是限流
2. 说明 human gate 是正式状态不是弹窗
3. 说明要从入口就建立 trace 和 event
4. 说明并发 run 会污染共享状态
5. 说明恢复要沿原 run_id 继续

# 常见误答

1. 把 admission 等同 API 网关
2. 把人工审批当产品交互细节
3. 不讲 thread 级并发控制
4. 不讲恢复后的控制权归属
