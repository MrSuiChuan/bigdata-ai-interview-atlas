---
kb_id: ai-agent/patterns/prompt-injection-least-privilege-and-tool-permission-boundaries
title: Prompt Injection / Least Privilege / Tool Permission Boundaries：不是把提示词写硬一点，而是让不可信内容碰不到高权限动作
domain: ai-agent
component: agent-patterns
topic: prompt-injection-least-privilege-tool-boundary
difficulty: advanced
status: reviewed
sidebar_position: 31
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-safety-best-practices
  - openai-computer-use-guide
  - openai-agents-sdk-mcp
claim_ids:
  - pattern-claim-0136
  - pattern-claim-0137
  - pattern-claim-0138
  - pattern-claim-0139
  - pattern-claim-0140
tags:
  - ai-agent
  - prompt-injection
  - least-privilege
  - tools
  - approvals
---
## 一句话结论

Prompt Injection / Least Privilege / Tool Permission Boundaries：不是把提示词写硬一点，而是让不可信内容碰不到高权限动作需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 prompt injection，马上就会回答：

1. 在 system prompt 里写不要听用户的恶意指令
2. 加一些安全规则
3. 告诉模型忽略网页里的诱导文字

这些都不是完全没用，但只停在这里会很危险。

因为 prompt injection 的真正难点是：

1. 模型仍然要读取不可信内容
2. 不可信内容有机会影响决策
3. 决策一旦连上工具，风险就会变成真实环境副作用

也就是说，prompt injection 真正考验的是 permission architecture，而不是措辞强度。

## 为什么“把提示词写硬一点”不能解决根问题

OpenAI 的 safety best practices 指南给了一个很重要的方向：

1. 要做 moderation 和 human oversight
2. 约束输入和缩小输出范围可以降低风险

这条指导的重点并不是“写一条更长的 system prompt”，而是承认：

1. 风险来自输入面太宽
2. 风险来自输出行动面太大
3. 防御需要在系统边界上缩小 attack surface

所以成熟系统会优先做：

1. 缩小可接收输入的自由度
2. 缩小模型可触达工具的自由度
3. 在高风险动作前增加人工或程序化审批

这比“希望模型一直听话”靠谱得多。

## Prompt injection 真正可怕的地方，是间接注入

很多人会把注入理解成用户直接输入一句恶意 prompt，但在 agent 场景里，更危险的往往是 indirect injection：

1. 网页内容里埋了恶意指令
2. 检索文档里出现诱导文本
3. 第三方工具返回的文本里夹带操作建议
4. 邮件、工单、网页、知识库本身变成攻击载体

OpenAI 的 computer use guide 非常明确地提醒：

1. 页面内容应该被视为 untrusted input
2. 这类 agent 应该运行在隔离浏览器或 VM 中
3. 要限制本地访问和环境暴露面

这说明 prompt injection 问题一旦进入浏览器、文件系统、MCP 或外部工具，就已经不再是“提示词卫生问题”，而是执行边界问题。

## Least Privilege 为什么是第一性原则

如果要用一句话讲 prompt injection 的工程解法，最强的一句通常是：

不要让模型默认拥有自己不该拥有的工具和权限。

OpenAI Agents SDK 的 MCP 文档给了非常适合落地的一组机制：

1. 可以用 `tool_filter` 只暴露部分工具
2. allow-list 和 block-list 可以组合使用
3. 如果同时存在，先按 allow-list 再移除 block-list

这件事的意义不只是“工具多了不好管理”，而是：

1. 模型看不到的工具，就无法被注入文本诱导调用
2. 子 agent 只拿到任务所需最小工具集时，攻击面天然收缩
3. least privilege 是默认安全，而不是事后拦截

所以 prompt injection 防线里最该优先做的不是“再写三段免责声明”，而是最小化 tool surface。

## Approval Boundary 和 Least Privilege 不是一回事

很多回答会把最小权限和审批混成同一个概念，但它们不是一回事：

1. least privilege 解决的是默认不暴露过多能力
2. approval boundary 解决的是即便工具暴露了，也不能直接自动执行高风险动作

OpenAI Agents SDK 的 MCP 文档支持 `require_approval`：

1. 可以对全部工具统一要求审批
2. 可以对特定工具单独要求审批
3. 可以接人工审批，也可以接程序化审批回调

这说明成熟系统通常至少分两道门：

1. exposure gate：这个工具对这个 agent 是否可见
2. execution gate：即便可见，当前这次调用是否被允许执行

两道门都要有，才能真正控制高风险动作。

## Allow list 为什么比事后检测更可靠

OpenAI 的 computer use guide 还强调：

1. 维护 domain allow list
2. 维护 action allow list
3. 对购买、认证、 destructive 或 hard-to-reverse 行为保持 human in the loop

这条建议很值钱，因为它体现了一个更成熟的安全逻辑：

1. 不是先让系统自由探索，再判断哪里危险
2. 而是先把合法动作空间定义出来
3. 超出合法空间的，默认就不允许发生

也就是说，allow list 的思想是“先定义安全集合”，而不是“在无限集合里尽量抓坏人”。

## 一个成熟的工具权限边界至少要分四层

如果想把这个主题答到原理层，一个完整回答通常至少会分四层：

1. untrusted input boundary：网页、检索结果、第三方工具返回都视为不可信
2. tool exposure boundary：只暴露最小必要工具集
3. execution approval boundary：高风险工具调用需要审批
4. environment isolation boundary：把 agent 放在隔离浏览器、容器或 VM 中运行

这四层一讲出来，prompt injection 的回答就从“写 prompt 对抗 prompt”升级成了“系统级权限架构”。

## 机制解读

Prompt injection 的风险本质，不是模型会不会被某段文字说服，而是不可信内容是否有机会通过模型触达高权限动作。OpenAI 的 safety best practices 指南建议使用 moderation、human oversight，并通过约束输入和缩小输出范围来减少风险，这说明防御重点在于收缩 attack surface，而不是只靠 system prompt 说“不要被骗”。在环境动作场景下，OpenAI 的 computer use guide 又明确指出网页内容应被视为 untrusted input，并建议在隔离浏览器或 VM 中运行、限制本地访问，同时维护 domain 和 action allow list，并对购买、认证、 destructive、hard-to-reverse 操作保持 human in the loop。进入工具协议层后，OpenAI Agents SDK 的 MCP 文档进一步提供了 `tool_filter` 和 `require_approval` 两道边界：前者控制哪些工具默认可见，后者控制哪些调用即使可见也必须先审批。真正成熟的系统，不会把 prompt injection 当成“提示词对抗战”，而会把它落实成不可信输入边界、最小权限工具暴露、审批门和执行环境隔离的联合设计。

## 易混边界

1. 认为写更强的 system prompt 就足够
2. 不区分直接用户输入和第三方内容注入
3. 给 agent 暴露过多工具，再指望事后拦截
4. 不给高风险动作设置审批门
5. 让 browser 或 computer-use agent 直接跑在高权限宿主环境里

## 相关样例

1. `examples/python/ai-agent/prompt_injection_least_privilege_outline.py`
