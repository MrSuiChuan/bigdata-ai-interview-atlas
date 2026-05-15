---
kb_id: ai-agent/patterns/subgraphs-private-state-shared-state-and-composition-boundaries
title: Subgraphs / Private State / Shared State / Composition Boundaries：子图最难的不是复用，而是状态合同怎么切
domain: ai-agent
component: agent-patterns
topic: subgraphs-private-state-shared-state-composition-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 44
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - langgraph-subgraphs-docs
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - autogen-teams-docs
claim_ids:
  - pattern-claim-0211
  - pattern-claim-0212
  - pattern-claim-0213
  - pattern-claim-0214
  - pattern-claim-0215
  - pattern-claim-0216
  - pattern-claim-0217
tags:
  - ai-agent
  - subgraphs
  - shared-state
  - private-state
  - composition
---
## 一句话结论

Subgraphs / Private State / Shared State / Composition Boundaries：子图最难的不是复用，而是状态合同怎么切需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 subgraph，就会说：

1. 把一个复杂流程拆成多个子流程
2. 子图可以复用
3. 多 agent 可以各自是一个 subgraph

这些说法都没错，但它们只讲了结构，没有讲到真正困难的地方：状态合同。

子图设计真正难的是四个问题：

1. 父图和子图是不是同一个 state schema
2. 子图里有没有私有状态不能直接暴露给父图
3. 子图调用之间需不需要跨轮记忆
4. 子图是否需要中断、恢复、状态检查和流式可观测

如果这四个问题讲不清，subgraph 很容易从“模块化”变成“状态混乱制造器”。

## 为什么“直接挂成节点”还是“包在 wrapper 里调用”取决于状态合同

LangGraph subgraphs 文档给了一个非常明确的分界：

1. 如果父图和子图共享 state keys，可以把编译好的 subgraph 直接作为节点加入父图
2. 如果父图和子图状态 schema 不同，或者需要做状态转换，推荐在 wrapper node 里调用子图

这说明 subgraph 组合方式首先不是代码组织问题，而是 state contract alignment 问题。

直接挂成节点的前提是：

1. 父子图对共享状态的理解一致
2. 数据可以在同一合同下自然流动

而 wrapper 调用适合的场景是：

1. 父图和子图看世界的方式不同
2. 需要显式映射输入和输出
3. 子图内部有私有状态不该直接暴露

## 为什么 private state 往往决定你必须用 wrapper

官方文档特别提到一种常见模式：多 agent 系统里，每个 agent 都可能有自己的私有 message history。这时常见做法就是在 node 内调用 subgraph，把父图状态转成子图状态，运行结束后再映回父图。

这背后的原理是：

1. 父图维护全局协作状态
2. 子图维护该 agent 自己的局部记忆
3. 两者不应该完全打平在一个共享 state 里

所以如果被问“为什么多 agent 很多时候不用共享一个大 state”，一个更深的回答就是：

因为私有推理历史和全局协作状态是两种不同生命周期、不同可见性的状态对象。

## 为什么 persistence 模式决定子图到底是什么

LangGraph subgraphs 一个非常容易被忽视、但非常关键的边界，是 `checkpointer` 的三种模式：

1. `None`：默认的 per-invocation persistence
2. `True`：per-thread persistence
3. `False`：stateless

这三者不是“小配置差异”，而是在定义子图到底是什么对象。

## `checkpointer=None`：每次调用一段新的短生命过程

官方建议大多数独立 subagent request 用这种模式。它的特点是：

1. 每次调用都从新状态开始
2. 在这一次调用内部仍可继承父图 checkpointer，支持 interrupt 和 durable execution
3. 调用结束后不保留跨调用的独立长期记忆

所以它适合“每次都像一个新的小任务”的 specialist subgraph。

## `checkpointer=True`：同一线程里的长生命子代理

如果子图需要跨多次调用累积记忆，就要用 per-thread persistence。此时：

1. 同一 thread 上多次进入子图会累积状态
2. 子图本身会像一个带长期记忆的角色

这更适合“真正有长期角色身份的 subagent”，而不是一次性工具化子流程。

## `checkpointer=False`：纯函数式子流程

如果你完全不需要 pause/resume、durable execution、state inspection，那么 `False` 会让子图退化成更像普通函数调用的 stateless 组件。

这类模式的本质是：

1. 简单
2. 无持久化成本
3. 但没有恢复和检查能力

所以它并不是“更轻量的默认值”，而是明确放弃了一类运行时能力。

## 为什么父图自己的 checkpointer 是前提条件

LangGraph 文档还强调：如果父图没有编译 checkpointer，那么子图很多依赖持久化的特性就不会生效，包括：

1. interrupts
2. state inspection
3. per-thread memory

这说明 subgraph persistence 不是子图自己单独声明就够了，它依赖整个执行树的持久化基础设施。技术复盘中如果只说“给子图开 memory”，其实还没有讲到真正的系统前提。

## 为什么 stateful subgraph 最怕在同一节点里重复复用同一个实例

官方还给了一个很工程化的坑：如果 persistence 开着，同一个 stateful subgraph instance 在同一 node 里被多次调用，会因为共享 checkpoint namespace 而冲突。所以这种场景更适合用 per-invocation persistence。

这件事背后说明：

1. stateful subgraph 不是纯函数
2. 它的身份里带着命名空间和持久化上下文
3. “复用同一个实例多次”不是无害优化

这非常适合技术复盘中区分“代码复用”和“状态实例复用”。

## 为什么 subgraph inspection 和 streaming 会改变你的编排方式

当 persistence 可用时，LangGraph 支持：

1. `get_state(config, subgraphs=True)` 查看子图状态
2. `stream(..., subgraphs=True)` 观察子图更新

这说明 subgraph 不只是黑盒复用单元，也可以是可观测执行单元。可一旦你希望它可观测、可中断、可检查，就必须回到前面那些状态边界问题：

1. 有没有 parent checkpointer
2. 是 per-invocation 还是 per-thread
3. 子图状态是否应被父图看到

## 一个成熟的 subgraph 设计至少要回答六个问题

如果要把这个主题答到原理层，至少要把下面六件事讲出来：

1. 父图和子图共享哪些 state keys
2. 哪些状态必须保持私有
3. 组合方式是 direct node 还是 wrapper invocation
4. 子图记忆是 per-invocation、per-thread 还是完全 stateless
5. 父图有没有提供持久化基础设施
6. 是否需要对子图做 state inspection 和 streaming observability

只有这六个问题都说清，subgraph 才是真正可维护的组合边界。

## 机制解读

Subgraph 设计的核心不是代码复用，而是父图与子图之间的状态合同设计。LangGraph 官方文档明确区分了两种组合方式：如果父图和子图共享 state keys，可以把编译好的 subgraph 直接作为节点加入父图；如果两者 state schema 不同，或者需要做显式状态转换，推荐在 wrapper node 里调用子图。这说明 direct node 和 wrapper invocation 的分界首先取决于 state contract 是否对齐。进一步，在多 agent 系统中，官方指出一种常见模式是把 subgraph 放在 node 内调用，以便每个 agent 维护自己的私有 message history，再把结果映回父图，这体现了私有局部状态和全局协作状态应当分层管理。持久化层面，`checkpointer=None` 表示默认的 per-invocation persistence，每次调用都是新的，但调用内部仍可继承父图 checkpointer 支持 interrupt 和 durable execution，适合大多数独立 subagent request；`checkpointer=True` 则开启 per-thread persistence，适合需要跨调用累积记忆的长生命 subagent；`checkpointer=False` 则让子图变成 stateless 组件，不支持 pause/resume、durable execution 和 inspectable checkpoints。与此同时，父图本身必须有 checkpointer，子图的 interrupts、state inspection 和 per-thread memory 才能真正生效。官方还提醒，同一个 stateful subgraph instance 在一个 node 里多次调用会因为共享 checkpoint namespace 发生冲突，因此这种场景更适合 per-invocation persistence。再加上 `get_state(config, subgraphs=True)` 和 `stream(..., subgraphs=True)` 可以暴露子图状态，说明 subgraph 既是组合单元，也是可观测单元。真正成熟的答案，必须同时讲清共享状态、私有状态、持久化模式、父图前提和实例复用风险。

## 易混边界

1. 把 subgraph 单纯理解成代码拆分或流程复用
2. 不区分共享状态和私有状态
3. 以为给子图单独开持久化就足够，不考虑父图前提
4. 把 stateful subgraph 当成纯函数一样在同一节点里重复复用
5. 不把 inspectability 和 streamability 视为设计边界的一部分

## 相关样例

1. `examples/python/ai-agent/subgraph_composition_boundary_outline.py`
