---
kb_id: bigdata/kafka/partition-reassignment-and-throttling
title: Kafka 分区迁移、副本节流与 Preferred Leader 调整
description: 解释分区重分配如何迁移副本，为什么需要 throttle，以及 leader 均衡和副本均衡的区别。
domain: bigdata
component: kafka
topic: partition-reassignment
difficulty: advanced
status: reviewed
sidebar_position: 35
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-basic-operations
  - kafka-docs-home
claim_ids:
  - kafka-claim-0033
  - kafka-claim-0034
  - kafka-claim-0036
  - kafka-claim-0035
tags:
  - kafka
  - partition-reassignment
  - replica-throttle
  - preferred-leader
  - operations
  - knowledge-base
---
## 分区迁移、副本节流与 Preferred Leader 调整

Kafka 分区迁移用于扩容、下线 broker、均衡磁盘或调整副本分布。它迁移的是 partition replica 的放置，不会重新计算历史 record 的 key 分布。分区迁移和 preferred leader 调整也不同：前者改变副本位置，后者调整哪个副本承担 leader 读写入口。

增加分区不会重分布旧数据，也不能减少分区数。副本迁移会消耗网络和磁盘，未限流时可能影响前台 produce/fetch；限流过低又会让迁移时间过长。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Replica Assignment | partition replicas 在 broker 上的放置 | 决定容灾和磁盘分布 |
| Reassignment Plan | 目标副本分布计划 | 用于扩容或迁移 |
| Throttle | 限制迁移复制带宽 | 保护前台业务 |
| Preferred Leader | 副本列表中理想 leader | 用于长期 leader 均衡 |
| ISR Catch-up | 迁移副本追赶 leader 日志 | 决定何时迁移完成 |

## 一次副本重分配的生产链路

1. 根据 broker 磁盘、机架和 topic 负载生成 reassignment plan。
2. 提交计划后，新副本开始从 leader 复制历史日志。
3. 复制过程受 throttle 控制，避免压垮网络和磁盘。
4. 新副本追上后加入 ISR。
5. 旧副本被移除，assignment 达到目标状态。
6. 必要时执行 preferred leader election 恢复 leader 分布。

## 图解：一次副本重分配的生产链路

```mermaid
flowchart LR
  Plan["Reassignment Plan"] --> Add["Add New Replicas"]
  Add --> Copy["Replica Copy with Throttle"]
  Copy --> ISR["Catch up and join ISR"]
  ISR --> Remove["Remove Old Replicas"]
  Remove --> Leader["Preferred Leader Election"]
```

## 核心机制拆解

- 副本迁移本质是复制已有 partition log，不改变 record offset。
- preferred leader election 处理读写入口均衡，不等于磁盘数据迁移。
- controlled shutdown 能在计划维护时迁移 leader，减少不可用。

## 性能和容量观察

- 迁移期间网络、磁盘和 page cache 都会承压。
- 大量 partition 同时迁移会放大 ISR 波动和客户端延迟。
- leader 不均衡会让某些 broker 产生热点，即使副本总数均匀。

## 生产排障入口

- 迁移前后比较 broker 磁盘、leader 数和 partition 数。
- 迁移慢时看 throttle、网络、磁盘和新副本 lag。
- 迁移后写入仍然热点时检查 leader 是否均衡。

## 生产观察指标

- 迁移前后每个 broker 的 partition 数、leader 数、磁盘占用和网络带宽。
- reassignment 任务进度、新副本 lag、ISR 变化和 URP。
- throttle 配置是否保护了前台 produce/fetch 延迟。
- 迁移完成后 preferred leader 是否仍然集中在少数 broker。

## 常见误区

- 把副本均衡误认为 leader 均衡。
- 迁移批次过大导致复制流量挤占生产消费流量。
- 以为迁移会改变历史数据 key 分布。
- 迁移完成后不做 leader 和热点 partition 复核。

## 可执行观察示例

```bash
kafka-reassign-partitions.sh --bootstrap-server broker:9092 --reassignment-json-file plan.json --execute
kafka-reassign-partitions.sh --bootstrap-server broker:9092 --reassignment-json-file plan.json --verify
```

## 设计取舍和边界

- 迁移批次越大，完成越快但业务风险越高。
- 节流越严格越安全，但窗口越长。
- 提前规划分区和机架放置比事后大规模迁移更低风险。

## 变更前后的验收口径

分区迁移完成不代表变更完成。验收时至少要同时确认四件事：第一，目标副本分布已经生效，旧副本不再占用预期迁出的 broker；第二，所有相关 partition 的 ISR 已恢复到预期副本集合；第三，leader 分布没有重新集中到少数 broker；第四，迁移期间和迁移后 producer、consumer 的请求延迟、错误率和 lag 已经回到基线。

如果迁移目标是下线 broker，还要确认没有残留 replica、没有内部 topic 被遗漏、没有 Connect、Streams 或 MirrorMaker 等应用继续依赖旧 broker 地址。生产环境中，副本迁移通常应和客户端发布、topic 扩分区、broker 下线分开窗口执行，避免多个变量同时变化导致事故归因困难。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-basic-operations`

### 事实声明

`kafka-claim-0033`、`kafka-claim-0034`、`kafka-claim-0036`、`kafka-claim-0035`
