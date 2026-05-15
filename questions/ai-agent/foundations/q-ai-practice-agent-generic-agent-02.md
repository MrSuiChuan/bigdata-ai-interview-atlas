---
id: q-ai-practice-agent-generic-agent-02
title: "GenericAgent 如何设计可恢复、可观测的执行链路？"
domain: ai-agent
component: generic-agent
topic: runtime-loop-tool-contract-memory-loading
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "GenericAgent repository, OpenAI context engineering guides, and 实践资料 hello-generic-agent repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - generic-agent-github
  - practice-hello-generic-agent
  - openai-compaction-guide
claim_ids:
  - practice-p1-claim-0005
  - agent-runtime-claim-0003
  - agent-runtime-claim-0006
related_docs:
  - ai-agent/frameworks/generic-agent-runtime-loop-tool-contracts-and-memory-loading
  - ai-agent/frameworks/generic-agent-skill-crystallization-evals-and-governance
estimated_minutes: 12
---

# 题目

GenericAgent 如何设计可恢复、可观测的执行链路？

# 一句话结论

关键是把 loop state、tool call、observation、memory write 和 stop reason 全部结构化记录下来，并在关键步骤保留恢复点。

# 核心机制

1. task lifecycle 要分阶段建模。
2. tool call 前后都要留下结构化证据。
3. 恢复点要和副作用边界一起设计。
4. trace 要能说明哪一步做了什么决策。
5. memory 写入要晚于事实确认。

# 标准答案

设计 GenericAgent 的执行链路时，可以把任务拆成创建、检索、规划、执行、观察、收敛和结束几个阶段。每个阶段都要写入状态和 trace。工具调用前做 schema 校验和权限判断，调用后记录结果、耗时和异常。失败时根据错误类型决定重试、降级、回滚或交给人工。恢复时既要看 checkpoint，也要确认外部副作用是否已经发生，不能把 compaction 当作完整恢复方案。

# 必答点

1. 任务生命周期清晰。
2. 恢复点保存关键状态。
3. 工具调用有参数校验和审计。
4. 错误分类对应恢复策略。
5. memory 写入与长期污染隔离。

# 常见误答

1. 只说加日志。
2. 没有正式状态持久化。
3. 所有错误都自动重试。
4. 把摘要结果当成恢复点。
