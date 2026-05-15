---
kb_id: ai-agent/frameworks/openai-agents-runtime-and-tools
title: OpenAI Agents SDK 工具体系：function tool、hosted tool、agent-as-tool 怎么区分
domain: ai-agent
component: openai-agents-sdk
topic: tools
difficulty: advanced
status: reviewed
sidebar_position: 2
version_scope: OpenAI Agents SDK docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - openai-agents-sdk-tools
  - openai-agents-sdk-docs
claim_ids:
  - openai-agents-claim-0003
  - openai-agents-claim-0004
  - openai-agents-claim-0005
tags:
  - ai-agent
  - openai
  - tools
  - agent-as-tool
---
## 一句话结论



OpenAI Agents SDK 的工具体系不能只背一个 `function_tool`，它真正重要的是把本地函数、平台托管能力和 Agent 子系统都纳入统一可调用接口。

## 为什么这个主题能看出理解深度

因为初学者通常只会说：

1. 把 Python 函数加个装饰器
2. 模型就能调用了

而更深一层的理解是：

1. 工具本质上是运行时边界
2. 工具类型不同，意味着控制权和执行位置不同
3. 某些“工具”其实是另一个 Agent

## 三类最值得讲的工具

### 1. Function tools

这是最容易落地的一类。

它的重点不只是“能调用 Python 函数”，而是：

1. 运行时能根据函数签名生成结构化 schema
2. 复杂输入可以用 Pydantic 模型精确定义
3. 这样工具调用才是受控的，而不是自由文本拼装

### 2. Hosted tools

这类工具强调的是：

1. 能力由平台托管
2. 运行时仍以统一工具接口接入

技术复盘中不用死背每个 hosted tool，而要知道它们体现的是“平台级能力也能进入同一调用面”。

### 3. Agents as tools

这是很容易和 handoff 混淆的一类。

它的关键点是：

1. 另一个 Agent 被当作工具调用
2. 调用结束后，控制权回到当前 Agent
3. 所以它更像子能力，而不是正式交班

这和 handoff 的差异，是技术复盘中非常高价值的加分点。

## 为什么 function tool 的 schema 很重要

因为没有 schema，就会立刻遇到几个问题：

1. 模型不知道参数边界
2. 运行时很难做验证
3. 调试和 tracing 也会变差

所以 function tool 的重点不是装饰器，而是结构化调用契约。

## 机制解读

OpenAI Agents SDK 的工具体系至少要区分 function tools、hosted tools 和 agents as tools。function tools 负责把本地函数以结构化 schema 暴露给运行时；hosted tools 代表平台托管能力也能进入统一工具调用面；agents as tools 则允许一个 Agent 作为另一个 Agent 的子能力被调用，调用结束后控制权仍返回原 Agent。真正该强调的是，工具不是 Prompt 附件，而是受 schema、运行时和 tracing 管理的正式执行边界。

## 易混边界

1. 只会讲 `function_tool` 装饰器
2. 把 agents as tools 和 handoff 混成一类
3. 完全忽略 schema 和参数校验价值

## 相关样例

1. `examples/python/ai-agent/openai_agents_tool_calling.py`
2. `examples/python/ai-agent/openai_agents_handoffs_sessions_tracing.py`
