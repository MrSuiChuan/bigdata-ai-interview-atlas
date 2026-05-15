---
id: q-ai-wow-agent-0005
title: 跨平台 Agent 的治理指标里，哪些比“最终答案对不对”更早暴露问题
domain: ai-agent
component: wow-agent
topic: production-governance-observability-framework-selection
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料 wow-agent repository, OpenAI Agents SDK docs, and MCP docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-wow-agent
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
claim_ids:
  - practice-p0-claim-0007
  - practice-p0-claim-0008
  - agent-runtime-claim-0006
related_docs:
  - ai-agent/frameworks/wow-agent-production-governance-observability-and-framework-selection
estimated_minutes: 10
---

# 题目

跨平台 Agent 的治理指标里，哪些比“最终答案对不对”更早暴露问题？

# 一句话结论

适配失败率、平台特定错误率、审批触发率、fallback 比例和 step 级延迟，通常比最终答案质量更早显示跨平台系统正在失控。

# 核心机制

1. 适配失败率反映模型或工具层不一致。
2. 平台特定错误率反映环境差异。
3. 审批触发率反映高风险动作暴露情况。
4. fallback 比例反映主路径是否稳定。
5. step 级延迟反映适配层和治理层成本。

# 标准答案

对于跨平台 Agent，仅看最终答案正确率太晚了。更早的信号通常来自适配失败率、平台特定错误率、审批触发率、fallback 比例、step 级延迟和单任务平均 token 成本。如果这些指标开始恶化，说明问题可能还没有全面反映到最终答案上，但系统已经在适配、权限或治理层出现了结构性不稳定。越早看这些中间指标，越容易在结果全面劣化前发现问题。

# 必答点

1. 说明适配失败率。
2. 说明平台特定错误率。
3. 说明审批与 fallback 比例。
4. 说明 step 级延迟和成本。
5. 说明这些是早期预警信号。

# 常见误答

1. 只看最终答案评分。
2. 不看平台差异指标。
3. 不统计审批和 fallback。
4. 不看 step 级成本。
