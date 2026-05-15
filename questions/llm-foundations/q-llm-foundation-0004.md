---
id: q-llm-foundation-0004
title: SFT、RLHF、DPO 分别解决什么问题，它们不能解决什么
domain: llm-foundations
component: post-training
topic: sft-rlhf-dpo-alignment
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "InstructGPT paper, DPO paper, and Hugging Face TRL docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - instructgpt-rlhf-paper
  - dpo-paper
  - huggingface-trl-dpo-docs
claim_ids:
  - llm-foundation-claim-0006
  - llm-foundation-claim-0007
  - llm-foundation-claim-0008
related_docs:
  - llm-foundations/post-training-sft-rlhf-dpo-and-alignment
estimated_minutes: 10
---

# 题目

SFT、RLHF、DPO 分别解决什么问题，它们不能解决什么？

# 一句话结论

SFT 让模型学习指令格式，RLHF 用人类偏好训练奖励并优化策略，DPO 更直接用偏好对优化模型；它们都不能单独保证事实正确和系统安全。

# 标准答案

SFT 用高质量指令数据训练模型，让模型学会任务格式、回答风格和基本指令遵循。RLHF 通常先做 SFT，再收集人类偏好比较，训练 reward model，并用策略优化让输出更符合偏好。DPO 直接利用 chosen/rejected preference pairs 优化模型，避免传统 RLHF 中显式 reward model 加强化学习的完整链路。后训练能改善指令遵循和偏好对齐，但不能保证事实正确、工具安全、业务合规和最新知识，生产系统仍需要 RAG、权限、guardrails、人工介入和评估。

# 必答点

1. 说明 SFT 的指令数据作用
2. 说明 RLHF 的 reward model 和策略优化
3. 说明 DPO 的 preference pairs
4. 说明后训练不等于事实正确
5. 说明仍需要应用层安全和评估

# 常见误答

1. 把 SFT、RLHF、DPO 混成一个概念
2. 认为 RLHF 是补知识
3. 认为 DPO 不依赖数据质量
4. 认为后训练能解决所有安全问题
5. 不讲 reward hacking 或偏好数据覆盖问题

