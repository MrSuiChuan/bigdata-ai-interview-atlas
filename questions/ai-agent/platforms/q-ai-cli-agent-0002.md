---
id: q-ai-cli-agent-0002
title: 为什么 CLI Agent 要把 Install Plan、Dry-run、Approval 和 Execution Policy 分成四层
domain: ai-agent
component: cli-agent
topic: install-plan-dry-run-approval-execution-policy
question_type: system-design
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
  - ai-agent/platforms/anycli-install-plan-dry-run-approval-and-execution-policy
estimated_minutes: 12
---

# 题目

为什么 CLI Agent 要把 Install Plan、Dry-run、Approval 和 Execution Policy 分成四层？

# 一句话结论

因为“打算做什么”“展示给谁看”“是否被允许做”“最终在哪个环境做”是四个不同问题，混在一起就很容易出事故。

# 核心机制

1. Install Plan 只描述计划。
2. Dry-run 只做预演和审查。
3. Approval 决定是否允许真实执行。
4. Execution Policy 决定执行环境边界。
5. Result Record 记录最终事实链。

# 标准答案

CLI Agent 要把 Install Plan、Dry-run、Approval 和 Execution Policy 分开，是为了把“计划”和“执行”彻底解耦。Install Plan 负责表达准备做什么；Dry-run 负责展示潜在副作用和命令细节；Approval 负责决定是否允许真实执行；Execution Policy 负责在真实执行时限制目录、网络、环境变量、超时和输出。只有这四层都独立存在，Agent 才不会从一个模糊意图直接跳到高风险命令落地。

# 必答点

1. 说明计划与执行分离。
2. 说明审批不是执行环境控制。
3. 说明 policy 是真实执行的最后保护层。
4. 说明四层混合会导致事故。
5. 说明 Result Record 便于排障与审计。

# 常见误答

1. 认为 dry-run 就够了。
2. 认为审批通过就可以任意执行。
3. 不讲执行环境限制。
4. 不讲结果记录。
