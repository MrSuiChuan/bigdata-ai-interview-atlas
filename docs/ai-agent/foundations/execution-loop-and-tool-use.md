---
kb_id: ai-agent/foundations/execution-loop-and-tool-use
title: Agent 执行循环：tool use 为什么不是把函数名塞进 Prompt
domain: ai-agent
component: agent-runtime
topic: execution-loop
difficulty: intermediate
status: reviewed
sidebar_position: 2
version_scope: Official AI agent docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - mcp-server-concepts
claim_ids:
  - agent-runtime-claim-0001
  - agent-runtime-claim-0002
  - openai-agents-claim-0003
  - openai-agents-claim-0004
  - mcp-claim-0006
  - mcp-claim-0007
tags:
  - ai-agent
  - tool-use
  - execution-loop
  - runtime
---
## 一句话结论

Agent 执行循环：tool use 为什么不是把函数名塞进 Prompt需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题经常被理解停留在表层

很多人一听工具调用，就回答：

1. 给模型一份工具描述
2. 模型输出要调用哪个函数
3. 代码再去执行

这还不够，因为它漏掉了真正困难的部分：

1. 工具参数如何结构化校验
2. 调用结果怎样再送回执行循环
3. 多轮任务里什么时候继续推理、什么时候继续调用工具
4. 工具能力如何被标准化暴露给不同客户端

这就是运行时视角和 Prompt 视角的差别。

## 一个最小的 Agent 执行循环长什么样

可以把它理解成下面这四步：

1. 模型读当前任务和上下文，决定下一步
2. 如果需要外部能力，就输出结构化工具调用意图
3. 运行时执行工具，拿到结果
4. 工具结果重新进入下一轮，直到任务结束

这个循环看起来简单，但一旦进入真实系统，就会自然衍生出：

1. schema 管理
2. 异常处理
3. tool result 注入
4. tracing
5. 权限和边界控制

### 运行时真正负责的是把这四步串成闭环
如果没有运行时，模型就只是提出“想做什么”；运行时负责把这个意图变成结构化调用、处理失败、更新状态，并决定下一轮是否继续。因此执行循环不是提示词技巧，而是一套持续运转的控制回路。

## 为什么结构化工具调用比“让模型自己编 JSON”更重要

OpenAI Agents SDK 的 Tools 文档强调了函数工具与 schema，MCP 的 server concepts 也把工具定义成标准化暴露的能力。

这说明行业主流方向不是：

1. 靠 Prompt 让模型自由编一个动作文本

而是：

1. 让工具有明确的输入结构
2. 让运行时知道工具能力边界
3. 让系统能验证、执行并追踪每次调用

所以 `tool use` 的本质是“受控的结构化外部动作”。

### schema 的价值不只是方便解析
schema 同时定义了工具边界、失败时可给出的错误类型，以及运行时能否做参数校验和审计记录。没有 schema，工具调用很难进入真正可治理的生产体系。

## Tool 和 Resource 为什么不能混着讲

在 MCP 里，`tool` 和 `resource` 是不同原语。

1. `tool` 更像可执行能力
2. `resource` 更像可读取上下文

这个区分非常重要，因为它对应了两种系统动作：

1. 调用外部函数
2. 读取外部上下文

如果把所有东西都当成 Tool，你就很难讲清：

1. 哪些动作会改变外部世界
2. 哪些动作只是给模型补充上下文

### 这会直接决定权限和审批设计
只读 resource 更适合被缓存、订阅和按范围读取；有副作用的 tool 则更适合做审批、幂等和超时控制。分类不清，后面的治理就会全被迫用最粗暴的总开关。

## 为什么工具调用一多，系统会迅速变复杂

因为复杂度不是来自函数本身，而是来自循环管理：

1. 多工具之间怎么选择
2. 工具失败后如何解释退
3. 一个 Agent 调另一个 Agent 时是 tool 语义还是 handoff 语义
4. 调用次数、权限范围和审计怎么做

所以高质量解释不能停在“会写一个工具注册器”，而是要讲执行循环与运行时控制。

## 机制解读

Agent 的工具调用本质上是一种运行时控制能力。模型负责判断是否需要外部能力，但真正的系统工作在于：用结构化 schema 描述工具、由运行时执行工具、把结果回送执行循环，并在多轮中持续管理调用边界。OpenAI Agents SDK 的 function tool 和 MCP 的 tools 都体现了这一点。因此，tool use 不应该被讲成“让模型在 Prompt 里拼一个函数名”，而应该讲成“受控、结构化、可追踪的外部能力调用”。

## 为什么工具结果必须进入状态层
如果工具结果只被临时拼回模型输入，而没有明确写入状态对象，系统就很难做中断恢复、trace 解释和多步骤审计。把结果进入状态层，意味着后续每一轮决策都能建立在可追溯事实之上，而不是建立在一次性上下文拼接之上。

## 本页结论
执行循环真正描述的是模型意图、工具调用、状态更新和继续/终止决策之间如何形成闭环。理解到这一层，tool use 才不再只是“给模型一个函数名”。

闭环一旦建立，排障、审计和恢复也才有共同坐标。

这正是运行时存在的意义所在。

## 易混边界

1. 把工具调用说成“输出一段 JSON 就结束”
2. 完全忽略 schema 校验和运行时控制
3. 把 tool、resource、prompt 三种概念混成一类

## 相关样例

1. `examples/python/ai-agent/openai_agents_tool_calling.py`
2. `examples/python/ai-agent/mcp_minimal_server_outline.py`
