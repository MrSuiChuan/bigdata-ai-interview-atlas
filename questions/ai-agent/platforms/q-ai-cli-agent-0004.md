---
id: q-ai-cli-agent-0004
title: CLI Agent 出现“明明工具存在但仍频繁执行失败”时，应该优先排哪些层
domain: ai-agent
component: cli-agent
topic: anycli-cli-registry-agent-tool-use
question_type: operations
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
  - ai-agent/platforms/anycli-cli-registry-for-agent-tool-use
  - ai-agent/platforms/anycli-install-plan-dry-run-approval-and-execution-policy
estimated_minutes: 10
---

# 题目

CLI Agent 出现“明明工具存在但仍频繁执行失败”时，应该优先排哪些层？

# 一句话结论

先排 Registry 元数据和 install plan，再排审批与 execution policy，最后才排具体命令本身。

# 核心机制

1. 工具存在不等于工具已就绪。
2. install plan 和真实环境可能不一致。
3. execution policy 可能拦住了命令。
4. 审批状态、目录范围和环境变量都可能导致失败。

# 标准答案

CLI Agent 出现这种问题时，优先确认 Registry entry 是否准确描述了二进制名、参数和安装方式；再确认工具是否真的按 install plan 安装完成，而不是只有 dry-run 记录；然后检查 approval 是否通过以及 execution policy 是否限制了目录、网络或环境变量；最后再看命令本身的参数和外部环境。这样排的原因是，CLI 失败经常不是命令语法错误，而是治理链上的某一层没有满足执行前提。

# 必答点

1. 说明 Registry 与真实环境可能不一致。
2. 说明 dry-run 不等于已安装。
3. 说明 execution policy 会拦住命令。
4. 说明审批状态也可能是根因。
5. 说明排障顺序要先看治理链。

# 常见误答

1. 一上来只改命令参数。
2. 不检查安装状态。
3. 忽略 policy 和 approval。
4. 不看 Registry 元数据是否过期。
