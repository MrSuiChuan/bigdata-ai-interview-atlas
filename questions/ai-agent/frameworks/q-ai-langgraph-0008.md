---
id: q-ai-langgraph-0008
title: LangGraph 为什么更适合长运行任务，而不是简单 Prompt chaining
domain: ai-agent
component: langgraph
topic: orchestration-runtime
question_type: comparison
difficulty: advanced
status: reviewed
version_scope: "LangGraph docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - langgraph-overview-docs
  - langgraph-persistence-docs
  - langgraph-streaming-docs
claim_ids:
  - langgraph-claim-0001
  - langgraph-claim-0002
  - langgraph-claim-0003
  - langgraph-claim-0005
related_docs:
  - ai-agent/frameworks/langgraph
estimated_minutes: 8
---

# 题目

LangGraph 为什么更适合长运行任务，而不是简单 Prompt chaining？

# 一句话结论

因为长运行任务真正缺的不是多一步模型调用，而是正式状态、恢复语义、人工介入点和运行时观测，而这些恰恰是 LangGraph 的核心能力。

# 这题想考什么

这题考的是你能不能把 LangGraph 和普通链式调用从运行时语义层拉开，而不是只停在“图更复杂”。

# 回答主线

1. 先讲 Prompt chaining 能做什么。
2. 再讲长运行任务新增了哪些运行时问题。
3. 最后讲 LangGraph 如何用 state、checkpoint、interrupt、streaming 回答这些问题。

# 参考作答

普通 Prompt chaining 适合解决一类相对短、直线、一次性的问题：模型调一步、工具调一步、结果往下传一步。这类系统往往不太需要正式状态模型，也不太需要中途恢复。

但长运行 Agent 任务不是这样。它会遇到中断、分支、循环、人工审批、失败恢复和过程可视化这些问题。也就是说，它缺的不是“多几步 Prompt”，而是“多步任务如何作为正式运行时存在”。LangGraph 的 state、checkpoint、thread、interrupt 和 streaming 正是在回答这些问题，所以它更适合长运行任务，而不是简单链式拼接。

# 现场判断抓手

1. 能把“多步”问题和“长运行”问题分开。
2. 能说明 LangGraph 解决的是恢复与观测，不只是编排形式。
3. 能把 checkpoint 和 interrupt 放进答案主线。

# 常见误区

1. 认为 LangGraph 只是图形化版 chain。
2. 只说节点和边更多。
3. 完全不提恢复和 streaming。

# 追问

1. 什么场景下普通 workflow 仍然比 LangGraph 更简单？
2. 如果一个系统永远不需要恢复能力，LangGraph 的价值会下降在哪？
3. 为什么 state schema 在长运行任务里比 prompt 本身更关键？
