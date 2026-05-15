---
kb_id: ai-agent/patterns/planner-executor
title: Planner-Executor / Budget-Aware Reasoning：为什么它不是 ReAct 的同义词，也不是越想越深越好
domain: ai-agent
component: agent-patterns
topic: planner-executor-budget-aware-reasoning
difficulty: advanced
status: reviewed
sidebar_position: 2
version_scope: Official docs and primary papers as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - react-paper
  - langgraph-thinking-docs
  - crewai-flows-docs
  - semantic-kernel-process-framework-docs
  - openai-latency-optimization-guide
  - openai-cost-optimization-guide
  - langgraph-graph-api-overview-docs
  - langgraph-use-graph-api-docs
claim_ids:
  - pattern-claim-0004
  - pattern-claim-0005
  - pattern-claim-0006
  - pattern-claim-0007
  - pattern-claim-0152
  - pattern-claim-0153
  - pattern-claim-0154
  - pattern-claim-0155
  - pattern-claim-0156
tags:
  - ai-agent
  - planner-executor
  - planning
  - budget
  - control-flow
---
## 一句话结论

Planner-Executor / Budget-Aware Reasoning：为什么它不是 ReAct 的同义词，也不是越想越深越好需要从对象、链路、边界和证据四个角度理解。

## 为什么这一题经常答混

大家很容易把下面几种模式都叫成“先规划后执行”：

1. ReAct 里的 reasoning + acting 交替循环
2. 一个显式 planner 先出 plan，再交给 executor 执行
3. 一个 deterministic flow 决定路径，某些节点再调用 agent 执行
4. 计划不够就继续细化，默认多想几轮总会更好

这四者不是同一层东西。

## Planner-Executor 最本质的价值

它真正解决的是控制问题：

1. 哪些决策应该集中在 planner
2. 哪些动作应该交给 executor
3. 路径和状态谁来持有
4. 什么时候应该停下来，不再继续规划

一旦分层清楚，系统会更容易：

1. 追踪
2. 回滚
3. 插入人工审批
4. 约束高风险动作
5. 在预算接近上限时做 graceful degradation

## 为什么它和 ReAct 不一样

ReAct 的特点是：

1. reasoning 和 action 交替出现
2. 模型边想边做

而 Planner-Executor 更像：

1. planner 先给任务结构、步骤或子目标
2. executor 再在这个结构下完成执行

所以 ReAct 更偏 interleaved control，Planner-Executor 更偏 layered control。

## 为什么现代框架会反复走向这种分层

从 LangGraph、CrewAI、Semantic Kernel 的文档都能看到同一种趋势：

1. 复杂任务会被拆成离散 step 或 flow
2. 自治 agent 行为通常被放在某些节点内，而不是统治整条路径
3. 图或流程会显式管理状态、边界和恢复点

这说明 Planner-Executor 不是一个孤立技巧，而是很多生产框架都会自然走到的结构。

## 为什么 planning depth control 不是附属优化

很多人一讲 planner，就会默认：

1. 先规划
2. 再执行
3. 不够好就继续细化

这听起来很像“更认真”，但工程上很容易失控。因为只要系统允许：

1. 无限拆子任务
2. 无限继续反思
3. 无限继续检索
4. 无限继续尝试 fallback

它就会迅速遇到三个现实问题：

1. 延迟爆炸
2. 成本失控
3. 在边际收益很低时继续消耗预算

所以 planning depth control 真正解决的，不是“怎么想更深”，而是“什么时候该停”。

## 预算控制为什么是控制流的一部分

OpenAI 的 latency 和 cost optimization 指南合起来指向一个很重要的工程结论：

1. 更多请求意味着更高成本和更高延迟
2. 更多 token 也意味着更高成本和更高延迟
3. 更大模型通常更贵，也常常更慢
4. 某些高度约束步骤根本不该默认交给 LLM

这意味着每增加一层规划、反思、重写、检索或验证，其实都在追加预算。因此，budget-aware reasoning 不应该是“流程定好以后再优化”，而应该反过来影响：

1. 是否继续规划
2. 是否继续拆分
3. 是否继续检索
4. 是否继续让更强模型介入
5. 是否退出到 deterministic logic

## Early Exit 为什么比“把 limit 调大”更成熟

很多系统一旦遇到规划不够深的问题，就会做一个很直观的动作：

1. 把循环上限调大
2. 把递归层数调大
3. 让 agent 再多试几轮

这往往只是延后爆炸。

真正成熟的系统会优先设计 early exit 条件，例如：

1. 证据已经足够
2. 目标已经满足
3. 剩余预算不足以支持继续探索
4. 当前路径边际收益已经很低
5. 当前节点已经可以退回 deterministic logic 或 fallback

也就是说，控制推理深度的关键不只是 hard limit，更是 soft stop condition。

## Recursion Limit 和 RemainingSteps 在回答什么

LangGraph Graph API 提供了两个非常值钱的控制点：

1. loop 必须有 termination condition
2. 系统可以配置 recursion limit，超出后会抛出 `GraphRecursionError`
3. 图内部可以通过当前步数和 `RemainingSteps` 感知剩余预算空间

这意味着：

1. hard limit 用来防止失控
2. soft exit 用来优化收益
3. graceful degradation 可以在快到边界时提前发生，而不是等撞墙后异常退出

## 适合什么场景

1. 高风险任务，动作要受控
2. 多步骤任务，状态和过程要可解释
3. 需要审批、暂停、重试、回滚
4. 任务结构本身相对稳定，但局部步骤需要智能决策
5. 成本和时延本身是设计约束，而不是事后优化项

## 一个高质量回答要补的边界

1. 计划本身也可能是错的
2. 计划过细会让系统僵硬
3. 计划过粗又会让 executor 自由度过大
4. 深度控制不能只靠 recursion limit
5. 并不是所有节点都值得继续调用 LLM

所以 Planner-Executor 不是银弹，而是一种更可治理的控制结构；budget-aware reasoning 也不是“小修小补”，而是这种结构能不能进生产的关键条件。

## 机制解读

Planner-Executor 模式的本质，是把计划生成和动作执行在系统结构上分层。它不同于 ReAct 那种 reasoning 和 acting 交替出现的模式，更像先由 planner 给出步骤、子目标或路径，再由 executor 在该结构下完成执行。LangGraph 的离散步骤设计、CrewAI 的 Flow-first 结构、Semantic Kernel 的 Process Framework 都体现了这种控制分层。但成熟回答不能停在“先规划再执行”，还必须补 planning depth control：OpenAI 的 latency 和 cost optimization 指南说明，请求数、token 数、模型大小和是否默认使用 LLM，都会直接决定时延与成本，所以每多一轮规划、反思或检索，本质上都在追加预算；LangGraph 的 termination condition、recursion limit 和 `RemainingSteps` 则说明生产系统必须同时设计 hard bound、soft exit、graceful degradation 和 deterministic escape hatch。技术复盘中如果能把它讲成“为了可追踪、可恢复、可治理且预算内可运行而做的结构化控制”，就已经答到原理层了。

## 易混边界

1. 把任何先想后做都叫 Planner-Executor
2. 把它和 ReAct 混为一谈
3. 认为推理越深系统就一定越好
4. 只加递归上限，不设计提前停止条件
5. 所有步骤都继续用 LLM，不愿退出到确定性逻辑

## 相关样例

1. `examples/python/ai-agent/planner_executor_outline.py`
2. `examples/python/ai-agent/planning_depth_budget_control_outline.py`
