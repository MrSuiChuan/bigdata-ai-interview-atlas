---
kb_id: bigdata/trino/architecture-and-roles
title: Trino 架构分层与角色协作
description: 解释 Coordinator、Worker、Catalog、Connector 与客户端在查询生命周期中的分工与协作。
domain: bigdata
component: trino
topic: architecture-and-roles
difficulty: advanced
status: reviewed
sidebar_position: 3
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-docs
  - trino-architecture-docs
  - trino-connector-docs
claim_ids:
  - bigdata-trino-claim-0002
  - bigdata-trino-claim-0003
  - bigdata-trino-claim-0004
  - bigdata-trino-claim-0005
tags:
  - trino
  - architecture
  - coordinator
  - worker
  - connector
  - knowledge-base
---
## 先按控制面、执行面和边界适配面理解 Trino
Trino 的架构不能只说成“一个 Coordinator 加很多 Worker”。更稳的理解方式是把它拆成三层：

1. 控制面：`Coordinator` 负责接收查询、生成计划、切分阶段、调度任务和汇总结果。
2. 执行面：`Worker` 负责执行 task，处理 split，运行 operator，并与其他 Worker 交换中间数据。
3. 边界适配面：`Catalog` 和 `Connector` 负责把外部系统接入 Trino，让引擎知道如何读元数据、拆 split、做 pushdown 和执行写入。

只要这三层分清，就不容易把“引擎能力”和“数据源能力”混在一起。

## Coordinator 为什么是 Trino 的真实控制面
Coordinator 不只是一个 SQL 网关。它承担的是真正的控制责任：

- 解析 SQL 语法并做语义分析。
- 解析 catalog、schema、table、column 等对象引用。
- 向 connector 请求元数据、统计信息和 split。
- 生成逻辑计划与分布式物理计划。
- 切分 stage、创建 task，并调度到 Worker 上执行。
- 收集结果页并返回给客户端。

因此 Coordinator 的压力不只是网络入口压力，还包括规划、调度、元数据和结果汇总压力。很多“查询刚开始就慢”的问题，未必是 Worker 算不动，而可能是 Coordinator 还在 planning、等待 metadata 或资源组排队。

## Worker 不是被动算子节点，而是分布式执行单元
Worker 负责真正的数据面动作。它会：

- 运行 task。
- 读取分配给 task 的 split。
- 在 driver 和 operator 链里完成过滤、投影、聚合、join、排序等操作。
- 和其他 Worker 通过 exchange 交换中间结果。
- 受内存、网络、spill、数据倾斜和 connector 读取能力影响。

所以当线上出现长尾 stage、task skew、内存峰值、blocked reason、Worker lost 等问题时，真正要分析的往往是 Worker 上的执行状态，而不是只看 Coordinator 是否“还活着”。

## Catalog 和 Connector 是架构边界，不是附属插件
很多人第一次学 Trino 时，会把 connector 当成“数据库驱动”。这个理解太浅。更准确地说：

- `catalog` 是一组命名配置，决定查询中某个名字空间映射到哪个数据源。
- `connector` 是实现该数据源行为的适配层，决定 metadata、split、pushdown、统计信息和写入语义如何暴露给 Trino。

因此 connector 不只是“让你连上数据源”，而是直接定义了 Trino 在那个数据源上的能力边界。

## 客户端请求是怎么在这些角色之间推进的
一条典型查询路径可以按下面顺序理解：

1. 客户端把 SQL 提交给 Coordinator。
2. Coordinator 识别 SQL 中引用的 catalog 和 table。
3. 对应 connector 提供 metadata、stats 和 split。
4. Coordinator 把分布式计划切成 stage 和 task。
5. Worker 执行 task 并消费 split。
6. 中间结果通过 exchange 在 stage 之间流动。
7. 最终结果返回到 Coordinator 再交给客户端。

这条路径最大的价值，是把“谁负责接请求”“谁负责决定能力”“谁负责真正算”分开。

## 角色失效时的影响差异
不同角色出问题，表现并不一样：

- Coordinator 出问题：新查询无法正常规划或调度，结果汇总链也会受到影响。
- Worker 出问题：正在执行的 task 失败，默认情况下查询可能整体失败；开启容错执行后才可能重试。
- Connector 或底层元数据系统出问题：表现为 planning 卡住、metadata 获取慢、pushdown 消失、读取失败或写入失败。

所以线上诊断时不能只按“节点坏了没”分类，而要先判断坏的是控制面、执行面还是边界适配面。

## 本页结论
Trino 的架构核心不是“有很多 Worker”，而是“Coordinator 统一控制、Worker 分布执行、Catalog/Connector 明确边界”。只有把这三层讲清，后面的性能、治理和恢复问题才有落点。


### 一条最小观察链
如果你要快速判断一条查询到底卡在控制面、执行面还是 connector 边界，最实用的做法是按下面顺序看证据：先看 queued time 和 planning time，判断查询是不是还停在 Coordinator 侧；再看 stage 和 task 分布，判断是不是已经进入 Worker 执行阶段；最后看对应 catalog 的 connector 日志与 pushdown 表现，判断是不是边界适配层把性能或能力拖住了。这个顺序能把同样表现为“慢”的问题切成不同责任层。

```sql
EXPLAIN SELECT orderkey
FROM lake.sales.orders
WHERE ds = DATE '2026-05-01';
```

像这样一条最小查询，真正有价值的不是 SQL 本身，而是看 Coordinator 是否拿到了合理的 layout、Worker 是否接到了足够细粒度的 split，以及过滤有没有在 connector 边界提前生效。

