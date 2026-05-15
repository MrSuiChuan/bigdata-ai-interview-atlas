---
id: q-ai-harness-engineering-0005
title: 如何证明一个长任务 Harness 真正可运营，而不是只是“能后台跑起来”
domain: ai-agent
component: harness-engineering
topic: agent-harness-runtime-recovery
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Official long-running agent docs and 实践资料 self-harness repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - openai-background-mode-guide
  - microsoft-agent-framework-workflows
  - practice-self-harness
claim_ids:
  - practice-p0-claim-0003
  - practice-p0-claim-0004
related_docs:
  - ai-agent/patterns/agent-harness-runtime-recovery-and-production-governance
  - ai-agent/patterns/agent-harness-admission-control-observability-and-human-gates
estimated_minutes: 15
---

# 题目

如何证明一个长任务 Harness 真正可运营，而不是只是“能后台跑起来”？

# 一句话结论

要同时证明它能接住任务、看清任务、暂停任务、恢复任务和审计任务；只会异步执行，不等于可运营。

# 核心机制

1. Admission 指标证明入口是否稳定
2. Trace、Event、Metrics 证明过程是否可观测
3. Checkpoint 和 Operation Log 证明恢复是否可信
4. Human Gate 和 Fallback 证明风险是否可控

# 标准答案

证明一个 Harness 可运营，不能只演示“任务丢到后台还能继续跑”。真正需要看的，是完整执行责任链是否成立：入口层是否能去重、控并发和分配预算；运行层是否能记录 trace、event 和关键 metrics；状态层是否有可信 checkpoint 和 operation log；风险层是否能在审批、外部等待和失败恢复时正确暂停和接管。评估指标通常至少包括任务成功率、重复执行率、恢复成功率、人工接管率、P95 排队时延、P95 恢复时延和高风险动作审批命中率。只有这些指标同时成立，才能说明 harness 不只是“会在后台跑”，而是真的能被生产运营。

# 必答点

1. 说明可运营性不是异步执行本身
2. 说明入口、观测、恢复、审批四条证据链
3. 说明至少一组关键指标
4. 说明要覆盖高风险动作和恢复场景
5. 说明为什么重复执行率很关键

# 常见误答

1. 只展示后台任务队列
2. 不看恢复成功率和重复执行率
3. 不看审批命中和排队时延
4. 不讲 trace、event 和 operation log
