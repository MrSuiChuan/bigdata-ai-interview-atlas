---
id: q-community-datawhale-llm-0003
title: 后训练为什么不能简单理解成“让模型事实更正确”？
domain: community
component: datawhale
topic: post-training
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale post-training repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-post-training-of-llms
claim_ids: []
related_docs:
  - community/datawhale/llm/p0-llm-mainline
estimated_minutes: 10
---

# 题目

后训练为什么不能简单理解成“让模型事实更正确”？

# 一句话结论

后训练主要改善指令遵循、回答风格、偏好对齐和安全行为，不等于给模型注入实时事实库。事实正确性仍需要数据、检索、评估和应用层约束。

# 核心机制

SFT 让模型学习指令格式和任务模式，偏好优化让模型更符合人类偏好或奖励模型偏好，安全对齐降低部分风险。但这些方法不保证模型知道最新事实，也不保证每个回答都有证据。

# 标准答案

后训练不能简单理解成“让模型事实更正确”。SFT 通常用高质量指令数据让模型学会怎么回答，DPO/RLHF 等偏好优化让模型更符合偏好或安全要求。这些过程可以减少一些不合适回答，但不等于模型拥有可验证事实库。事实正确性还要依赖训练数据质量、RAG、工具查询、引用约束和评估集。面试里要把后训练的目标和边界讲清楚，不能把它当成万能知识修正手段。

# 必答点

1. 说明 SFT 的作用。
2. 说明偏好优化的作用。
3. 说明后训练不等于实时事实更新。
4. 说明 RAG 和评估仍然必要。
5. 说明安全对齐也有边界。

# 常见误答

1. 认为微调能解决所有幻觉。
2. 混淆 SFT、RLHF、DPO。
3. 不讲偏好数据质量。
4. 不讲评估和回归测试。

# 延伸追问

1. SFT 和 DPO 的数据格式有什么区别？
2. 后训练为什么可能损伤某些能力？
3. 如何评估后训练后的模型？
