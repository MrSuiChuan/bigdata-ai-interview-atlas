---
id: q-llm-foundation-0009
title: 开源大模型部署和微调应该怎么设计，为什么不能只说下载模型跑起来
domain: llm-foundations
component: open-source-llm-deployment-finetuning
topic: local-runtime-deployment-full-finetuning-lora-qlora
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料 self-llm, LoRA, and QLoRA sources as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-self-llm
  - lora-paper
  - qlora-paper
claim_ids:
  - llm-foundation-claim-0018
  - llm-foundation-claim-0019
  - llm-foundation-claim-0015
related_docs:
  - llm-foundations/open-source-llm-deployment-finetuning-and-local-runtime
estimated_minutes: 10
---

# 题目

开源大模型部署和微调应该怎么设计？为什么不能只说“下载模型跑起来”？

# 一句话结论

部署要处理模型来源、许可证、硬件、环境、精度、推理服务、监控和回滚；微调要区分全量微调、LoRA、QLoRA 和 RAG 的目标边界。

# 标准答案

开源大模型部署要先确认模型官方来源、模型卡、许可证、显存和依赖要求，再搭建 Linux、驱动、CUDA、Python、PyTorch 或推理框架环境。推理时要选择 FP16、BF16 或量化方案，并评估显存、延迟、吞吐、并发和上下文长度。微调时要区分全量微调、LoRA、QLoRA 和 RAG：全量微调更新大量权重，成本高；LoRA 冻结原模型并训练低秩 adapter；QLoRA 在量化冻结模型上训练 adapter；RAG 不改模型权重而是接入外部知识。生产还要考虑数据安全、评估、日志、监控、灰度和回滚。

# 必答点

1. 说明模型来源、模型卡和许可证
2. 说明硬件、环境和精度选择
3. 说明推理服务指标
4. 说明全量微调、LoRA、QLoRA 和 RAG 的区别
5. 说明安全、评估和回滚

# 常见误答

1. 下载模型能跑就算部署完成
2. 不看许可证和模型卡
3. 认为量化一定无损且更快
4. 一遇到知识问答就先微调
5. 不做评估和回滚

# 追问

1. 量化为什么可能影响质量？
2. LoRA 和 QLoRA 的差异是什么？
3. 为什么企业知识库通常先做 RAG？
4. 本地 LLM 服务要看哪些指标？
