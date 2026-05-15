---
kb_id: ai-agent/patterns/event-streaming-taxonomy-state-diffs-and-progress-signals
title: "Event Streaming Taxonomy / State Diffs / Progress Signals：流式系统最怕的不是慢，而是把不同语义的流混成一条 UI 管道"
domain: ai-agent
component: agent-patterns
topic: event-streaming-taxonomy-state-diffs-progress-signals
difficulty: advanced
status: reviewed
sidebar_position: 45
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - langgraph-streaming-docs
  - microsoft-agent-framework-workflow-events
claim_ids:
  - pattern-claim-0218
  - pattern-claim-0219
  - pattern-claim-0220
  - pattern-claim-0221
  - pattern-claim-0222
  - pattern-claim-0223
tags:
  - ai-agent
  - streaming
  - events
  - progress
  - ui
---

# 一句话结论

流式 agent 系统真正难的不是“能不能一边跑一边吐字”，而是要把 token 流、状态 diff 流、检查点流、任务生命周期流、审批请求流分开建模；不然 UI 看起来很实时，语义却是乱的。

# 为什么这题很容易答浅

很多人一讲 streaming，就会说：

1. 把模型 token 实时显示出来
2. 工具执行时给用户一个 loading
3. 完成后展示最终答案

这套回答的问题在于，它把所有“边跑边发”的数据都当成同一种流。但在真实 agent 工作流里，流至少有几种完全不同的语义：

1. token 流：用户正在看到语言模型说话
2. state diff 流：系统状态哪个键刚刚变了
3. snapshot 流：当前完整状态长什么样
4. checkpoint 流：现在已经可恢复到哪里了
5. task 生命周期流：哪个任务开始、结束、失败了
6. request 流：现在是不是在等待人工审批或补充输入

如果这些流被混在一个前端事件管道里，常见后果就是：

1. UI 更新看起来很花，但无法严格回放
2. “进度条前进”不等于“状态已经安全落盘”
3. 用户以为系统在等人工审批，实际上只是在等另一个工具

所以这题真正考的是：你有没有把 streaming 看成“多语义事件面”，而不是“把文本一点点吐出来”。

# 为什么稳定事件合同比“先跑起来”更重要

LangGraph streaming 文档里一个特别值得讲的点是：v2 把流事件统一成 `StreamPart`，有稳定的 `type`、`ns` 和 `data` 字段，而且当启用 subgraph streaming 时，`ns` 会携带命名空间。

这意味着成熟流式系统首先要解决的是消费合同稳定性：

1. 事件长什么样
2. 消费端如何按类型分流
3. 子图、父图、不同执行源如何被命名空间区分

文档还特别对比了 v1：v1 的输出格式会随着单模式、多模式、是否启用 subgraph streaming 而变化；v2 则保持稳定，并支持根据 `chunk["type"]` 做类型收窄。

这件事面试里非常适合深挖，因为它说明：

流式系统最怕的不是事件多，而是事件合同不稳定，导致消费端逻辑越来越脆。

# 为什么 `values` 和 `updates` 不是两种“差不多的状态流”

LangGraph 明确区分：

1. `values`：每一步后发完整图状态
2. `updates`：每一步后只发变化的键

而且如果同一步里有多个更新，还会分开发送。

这说明两者服务的是两种完全不同的消费策略：

1. `values` 适合把当前状态当作快照真相来渲染
2. `updates` 适合做增量 UI、轻量同步和操作回放

面试里如果只说“一个发全量，一个发增量”，还不够。更深一层要讲到：

1. 全量流更稳，但带宽和重绘成本更高
2. 增量流更轻，但消费端必须自己维护状态归并
3. 同一步多次更新分开发送，意味着“逻辑步骤”不等于“单事件”

# 为什么 token 流和进度流必须彻底分开

LangGraph 还明确了：

1. `messages` 模式会流式发送 `(message_chunk, metadata)`，而且它可以来自 nodes、tools、subgraphs、tasks 的任意部分
2. `custom` 模式允许节点发任意应用数据

这正好说明一个成熟产品设计原则：

1. token 流用来表达“模型在说什么”
2. custom progress 流用来表达“系统在做什么”

如果把这两层混起来，最常见的问题是：

1. 用模型文本模拟进度，结果不稳定也不可校验
2. 用户看到“正在查询数据库”，其实那只是模型瞎说的一句解释

所以真正靠谱的产品不会用 token 伪装 progress，而会让 progress 成为独立事件层。

# 为什么 checkpoint、tasks、debug 是“可恢复观察面”，不是普通日志

LangGraph 文档里 `checkpoints`、`tasks`、`debug` 三种模式也特别重要：

1. `checkpoints` 发出的事件格式和 `get_state()` 一致
2. `tasks` 发任务开始/完成及结果、错误
3. `debug` 会把 checkpoints、tasks 和额外元数据一起发出来
4. 这三类都要求有 checkpointer

这说明这几类流和“随便打点日志”完全不同。它们的本质是：

1. 和持久化、恢复点直接相关
2. 带有执行树生命周期语义
3. 可用于重建工作流而不是只看热闹

所以如果一个团队把 debug event 和聊天 token 一视同仁地往前端直接推，后面一定会越来越乱。

# 为什么审批请求流是独立交互层，不是附属提示

Microsoft Agent Framework 的 workflow events 给了另一个很强的视角。它把事件统一成 `WorkflowEvent` 的 type discriminator，并覆盖：

1. workflow lifecycle
2. executor events
3. superstep events
4. request events

而 `request_info` 常常承载 approval-required tools 的审批负载。再加上 `workflow.run_stream(...)` / `WatchStreamAsync()` 是按执行过程持续消费这些事件，这说明：

审批请求不是“执行旁边顺手弹出的一个提示框”，而是流式交互协议中的正式事件。

也就是说，成熟系统会把：

1. progress event
2. completion event
3. approval request event

当成三种不同 UI 状态机输入，而不是一股脑儿塞进“事件流”。

# 一个成熟的事件流设计至少要拆成五层

如果要把这题答到原理层，至少要把下面五层讲清楚：

1. contract layer：事件结构是不是稳定、是否可按类型分流
2. state layer：这是全量快照还是增量更新
3. language layer：这是 token/message 还是业务进度
4. recovery layer：这条事件是否和 checkpoint、task 生命周期有关
5. interaction layer：这是不是 request/approval/input-required 之类的人机协作事件

少一层，系统看起来也许能跑，但产品和运维都会越来越难。

# 标准面试答案

Agent streaming 真正难的不是 token 实时输出，而是不同语义事件必须分层建模。LangGraph streaming 文档说明，v2 使用统一的 `StreamPart` 结构，带稳定的 `type`、`ns`、`data` 字段，subgraph 事件还会带命名空间；相对地，v1 的输出格式会随着单模式、多模式和 subgraph streaming 配置而变化。这说明流式系统首先要有稳定的事件合同，否则消费端会随着模式变化不断写分支。状态层面，`values` 发每一步后的完整状态，`updates` 只发变化键，而且同一步内多个更新会分开发送，因此全量快照流和增量 diff 流服务的是不同 UI 与同步策略。语言层面，`messages` 流的是来自 nodes、tools、subgraphs、tasks 任意部分的 `(message_chunk, metadata)`，而 `custom` 模式才适合发应用自己的进度数据，这说明 token 流和 progress 流必须拆开，不能拿模型文本去伪装系统进度。恢复层面，`checkpoints`、`tasks`、`debug` 三种流都依赖 checkpointer，它们和持久化、恢复以及任务生命周期直接相关，不是普通日志。交互层面，Microsoft Agent Framework 把 workflow、executor、superstep、request 等事件统一到 `WorkflowEvent`，其中 `request_info` 往往携带审批所需负载，说明人工审批请求本身就是流式交互协议的一部分。真正成熟的 streaming 设计，必须同时区分事件合同、状态 diff、token 输出、恢复观察和人机协作请求，而不是把所有“边跑边发”的数据塞进一个前端事件管道。

# 常见误答

1. 把 streaming 理解成 token 实时显示
2. 不区分快照流和增量 diff 流
3. 用模型输出文本冒充进度事件
4. 把 debug/checkpoint/task 事件当成普通日志打印
5. 把审批请求当成 UI 附属提示，而不是正式事件类型

# 相关样例

1. `examples/python/ai-agent/streaming_event_taxonomy_outline.py`
