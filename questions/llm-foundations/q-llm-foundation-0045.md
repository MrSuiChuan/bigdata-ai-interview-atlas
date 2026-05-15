---
id: q-llm-foundation-0045
title: 为什么小模型训练实验里也不能省掉 Checkpoint、Eval Set 和 Tokenizer Version 这些工程对象
domain: llm-foundations
component: llm-training-foundations
topic: data-pipeline-checkpoint-eval-peft-boundaries
question_type: system-design
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

为什么小模型训练实验里也不能省掉 `Checkpoint`、`Eval Set` 和 `Tokenizer Version` 这些工程对象？

# 一句话结论

因为这些对象决定实验是否可恢复、可比较、可复现，小实验不建立纪律，大实验就更无从谈起。

# 标准答案

很多人会觉得小模型实验规模不大，可以随手跑、随手改，但真正的训练能力就是从这些细节开始建立的。`Checkpoint` 决定训练中断后能否恢复、不同阶段结果能否比较；`Eval Set` 决定 loss 之外是否真的在任务上变好；`Tokenizer Version` 决定输入离散化边界是否一致。没有它们，小实验也会出现“今天好像更好，明天怎么不一样了”的混乱，更不用说迁移到更大规模训练了。工程对象不是大项目专属，而是训练纪律本身。

# 必答点

1. 说明 checkpoint 的恢复和比较价值
2. 说明 eval set 的验证价值
3. 说明 tokenizer version 的可比性价值
4. 说明小实验也需要工程纪律
5. 说明这些对象是向大规模训练迁移的基础

# 常见误答

1. 小实验随便跑就行
2. 只看 train loss
3. tokenizer 改了还直接对比
4. 训练中断后从头跑也无所谓

# 追问

1. checkpoint 频率通常怎么折中？
2. eval set 和 train set 混了会有什么后果？
3. 为什么 tokenizer 版本漂移会影响推理比较？
