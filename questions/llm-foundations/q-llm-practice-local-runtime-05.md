---
id: q-llm-practice-local-runtime-05
title: "开源模型部署与微调：如何设计 LLM 应用的评估和回归机制？"
domain: llm-foundations
component: inference
topic: open-source-llm
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-self-llm
claim_ids: []
related_docs:
  - llm-foundations/llm-engineering-full-stack-practice
estimated_minutes: 12
---

# 题目

开源模型部署与微调：如何设计 LLM 应用的评估和回归机制？

# 一句话结论

LLM 应用必须有离线评估集、线上监控、人工抽检和版本回归，不能只凭交互体验判断质量。

# 核心机制

模型、prompt、RAG 数据、工具和安全策略任一变化都可能引入回归。评估要覆盖正确性、忠实性、安全、延迟和成本。

# 标准答案

评估开源模型部署与微调时，先把真实任务整理成测试集，标注期望答案、标准证据、允许工具和拒答条件。离线看准确率、引用一致性、安全拒答、格式正确率；线上看用户反馈、人工接管、异常率、延迟和成本。每次改模型、prompt、检索策略或工具，都要跑回归并保留版本对比。

# 必答点

1. 有离线评估集
2. 覆盖正确性和安全
3. 线上监控延迟和成本
4. 变更后做回归
5. 保留版本对比

# 常见误答

1. 只靠人工试用
2. 只看答案像不像
3. 不评估拒答
4. 改 prompt 不跑回归

# 延伸追问

1. 如何构建黄金集？
2. 线上反馈如何进入离线集？
3. 如何评估幻觉率？

