---
id: q-llm-foundation-0035
title: LoRA 或 QLoRA 微调后，为什么必须把 base model、adapter、评估结果和回滚目标绑定治理
domain: llm-foundations
component: open-source-llm-deployment-finetuning
topic: local-runtime-deployment-full-finetuning-lora-qlora
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale self-llm, llm-deploy, LoRA, and QLoRA sources as verified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-self-llm
  - practice-llm-deploy
  - lora-paper
  - qlora-paper
claim_ids:
  - llm-foundation-claim-0018
  - llm-foundation-claim-0019
  - llm-foundation-claim-0015
related_docs:
  - llm-foundations/open-source-llm-deployment-finetuning-and-local-runtime
  - llm-foundations/open-source-llm-model-card-license-quantization-adapter-and-rollback-governance
estimated_minutes: 10
---

# 题目

LoRA 或 QLoRA 微调后，为什么必须把 `base model`、`adapter`、评估结果和回滚目标绑定治理？

# 一句话结论

因为微调产物本质上是一个组合体版本，不绑定底座、评估和回滚信息，就无法解释效果、无法稳定部署，也无法在出问题时快速撤回。

# 标准答案

LoRA 或 QLoRA 通常只训练增量参数，真正上线时使用的是“底座模型 + tokenizer + adapter + 量化方式 + 生成配置”的组合体，而不是单独一份 adapter 文件。如果没有绑定 `base model` 和版本，就可能在部署时接错底座；如果没有绑定评估结果，就无法判断这次微调到底提升了什么、退化了什么；如果没有回滚目标，线上异常时就只能临时救火。真正成熟的做法，是把微调版本当成一份可治理发布单元来管理。

# 必答点

1. 说明 LoRA/QLoRA 是组合体版本
2. 说明必须绑定 base model 和 tokenizer
3. 说明评估结果是验收依据
4. 说明回滚目标是生产必要条件
5. 说明单独保存 adapter 不足以支撑上线

# 常见误答

1. 认为 adapter 就是完整模型
2. 不讲版本固定
3. 不讲评估和回滚
4. 认为本地加载成功就足够

# 追问

1. QLoRA 为什么还要额外关注量化方式？
2. 如果底座版本偷偷变了，会出现什么问题？
3. 为什么评估必须跟微调版本一起保存？
