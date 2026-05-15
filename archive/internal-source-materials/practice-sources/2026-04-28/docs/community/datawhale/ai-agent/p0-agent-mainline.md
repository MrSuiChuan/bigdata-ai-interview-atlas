---
kb_id: community/datawhale/ai-agent/p0-agent-mainline
title: "Datawhale P0 Agent 主线整理"
domain: community
component: datawhale
topic: p0-agent-mainline
difficulty: advanced
status: reviewed
sidebar_position: 1
version_scope: "Datawhale Agent repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-hello-agents
  - datawhale-agentic-ai
  - datawhale-agent-tutorial
  - datawhale-self-harness
  - datawhale-handy-multi-agent
  - datawhale-hugging-multi-agent
  - datawhale-easy-langent
  - datawhale-agent-skills-with-anthropic
claim_ids: []
---

# 一句话定位

Datawhale Agent 主线适合整理成“从单 Agent 到长任务 Agent，再到多 Agent 和框架工程”的面试路径。它不能只讲会调用工具，而要讲任务循环、状态、工具边界、失败恢复、观测和评估。

# 需要提炼出的核心知识点

1. Agent 不是一个 prompt，而是由模型、工具、状态、执行循环、停止条件和观测组成的系统。
2. 工具调用的难点不是把函数暴露给模型，而是权限、参数校验、错误处理、重试和审计。
3. 长任务 Agent 的核心是 harness engineering：任务拆解、检查点、恢复、日志、评估和人工接管。
4. 多 Agent 不是越多越好，关键在角色边界、通信协议、共享状态、冲突解决和成本控制。
5. 框架选型要看 runtime 能力，而不是只看 demo：状态管理、并发、持久化、tracing、human-in-the-loop 都是面试高频点。

# 项目到面试知识点映射

| Datawhale 项目 | 适合转化的知识点 | 面试题方向 |
| --- | --- | --- |
| hello-agents | Agent 基础、工具调用、任务循环 | “Agent 和普通 LLM 应用有什么区别？” |
| agentic-ai | 规划、行动、反馈、工具使用 | “Agentic AI 的核心能力边界是什么？” |
| agent-tutorial | 入门路径和基础实践 | “如何从零搭一个最小 Agent？” |
| self-harness | 长任务、恢复、观测、评估 | “为什么长任务 Agent 需要 harness？” |
| handy-multi-agent | 多 Agent 协作和角色拆分 | “多 Agent 系统为什么容易失控？” |
| hugging-multi-agent | MetaGPT 类工程实践 | “角色型多 Agent 的优势和代价是什么？” |
| easy-langent | LangChain / LangGraph / Lagent 框架 | “Agent 框架选型看什么？” |
| agent-skills-with-anthropic | Agent skills 和工具使用 | “skills 和 tools 的边界是什么？” |

# 面试回答必须讲到的深度

低质量回答通常只说“Agent 能调用工具、能自动完成任务”。高质量回答要补四层：

1. 控制层：谁决定下一步行动、何时停止、何时回退。
2. 状态层：任务状态、会话状态、工具结果和中间产物放在哪里。
3. 工具层：工具权限、输入校验、异常处理和副作用边界。
4. 评估层：怎么知道 Agent 做对了、失败了、变慢了或越权了。

# 常见误区

1. 把 Agent 等同于 ReAct prompt。
2. 把多 Agent 等同于多个角色聊天。
3. 忽略工具调用的副作用和权限。
4. 不设计停止条件，导致循环失控。
5. 没有 tracing，只能靠肉眼看日志排查。

# 需要官方交叉复核的点

1. LangGraph、OpenAI Agents SDK、AutoGen、CrewAI 等框架的当前 API 行为。
2. MCP、A2A 等协议的正式语义和版本差异。
3. 平台工具调用、权限、审计和沙箱能力。
4. 模型 tool calling 的具体参数和返回格式。

# 后续拆分任务

1. 为每个 P0 Agent 项目补独立整理页。
2. 每个项目至少产出 5 道题。
3. 把通用 Agent 原理融合进 `docs/ai-agent`。
4. 把项目复盘题加入 `questions/ai-agent` 或 `questions/community/datawhale`。
