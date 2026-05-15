---
id: q-ai-openai-agents-0007
title: 为什么 OpenAI Agents SDK 里 handoff 和 agent-as-tool 必须严格区分
domain: ai-agent
component: openai-agents-sdk
topic: advanced-runtime
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "OpenAI Agents SDK docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - openai-agents-sdk-tools
  - openai-agents-sdk-handoffs
claim_ids:
  - openai-agents-claim-0005
  - openai-agents-claim-0006
  - openai-agents-claim-0007
related_docs:
  - ai-agent/frameworks/openai-agents-sdk
  - ai-agent/frameworks/openai-agents-handoffs-sessions-tracing
estimated_minutes: 8
---

# 题目

为什么 OpenAI Agents SDK 里 `handoff` 和 `agent-as-tool` 必须严格区分？

# 一句话结论

因为前者表示控制权正式转交，后者表示把另一个 agent 当子能力调用后再回到原 agent；如果把两者混在一起，系统的状态归属、trace 解释和排障都会乱掉。

# 这题想考什么

这题考的是你是否真正理解 OpenAI Agents SDK 的 delegation 语义，而不是只会说“都能调别的 agent”。

# 回答主线

1. 先讲 agent-as-tool 解决什么。
2. 再讲 handoff 解决什么。
3. 最后讲为什么状态和 trace 解释会因此不同。

# 参考作答

OpenAI Agents SDK 里，`agent-as-tool` 更像子能力调用。当前 agent 把另一个 agent 当作工具使用，等结果返回后，控制权仍在原 agent 手里。`handoff` 则不同，它是正式 delegation 机制，表示当前 agent 把后续执行控制权交给另一个 agent。

这个区别非常重要，因为它直接影响运行时语义。agent-as-tool 更像同步子调用，适合拿结果回来后继续由原 agent 决策；handoff 更像执行所有权切换，后续 trace、状态推进和输出责任都要围绕被交接的 agent 解释。如果把这两者混在一起，面试题里通常会暴露出你没有真正理解 OpenAI Agents SDK 的多 Agent 运行边界。

# 现场判断抓手

1. 能说清返回控制权和转移控制权的差别。
2. 能解释为什么 trace 语义不同。
3. 能把这个差别和系统设计边界联系起来。

# 常见误区

1. 认为 handoff 只是另一种 tool call。
2. 认为 agent-as-tool 也是正式接管后续执行。
3. 完全不提状态归属和排障差异。

# 追问

1. 什么场景下 agent-as-tool 比 handoff 更合适？
2. 为什么 handoff 更容易增加排障复杂度？
3. 在 trace 里怎么判断一次 delegation 属于哪一类？
