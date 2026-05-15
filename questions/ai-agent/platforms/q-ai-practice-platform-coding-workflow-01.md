---
id: q-ai-practice-platform-coding-workflow-01
title: "AI 编码工作流：系统设计时应该拆成哪些平台层？"
domain: ai-agent
component: agent-platforms
topic: ai-coding
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-smart-dev
claim_ids: []
related_docs:
  - ai-agent/platforms/ai-application-platform-engineering-practice
estimated_minutes: 12
---

# 题目

AI 编码工作流：系统设计时应该拆成哪些平台层？

# 一句话结论

AI 编码工作流要按模型接入、工作流、工具、协议、观测和治理分层，而不是只描述页面和调用接口。

# 核心机制

平台工程的核心是把多模型、多工具、多用户、多工作流统一治理，保证权限、可观测性、成本和发布可控。

# 标准答案

设计AI 编码工作流时，可以拆成模型接入层、工作流编排层、工具层、协议层、观测层和治理层。模型接入层处理密钥、路由、降级和限流；工作流层管理节点状态和失败恢复；工具层负责 schema、权限和审计；观测层记录 trace；治理层处理多租户、灰度、回滚和安全策略。

# 必答点

1. 分层清晰
2. 模型接入有路由和降级
3. 工具层有权限和审计
4. 工作流有状态和恢复
5. 观测和治理可落地

# 常见误答

1. 只画前端页面
2. 只说接一个模型接口
3. 没有权限模型
4. 没有发布和回滚

# 延伸追问

1. 模型路由策略怎么设计？
2. 工具权限在哪里判断？
3. 工作流失败后如何恢复？

