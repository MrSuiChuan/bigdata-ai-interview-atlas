---
id: q-ai-case-0014
title: RAG 出现“能召回但总答错”时，应该怎样按链路排障
domain: ai-agent
component: rag
topic: rag-system-components-retrieval-grounding-boundaries
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "RAG 论文、检索资料与实践材料 as verified on 2026-04-24 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - rag-paper
  - openai-retrieval-guide
  - practice-easy-vecdb
claim_ids:
  - pattern-claim-0002
  - case-claim-0004
  - llm-foundation-claim-0030
related_docs:
  - ai-agent/cases/rag-system-components-retrieval-and-grounding-boundaries
estimated_minutes: 10
---

# 题目

RAG 出现“能召回但总答错”时，应该怎样按链路排障？

# 一句话结论

先看召回的是不是正确候选，再看重排和 grounding 有没有把正确证据丢掉，最后才看生成阶段有没有在正确证据上跑偏。

# 核心机制

1. 检索到候选不等于模型真的用到了正确证据
2. reranker 和 grounding 经常是隐性故障层
3. Generator 只应在证据约束下组织答案
4. 引用层能帮助判断模型到底用了什么

# 标准答案

当 RAG 出现“能召回但总答错”时，排障顺序应按责任链推进。第一步看 retriever 返回的候选集中是否已经包含正确证据；如果没有，问题在检索或切分层。第二步如果候选集中已有正确证据，就看 reranker、metadata filter 和 grounding builder 是否把它挤掉、压缩掉或顺序放错；很多系统的真实问题出在这里。第三步如果最终上下文里已经有正确证据，再看 generator 是否因为提示约束不清、答案格式要求过强或输出长度控制不当而跑偏。最后再借助引用层判断答案中的事实到底能不能回到具体证据，避免只凭感觉说“模型幻觉了”。

# 必答点

1. 先查候选集里有没有正确证据
2. 再查 reranker 和 grounding 是否丢证据
3. 再查生成阶段是否在正确信息上跑偏
4. 说明引用层有助于定位证据使用问题
5. 说明不能一上来就归因于模型幻觉

# 常见误答

1. 一出错就直接换模型
2. 不区分召回阶段和上下文组装阶段
3. 完全不看候选证据和最终上下文
4. 不用引用信息做定位
