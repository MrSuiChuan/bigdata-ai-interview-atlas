---
id: q-ai-metagpt-lagent-0001
title: 多智能体开发为什么要从 Role、Action、State 和 Message 讲，而不是只背框架名
domain: ai-agent
component: multi-agent-frameworks
topic: metagpt-lagent-code-level-multi-agent
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "MetaGPT, Lagent, LangGraph docs, and 实践资料 P2 repositories as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - metagpt-github
  - lagent-github
  - langgraph-overview-docs
  - practice-hugging-multi-agent
  - practice-easy-langent
claim_ids:
  - practice-p2-claim-0004
  - practice-p2-claim-0005
related_docs:
  - ai-agent/frameworks/metagpt-lagent-code-level-multi-agent-development
estimated_minutes: 12
---

# 题目

多智能体开发为什么要从 Role、Action、State 和 Message 讲，而不是只背框架名？

# 一句话结论

因为多智能体的本质是协作协议和状态控制，框架只是实现这些抽象的方式。

# 标准答案

代码级多智能体开发要从 Role、Action、State、Message 和 Workflow 讲。Role 定义职责、上下文和验收边界；Action 定义一个角色能执行的动作和输入输出；State 定义私有状态、共享状态、任务进度和 checkpoint；Message 定义 Agent 之间传递任务、产物和状态变更的协议；Workflow 定义任务如何分派、汇总、验收和终止。MetaGPT 适合学习软件公司式多角色协作，Lagent 适合轻量组件化 Agent，LangGraph 适合状态图、持久化和复杂流程控制。选型要看任务复杂度、状态要求、恢复要求和代码级可控性。

# 必答点

1. Role 不是 persona，而是职责边界
2. Action 要有输入输出
3. State 要区分私有、共享和 checkpoint
4. Message 是协作协议
5. Workflow 负责分派、汇总和终止

# 常见误答

1. 只背 MetaGPT、AutoGen、LangGraph 名字
2. 认为多 Agent 就是群聊
3. 不讲状态和恢复
4. 不讲验收标准
5. 不讲消息结构

