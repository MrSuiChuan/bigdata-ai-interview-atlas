---
kb_id: bigdata/flink/deployment-high-availability-resource-model
title: Flink 部署、高可用与资源模型
description: 解释 Flink 的部署形态、高可用边界、JobManager 与 TaskManager 的职责、slot 共享与资源分配逻辑。
domain: bigdata
component: flink
topic: deployment-high-availability-resource-model
difficulty: intermediate
status: reviewed
sidebar_position: 4
version_scope: Flink 2.2 stable docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - flink-architecture-doc
  - flink-docs-home
  - flink-state-backends-ops
claim_ids:
  - flink-claim-0022
  - flink-claim-0023
  - flink-claim-0024
  - flink-claim-0025
  - flink-claim-0026
tags:
  - flink
  - deployment
  - ha
  - slot
  - resource
  - knowledge-base
---

## 这页只回答一个问题
Flink 在集群里到底是怎么“分工干活”的，为什么 JobManager、TaskManager、slot、state backend 不能混着理解。

## 先分清三层
| 层 | 负责什么 | 不是 |
| --- | --- | --- |
| JobManager | 调度、checkpoint 协调、恢复编排 | 不直接执行每条记录 |
| TaskManager | 运行 task、持有 slot、交换数据 | 不等于 JVM 数量，也不等于 CPU 核数 |
| slot | 资源调度单元，主要隔离 managed memory | 不是严格的 CPU 隔离边界 |

JobManager 负责把逻辑图变成可执行图，并在失败时决定恢复范围。TaskManager 真正跑算子、发网络包、写中间数据。slot 则是 TaskManager 上用于装载 task 的资源抽象，最容易被误解成“一个 slot 就是一颗 CPU”，这在 Flink 里并不成立。

## slot sharing 为什么重要
```mermaid
flowchart LR
  A["Source"] --> B["Map"]
  B --> C["KeyBy"]
  C --> D["Window"]
  D --> E["Sink"]
  B -. slot sharing .- C
  C -. slot sharing .- D
```

默认情况下，同一 job 的多个 subtask 可以共享 slot。它带来的意义不是“省几个容器”，而是把一条数据链尽量放进更少的 slot 里，减少跨线程、跨网络边界的开销。

## 为什么 parallelism 不能只看算子数
真正决定资源需求的，通常是这几个边界：
- 链路里最宽的那个 parallelism。
- 是否发生了大量 shuffle。
- 是否有高成本 state 或大对象缓存。
- 是否需要单独隔离某些 source、sink 或外部连接。

所以“算子很多”不等于“slot 一定很多”，而“只有一个算子”也不等于“资源一定少”。

## state backend 在这里扮演什么角色
| backend | 更像什么 | 主要代价 |
| --- | --- | --- |
| Heap/HashMap 风格 | 把 state 放内存里 | 更快，但受堆内存限制明显 |
| RocksDB 风格 | 把 state 放到本地磁盘支持的外部存储结构里 | 更能扛大状态，但序列化和访问成本更高 |

这不是“哪个好”的问题，而是“状态规模、恢复速度、内存压力、磁盘 IO”之间的平衡。

## 高可用要看什么
Flink 的高可用不是只靠“重启一下就行”，而是要同时看：
1. JobManager 故障后能否重新选主。
2. checkpoint 元数据是否还能找到。
3. 状态是否还能从一致点恢复。
4. 外部 source/sink 是否支持继续对接。

如果只有计算层恢复，而外部元数据和数据边界没有配合，作业最多只能算“活回来了”，不一定算“正确恢复了”。

## 生产里最容易错的判断
- 把 slot 当成 CPU 绑定。
- 把 TaskManager 数量当成并行度。
- 把 state backend 当成纯性能开关。
- 把高可用等同于“自动重启”。

## 你应该看哪些证据
- JobManager 和 TaskManager 日志。
- Web UI 里的并行度、slot 占用和失败区域。
- state backend 类型、state size、checkpoint 时长。
- 资源队列和外部部署环境的限制。

## 为什么部署层不是纯运维问题
部署方式会直接影响恢复边界和资源边界。

比如同样是高可用集群，JobManager 选主、存储可达性、外部 checkpoint 目录和资源池配置不同，最终会影响“失败后到底能不能回到一致点”。所以部署不是“把机器开起来”，而是把恢复前提搭出来。

## 一句话检查点
如果你能说清“谁调度、谁执行、谁装 state、谁决定恢复边界”，这页就算过关。

### 来源

`flink-architecture-doc`、`flink-docs-home`、`flink-state-backends-ops`

### 事实声明

`flink-claim-0022`、`flink-claim-0023`、`flink-claim-0024`、`flink-claim-0025`、`flink-claim-0026`
