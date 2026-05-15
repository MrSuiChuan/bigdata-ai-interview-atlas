---
id: q-llm-foundation-0015
title: 后训练为什么不能只说微调，SFT、DPO、Online RL 和评估怎么串起来
domain: llm-foundations
component: post-training
topic: sft-dpo-online-rl-evaluation-regression
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料 post-training-of-llms, InstructGPT, DPO, and TRL docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-post-training-of-llms
  - instructgpt-rlhf-paper
  - dpo-paper
  - huggingface-trl-dpo-docs
claim_ids:
  - llm-foundation-claim-0028
  - llm-foundation-claim-0029
related_docs:
  - llm-foundations/post-training-online-rl-dpo-sft-and-regression-risk
estimated_minutes: 10
---

# 题目

后训练为什么不能只说微调？SFT、DPO、Online RL 和评估怎么串起来？

# 一句话结论

后训练是行为塑形链路，SFT 学指令格式，DPO 和 RLHF 学偏好，Online RL 引入运行期反馈，但必须用评估和回归控制风险。

# 标准答案

后训练不能只说微调。SFT 用高质量指令数据让模型学习任务格式和指令遵循；DPO 用 chosen/rejected 偏好对优化模型偏好，但依赖偏好数据质量；RLHF 通过 reward model 和策略优化对齐偏好；Online RL 引入运行期反馈，但奖励设计、reward hacking、分布变化和回滚风险更高。后训练改善行为和偏好，不等于事实正确、最新知识或系统安全。生产里要评估目标能力、格式稳定、偏好胜率、事实正确、安全拒答和原有能力退化。

# 必答点

1. 说明 SFT 的作用
2. 说明 DPO 的偏好数据
3. 说明 Online RL 的风险
4. 说明后训练不等于补知识
5. 说明评估和回归

# 常见误答

1. 把后训练等同于普通微调
2. 认为 DPO 不依赖数据质量
3. 认为 RLHF 是补知识
4. Online RL 越多越好
5. 不做退化评估

# 追问

1. SFT 和 DPO 数据形式有什么区别？
2. Online RL 最大工程风险是什么？
3. 后训练后怎么判断原能力退化？
