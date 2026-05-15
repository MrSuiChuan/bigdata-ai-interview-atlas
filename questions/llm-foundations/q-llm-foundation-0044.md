---
id: q-llm-foundation-0044
title: 为什么 LLM 训练实践必须把数据管线、Tokenizer、预训练、SFT、PEFT 和评估连成一条链，而不是只盯训练 loss
domain: llm-foundations
component: llm-training-foundations
topic: nlp-transformer-tokenizer-pretraining-sft-lora-qlora
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Happy-LLM, Transformer, tokenizer, GPT, LoRA, and QLoRA sources as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-happy-llm
  - transformer-attention-paper
  - huggingface-tokenizers-course
  - gpt3-language-models-paper
  - lora-paper
  - qlora-paper
claim_ids:
  - llm-foundation-claim-0011
  - llm-foundation-claim-0014
  - llm-foundation-claim-0015
related_docs:
  - llm-foundations/from-nlp-to-llm-training-practice-and-small-model
  - llm-foundations/llm-training-foundations-data-pipeline-checkpoint-eval-and-peft-boundaries
estimated_minutes: 10
---

# 题目

为什么 LLM 训练实践必须把数据管线、Tokenizer、预训练、SFT、PEFT 和评估连成一条链，而不是只盯训练 loss？

# 一句话结论

因为 loss 只是训练目标拟合情况的一部分，而模型最终能否用于任务，取决于数据、离散化、训练方式、适配方式和评估结果是否共同成立。

# 标准答案

LLM 训练不是孤立的优化过程，而是一条从数据到行为的链。数据管线决定模型学到什么信号，Tokenizer 决定文本如何进入模型，预训练决定通用语言和模式，SFT 或 PEFT 决定任务适配方式，评估则决定这些变化是否真的带来任务收益。只看 loss 会忽略数据污染、Tokenizer 漂移、微调退化、任务评估不达标等关键问题。真正成熟的训练实践，必须把这些对象作为一个连续系统一起设计和验证。

# 必答点

1. 说明 loss 不是唯一判断标准
2. 说明数据和 tokenizer 会影响训练结果
3. 说明 SFT / PEFT 是后续适配层
4. 说明评估负责桥接训练目标和任务目标
5. 说明训练是连续系统而不是单点循环

# 常见误答

1. loss 下降就默认训练成功
2. 不讲 tokenizer 和数据版本
3. 不区分预训练和微调
4. 不讲 eval 集

# 追问

1. 为什么 tokenizer 变化会让旧实验不可比？
2. LoRA/QLoRA 的资源优势能替代评估吗？
3. 训练目标和业务目标为什么经常不一致？
