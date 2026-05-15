---
id: q-ai-case-0030
title: AI 编程 Agent 为什么要把命令执行、审批和恢复策略放进同一条验证闭环
domain: ai-agent
component: ai-coding-workflow
topic: test-loop-permission-approval-recovery
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Datawhale smart-dev repository, Roo Code docs, and MCP docs as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-smart-dev
  - roo-code-docs
  - mcp-server-concepts
  - openai-agents-sdk-tracing
claim_ids:
  - practice-p1-claim-0012
related_docs:
  - ai-agent/cases/ai-coding-workflow-test-loop-permission-approval-and-recovery
estimated_minutes: 12
---

# 题目

AI 编程 Agent 为什么要把命令执行、审批和恢复策略放进同一条验证闭环？

# 一句话结论

因为验证动作本身就可能带来副作用，不能只把它当作无害的“跑测试”。

# 标准答案

在编程 Agent 场景里，验证不只是读日志，它可能触发构建、迁移、外部服务访问、浏览器自动化等高副作用动作。如果系统只关注 patch，对命令执行没有审批和恢复设计，就会出现两类风险：一类是做了本不该自动做的事，另一类是失败后在错误状态下继续重试，把问题放大。因此成熟系统要把验证计划、审批门、结构化执行结果和恢复策略放进同一条链里，确保每个命令的权限边界、失败解释和后续动作都有明确规则。

# 必答点

1. 验证动作可能有副作用
2. 审批用于拦截高风险命令
3. 恢复策略用于约束失败后的动作
4. 结构化结果用于区分环境错和代码错

# 常见误答

1. 跑测试天然安全
2. 审批只在部署时才需要
3. 命令失败就一直重试
4. 不记录执行 trace
