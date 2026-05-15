---
id: q-ai-agent-skills-0005
title: 线上出现误触发 Skill、错误委派 Subagent 或远程 Tool 超时，应该怎样排障
domain: ai-agent
component: agent-skills
topic: agent-skills-tools-mcp-subagents
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Anthropic docs, Claude blog, DeepLearning.AI course page, and 实践资料 agent-skills repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - anthropic-agent-skills-docs
  - practice-agent-skills-with-anthropic
  - mcp-server-concepts
claim_ids:
  - practice-p2-claim-0002
  - practice-p2-claim-0003
  - agent-runtime-claim-0006
related_docs:
  - ai-agent/patterns/agent-skills-tools-mcp-and-subagents
  - ai-agent/patterns/agent-skills-versioning-evals-and-permission-governance
estimated_minutes: 15
---

# 题目

线上出现误触发 Skill、错误委派 Subagent 或远程 Tool 超时，应该怎样排障？

# 一句话结论

先按责任层查证据：先查 Skill 命中，再查 Tool 暴露，再查 MCP 连接与鉴权，最后查 Subagent 输出合同和验收。

# 核心机制

1. Skill 层问题通常表现为上下文准备错误
2. Tool 层问题通常表现为参数、权限或副作用边界异常
3. MCP 层问题通常表现为连接、鉴权或 server 暴露范围异常
4. Subagent 层问题通常表现为子任务目标或验收合同缺失

# 标准答案

排障时不要把所有异常都归咎于模型。第一步先看当前 run 命中了哪个 skill、哪个版本、为什么命中，确认是不是错误能力包把主任务带偏。第二步看本轮实际暴露给模型的工具集合，确认有没有漏暴露必要工具或暴露了不该出现的高风险工具。第三步如果问题涉及远程能力，再查 MCP Client 到 Server 的连接状态、鉴权结果、超时和返回结构。第四步如果系统做了委派，要检查 Subagent 的目标、独立上下文、输出合同和主 Agent 的验收逻辑。最后再结合 trace、审批日志和 operation log 判断是否出现了重复动作、未验收结果进入主链路或错误版本的 skill 被灰度放大。

# 必答点

1. 排障顺序要按 Skill、Tool、MCP、Subagent 分层
2. 说明每层各自最典型的证据
3. 说明为什么不能一上来就调 Prompt
4. 说明要结合 trace、审批、operation log
5. 说明错误版本或误召回可能是根因

# 常见误答

1. 所有问题都说是模型不稳定
2. 不区分本地 Tool 和远程 MCP 能力
3. 不查 skill 版本和命中原因
4. 不查 Subagent 验收合同
