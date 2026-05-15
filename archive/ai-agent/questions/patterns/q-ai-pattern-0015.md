---
id: q-ai-pattern-0015
title: 为什么说有 citation 还不够，Evidence Selection 和 Answer Synthesis 也必须单独设计
domain: ai-agent
component: agent-patterns
topic: citation-fidelity-answer-synthesis
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-file-search-docs
  - openai-retrieval-guide
  - alce-paper
  - attribute-first-paper
  - rarr-paper
claim_ids:
  - pattern-claim-0049
  - pattern-claim-0050
  - pattern-claim-0051
  - pattern-claim-0052
  - pattern-claim-0053
  - pattern-claim-0054
  - pattern-claim-0055
related_docs:
  - ai-agent/patterns/citation-fidelity-evidence-selection-and-answer-synthesis
estimated_minutes: 9
---

# 题目

为什么说有 citation 还不够，Evidence Selection 和 Answer Synthesis 也必须单独设计？

# 一句话结论

因为 citation 只是支持路径暴露结果，真正决定答案是否可信的，是系统有没有先挑对证据，再让答案受证据约束地生成出来。

# 核心机制

1. citation exposure is not equivalent to evidence sufficiency
2. evidence selection should happen before synthesis
3. revision may still be needed after synthesis

# 标准答案

高质量 RAG 不能把 citation、evidence selection 和 answer synthesis 混成一步。OpenAI File Search 说明答案里的 file citation annotations 和 raw search results 是分开的，后者默认甚至不会自动返回，所以“有引用”不等于已经完成证据审计。OpenAI Retrieval guide 也把 grounded response synthesis 单独作为一步。更进一步，Attribute First, then Generate 说明 attributed generation 更合理的做法是先做 content selection 和 sentence planning，再逐句生成；ALCE 则证明 citation quality 需要独立评估，最佳系统在 ELI5 上仍有 50% 时间缺乏完整 citation support。必要时还可以像 RARR 那样对 unsupported content 做 revision。因此，可靠系统应该是“先选证据，再合成答案，再检查引用完整性”。

# 必答点

1. citation 不等于完整证据支撑
2. evidence selection 不应省略
3. answer synthesis 是独立阶段
4. 必要时还要做 attribution repair

# 常见误答

1. 认为带了来源链接就一定可靠
2. 把 top-k 全塞给模型当作 evidence selection
3. 完全不考虑 citation quality 的独立评估