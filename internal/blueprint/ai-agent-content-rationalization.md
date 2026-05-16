---
kb_id: blueprint/ai-agent-content-rationalization
title: "AI Agent 内容整理说明"
domain: blueprint
component: project
topic: ai-agent-content-rationalization
difficulty: intermediate
status: reviewed
sidebar_position: 13
version_scope: "AI Agent content rationalization as of 2026-04-28"
last_verified_at: "2026-04-28"
source_ids: []
claim_ids: []
---

# 当前结论

AI Agent 内容已经按主线知识库重新整理，不再按外部项目或独立专区展示。主线结构以面试能力为中心，分为运行时基础、工程模式、框架协议、平台工作流和场景案例。

# 整理原则

1. 知识库讲机制：对象、状态、链路、失败模式、边界和权衡必须写清楚。
2. 题库考表达：题目必须能追问原理、系统设计、排障和工程取舍。
3. 实践资料只做素材：可以吸收项目经验，但不能替代官方协议、API 和版本说明。
4. 前端不按素材来源建专区：所有内容都归入 AI Agent、RAG、大模型基础或大数据主线。
5. 内容必须可验证：关键事实需要来源，具体框架行为优先回到官方文档。

# 主线结构

| 主线 | 内容范围 | 面试重点 |
| --- | --- | --- |
| Agent Runtime 基础 | 执行循环、工具调用、状态、记忆、停止条件 | 说明 Agent 为什么是运行时系统 |
| Agent 工程模式 | RAG、权限、观测、评估、长任务恢复 | 说明生产环境如何可靠运行 |
| 框架与协议 | MCP、A2A、LangGraph、AutoGen、CrewAI、Semantic Kernel 等 | 说明框架能力边界和选型依据 |
| 平台与工作流 | 低代码平台、本地模型、工具生态、CLI Agent | 说明平台层如何治理模型、工具和权限 |
| 场景案例 | RAG 应用、AI 编码、内容生产、安全升级等 | 说明如何把项目复盘成结构化面试答案 |

# 已完成动作

1. 移除独立实践资料前端入口。
2. 将旧素材归档到 `archive/internal-source-materials/practice-sources/2026-04-28`。
3. 新增 4 篇主线知识文档，覆盖 Agent、RAG、LLM 和平台工程。
4. 新增 147 道实践型面试题，全部归入主线题库。
5. 重建前端 catalog，当前题库收录 600 道 Markdown 题目。

# 后续检查项

1. 每篇知识文档是否回答“它解决什么问题、核心对象是什么、链路怎么走、失败怎么排、边界在哪里”。
2. 每道题是否有一句话结论、这题想考什么、回答主线、参考作答、现场判断抓手、误区和追问。
3. 前端是否只展示主线方向和通用来源类型。
4. 搜索、导航、侧边栏和页脚是否没有旧专区入口。
5. 校验、审计、构建和本地预览是否通过。
