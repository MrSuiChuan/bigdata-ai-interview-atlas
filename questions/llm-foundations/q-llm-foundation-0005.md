---
id: q-llm-foundation-0005
title: LLM 应用开发为什么不能只讲 API 调用和 Prompt
domain: llm-foundations
component: llm-application-development
topic: api-prompt-rag-eval-learning-path
question_type: system-design
difficulty: intermediate
status: reviewed
version_scope: "实践资料 llm-cookbook, llm-universe, and evaluation docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-llm-cookbook
  - practice-llm-universe
  - openai-evaluation-best-practices
claim_ids:
  - llm-foundation-claim-0009
  - llm-foundation-claim-0010
  - llm-foundation-claim-0012
related_docs:
  - llm-foundations/llm-application-development-path-api-prompt-rag-eval
estimated_minutes: 8
---

# 题目

LLM 应用开发为什么不能只讲 API 调用和 Prompt？一个完整应用链路应该包含哪些层？

# 一句话结论

LLM 应用开发是一条工程链路，至少要包含模型/API、Prompt 与上下文、知识接入、编排、部署、评估和生产治理，不能只停留在“调接口返回文本”。

# 标准答案

API 调用只解决“把请求发给模型并拿到输出”的问题，Prompt 只解决任务表达和上下文组织的一部分。完整 LLM 应用还要考虑模型版本、超时重试、限流、token 成本、输出解析、RAG 知识接入、工具和工作流编排、前端或服务部署、权限和安全边界、日志观测、评估数据集和回归测试。真正的应用可靠性来自这些环节的组合，而不是单次 demo 输出看起来不错。

# 必答点

1. 说明 API 层要处理模型版本、超时、重试、限流和日志
2. 说明 Prompt 层要处理任务边界、输入字段、输出格式和失败策略
3. 说明 RAG 层负责外部知识接入，但不保证天然正确
4. 说明部署层要考虑权限、交互和稳定性
5. 说明评估层要用数据集和回归测试证明改动有效

# 常见误答

1. 只说会调模型接口
2. 把 Prompt 当成全部工程
3. 认为 RAG 可以自动解决幻觉
4. 不记录模型版本和失败样本
5. 不讲评估和回归测试

# 追问

1. 如果 Prompt 改了，你如何判断效果真的变好？
2. API 重试为什么可能带来业务副作用？
3. RAG、微调和 Agent Runtime 的边界怎么区分？
