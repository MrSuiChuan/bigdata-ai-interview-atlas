---
id: q-llm-foundation-0041
title: 为什么企业知识问答类应用通常先做 API、Prompt、RAG 和评估闭环，而不是一开始就微调或上 Agent
domain: llm-foundations
component: llm-application-development
topic: api-prompt-rag-eval-learning-path
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Datawhale llm-cookbook, llm-universe, and evaluation docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-llm-cookbook
  - practice-llm-universe
  - openai-evaluation-best-practices
claim_ids:
  - llm-foundation-claim-0009
  - llm-foundation-claim-0010
  - llm-foundation-claim-0012
related_docs:
  - llm-foundations/llm-application-development-path-api-prompt-rag-eval
  - llm-foundations/llm-application-development-observability-permission-and-online-iteration
estimated_minutes: 10
---

# 题目

为什么企业知识问答类应用通常先做 API、Prompt、RAG 和评估闭环，而不是一开始就微调或上 Agent？

# 一句话结论

因为企业知识问答的核心问题通常是知识接入、权限和引用，而不是高自主行动，先把证据链和评估闭环做稳，成本更低、回滚更容易。

# 标准答案

企业知识问答的主要诉求通常是接入私有知识、保证权限正确、给出可追溯引用，并在知识更新后快速生效。这类问题优先适合 API、Prompt 和 RAG 的组合：API 提供模型能力，Prompt 定义回答规约，RAG 接入最新知识，评估闭环负责验证效果。直接微调往往不利于频繁知识更新，直接上 Agent 又会引入额外的工具、副作用和治理复杂度。更合理的路径是先把知识接入、回答约束和评估机制稳定下来，再决定是否需要更高阶的微调或 Agent 编排。

# 必答点

1. 说明企业知识问答首先是知识接入问题
2. 说明 RAG 对更新和引用的优势
3. 说明微调不适合高频知识更新
4. 说明 Agent 会增加治理复杂度
5. 说明评估闭环是先决条件

# 常见误答

1. 知识问答一上来就先微调
2. 认为 Agent 默认更高级所以一定更好
3. 不讲权限和引用
4. 不讲回滚和评估

# 追问

1. 什么时候知识问答项目需要再引入微调？
2. 什么场景才值得升级成 Agent？
3. RAG 做稳之前最该优先补哪一层？
