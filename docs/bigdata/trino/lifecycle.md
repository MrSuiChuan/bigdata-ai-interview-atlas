---
kb_id: bigdata/trino/lifecycle
title: Trino 查询生命周期
description: 说明查询从提交、排队、规划、执行、结束到失败或重试的完整生命周期，以及各阶段该看什么证据。
domain: bigdata
component: trino
topic: lifecycle
difficulty: advanced
status: reviewed
sidebar_position: 11
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-architecture-docs
  - trino-resource-groups-docs
  - trino-fault-tolerant-execution-docs
claim_ids:
  - bigdata-trino-claim-0002
  - bigdata-trino-claim-0005
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0014
  - bigdata-trino-claim-0015
  - bigdata-trino-claim-0016
  - bigdata-trino-claim-0017
tags:
  - trino
  - lifecycle
  - query
  - retry
  - resource-group
  - knowledge-base
---
## Trino 的生命周期对象不是表，而是 Query
很多存储系统的生命周期围绕表、文件或分区展开，但 Trino 不一样。它最核心的生命周期对象是 query。一次查询从提交到结束，会经历一整套状态变化，这条链直接决定：

- 用户在什么时候感知到“查询慢”。
- 资源在什么时候开始占用。
- 失败和重试发生在哪一层。
- 哪些现象属于 planning，哪些属于 running。

所以理解 Trino 生命周期，首先要把注意力从“表长期怎么演化”切换到“查询一次次怎么流动”。

## 第一步：提交与资源组归属
查询进入系统后，第一件重要的事往往不是执行，而是被分配到哪个资源组。这个阶段要回答：

- 这条查询属于哪个租户、用户、来源或工作负载。
- 是否进入了预期的 resource group。
- 是立即执行，还是先进入队列等待。

因此很多“查询一开始就慢”的问题，其实已经在生命周期的入口阶段决定了。

## 第二步：Planning 生命周期
真正进入 planning 后，Coordinator 会经历：

1. SQL 解析。
2. 语义分析。
3. metadata 获取。
4. 计划优化。
5. stage/task 生成。

这时候 planning time 如果异常高，说明问题很可能还在控制面、metadata 或优化器前半段，而不是 Worker 运行阶段。

## 第三步：Running 生命周期
进入 running 阶段后，生命周期的主角开始从 Coordinator 转到 Worker：

- task 被调度到具体节点。
- split 被实际消费。
- stage 之间通过 exchange 流动。
- query 在执行中可能遇到内存、阻塞、长尾、Worker 失败等问题。

这阶段的关键不是“查询是不是还在跑”，而是“跑得最慢的 stage/task 到底为什么慢”。

## 第四步：完成、失败与取消
查询结束有三条主线：

- 正常完成：结果返回，资源释放。
- 失败：可能是语义错误、权限错误、Worker 失败、connector 错误或底层系统异常。
- 取消：由用户、治理策略或运维动作终止。

这三类结束状态的排障路径完全不同。把它们都叫“查挂了”，通常不够专业。

## 第五步：重试生命周期只在特定模式下成立
默认情况下，Worker 故障往往会导致 query 失败。只有在 fault-tolerant execution 启用后，生命周期才会多出“可重试阶段”：

- `QUERY` retry 更适合小查询主导的环境。
- `TASK` retry 更适合大批量查询，但要求 exchange manager 和 connector 支持。

所以“重试是不是理所当然”在 Trino 里本身就是一个生命周期边界题。

## 现场看生命周期时最该看什么
1. queued time：判断是不是治理或资源组问题。
2. planning time：判断是不是 metadata 或优化器阶段问题。
3. stage/task 分布：判断是不是执行阶段长尾。
4. retry/failed 信息：判断是不是进入了容错执行边界。

## 本页结论
Trino 的生命周期本质上是 query 的生命周期：提交、归组、planning、running、finished/failed/retried。只要先按这个顺序看，很多“查询为什么慢、为什么挂、为什么没重试”的问题都会自然收敛。


### 生命周期证据应该怎样读
比起抽象地说“查询在跑”，更有价值的是知道每个阶段该看什么证据。queued time 长，通常说明资源组或准入边界在起作用；planning time 长，通常意味着 metadata、优化器或 connector 前半程有阻塞；running time 长，则要继续拆 stage、task、exchange 和 blocked reason。这样读生命周期，才能把“慢”切回真正的阶段。

```yaml
query_timeline:
  queued_ms: 18000
  planning_ms: 2400
  running_ms: 93000
  retry_policy: NONE
  dominant_stage: stage_7
```

像这个样例里，第一眼应该先看到 queued 很长，再决定要不要先回到 resource group，而不是直接去怀疑 Worker CPU。

### ??? queued?planning?running ????????
???????????????????????????????????? queued?planning?running ?????????????queued ???????????planning ??? Coordinator?metadata ?????running ????? Worker?stage?exchange ? task ??????????????????????????????????? metadata ???? CPU ???

????????????????????????????????????????
