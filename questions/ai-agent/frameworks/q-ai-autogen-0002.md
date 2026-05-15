---
id: q-ai-autogen-0002
title: AutoGen 里 teams、workbench、human-in-the-loop 的边界应该怎么讲
domain: ai-agent
component: autogen
topic: teams-workbench-hitl
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "AutoGen stable docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - autogen-teams-docs
  - autogen-workbench-docs
  - autogen-human-in-the-loop-docs
claim_ids:
  - autogen-claim-0002
  - autogen-claim-0003
  - autogen-claim-0004
  - autogen-claim-0006
  - autogen-claim-0007
related_docs:
  - ai-agent/frameworks/autogen-teams-workbench-and-hitl
estimated_minutes: 8
---

# 题目

AutoGen 里 teams、workbench、human-in-the-loop 的边界应该怎么讲？

# 一句话结论

teams 负责多 Agent 协作语义，workbench 负责共享工具与资源作用域，human-in-the-loop 负责人工介入，但其阻塞式方案并不等于完整可恢复执行。

# 核心机制

1. teams 定义协作协议
2. workbench 组织共享工具和 MCP 接入
3. UserProxyAgent 代表阻塞式人工反馈

# 标准答案

在 AutoGen 里，teams 不是“多几个 Agent”，而是具体协作协议，例如 RoundRobinGroupChat 里的共享上下文和轮流响应；workbench 不是单个函数注册器，而是共享状态、工具和资源的组织容器，还能通过 McpWorkbench 接入 MCP server；human-in-the-loop 则提供人工反馈入口，但官方也明确说明阻塞等待时应用状态无法保存或恢复，所以它和真正的 pause/resume 运行时还有边界。

# 必答点

1. team protocol
2. workbench shared scope
3. HITL recovery boundary

# 常见误答

1. 把 teams 讲成简单分工
2. 把 workbench 讲成函数列表
3. 把 AutoGen 的 HITL 讲成完整 checkpoint/resume