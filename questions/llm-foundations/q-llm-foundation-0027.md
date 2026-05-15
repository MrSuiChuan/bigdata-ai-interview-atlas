---
id: q-llm-foundation-0027
title: 怎样用评估 trace 区分 RAG 是 recall 错、ranking 错、grounding 错，还是 generation 错
domain: llm-foundations
component: information-retrieval
topic: retrieval-evaluation-labeling-and-rag-failure-localization
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "IR textbook, DPR paper, BEIR paper, OpenAI retrieval guide, Azure RAG evaluators, and RAG paper as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - beir-paper
  - openai-retrieval-guide
  - azure-rag-evaluators
  - rag-paper
claim_ids:
  - llm-foundation-claim-0030
  - llm-foundation-claim-0013
related_docs:
  - llm-foundations/information-retrieval-bm25-dense-hybrid-and-rag-eval
  - llm-foundations/information-retrieval-evaluation-labeling-and-rag-failure-localization
estimated_minutes: 12
---

# 题目

怎样用评估 trace 区分 RAG 是 recall 错、ranking 错、grounding 错，还是 generation 错？

# 一句话结论

要同时记录 gold evidence、candidate set、ranked list、grounded context 和 final answer，按证据链逐层判断正确证据到底是没找到、没排前、没进 prompt，还是进了 prompt 但模型没用好。

# 标准答案

要区分 RAG 的失败层，首先需要一条完整评估 trace。对每个 query，至少要有 gold evidence，也就是期望命中的关键证据；然后记录 candidate set，看召回阶段有没有把正确证据找回来；再记录 ranked list，看 rerank 后正确证据是否仍排在前列；接着记录 grounded context，看排在前面的证据有没有真正进入模型上下文；最后再看 final answer 和引用。如果 gold evidence 根本不在 candidate set，就是 recall 错；如果在候选里但排得太后，就是 ranking 错；如果排得不错但没进 prompt，就是 grounding 错；如果已经进 prompt 仍然答错，才优先判断为 generation 错。没有这条分层 trace，团队就会把很多检索问题误判成模型问题。

# 必答点

1. 说明必须有 gold evidence
2. 说明要记录 candidate set 和 ranked list
3. 说明要记录 grounded context
4. 说明四类失败层的判定逻辑
5. 说明没有 trace 就会误判问题归因

# 常见误答

1. 只看最终答案对不对
2. 不标注期望证据
3. 不记录候选集和排序结果
4. 一答错就归因于模型幻觉

# 追问

1. 为什么只做最终答案评估不够？
2. BEIR 这类 benchmark 能完全替代业务内评估吗？
3. grounding 错和 generation 错在修复策略上有什么不同？
