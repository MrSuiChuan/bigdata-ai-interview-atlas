---
id: q-ai-agent-skills-0004
title: 如何为 Agent Skill 设计版本、评估和回滚机制
domain: ai-agent
component: agent-skills
topic: agent-skills-versioning-evals-permission-governance
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Anthropic docs, Claude blog, DeepLearning.AI course page, and 实践资料 agent-skills repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - anthropic-agent-skills-docs
  - anthropic-skills-explained-blog
  - practice-agent-skills-with-anthropic
claim_ids:
  - practice-p2-claim-0003
  - agent-runtime-claim-0006
  - agent-runtime-claim-0007
related_docs:
  - ai-agent/patterns/agent-skills-versioning-evals-and-permission-governance
estimated_minutes: 15
---

# 题目

如何为 Agent Skill 设计版本、评估和回滚机制？

# 一句话结论

要把 Skill 当成长期运行资产管理：先进入 registry candidate，再过 eval gate，随后灰度发布，并持续监控误召回、越权和成功率退化，必要时快速回滚。

# 核心机制

1. Skill Registry 管版本、owner、状态和适用范围
2. Eval Set 检查成功率、步骤数、成本和错误工具请求率
3. Permission Profile 控制 tool 和 MCP 能力边界
4. Rollout Policy 控制灰度与回滚

# 标准答案

设计 Skill 治理机制时，首先要有 Skill Registry，明确 skill_id、owner、版本、状态、允许工具和适用范围。新版本不能直接上线，而应先进入 candidate，再用固定 eval set 对比新旧版本的任务成功率、平均步骤数、错误工具请求率、人工介入率和成本变化。通过后只在灰度范围内启用，比如某个环境或低风险任务集合。上线后持续观察命中率、误召回、越权请求和成功率退化，一旦发现异常就立即禁用或回滚到上一个稳定版本。这样做的核心，不是管理文档，而是管理一个会影响执行链路和权限边界的生产能力包。

# 必答点

1. 说明为什么 Skill 需要 Registry
2. 说明 Eval Gate 至少要覆盖成功率、步骤数和成本
3. 说明权限边界不能跟着全局工具注册自动扩大
4. 说明灰度发布和回滚机制
5. 说明 trace 对问题追溯的重要性

# 常见误答

1. Skill 改完直接上线
2. 只看单次 Demo 成功
3. 不讲权限扩大风险
4. 不讲回滚范围和受影响任务定位
