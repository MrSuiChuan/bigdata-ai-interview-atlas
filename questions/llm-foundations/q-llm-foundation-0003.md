---
id: q-llm-foundation-0003
title: 为什么上下文窗口不是越长越好，RAG 和 Agent 还要做 token budget
domain: llm-foundations
component: tokenizer
topic: tokenizer-context-window-token-budget
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Hugging Face tokenizer course and OpenAI help article as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - huggingface-tokenizers-course
  - openai-tokenizer-help
claim_ids:
  - llm-foundation-claim-0004
  - llm-foundation-claim-0005
related_docs:
  - llm-foundations/tokenizer-context-window-and-token-budget
estimated_minutes: 8
---

# 题目

为什么上下文窗口不是越长越好，RAG 和 Agent 还要做 token budget？

# 一句话结论

长上下文只是容量更大，不代表信息更有效；token budget 决定输入、检索、工具输出和模型回复如何在成本、延迟和质量之间平衡。

# 标准答案

Token 不等于字符或单词，Tokenizer 会用 BPE、WordPiece、Unigram 等子词方法把文本转成 token ID。Context window 只是一次请求能容纳的最大 token 范围，不代表越长越好。长上下文会增加成本和延迟，也可能让无关信息干扰模型。RAG 和 Agent 必须做 token budget，把 system prompt、用户输入、历史、检索片段、工具结果、输出 token、缓存 token 和 reasoning token 放在一起管理。检索内容也不能越多越好，要控制 chunk、top_k、rerank 和压缩。

# 必答点

1. 说明 token 不等于字符或单词
2. 说明 context window 是容量边界
3. 说明长上下文的成本、延迟和干扰
4. 说明 RAG 要控制 chunk、top_k、rerank
5. 说明 Agent 要控制历史和工具输出

# 常见误答

1. 认为窗口越长效果越好
2. 不给输出预留 token
3. 检索到多少塞多少
4. 不控制工具输出
5. 不区分 prompt、completion、cached、reasoning tokens

