---
id: q-ai-cli-agent-0005
title: 哪些指标最能提前暴露 CLI Agent 的高权限风险正在扩大
domain: ai-agent
component: cli-agent
topic: production-security-audit-selection-boundary
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料 anycli repository and official tool protocol docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-anycli
  - openai-agents-sdk-tools
  - mcp-server-concepts
claim_ids:
  - practice-p1-claim-0003
  - practice-p1-claim-0004
related_docs:
  - ai-agent/platforms/anycli-production-security-audit-and-cli-agent-selection-boundary
estimated_minutes: 10
---

# 题目

哪些指标最能提前暴露 CLI Agent 的高权限风险正在扩大？

# 一句话结论

审批率、危险命令触发率、目录越界尝试、环境变量访问请求和重复失败模式，通常比最终任务成功率更早暴露风险扩大。

# 核心机制

1. 审批率反映高风险动作暴露频率。
2. 危险命令触发率反映 tool surface 是否过宽。
3. 目录越界尝试反映权限边界压力。
4. 环境变量访问请求反映凭证与机密风险。
5. 重复失败模式反映治理层设计缺陷。

# 标准答案

CLI Agent 的高权限风险往往先体现在中间指标上，而不是最终任务失败上。优先要看审批率是否持续上升、危险命令或 destructive action 请求频率是否增加、目录越界尝试是否增多、环境变量和网络访问请求是否异常、以及 audit 里是否频繁出现同一类失败模式。如果这些指标在抬头，说明 Agent 已经在逼近或突破当前权限边界，应该及时收窄 tool surface 或改成更受限的封装方式。

# 必答点

1. 说明审批率。
2. 说明危险命令触发率。
3. 说明目录越界和环境变量访问请求。
4. 说明重复失败模式和 audit。
5. 说明这些是早期预警信号。

# 常见误答

1. 只看任务成败。
2. 不看权限边界信号。
3. 不分析 audit。
4. 不把高频审批当作风险指标。
