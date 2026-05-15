---
id: q-ai-pattern-0008
title: 为什么说有检索不等于有 grounding，有 citation 也不等于答案真的被证据支撑
domain: ai-agent
component: agent-patterns
topic: grounding-citation-evidence-selection-answer-synthesis
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - rag-paper
  - openai-file-search-docs
  - openai-retrieval-guide
  - alce-paper
  - attribute-first-paper
  - rarr-paper
claim_ids:
  - pattern-claim-0002
  - pattern-claim-0024
  - pattern-claim-0025
  - pattern-claim-0026
  - pattern-claim-0049
  - pattern-claim-0050
  - pattern-claim-0051
  - pattern-claim-0052
  - pattern-claim-0053
  - pattern-claim-0054
  - pattern-claim-0055
related_docs:
  - ai-agent/patterns/grounding-and-citation
estimated_minutes: 8
---

# 题目

为什么说有检索不等于有 grounding，有 citation 也不等于答案真的被证据支撑？

# 一句话结论

因为 retrieval、evidence selection、grounding / answer synthesis、citation fidelity 分别回答“有没有候选证据”“有没有选对证据”“答案是否受证据约束”“证据路径是否真的支撑关键结论”四个不同问题。

# 核心机制

1. retrieval fetches candidate evidence
2. evidence selection chooses supporting evidence before synthesis
3. grounded synthesis constrains answer generation with evidence
4. citation exposes the supporting source path but is not equal to evidence sufficiency

# 标准答案

系统检索到资料，只说明候选证据被找回来了，不代表这些证据真的被用于支撑答案。真正成熟的知识型 Agent 或 RAG 系统，至少要把 retrieval、evidence selection、grounded answer synthesis 和 citation rendering 分开理解。RAG 论文说明了 retrieval-conditioned generation 的基本思想；OpenAI File Search 文档说明最终答案里的 file citation annotations 与 raw search results 是两层资产，后者默认甚至不会自动返回，所以“答案里有 citation”不等于“你已经拿到了完整证据载荷”；OpenAI Retrieval guide 又把 grounded response synthesis 单独拿出来。进一步，Attribute First, then Generate 说明 attributed generation 更合理的做法是先选证据、再做句子规划、再逐句生成；ALCE 证明 citation quality 需要独立评估；RARR 则说明必要时还要对 unsupported content 做 revision。因此，可靠系统应该是“先选证据，再合成答案，再验证引用完整性，必要时再修订”，而不是“先写答案，最后贴来源”。

# 必答点

1. retrieved 不等于 grounded
2. citation 不等于完整证据支撑
3. evidence selection 不应被 top-k 全塞模型替代
4. citation 的核心价值是 traceability，不是正确性证明

# 常见误答

1. 认为有 citation 就一定正确
2. 把 grounding 简化成“把文档塞进上下文”
3. 把 citation 当成模型自我解释
4. 把 top-k 全塞给模型当作 evidence selection
5. 完全不考虑 citation quality 的独立评估
