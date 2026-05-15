---
id: q-llm-foundation-0011
title: LLM 推理为什么要区分 Prefill、Decode、KV Cache 和解码策略
domain: llm-foundations
component: inference
topic: prefill-decode-kv-cache-decoding-serving-latency
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "GPT paper and Hugging Face inference docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - gpt3-language-models-paper
  - huggingface-kv-cache-docs
  - huggingface-generation-strategies-docs
claim_ids:
  - llm-foundation-claim-0022
  - llm-foundation-claim-0023
related_docs:
  - llm-foundations/inference-kv-cache-decoding-and-serving-latency
estimated_minutes: 10
---

# 题目

LLM 推理为什么要区分 Prefill、Decode、KV Cache 和解码策略？

# 一句话结论

Prefill 处理输入上下文，Decode 逐 token 生成，KV Cache 用显存换计算，解码策略决定概率分布如何变成输出文本。

# 标准答案

LLM 推理不是一次性生成完整答案。Prefill 阶段处理输入 prompt，成本主要和上下文长度相关；Decode 阶段每次生成一个 token，成本主要和输出长度相关。KV Cache 缓存历史 token 的 key/value，避免 decode 时重复计算历史上下文，但会占用显存，长上下文和高并发时可能成为瓶颈。解码策略如 greedy、sampling、temperature、top_p、beam search 决定如何从下一 token 概率分布中选择输出，影响稳定性、多样性、重复和延迟，但不会给模型增加新知识。

# 必答点

1. 说明 prefill 和输入长度相关
2. 说明 decode 和输出 token 数相关
3. 说明 KV Cache 用显存换计算
4. 说明解码策略影响输出选择
5. 说明服务要看首 token 延迟、吞吐、并发和显存

# 常见误答

1. 认为模型一次性生成完整答案
2. 只说 KV Cache 加速，不讲显存
3. 认为 temperature 低就一定事实正确
4. 把 top_p 当安全控制
5. 不区分首 token 延迟和完整答案延迟

# 追问

1. 长上下文为什么增加 KV Cache 压力？
2. streaming 能降低计算成本吗？
3. 输出很长时为什么 decode 成本高？
4. 服务 OOM 从哪些方向排查？
