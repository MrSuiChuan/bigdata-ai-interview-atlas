---
id: q-ai-pattern-0038
title: 为什么 Agent 评测必须做成 Multi-Stage Evals 和 Closed Loop
domain: ai-agent
component: agent-patterns
topic: multi-stage-evals-online-feedback-closed-loop-improvement
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agent-evals-guide
  - openai-evaluation-best-practices
  - openai-graders-guide
  - openai-trace-grading-guide
  - openai-agents-sdk-tracing
claim_ids:
  - pattern-claim-0174
  - pattern-claim-0175
  - pattern-claim-0176
  - pattern-claim-0177
  - pattern-claim-0178
  - pattern-claim-0179
related_docs:
  - ai-agent/patterns/multi-stage-evals-online-feedback-and-closed-loop-improvement
estimated_minutes: 12
---

# 题目

为什么 Agent 评测必须做成 Multi-Stage Evals，并且要把线上反馈做成 Closed Loop？

# 一句话结论

因为 agent 的失败不只发生在最终答案，必须先用 trace 找到流程哪里坏了，再把线上发现的新问题沉淀为离线回归样本，评测体系才会越跑越强。

# 核心机制

1. traces, graders, datasets, and eval runs solve different evaluation jobs
2. trace grading explains failures better than pure black-box scoring
3. online logs and human feedback are the source of future regression suites

# 标准答案

Agent 评测必须做成多阶段，是因为不同评测对象解决的是不同问题。OpenAI 的 evaluate-agent-workflows 指南把 traces、graders、datasets 和 eval runs 视为不同 evaluation surfaces，意味着开发期往往先靠 trace 观察系统行为，等理解了什么算好结果后，再把这些标准沉淀进 graders、数据集和持续回归运行。trace grading 的价值在于它比只看最终答案的 black-box eval 更能解释为什么失败，因为它评价的是端到端过程，可以帮助定位是规划错、工具参数错、检索错还是合成错。与此同时，OpenAI evaluation best practices 强调要记录完整日志、优先用生产或历史数据构建数据集、每次变更都持续评测，并用人工反馈校准自动评分，这说明线上反馈不是附属品，而是新测试样本的来源。对于 agent 这类多约束系统，graders 文档中的 multigrader 还能把正确性、合规性、预算和流程约束等多个条件聚合成总分。再结合 Agents SDK tracing 可用于开发和生产、长任务可 `flush_traces()` 的能力，一个成熟的 closed loop 就是把线上 traces 和日志挖掘出的失败模式，经过人工校准后回灌到 datasets 和 eval runs 中，变成之后每次改动都要通过的回归套件。

# 必答点

1. 说明 traces、graders、datasets、eval runs 是不同评测层
2. 说明 trace grading 的核心价值是定位失败原因
3. 说明生产日志和人工反馈是数据集的重要来源
4. 说明闭环的目标是把线上新事故变成离线回归样本

# 常见误答

1. 用一份离线题库代替整个 agent eval 体系
2. 只看最终答案，不分析执行过程
3. 不做人工校准，完全依赖自动 grader
4. 线上出了新问题但没有回灌到回归集
