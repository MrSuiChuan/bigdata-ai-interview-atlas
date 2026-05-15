---
id: q-llm-foundation-0025
title: 聊天历史、RAG 证据和工具输出应该怎样分配 token budget，为什么不能一刀切截断
domain: llm-foundations
component: tokenizer
topic: tokenizer-packing-truncation-history-retrieval-budgeting
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Hugging Face tokenizer course, OpenAI token help article, and OpenAI latency optimization guide as verified on 2026-04-26 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - huggingface-tokenizers-course
  - openai-tokenizer-help
  - openai-latency-optimization-guide
claim_ids:
  - llm-foundation-claim-0004
  - llm-foundation-claim-0005
related_docs:
  - llm-foundations/tokenizer-context-window-and-token-budget
  - llm-foundations/tokenizer-packing-truncation-chat-history-and-retrieval-budgeting
estimated_minutes: 12
---

# 题目

聊天历史、RAG 证据和工具输出应该怎样分配 token budget，为什么不能一刀切截断？

# 一句话结论

应该先按对象分桶再做优先级压缩，因为不同对象承担的任务价值不同，直接按文本长度截断通常会把结构、来源和关键字段一起切坏。

# 标准答案

做 token budget 时，聊天历史、RAG 证据和工具输出不应该平等竞争上下文，而应先按对象分桶。系统提示和核心规则通常优先保留；历史对话应做窗口化或摘要化；检索证据应先重排和去重，再保留标题、来源和高价值片段；工具输出应提取任务相关字段，避免整段日志直接进入 prompt；最后还要预留 completion token 给模型输出。一刀切按字符或字数截断的坏处是会把一个证据块截成半句、把 JSON 截断到字段不完整、把来源信息切掉，最终既影响质量，也增加排障难度。

# 必答点

1. 说明要先按对象分桶
2. 说明历史适合摘要而不是无限保留
3. 说明检索证据要重排和去重
4. 说明工具输出要结构化提取
5. 说明不能侵占 completion 预留空间

# 常见误答

1. 所有上下文按先来后到保留
2. 检索到多少塞多少
3. 工具输出整段直塞
4. 按字符数硬截断

# 追问

1. 为什么对象边界比字符边界更重要？
2. RAG 证据为什么要保留来源字段？
3. 哪些对象最适合做摘要而不是原文保留？
