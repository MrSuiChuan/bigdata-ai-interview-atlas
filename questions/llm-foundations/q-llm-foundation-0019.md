---
id: q-llm-foundation-0019
title: LLM 入门实训为什么要按 API、本地模型、部署、Prompt、LoRA 递进
domain: llm-foundations
component: llm-practice-bootcamp
topic: api-local-model-vllm-prompt-lora-learning-path
question_type: system-design
difficulty: intermediate
status: reviewed
version_scope: "实践资料 open-ai-general-course, llm-preview, and hands-on-llm metadata as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-open-ai-general-course
  - practice-llm-preview
  - practice-hands-on-llm
claim_ids:
  - llm-foundation-claim-0035
  - llm-foundation-claim-0036
related_docs:
  - llm-foundations/llm-practice-bootcamp-api-local-vllm-lora-learning-path
estimated_minutes: 8
---

# 题目

LLM 入门实训为什么要按 API、本地模型、部署、Prompt、LoRA 递进？

# 一句话结论

API 帮助快速理解应用范式，本地模型帮助理解权重和环境，部署帮助理解服务化，Prompt 和 LoRA 帮助进入任务适配，但每步都要有评估意识。

# 标准答案

入门实训应先用通识基础理解 AI、ML、DL、NLP 和 LLM 的关系，再用 API 调用掌握输入输出、token、成本和错误处理；之后用 Transformers 调用本地模型，理解模型权重、tokenizer、显存和环境；再用推理框架做服务化部署，关注并发、延迟、吞吐和 KV Cache；然后学习 Prompt Engineering，用任务规约和评估改进输出；最后用 LoRA 做小任务微调，理解数据、adapter、训练和评估。不能只追求跑通 demo。

# 必答点

1. 说明先 API 的价值
2. 说明本地模型的价值
3. 说明服务化部署指标
4. 说明 Prompt 和 LoRA 的学习顺序
5. 说明评估和安全意识

# 常见误答

1. 一上来堆复杂部署
2. 只会 API，不懂本地模型
3. 只会 notebook，不懂服务化
4. LoRA 没有评估集
5. 不区分 RAG 和微调

# 追问

1. 为什么初学者适合先用 API？
2. vLLM 这类框架解决什么？
3. LoRA 实训为什么必须有评估集？
