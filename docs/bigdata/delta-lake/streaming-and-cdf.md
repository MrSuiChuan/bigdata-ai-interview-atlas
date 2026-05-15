---
kb_id: bigdata/delta-lake/streaming-and-cdf
title: Delta Lake 流处理、CDF 与增量消费边界
description: 解释 Delta Lake 流式读写、Change Data Feed、最新 Schema 边界、慢消费者风险和幂等写入要点。
domain: bigdata
component: delta-lake
topic: streaming-and-cdf
difficulty: advanced
status: reviewed
sidebar_position: 11
version_scope: Delta Lake docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-streaming
  - delta-lake-cdf
  - delta-lake-batch
  - delta-lake-column-mapping
claim_ids:
  - bigdata-delta-claim-0014
  - bigdata-delta-claim-0015
  - bigdata-delta-claim-0016
  - bigdata-delta-claim-0017
  - bigdata-delta-claim-0018
  - bigdata-delta-claim-0023
  - bigdata-delta-claim-0045
tags:
  - delta-lake
  - streaming
  - cdf
  - foreachBatch
  - knowledge-base
  - production
---
## 流处理题的核心不是“能不能 readStream”，而是“提交序列如何被消费”
Delta Lake 的流处理能力之所以重要，是因为它把批和流都统一到了同一份事务日志之上。流读不是去目录里盲扫新文件，而是沿着表提交序列推进；CDF 也不是随手比对两次快照，而是基于表变化生成结构化变更记录。

## Streaming source 先吃全量，再跟增量
官方 streaming 文档给出的关键事实是：把 Delta 表作为 streaming source 时，系统会先处理当前表的全量快照，然后再持续处理新的提交。即使显式指定了 `startingVersion` 或 `startingTimestamp`，流使用的 Schema 也始终是“当前最新表 Schema”，而不是历史某个版本自己的旧 Schema。

这条边界很重要，因为它直接解释了两类现象：

1. 为什么旧版本数据在回放时仍要受当前 Schema 解释约束。
2. 为什么 Schema 演进会和流作业重启紧密耦合。

## 慢消费者风险不是理论问题，而是保留期边界
Delta 的 streaming source 还有一个很锋利的边界：如果流作业滞后过久，源表对应的日志条目被 `logRetentionDuration` 清理掉，读取可能从最新可用历史继续，而不是自动失败修复。结果就是数据可能被跳过。

这意味着慢流不是“晚点追上就好”，而是可能真实丢历史。生产里必须把三件事一起管理：

1. 源表日志保留期。
2. 流作业最大允许滞后时间。
3. 故障恢复后的补数与校验机制。

## CDF 解决的是“增量变化语义”，不是“自己写 diff”
Change Data Feed 默认不开启。开启后，Delta 会记录行级 insert、update、delete 变化，可以用 batch 或 streaming 方式读取。对于需要下游 CDC、维表同步、变更审计和增量派生表的场景，CDF 的价值很高，因为它提供的是“结构化变更语义”，而不是“自己比较两次快照猜谁变了”。

同时也要记住两个边界：

- 变更数据可能保存在 `_change_data` 目录。
- `VACUUM` 会把这些 CDF 文件一并清理。

所以 CDF 的可回放窗口不是无限的，它同样受保留策略限制。

### 流和 CDF 为什么必须放在同一张设计图里
很多团队会把 streaming source 和 CDF 当成两个互不相干的专题，一个负责“持续读表”，一个负责“读取变化”。但对 Delta 来说，它们都建立在同一条提交历史之上，也都同时受 Schema、保留窗口和客户端兼容性影响。只要这一层没有统一设计，下游迟早会出现“有人按快照理解表，有人按变更理解表”的语义分裂。

更进一步说，流和 CDF 最终服务的往往也是同一套下游治理目标：谁负责持续消费当前表状态，谁负责消费变化事件，谁负责在恢复时补齐断档。把这些角色在设计时说清，下游体系才不会在同一张表上出现多套互相冲突的消费语义。

## `foreachBatch` 不是天然幂等
`foreachBatch` 非常常见，但官方文档明确指出它默认不是幂等的。要让它在重试时避免重复写表，需要配合 `txnAppId` 和 `txnVersion` 这些 writer options。

这件事的根本原因在于：流处理失败重启不是异常边角，而是日常事件。只要没有明确批次标识和去重策略，重复执行同一批次就会重复落表。

下面是最小示例：

~~~python
def write_batch(df, batch_id):
    (
        df.write.format("delta")
        .mode("append")
        .option("txnAppId", "orders_stream")
        .option("txnVersion", str(batch_id))
        .save("/data/delta/orders")
    )

query = (
    spark.readStream.table("bronze_orders")
    .writeStream.foreachBatch(write_batch)
    .option("checkpointLocation", "/chk/orders")
    .start()
)
~~~

## Schema 变更和列映射会放大流风险
Schema 更新会让读取该表的流终止并需要重启；如果表还启用了 column mapping，那么非新增型 Schema 变化对 Structured Streaming 的要求更高，需要 schema tracking 才能安全继续。再加上 column mapping 还可能影响某些 CDF 场景，这就意味着：

- 活跃流表不能把 Schema 变更当成无感操作。
- 启用 column mapping 前必须盘点所有流式读者。
- CDF 和 streaming 要一起评估，而不是分开看。

## CDF 最小使用示例
~~~python
changes = (
    spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", 10)
    .table("silver.orders")
)
~~~

真正要观察的是：起始版本是否仍在保留窗口内；表是否开启了 CDF；下游是否能正确处理 update / delete 事件，而不只是 insert。

## 本页结论
Delta 的流处理能力，本质上是“让流围绕表提交历史推进”；CDF 的价值，本质上是“给出结构化变更语义”。真正深入的回答，必须能说清全量到增量的切换、最新 Schema 边界、慢消费者的日志保留风险，以及 `foreachBatch` 为什么必须额外处理幂等。

## 来源与事实边界
本页以 Delta Streaming、CDF、Batch 和 Column Mapping 文档为边界。具体 sink 类型和运行时 checkpoint 细节会因引擎配置不同而变化，但提交序列、保留窗口和幂等边界不应变化。
