---
id: q-llm-foundation-0002
title: Transformer 的 self-attention 和 decoder-only 生成机制应该怎么讲
domain: llm-foundations
component: transformer
topic: attention-decoder-only-llm
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Transformer and GPT papers as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - transformer-attention-paper
  - gpt3-language-models-paper
claim_ids:
  - llm-foundation-claim-0002
  - llm-foundation-claim-0003
related_docs:
  - llm-foundations/transformer-attention-and-decoder-only-llm
estimated_minutes: 8
---

# 题目

Transformer 的 self-attention 和 decoder-only 生成机制应该怎么讲？

# 一句话结论

self-attention 让 token 之间直接建立上下文关系，decoder-only LLM 用 causal mask 按 autoregressive 方式逐 token 预测。

# 标准答案

Transformer 的 self-attention 让当前位置在计算表示时关注序列中其他位置的信息，query 表示当前位置要找什么，key 表示其他位置能否匹配，value 表示被聚合进来的内容。multi-head attention 让不同 head 学习不同关系。decoder-only LLM 使用 causal mask，只能看历史 token，因此通过 autoregressive 方式预测下一个 token，再把新 token 放回上下文继续生成。next-token prediction 提供通用语言和知识底座，但指令遵循依赖后训练，事实可靠性还需要 RAG 和评估。

# 必答点

1. 说明 query、key、value 的直觉
2. 说明 multi-head attention 的意义
3. 说明 causal mask
4. 说明 autoregressive generation
5. 说明 next-token prediction 的边界

# 常见误答

1. 只说用了 attention
2. 把 multi-head 说成纯并行加速
3. 不讲 causal mask
4. 认为 next-token prediction 只是文字接龙
5. 把结构能力和事实正确混为一谈

