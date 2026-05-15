---
kb_id: bigdata/trino/core-objects-state
title: Trino 核心对象与状态所有权
description: 解释 Query、Stage、Task、Split、Catalog、Connector、Driver、Operator 与 Exchange 的职责和状态边界。
domain: bigdata
component: trino
topic: core-objects-state
difficulty: advanced
status: reviewed
sidebar_position: 4
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-architecture-docs
  - trino-connector-docs
  - trino-admin-properties
claim_ids:
  - bigdata-trino-claim-0003
  - bigdata-trino-claim-0004
  - bigdata-trino-claim-0005
  - bigdata-trino-claim-0023
  - bigdata-trino-claim-0024
tags:
  - trino
  - objects
  - query
  - stage
  - task
  - knowledge-base
---
## 学 Trino，先分清“逻辑对象”和“执行对象”
Trino 的对象很多，但并不是都在同一层。最容易学乱的地方，是把 catalog、query、stage、task、split、driver、operator 全都当成同一种“组件名”。更稳的做法，是先按状态层次拆开：

- 边界对象：`catalog`、`connector`、schema、table。
- 查询对象：query、stage、task、split。
- 执行对象：driver、operator、exchange。
- 资源对象：memory pool、resource group、queue。

这样一来，回答时就能说清“谁定义能力、谁承载状态、谁真的在跑”。

## 核心对象一览
| 对象 | 它真正代表什么 | 最该观察什么 |
| --- | --- | --- |
| Catalog | 一个数据源入口配置 | 是否路由到正确 connector、权限和资源边界 |
| Connector | 数据源适配实现 | metadata、split、pushdown、统计信息、写入支持 |
| Query | 一次完整查询生命周期 | 状态、排队、planning、running、finished/failed |
| Stage | 查询中的一个分布式阶段 | 上下游依赖、exchange、并行度 |
| Task | 某个 Worker 上执行的阶段片段 | 长尾、失败、内存、blocked reason |
| Split | 最小扫描工作单元 | 扫描粒度、分布均匀性、数据局部性 |
| Driver | Worker 上的一条执行流水线 | operator 串联、阻塞位置 |
| Operator | 过滤、聚合、join 等具体算子 | CPU、内存、spill、是否成为热点 |
| Exchange | stage 之间的数据交换边界 | 网络量、shuffle 成本、容错存储需求 |

## Query 是生命周期对象，不是单条 SQL 文本
Query 不是“SQL 字符串的另一个名字”。它代表的是从提交、排队、规划、执行到结束的整个生命周期。因此：

- query 失败，不等于 SQL 一定写错。
- query 慢，也不一定是 Worker 算慢，有可能是排队或 planning 慢。
- query 成功，只说明这次执行链结束，不代表 Trino 拥有了外部系统的数据真相。

## Stage、Task、Split 决定并行度和长尾形态
很多 Trino 性能问题都要落到这三个对象上：

1. `Stage` 决定了执行图中必须等待 exchange 的边界。
2. `Task` 决定了具体执行落在哪些 Worker 上。
3. `Split` 决定了最细粒度的扫描并行度和负载均匀性。

如果 split 天然不均匀、底层文件过碎或某个 stage 的 build side 过大，就会直接表现成 task 长尾、stage 等待或 exchange 压力。

## Driver 和 Operator 才是 Worker 内部真正算起来的地方
Worker 不是一个黑盒。真正的数据变换发生在 driver 和 operator 链条里。可以把它理解成：

- split 把扫描工作送进来。
- driver 把一串 operator 串起来执行。
- operator 逐步完成过滤、投影、聚合、join、排序等工作。

因此当查询慢到 task 层还不够解释时，往往要进一步看 operator 是否是瓶颈，例如 build hash 过大、排序占内存、聚合无法下推、exchange 读写过重。

## Catalog/Connector 和 Query/Task 不在同一维度
一个很常见的误区，是把 `catalog` 当成和 stage、task 一样的执行对象。其实它们完全不是一类东西：

- catalog/connector 回答的是“这张表从哪里来，以及 Trino 能对它做什么”。
- query/stage/task/split 回答的是“这次请求如何在集群里执行”。

这两个维度混掉以后，设计题和排障题都会答歪。

## 观察这些对象时该看什么证据
- 讲 catalog/connector：看 connector 文档、权限、pushdown、stats、写入能力。
- 讲 query：看 query state、queued time、planning time、running time。
- 讲 stage/task：看 Web UI、task skew、blocked reason、exchange 开销。
- 讲 operator：看 explain analyze、CPU、内存、spill、build/probe 行为。

## 本页结论
Trino 的对象体系必须分层理解：catalog/connector 负责边界，query/stage/task/split 负责查询执行，driver/operator/exchange 负责真正的数据流动。只有先把对象分层，后面的性能、故障和设计问题才不会答成一锅粥。
