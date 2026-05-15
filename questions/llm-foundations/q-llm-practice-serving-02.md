---
id: q-llm-practice-serving-02
title: "推理部署：为什么不能只看模型参数量？"
domain: llm-foundations
component: inference
topic: llm-serving
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-llm-deploy
claim_ids: []
related_docs:
  - llm-foundations/llm-engineering-full-stack-practice
estimated_minutes: 10
---

# 题目

推理部署：为什么不能只看模型参数量？

# 一句话结论

参数量只是能力相关因素之一，数据质量、上下文长度、推理框架、量化、后训练和任务匹配同样重要。

# 核心机制

同等参数量模型可能因为数据、训练目标、后训练和部署方式不同表现差异很大；更大模型也可能因为延迟、成本或私有化要求不适合业务。

# 标准答案

讨论推理部署时，不能用参数量直接判断系统效果。需要同时看模型结构、训练数据、上下文窗口、推理速度、显存、量化方式、指令遵循、安全边界和任务评估结果。工程上常用模型分级和路由：简单任务用小模型，复杂任务用强模型，高风险任务加入 RAG、工具或人工复核。

# 必答点

1. 说明参数量不是唯一指标
2. 补充数据和后训练因素
3. 补充推理成本和延迟
4. 说明任务匹配和模型路由
5. 说明用评估而不是感觉选型

# 常见误答

1. 参数越大越好
2. 忽略上下文窗口
3. 忽略部署成本
4. 不做任务评估

# 延伸追问

1. 如何做模型路由？
2. 量化会影响哪些任务？
3. 小模型适合哪些场景？

