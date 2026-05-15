---
id: q-ai-platform-0001
title: 为什么 Dify 不是简单的大模型套壳，而是低代码 Agent 应用运行平台
domain: ai-agent
component: agent-platforms
topic: dify-workflow-knowledge-agent-apps
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Dify docs and 实践资料 self-dify repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - dify-agent-docs
  - dify-agent-node-docs
  - dify-knowledge-pipeline-docs
  - practice-self-dify
claim_ids:
  - platform-claim-0001
  - platform-claim-0002
  - platform-claim-0003
  - platform-claim-0004
related_docs:
  - ai-agent/platforms/dify-workflow-knowledge-and-agent-apps
estimated_minutes: 10
---

# 题目

为什么 Dify 不是简单的大模型套壳，而是低代码 Agent 应用运行平台？

# 一句话结论

因为 Dify 把 Prompt、工具、知识库、Workflow、Agent 节点、日志和发布能力组合成应用编排层，真正解决的是 LLM 应用落地问题，而不是模型能力本身。

# 核心机制

1. Agent App 强调模型围绕工具和目标自主执行
2. Workflow 强调显式流程编排
3. Agent 节点提供工具输出、推理轨迹、迭代次数和日志
4. Knowledge Pipeline 决定 RAG 入库质量

# 标准答案

Dify 不是简单的大模型套壳，因为它承担的是 LLM 应用编排和发布层，而不是模型生成层。Dify Agent App 通过提示词和工具让模型围绕任务目标执行，工具可以连接外部服务、API、搜索或数据库；Workflow 则把复杂任务拆成显式流程节点，适合把输入处理、知识检索、工具调用、模型生成和结果格式化串起来。Dify 的 Agent 节点更进一步，允许 LLM 在节点内部自主控制工具，并暴露 final answer、tool outputs、reasoning trace、iteration count、success status 和 agent logs，这些信息让应用可调试、可观测。知识库层面，Dify Knowledge Pipeline 包含文档抽取、清洗、分块和 DSL 配置，说明 RAG 质量首先取决于入库流水线，而不是只靠最后一步生成。实践资料 的 self-dify 适合作为学习路径来源，因为它从本地部署逐步覆盖 Prompt、Workflow、知识库、DeepResearch、数据库、MCP 和复杂任务编排。成熟回答要同时讲价值和边界：Dify 降低搭建门槛，但不自动解决知识质量、工具副作用、权限审批和生产治理。

# 必答点

1. 说明 Dify 是应用编排层，不是模型层
2. 区分 Agent App 和 Workflow
3. 讲清 Agent 节点的可观测输出
4. 说明 Knowledge Pipeline 对 RAG 质量的影响
5. 说明低代码平台仍需要工程治理

# 常见误答

1. 只说 Dify 能搭聊天机器人
2. 认为接知识库就等于 RAG 可靠
3. 不区分 Workflow 和 Agent App
4. 忽略日志、推理轨迹和工具输出
5. 不讲版本、权限和测试治理

