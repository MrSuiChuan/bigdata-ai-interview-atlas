---
id: q-ai-camel-0005
title: CAMEL 多智能体上线后，首先要监控哪些信号来判断它是否正在失控
domain: ai-agent
component: camel-ai
topic: production-governance-observability-human-override
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "CAMEL-AI docs, CAMEL Workforce docs, and 实践资料 handy-multi-agent repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - camel-ai-docs
  - camel-ai-workforce-docs
  - practice-handy-multi-agent
claim_ids:
  - practice-p0-claim-0005
  - practice-p0-claim-0006
  - agent-runtime-claim-0006
related_docs:
  - ai-agent/frameworks/camel-ai-production-governance-observability-and-human-override
estimated_minutes: 10
---

# 题目

CAMEL 多智能体上线后，首先要监控哪些信号来判断它是否正在失控？

# 一句话结论

要重点看协作轮次、review reject 次数、共享产物回退率、人工升级率和高风险动作请求频率，这些信号比单纯答案好坏更早暴露失控趋势。

# 核心机制

1. collaboration trace 记录协作链。
2. review reject 次数反映收敛质量。
3. escalation rate 反映自动化是否被高风险压垮。
4. artifact rollback 反映错误传播程度。
5. max rounds 告诉你系统是否陷入无效讨论。

# 标准答案

多智能体上线后的关键监控，不只是最终答案是否正确，而是系统是否正在越来越难收敛。优先关注协作总轮次、每个任务的 review reject 次数、共享产物被回退或重写的比例、人工升级率、高风险工具请求频率和单任务平均 token 成本。如果这些指标持续上升，往往说明任务拆解、角色边界或 reviewer 机制已经出了问题。越早监控这些中间信号，越容易在结果全面劣化前发现问题。

# 必答点

1. 说明协作轮次和无效讨论。
2. 说明 review reject 与 artifact rollback。
3. 说明人工升级率和高风险动作请求。
4. 说明 token 与延迟成本。
5. 说明这些是比最终结果更早的预警信号。

# 常见误答

1. 只监控最终答案评分。
2. 不看中间协作信号。
3. 不监控高风险动作请求。
4. 不把人工升级当成系统信号。
