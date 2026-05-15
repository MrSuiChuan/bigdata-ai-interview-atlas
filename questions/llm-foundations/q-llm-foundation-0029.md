---
id: q-llm-foundation-0029
title: 为什么说 PEFT 或 LoRA 微调后，真正需要治理的是“底座模型与 adapter 的组合体”而不是单个目录
domain: llm-foundations
component: huggingface-ecosystem
topic: hub-checkpoints-adapters-deployment-boundaries
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Datawhale unlock-hf and Hugging Face official docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-unlock-hf
  - huggingface-transformers-docs
  - huggingface-peft-docs
claim_ids:
  - llm-foundation-claim-0031
  - llm-foundation-claim-0032
related_docs:
  - llm-foundations/huggingface-ecosystem-transformers-datasets-peft-evaluate
  - llm-foundations/huggingface-ecosystem-hub-checkpoints-adapters-and-deployment-boundaries
estimated_minutes: 10
---

# 题目

为什么说 PEFT 或 LoRA 微调后，真正需要治理的是“底座模型与 adapter 的组合体”，而不是单个 adapter 目录？

# 一句话结论

因为 adapter 本身不包含完整语义，它必须和特定的 base model、tokenizer、配置和版本一起使用，脱离组合体谈部署和评估会导致结果不可解释。

# 标准答案

LoRA 或其他 PEFT 方式通常只训练少量增量参数，底座模型大部分权重保持冻结，因此 adapter 只是对 base model 的定向修改，而不是一份独立完整模型。上线时如果没有同时固定 base model ID、revision、tokenizer、配置和评估证据，就可能出现“训练时效果很好，部署时效果变了”的问题。真正要治理的是组合体：哪一个底座模型、哪一版 tokenizer、哪一套 adapter、哪一份生成配置、哪一组评估结果一起构成当前可交付版本。这样才能复现、压测、灰度和回滚。

# 必答点

1. 说明 adapter 不独立承担完整模型语义
2. 说明必须绑定 base model 和 tokenizer
3. 说明部署和评估都要针对组合体
4. 说明版本固定和回滚能力的重要性
5. 说明“训练好”不等于“部署对”

# 常见误答

1. 把 adapter 当成完整模型
2. 认为只要保存 adapter 就够了
3. 不讲 tokenizer 和 revision
4. 不讲部署阶段的评估验证

# 追问

1. 组合体治理最少要记录哪些元信息？
2. 为什么本地加载成功不代表线上组合一致？
3. 如果 adapter 依附的 base model 换了，会发生什么？
