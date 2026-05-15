---
id: q-llm-practice-tiny-model-03
title: "小模型实验：后训练、RAG 和微调分别适合解决什么问题？"
domain: llm-foundations
component: llm-overview
topic: small-model
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-tiny-universe
claim_ids: []
related_docs:
  - llm-foundations/llm-engineering-full-stack-practice
estimated_minutes: 12
---

# 题目

小模型实验：后训练、RAG 和微调分别适合解决什么问题？

# 一句话结论

后训练主要改行为和偏好，RAG 适合接入可更新知识，微调适合稳定任务格式和领域表达，三者不能互相替代。

# 核心机制

把事实更新交给微调通常成本高且难回滚；把行为对齐交给 RAG 也不合适。正确方案要先判断问题属于知识、行为、格式还是工具能力。

# 标准答案

在小模型实验相关问题中，先分类需求：如果是私有知识和实时更新，用 RAG；如果是输出风格、指令遵循和偏好排序，用后训练；如果是稳定领域格式、专有表达或小模型适配，可以考虑微调。涉及外部系统动作时，要使用工具调用或 Agent，并加权限和审计。

# 必答点

1. 区分知识、行为、格式和动作
2. 说明 RAG 的知识更新优势
3. 说明后训练的行为边界
4. 说明微调的适用场景
5. 说明回滚和评估成本

# 常见误答

1. 用微调修所有事实
2. 用 RAG 解决行为对齐
3. 忽略数据质量
4. 不考虑回滚

# 延伸追问

1. 事实更新为什么更适合 RAG？
2. SFT 数据质量差会怎样？
3. 如何评估微调是否退化？

