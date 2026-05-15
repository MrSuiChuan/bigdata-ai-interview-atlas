---
id: q-ai-case-0012
title: 为什么 RAG 的核心对象不能只写成“向量库 + 大模型”
domain: ai-agent
component: rag
topic: rag-system-components-retrieval-grounding-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "RAG 论文、检索资料与实践材料 as verified on 2026-04-24 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - rag-paper
  - openai-retrieval-guide
  - practice-all-in-rag
claim_ids:
  - pattern-claim-0001
  - pattern-claim-0002
  - llm-foundation-claim-0013
related_docs:
  - ai-agent/cases/rag-system-components-retrieval-and-grounding-boundaries
estimated_minutes: 12
---

# 题目

为什么 RAG 的核心对象不能只写成“向量库 + 大模型”？

# 一句话结论

因为真正决定质量的是完整证据链：文档如何进入系统、候选证据如何被筛选、最终上下文如何组装、答案如何回到来源，而不只是“存向量然后生成”。

# 核心机制

1. Loader、Cleaner、Splitter 决定证据进入方式
2. Retriever、Reranker 决定候选证据质量
3. Grounding Builder 决定模型真正看到的上下文
4. Citation Layer 决定答案能否被复核

# 标准答案

RAG 的核心对象不能只写成“向量库 + 大模型”，因为这会把真正决定效果的中间层全部抹掉。完整 RAG 至少要区分 Loader、Cleaner、Splitter、Indexer、Retriever、Reranker、Grounding Builder、Generator 和 Citation Layer。Loader 到 Splitter 决定原始知识如何进入系统，Retriever 和 Reranker 决定找回什么候选证据，Grounding Builder 决定哪些证据真正进入 prompt，Generator 只是在证据约束下组织回答，Citation Layer 则保证答案能够回到原文。只讲向量库和大模型，就无法解释为什么系统会召回错、组装错、引用错，也无法做分层排障。

# 必答点

1. 说明 RAG 是完整证据链
2. 说明 retrieval 和 grounding 不是一回事
3. 说明 Generator 不负责替代证据治理
4. 说明 Citation 对可复核性的重要性
5. 说明只讲向量库和大模型无法排障

# 常见误答

1. 把检索、重排和上下文组装混成一个步骤
2. 不区分证据召回和证据使用
3. 认为模型足够强就能弥补中间层缺陷
4. 不讲引用和可追溯性
