---
kb_id: bigdata/flink/data-stream-basics-source-sink-partitioning-and-serialization
title: Flink DataStream 基础能力
description: 解释 Flink DataStream 的 source、sink、partitioning、序列化和低级数据流控制边界。
domain: bigdata
component: flink
topic: data-stream-basics-source-sink-partitioning-serialization
difficulty: intermediate
status: reviewed
sidebar_position: 5
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-async-io
  - flink-working-with-state
  - flink-docs-home
  - flink-kafka-connector
claim_ids:
  - flink-claim-0037
  - flink-claim-0041
  - flink-claim-0068
  - flink-claim-0069
  - flink-claim-0073
  - flink-claim-0074
  - flink-claim-0092
  - flink-claim-0093
  - flink-claim-0094
  - flink-claim-0095
  - flink-claim-0096
  - flink-claim-0097
  - flink-claim-0098
  - flink-claim-0099
  - flink-claim-0100
tags:
  - flink
  - datastream
  - source
  - sink
  - async-io
  - serialization
  - knowledge-base
---

## 这页看的是 DataStream 的“骨架”
如果说 state 页回答“数据到了之后怎么记住”，那这一页回答的是“数据从哪里来、怎么分发、怎么出去、哪里不能乱改”。

## 三个最基础的边界
| 组件 | 核心职责 | 关键边界 |
| --- | --- | --- |
| Source | 把外部数据变成 Flink 内部记录 | 是否可回放、是否可对齐 checkpoint |
| Operator | 做转换、聚合、异步访问、路由 | 是否会破坏顺序、是否引入状态 |
| Sink | 把结果写到外部系统 | 是否支持提交、幂等或事务 |

## source 的真正问题不是“读出来”
source 的关键不是把数据“读到”，而是把“读到哪儿了”也一起纳入容错边界。

- 可回放 source 才能和 checkpoint 形成完整恢复链路。
- 需要 exactly-once 的 source，必须把发记录和更新状态做成原子动作。
- 对 Kafka 这类分区源，parallelism 大于分区数时，不能指望系统自动帮你把 watermark 问题处理掉。

## sink 的真正问题不是“写出去”
sink 的关键不是把结果“发出去”，而是让“发出去的结果”在恢复后不变形。

- 只要 sink 不参与 checkpoint，端到端 exactly-once 就不成立。
- KafkaSink 的 EXACTLY_ONCE 依赖事务和 checkpoint 协调。
- 许多外部系统只能保证 at-least-once，业务层就要自己承担去重或幂等设计。

## async I/O 为什么属于 DataStream 基础能力
```mermaid
flowchart LR
  In["Record"] --> Req["Async Request"]
  Req --> Wait["In-flight Waiting"]
  Wait --> Out["Result"]
```

Async I/O 不是“把代码包一层 future”这么简单，它是在单个并行实例里把外部等待和本地算子推进解耦。这样做的前提是：回调不要阻塞、请求失败要能重试、checkpoint 要能把 in-flight 请求纳入恢复。

## 这几个边界最常考
- `AsyncFunction` 不是多线程并行执行本体。
- ordered 和 unordered 不是“一个对一个错”，是顺序和延迟的权衡。
- event time 下，watermark 也会影响 async 结果的可见顺序。
- async operator 不能随便和 source 串在一起链式执行。

## partitioning 不能只当成“分流”
分区不是只为了“平均摊一摊”，而是为了控制：
- key 是否始终落到同一个状态单元。
- 哪些记录需要经过 shuffle。
- 下游窗口、join、聚合是否还能保持可恢复语义。

## 序列化也是边界
如果对象类型、Kryo、schema evolution 混在一起不分，最常见的后果就是：
- 旧状态恢复失败。
- savepoint 无法迁移。
- 字段变了但 key 语义也跟着变了。

## 最小检查点
1. source 能不能回放。
2. sink 能不能提交或幂等。
3. async 是否会阻塞 callback。
4. partitioning 是否破坏 state locality。
5. 序列化是否支持后续升级。

### 来源

`flink-async-io`、`flink-working-with-state`、`flink-docs-home`、`flink-kafka-connector`

### 事实声明

`flink-claim-0037`、`flink-claim-0041`、`flink-claim-0068`、`flink-claim-0069`、`flink-claim-0073`、`flink-claim-0074`、`flink-claim-0092`、`flink-claim-0093`、`flink-claim-0094`、`flink-claim-0095`、`flink-claim-0096`、`flink-claim-0097`、`flink-claim-0098`、`flink-claim-0099`、`flink-claim-0100`
