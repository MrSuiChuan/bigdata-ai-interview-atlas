---
id: q-ai-wow-agent-0004
title: 跨平台 Agent 出现“同一任务在不同终端行为不一致”时，应该先从哪几层排查
domain: ai-agent
component: wow-agent
topic: cross-platform-agent-framework
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "实践资料 wow-agent repository, OpenAI Agents SDK docs, and MCP docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-wow-agent
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - mcp-introduction
claim_ids:
  - practice-p0-claim-0007
  - practice-p0-claim-0008
  - agent-runtime-claim-0006
related_docs:
  - ai-agent/frameworks/wow-agent-cross-platform-agent-framework
  - ai-agent/frameworks/wow-agent-tool-adapter-runtime-loop-and-permission-boundaries
estimated_minutes: 10
---

# 题目

跨平台 Agent 出现“同一任务在不同终端行为不一致”时，应该先从哪几层排查？

# 一句话结论

优先看模型适配层、工具适配层、权限边界和状态层是否把平台差异混进了统一运行语义里。

# 核心机制

1. Model Adapter 处理消息和工具调用差异。
2. Tool Adapter 处理平台能力映射差异。
3. Permission Boundary 处理不同环境的限制。
4. State Layer 处理平台特有脏状态。
5. Governance Layer 提供 trace 证据。

# 标准答案

同一任务在不同终端上表现不一致时，先不要急着怪模型波动，应该先看模型适配层是否对不同 provider 的 tool calling 或消息格式处理一致；再看工具适配层是否把不同平台能力映射成了同样的 schema；然后看权限边界是否让某些终端天然少一部分能力；再看状态层是否混入平台特有字段，导致后续推理路径变化；最后再利用 trace 判断错误究竟来自平台、适配器还是 runtime loop。

# 必答点

1. 说明模型适配层。
2. 说明工具适配层。
3. 说明权限边界。
4. 说明状态层污染。
5. 说明 trace 作为证据链。

# 常见误答

1. 只说模型随机性。
2. 不看工具 schema 映射。
3. 忽略终端权限差异。
4. 不检查状态字段。
