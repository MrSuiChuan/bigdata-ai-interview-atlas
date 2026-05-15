---
id: q-llm-foundation-0012
title: 为什么不能靠一次 demo 判断 LLM 应用效果
domain: llm-foundations
component: evaluation
topic: benchmark-regression-eval-driven-development-production-feedback
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenAI evaluation docs and RAG evaluator docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - openai-evaluation-best-practices
  - openai-agent-evals-guide
  - azure-rag-evaluators
claim_ids:
  - llm-foundation-claim-0024
  - llm-foundation-claim-0013
related_docs:
  - llm-foundations/evaluation-benchmark-regression-and-production-feedback
estimated_minutes: 10
---

# 题目

为什么不能靠一次 demo 判断 LLM 应用效果？完整评估应该怎么做？

# 一句话结论

一次 demo 只能说明一个样例在一次运行中看起来可用，可靠性要靠任务评估集、评分标准、回归测试、组件级诊断和线上反馈闭环证明。

# 标准答案

LLM 输出受模型版本、Prompt、检索结果、工具返回、解码参数和上下文影响，一次 demo 不代表真实用户分布。完整评估要先定义任务和期望行为，构建包含真实问题、边界问题、负例、安全问题和历史失败样本的数据集；再分层评估，普通应用看正确性、格式、拒答、成本和延迟，RAG 看检索命中、rerank 和引用支撑，Agent 看工具选择、参数和中间状态。每次模型、Prompt、检索、工具或参数改动后都要跑回归测试，线上失败样本要回流评估集。

# 必答点

1. 说明 demo 样例不代表真实分布
2. 说明评估集要覆盖真实、边界、负例和失败样本
3. 说明 RAG 和 Agent 要做组件级评估
4. 说明改动后要跑回归
5. 说明线上反馈要回流

# 常见误答

1. 看一次输出流畅就认为可用
2. 只看通用 benchmark
3. 只评最终答案，不看检索和工具
4. Prompt 改了不跑回归
5. LLM-as-Judge 没有评分标准

# 追问

1. RAG 错误怎么定位？
2. LLM-as-Judge 有哪些偏差？
3. 评估集如何持续更新？
4. 模型升级为什么必须回归？
