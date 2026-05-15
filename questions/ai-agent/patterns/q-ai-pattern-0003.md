---
id: q-ai-pattern-0003
title: Reflection / Self-Refinement 为什么不是简单重写一遍答案
domain: ai-agent
component: agent-patterns
topic: reflection-self-refinement
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Primary papers as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - self-refine-paper
  - reflexion-paper
claim_ids:
  - pattern-claim-0008
  - pattern-claim-0009
  - pattern-claim-0010
  - pattern-claim-0012
related_docs:
  - ai-agent/patterns/reflection-and-self-refinement
estimated_minutes: 7
---

# 题目

Reflection / Self-Refinement 为什么不是简单重写一遍答案？

# 一句话结论

因为真正的 reflection 模式会把反馈变成显式对象，并让它影响后续改进或未来决策，而不是只做一次润色。

# 核心机制

1. explicit feedback loop
2. iterative refinement
3. optionally preserved reflections in memory

# 标准答案

真正的 Reflection / Self-Refinement 模式，不只是让模型再改一版输出，而是把 feedback 当成系统里的正式中间结果。Self-Refine 用“生成 -> 反馈 -> 改写”的显式循环改进输出；Reflexion 还会把 verbal reflections 存入 episodic memory 影响后续行为。因此它比普通 rewrite 更像一个基于反馈的持续改进回路。

# 必答点

1. feedback as object
2. iterative loop
3. reflection may persist across runs

# 常见误答

1. 把 reflection 说成任何二次改写
2. 完全不提 feedback 存储和重用