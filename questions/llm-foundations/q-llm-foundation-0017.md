---
id: q-llm-foundation-0017
title: Hugging Face 生态为什么不能只讲 pipeline
domain: llm-foundations
component: huggingface-ecosystem
topic: datasets-transformers-tokenizers-peft-evaluate-pipeline
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "实践资料 unlock-hf and Hugging Face official docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-unlock-hf
  - huggingface-transformers-docs
  - huggingface-datasets-docs
  - huggingface-peft-docs
  - huggingface-evaluate-docs
claim_ids:
  - llm-foundation-claim-0031
  - llm-foundation-claim-0032
related_docs:
  - llm-foundations/huggingface-ecosystem-transformers-datasets-peft-evaluate
estimated_minutes: 8
---

# 题目

Hugging Face 生态为什么不能只讲 `pipeline`？

# 一句话结论

`pipeline` 适合快速 demo，但完整 Hugging Face 工作流要包含 Datasets、Tokenizer、Transformers、PEFT、Evaluate、Hub 和部署。

# 标准答案

Hugging Face 生态要按数据、Tokenizer、模型、训练/PEFT、推理、评估和发布来讲。Datasets 负责加载、处理和切分数据；Tokenizer 把文本转成模型输入；Transformers 负责模型加载、训练、推理和 generation；PEFT 用 LoRA 等方法降低微调成本；Evaluate 用于指标和评估流程；Hub 负责模型和数据版本共享。`pipeline` 适合快速验证，但不能代表训练、微调、评估和部署能力。

# 必答点

1. 说明 Datasets
2. 说明 Tokenizer
3. 说明 Transformers 不只是 pipeline
4. 说明 PEFT 和 Evaluate
5. 说明版本、权重、tokenizer 和 adapter 管理

# 常见误答

1. Hugging Face 等同于 Transformers
2. Transformers 等同于 pipeline
3. 不讲数据处理
4. PEFT 后不评估
5. 忽略许可证和版本

# 追问

1. 为什么保存模型也要保存 tokenizer？
2. PEFT adapter 推理要注意什么？
3. pipeline 适合什么，不适合什么？
