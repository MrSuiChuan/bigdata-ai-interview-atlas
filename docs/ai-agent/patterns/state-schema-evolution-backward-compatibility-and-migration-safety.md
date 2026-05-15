---
kb_id: ai-agent/patterns/state-schema-evolution-backward-compatibility-and-migration-safety
title: State Schema Evolution / Backward Compatibility / Migration Safety：状态型 Agent 一旦上线，历史 checkpoint 就是活着的执行合同
domain: ai-agent
component: agent-patterns
topic: state-schema-evolution-backward-compatibility-migration-safety
difficulty: advanced
status: reviewed
sidebar_position: 37
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - langgraph-persistence-docs
  - openai-agents-sdk-docs
  - openai-agents-sdk-tools
  - langgraph-subgraphs-docs
  - autogen-teams-docs
claim_ids:
  - pattern-claim-0168
  - pattern-claim-0169
  - pattern-claim-0170
  - pattern-claim-0171
  - pattern-claim-0172
  - pattern-claim-0173
tags:
  - ai-agent
  - state
  - schema
  - backward-compatibility
  - migration
---
## 一句话结论

State Schema Evolution / Backward Compatibility / Migration Safety：状态型 Agent 一旦上线，历史 checkpoint 就是活着的执行合同需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 schema evolution，就会回答：

1. 字段改了就写个迁移脚本
2. 节点变了就发版重启
3. 出问题再回滚

这些回答更像传统离线批处理思路，但对 stateful agent workflow 来说，真正困难的地方在于：旧状态不是“历史数据”，而是可能随时要恢复执行的 live execution state。

LangGraph persistence 文档明确说明：

1. 图在每一步执行后都会保存 checkpoint
2. checkpoint 按 thread 组织
3. 之后的恢复依赖这些已序列化状态

这意味着当你修改图结构、节点名、状态字段名或字段类型时，影响的不是一份冷数据，而是未来任意时刻都可能被恢复的工作流。技术复盘中如果只说“做数据库迁移就行”，就还是没讲到点上。

## 为什么 persistence 会把“旧状态”升级成运行合同

只要系统支持 pause、interrupt、checkpoint 或 long-running resume，过去某一步保存下来的状态就不只是为了审计，而是恢复执行的输入。于是当前代码的行为实际上取决于两部分：

1. 现在部署的图结构和节点逻辑
2. 过去版本留下的 checkpoint 形状和含义

这就是为什么 state schema evolution 在 agent 里比普通对象重命名更危险。你不是在改一个类定义，而是在改“未来恢复时解释旧状态的规则”。

更直白一点说，持久化让 schema 变成了协议。协议一旦对外生效，后续每次改动都要考虑老参与方还在不在。

## 为什么“线程是否结束”会决定你能改多少

LangGraph 的 graph migrations 指南给了一个非常有工程价值的边界：对于已经走到图末尾的 threads，可以自由调整整个 topology，包括新增、删除、重命名节点和边。这说明当线程已经终结时，历史状态不再需要继续进入未来节点，所以图结构可以大胆重构。

但对当前处于 interrupted 状态、未来还要继续执行的 thread，约束就明显变强了。官方文档指出：

1. 大多数 topology change 可以做
2. 但不能随意 rename 或 remove 即将进入的节点

原因很简单：中断中的线程已经“站在图中的某个位置上”。如果你把它下一步要去的节点删掉或改名，恢复时就等于把路挖断了。

所以 migration safety 的第一原则不是“代码新不新”，而是“旧线程下一步还能不能找到它以为会存在的世界”。

## 为什么加字段和删字段通常比改字段名安全

LangGraph 对状态模式变更的兼容性边界也说得很清楚：

1. 添加 state key 是前后兼容的
2. 删除 state key 也是前后兼容的
3. 重命名 state key 会丢失旧线程上保存的对应状态
4. 不兼容的 state type 变化可能让旧 checkpoint 恢复出问题

这个边界背后的原理是：

1. 新增字段时，旧 checkpoint 只是少一个键，系统通常还能给默认值
2. 删除字段时，新代码可以忽略旧 checkpoint 里多出来的键
3. 但重命名不是语义兼容，它等于告诉新代码“旧键不再存在”，旧值也就找不到了
4. 类型不兼容更危险，因为即便字段名还在，旧值也可能无法被新逻辑正确解释

所以技术复盘中如果被问到“最危险的状态演化是什么”，一个很强的回答是：

最危险的通常不是加字段，而是重命名和语义不兼容的类型变化，因为它们会破坏新代码解释旧 checkpoint 的能力。

## 为什么 breaking change 不能只靠回滚解决

很多团队以为“发版失败就回滚”足够，但状态型 agent 的问题在于，breaking change 可能不是上线那一刻爆，而是在某个中断线程隔几个小时或几天恢复时才爆。

这会导致两类典型事故：

1. 发布时健康检查全绿，但老线程恢复时报错
2. 部分线程在新版本跑了一半，回滚后又和更老的状态解释器不兼容

所以 migration safety 真正要处理的是跨时间的不一致，而不是单次部署窗口内的不一致。

## 一个成熟的迁移策略为什么通常只有两条路

把官方边界和工程实践合起来看，迁移安全通常只有两种主路线：

1. 保持向后兼容
2. 先 drain 再做 breaking change

所谓保持向后兼容，就是新代码继续理解旧 checkpoint，例如：

1. 对新增字段提供默认值
2. 同时兼容旧键和新键一段时间
3. 对旧类型做适配转换
4. 避免删除中断线程仍可能进入的节点

所谓 drain interrupted threads，就是在引入破坏性变更前，先把所有会继续跑的旧线程执行完、废弃掉，或者强制迁移到安全终点。原因在于 persistence 已经让旧 run state 成为 live contract；只要这些线程还活着，你就不能假装新旧世界彼此隔离。

## 设计迁移方案时至少要盘点五件事

如果技术复盘官继续进一步分析“怎么落地”，至少要讲清楚下面五件事：

1. 状态面：新增、删除、重命名、类型变化分别有哪些兼容性风险
2. 拓扑面：节点和边的变化会不会影响尚未结束的 thread
3. 生命周期面：当前有多少 running 或 interrupted threads 仍依赖旧图
4. 部署面：是双读双写、兼容期发布，还是先 drain 后切换
5. 恢复面：出现失败时，是回到旧代码继续恢复，还是提供显式迁移逻辑

只有把这五件事说出来，才说明你理解“state schema evolution”不是简单重构，而是正在修改一个带运行中会话的协议。

## 机制解读

在支持 persistence 的 agent workflow 里，state schema evolution 首先是兼容性问题，而不是单纯代码整理问题。LangGraph persistence 文档说明，图状态会在每一步保存为 checkpoint，并按 thread 组织，所以恢复执行依赖的是“当前代码 + 历史 checkpoint”这两个部分，而不是只有当前代码。进一步，LangGraph 的 graph migrations 指南明确区分了线程状态：对于已经结束的 threads，可以自由修改整个图拓扑，包括新增、删除、重命名节点和边；但对仍处于 interrupted 状态、未来还会继续执行的 threads，大多数变更虽然可做，但不能随意 rename 或 remove 它们接下来可能进入的节点，否则恢复时会失去目标节点。状态字段层面，添加或删除 state key 通常是前后兼容的，但重命名 key 会让旧状态丢失映射，不兼容的类型变化也可能让旧 checkpoint 无法被新逻辑解释。因此，迁移安全的核心原则是：只要旧 checkpoint 还可能被恢复，它们就是活着的执行合同。真正可落地的策略通常只有两种，要么保持对旧 checkpoint 的兼容读取和解释能力，要么在引入 breaking topology 或 schema changes 之前先 drain 掉所有会继续执行的 interrupted threads。回答这个主题时，如果只说“改字段写迁移脚本”或“发版失败再回滚”，仍然没有触及 stateful agent 的本质难点。

## 易混边界

1. 把 checkpoint 当成普通历史日志，忽略它还会参与恢复执行
2. 认为只要线程已暂停，就可以任意删除或重命名未来节点
3. 误以为重命名字段只是代码整洁问题，不影响旧状态读取
4. 以为 breaking change 的风险只存在于发版当下
5. 忽略 running 和 interrupted threads 对旧协议的持续依赖

## 相关样例

1. `examples/python/ai-agent/state_schema_migration_safety_outline.py`
