---
id: q-ai-pattern-0025
title: 为什么 Agent Memory 上生产必须先定义 Retention Policy 和 PII Governance
domain: ai-agent
component: agent-patterns
topic: memory-safety-privacy-pii-governance-retention-policy
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-data-controls-guide
  - openai-agents-sdk-tracing
  - openai-agents-sdk-sessions
  - presidio-home
  - presidio-telemetry-redaction
claim_ids:
  - pattern-claim-0104
  - pattern-claim-0105
  - pattern-claim-0106
  - pattern-claim-0107
  - pattern-claim-0108
  - pattern-claim-0109
related_docs:
  - ai-agent/patterns/memory-safety-privacy-pii-governance-and-retention-policy
estimated_minutes: 10
---

# 题目

为什么 Agent Memory 上生产必须先定义 Retention Policy 和 PII Governance，再谈长期记忆能力？

# 一句话结论

因为 memory 一旦被写入并跨会话保留，它就从“提高体验的上下文”变成了“持续存在的隐私和合规对象”；不先定义保留与脱敏边界，记得越多风险越大。

# 核心机制

1. memory design starts with minimization before storage
2. retention boundaries differ across sessions, traces, and background state
3. pii detection is helpful but not exhaustive

# 标准答案

Agent Memory 的治理重点，不是先讨论“怎么把更多内容记住”，而是先定义“哪些内容不该写入、默认保留多久、写入后如何保护”。OpenAI 的 data controls guide 说明 Responses API 的 application state 默认保留 30 天，而 background mode 为支持轮询会把响应数据短暂落盘约 10 分钟；在 Zero Data Retention 下，`store` 会被视为 `false`，但某些能力仍可能保存必要应用状态，发往 remote MCP server 的数据还会受到第三方服务保留策略影响。这说明 retention boundary 必须逐层定义，而不是一句“我们不开存储”。同时，Agents SDK tracing 在 Zero Data Retention 组织下不可用，表明 observability 与最严 retention 策略之间存在直接取舍。会话层面，`EncryptedSession` 提供的是写入后的加密和 TTL 保护，但它不能替代写入前的数据最小化。再往下，Presidio 虽然能做 PII detection 和 anonymization，但官方也明确提醒自动检测并不保证识别全部敏感信息；它更适合成为多层治理中的一层，而不是唯一防线。成熟系统因此会同时设计分类、最小化、TTL、加密、日志出站前脱敏，以及第三方工具边界，而不是只在数据库上做一层加密。

# 必答点

1. 先讲 minimization，再讲 encryption 和 TTL
2. 说清 session、trace、background state 的 retention 不是一回事
3. 说清 Zero Data Retention 不等于端到端绝对不留状态
4. 提到 PII detector 不能替代完整治理

# 常见误答

1. 只谈数据库加密，不谈写入前分类
2. 认为 Zero Data Retention 就代表整条链路都不留数据
3. 认为有 PII 检测器就已经安全
4. 把原始敏感日志先送到观测平台，再考虑后处理