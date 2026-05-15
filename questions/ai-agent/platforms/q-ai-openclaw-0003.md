---
id: q-ai-openclaw-0003
title: 个人 Agent Gateway 什么时候应该自动执行，什么时候应该只提醒或待审批
domain: ai-agent
component: openclaw
topic: production-security-observability-selection-boundary
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "OpenClaw official site, GitHub repository, security advisory, and 实践资料 OpenClaw tutorials as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - openclaw-site
  - openclaw-github
  - openclaw-security-advisory-ghsa-m3mh-3mpg-37hw
  - practice-openclaw-tutorial
  - practice-hand-on-openclaw
claim_ids:
  - practice-p1-claim-0007
  - practice-p1-claim-0008
related_docs:
  - ai-agent/platforms/openclaw-production-security-observability-and-personal-agent-selection-boundary
estimated_minutes: 10
---

# 题目

个人 Agent Gateway 什么时候应该自动执行，什么时候应该只提醒或待审批？

# 一句话结论

低风险、可回溯、误触发成本低的动作可以自动执行；高风险、不可逆、涉及敏感账户或对外沟通的动作更适合提醒或审批模式。

# 核心机制

1. Risk Tier 决定动作分级。
2. Approval Mode 决定自动执行、待批执行或仅提醒。
3. Observability 确保所有动作可追溯。
4. Kill Switch 负责异常时快速停用能力。

# 标准答案

个人 Agent Gateway 的关键不是“尽量自动化”，而是按风险等级做不同放权。低风险动作，例如读日历、总结文件、整理待办，通常可以自动执行；涉及外发消息、修改工作区文件、操作账号设置或任何不可逆动作，则更适合待审批或只提醒。这样设计的核心原因是：个人 Agent 离用户的真实工作与账户太近，误触发代价很高，因此自动化收益必须和风险分级一起判断。

# 必答点

1. 说明 Risk Tier。
2. 说明 Approval / Reminder 模式。
3. 说明高风险动作示例。
4. 说明 Observability 和 Kill Switch。
5. 说明不是越自动越好。

# 常见误答

1. 认为个人助手就该尽量自动做完。
2. 不讲不可逆动作。
3. 不讲提醒模式。
4. 不讲快速停用能力。
