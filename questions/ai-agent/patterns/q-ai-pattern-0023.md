---
id: q-ai-pattern-0023
title: 为什么 Agent Evals 不能只看最终答案，而要把 Trace、Task Success、Regression Gate 和 Closed Loop 一起设计
domain: ai-agent
component: agent-patterns
topic: agent-evals-trace-grading-regression-closed-loop
question_type: operations
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
  - pattern-claim-0094
  - pattern-claim-0095
  - pattern-claim-0096
  - pattern-claim-0097
  - pattern-claim-0098
  - pattern-claim-0174
  - pattern-claim-0175
  - pattern-claim-0176
  - pattern-claim-0177
  - pattern-claim-0178
  - pattern-claim-0179
related_docs:
  - ai-agent/patterns/agent-evals-task-success-and-regression-prevention
estimated_minutes: 12
---

# 题目

为什么 Agent Evals 不能只看最终答案，而要把 Trace、Task Success、Regression Gate 和 Closed Loop 一起设计？

# 一句话结论

因为 agent 的失败可能发生在中间执行路径，而不是只体现在最终答案表面，所以必须同时评估 execution path、任务成功定义、持续回归防护，以及把线上新问题回灌成离线回归样本的能力。

# 核心机制

1. trace eval explains workflow-level behavior
2. task success needs multi-dimensional grading
3. regression gates prevent silent quality drift after changes
4. online logs and human feedback are the source of future regression suites

# 标准答案

Agent eval 不能只靠人工感觉，因为 agent 的行为受 prompt、模型、工具、路由、guardrails 和外部知识链路共同影响，任何一处变化都可能导致任务成功率回退。OpenAI 的 evaluating agent workflows guide 建议先用 trace grading 快速发现 workflow-level 问题，再在需要可重复和大规模比较时转向 datasets 与 eval runs；trace grading guide 又说明 trace eval 比 black-box final-answer eval 更能解释 regressions，因为它直接对 end-to-end execution path 打标签和分数。与此同时，evaluation best practices 强调 eval-driven development、continuous evaluation、task-specific metrics、日志完备和避免 vibe-based eval；graders guide 则提供了 0 到 1 的结构化评分框架，可以组合 string check、text similarity、score model grader、Python execution 和 multigrader，把 task success 做成多维 scorecard。更进一步，线上 traces、日志挖掘和人工反馈并不是离线评测的补充，而是 closed-loop improvement 的数据来源；Agents SDK tracing 则为这个闭环提供了过程数据基础设施。真正成熟的做法，是把 trace eval、task success graders、dataset eval、regression gate 和线上反馈回灌绑成一个持续系统，而不是只看一张离线分数表。

# 必答点

1. final answer eval 不足以覆盖 agent failure mode
2. trace grading 适合 workflow-level 问题定位
3. task success 需要 task-specific graders 和 multigrader
4. 每次关键改动都要触发 regression gate
5. 线上新问题必须回灌到数据集和 eval runs

# 常见误答

1. 只看最终输出像不像样
2. 没有 task-specific metrics
3. prompt、tool、routing 改了也不重跑评测
4. 线上出了新问题但没有回灌到回归集
