---
kb_id: bigdata/spark/shuffle-map-output-fetch-failure-and-stage-resubmit-boundaries
title: Spark Shuffle 拉取失败与 Stage 重提
description: 解释 Spark Shuffle 拉取失败与 Stage 重提如何发现故障、隔离影响、重建状态和恢复服务，并说明生产验证与风险边界。
domain: bigdata
component: spark
topic: shuffle-map-output-fetch-failure-stage-resubmit-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 18
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-rdd-guide
  - spark-dagscheduler-source
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-dataset-javadoc
  - spark-job-scheduling
claim_ids:
  - spark-claim-0014
  - spark-claim-0024
  - spark-claim-0078
  - spark-claim-0079
  - spark-claim-0096
  - spark-claim-0097
  - spark-claim-0098
  - spark-claim-0099
  - spark-claim-0100
  - spark-claim-0101
tags:
  - spark
  - shuffle
  - fetch-failure
  - dagscheduler
  - fault-tolerance
  - knowledge-base
  - production
---
## FetchFailed 暴露的是 Shuffle 输出可用性边界
Fetch failure 是理解 Spark shuffle 容错的关键入口。下游 reduce 侧 task 需要读取上游 map 侧 task 产生的 shuffle block，如果这些 block 因 executor 丢失、磁盘清理、网络问题或 shuffle 服务异常不可用，下游 task 会失败并把 FetchFailed 信息反馈给 DAGScheduler。Fetch failure 不只是网络报错，它可能意味着上游 stage 已经完成但物化输出丢失。

## Map Output、BlockManager、MapOutputTracker 与 FetchFailed
| 对象 | 作用 | 失败影响 |
| --- | --- | --- |
| ShuffleMapStage | 产生 map output | 输出丢失时需要重提 |
| MapOutputTracker | 记录 shuffle map output 位置 | 位置过期或丢失会影响下游读取 |
| Reduce Task | 拉取上游 block 并执行下游计算 | fetch failed 会触发 task/stage 失败处理 |
| DAGScheduler | 处理 CompletionEvent 和 FetchFailed | 判断 lost stage 并重新提交 |

## 下游 Task 如何定位并拉取上游 Shuffle Block
上游 shuffle map task 完成后，会在 executor 本地写出 shuffle block，并把位置信息汇报给 Driver。DAGScheduler 记住哪些 ShuffleMapStage 已经产生输出，后续 job 可以复用这些输出，而不用每次重算上游。但这些输出不是外部可靠存储，executor 丢失、本地磁盘清理或 shuffle 服务不可用，都可能让 map output 位置失效。

## Stage Finished 不等于 Shuffle 输出永久可靠
当下游 task 拉取某个 shuffle block 失败时，Spark 会把失败包装为 FetchFailed 或 ExecutorLost 等事件传回 DAGScheduler。DAGScheduler 会标记相关 map output 不可用，并在必要时重新提交产生这些输出的 stage。stage 可能被多个 job 共享，Stage Finished 不等于其所有物理输出永久可靠。

## Fetch Failure 要同时看网络、磁盘和 Executor 生命周期
优先收集 Driver 日志中的 FetchFailed、executor lost reason、Stages 页面 retry 次数、shuffle read blocked time、executor 磁盘错误、external shuffle service 日志、节点维护事件和 dynamic allocation 回收日志。大量 fetch failure 通常指向集群稳定性、executor 频繁丢失、磁盘压力、网络抖动或 shuffle 服务配置问题。

## 示例：最小可观察入口
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-plan-demo").getOrCreate()
df = spark.range(0, 10000).select((F.col("id") % 100).alias("k"), F.col("id"))
result = df.repartition(8, "k").groupBy("k").count()
result.explain("formatted")
print(result.orderBy("k").take(5))
spark.stop()
~~~

## 重提 Stage、保留 Shuffle 与降低重分布成本
如果 executor 因内存或容器限制被杀，fetch failure 是结果不是根因；如果节点磁盘清理了 shuffle 文件，重提 stage 也可能反复失败；如果 dynamic allocation 过早回收持有 shuffle 输出的 executor，需要检查 shuffle tracking 或 external shuffle service 方案。

## 依据与版本边界
本页依据 Spark RDD Guide、DAGScheduler 源码登记说明和 Job Scheduling 文档。具体重试次数、等待时间和 shuffle 服务行为受版本与部署配置影响。
