---
kb_id: bigdata/flink/keyed-state-and-key-groups
title: Flink Keyed State 与 Key Group
description: 解释 Flink Keyed State 与 Key Group中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: flink
topic: keyed-state-and-key-groups
difficulty: advanced
status: reviewed
sidebar_position: 3
version_scope: Flink 2.2 docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - flink-stateful-stream-processing
  - flink-working-with-state
  - flink-docs-home
claim_ids:
  - flink-claim-0003
  - flink-claim-0004
  - flink-claim-0005
  - flink-claim-0018
  - flink-claim-0019
tags:
  - flink
  - keyed-state
  - key-groups
  - rescale
  - knowledge-base
  - production
---

## Keyed State 的本质是状态放置规则
`keyBy` 不是简单的分组 API。它把同一个 key 的数据路由到同一个逻辑分区，并让该 key 对应的状态可以在本地读写。这样状态更新不需要跨节点事务协调。

## key、key group 和 parallelism 的关系
```mermaid
flowchart LR
  Key["业务 key"] --> KG["Key Group"]
  KG --> Subtask["并行 subtask"]
  Subtask --> State["本地 keyed state"]
```

Key group 是 Flink 重新分配 keyed state 的原子单位。最大并行度决定 key group 的数量，运行时并行度决定这些 key group 被分到哪些 subtask 上。

这一点解释了两个常见现象：第一，扩缩容时状态不是随机搬迁，而是按 key group 重新映射；第二，最大并行度一旦设计得太小，未来并行度提升会被结构性限制。

## 为什么 rescale 能搬状态
Flink 恢复或扩缩容时，不是按“每个 key 单独搬一次”来做，而是按 key group 切分状态。这样能在并行度变化时重新把 key group 分配给新的 subtask。

如果某些 key 非常热，即使 key group 能被平均分给不同 subtask，也仍然可能出现运行时热点。key group 解决的是状态切分和恢复映射问题，不自动解决业务 key 倾斜。

## State API 看起来简单，但边界很硬
| 状态类型 | 典型用途 |
| --- | --- |
| ValueState | 每个 key 一个值 |
| ListState | 每个 key 一组值 |
| MapState | 每个 key 一个 map |
| ReducingState | 增量归约 |
| AggregatingState | 增量聚合并转换输出类型 |

这些状态只能在 KeyedStream 上使用。没有 `keyBy`，就没有当前 key 的 keyed state 访问边界。

## 生产问题通常不是“状态怎么写”
更常见的问题是：

- key 分布倾斜导致某些 subtask 状态特别大。
- 最大并行度设置不合理，后续扩缩容受限。
- state serializer 或 schema 变化影响恢复。
- 状态太大导致 checkpoint 和恢复时间变长。

## key 设计要提前想清楚
好的 key 能让状态本地化、负载均匀、恢复可控；坏的 key 会让某个 subtask 变成单点热点。比如按 `user_id` 聚合通常比按 `country` 聚合更容易分散，但如果某个超级用户产生海量事件，也仍然需要拆 key 或引入二级聚合。

## 观察指标
1. 每个 subtask 的 state size。
2. 每个 subtask 的输入速率。
3. checkpoint 对齐和写出时间。
4. 恢复后 key group 分布。
5. 热 key 是否集中在少数 subtask。

## 一个 key 倾斜例子
假设实时统计商品浏览量，按 `category_id` 做 key 可能只有几十个类别，热点类目会把状态和计算集中到少数 subtask。按 `item_id` 做 key 则更细，但如果还要输出类目级结果，就需要再做一次聚合或设计两阶段聚合。

这种取舍说明：key 不只是业务字段选择，还是负载分布、状态规模和恢复效率的共同设计。

## 什么时候要谨慎改 key
- 已经有线上 savepoint 或 checkpoint 需要恢复。
- 下游语义依赖旧 key 的聚合边界。
- key 类型或字段变化会影响状态分区。
- 旧状态需要迁移或合并。

## 最小代码示意
```java
ValueStateDescriptor<Long> desc =
    new ValueStateDescriptor<>("lastSeen", Long.class);

ValueState<Long> lastSeen =
    getRuntimeContext().getState(desc);
```

## 判断是否理解到位
能把 keyed state 讲清楚的人，通常能说清三个问题：

1. 状态为什么是本地访问。
2. 扩缩容时状态为什么能重分配。
3. key group 为什么比单个 key 更适合作为搬迁单位。

## 来源与事实边界
本页只依赖当前知识库登记的官方 source 和 claim。关于最大并行度、key group 数量和状态类型 API，应以当前 Flink 版本官方文档为准。

### 来源

`flink-stateful-stream-processing`、`flink-working-with-state`、`flink-docs-home`

### 事实声明

`flink-claim-0003`、`flink-claim-0004`、`flink-claim-0005`、`flink-claim-0018`、`flink-claim-0019`
