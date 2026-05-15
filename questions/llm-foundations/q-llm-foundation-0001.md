---
id: q-llm-foundation-0001
title: 面试里为什么不能把 LLM 讲成一个文本补全接口
domain: llm-foundations
component: llm-overview
topic: overview
question_type: principle
difficulty: beginner
status: reviewed
version_scope: "Primary LLM papers and official docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - gpt3-language-models-paper
  - transformer-attention-paper
  - huggingface-tokenizers-course
  - instructgpt-rlhf-paper
claim_ids:
  - llm-foundation-claim-0001
related_docs:
  - llm-foundations/overview
estimated_minutes: 6
---

# 题目

面试里为什么不能把 LLM 讲成一个文本补全接口？

# 一句话结论

因为 LLM 背后包含 Tokenizer、Transformer、预训练、后训练、推理、上下文预算、应用集成和评估等多层机制。

# 标准答案

LLM 不能只讲成文本补全接口。Tokenizer 决定文本如何变成 token，Transformer 决定模型如何利用上下文，预训练让模型学习大规模语言分布，后训练让模型更符合指令和人类偏好，推理阶段的上下文预算和解码策略影响成本、延迟和稳定性。进入应用层后，RAG、工具调用、Agent Runtime 和 Eval 还会进一步影响系统可靠性。所以模型能力不等于应用可靠性。

# 必答点

1. 说明 Tokenizer 和 token budget
2. 说明 Transformer 和预训练
3. 说明后训练和指令遵循
4. 说明推理和上下文预算
5. 说明应用层还需要 RAG、工具和评估

# 常见误答

1. 把 LLM 当搜索引擎
2. 只讲 API 调用
3. 不讲 token
4. 不讲后训练
5. 把模型能力等同于应用可靠性

