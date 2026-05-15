---
kb_id: bigdata/spark/scheduler-stage-cut-locality-and-straggler-boundaries
title: Spark 调度、本地性与慢任务边界
description: 解释 Spark 调度、本地性与慢任务边界的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: scheduler-stage-cut-locality-straggler-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 12
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-job-scheduling
  - spark-tuning-guide
  - spark-dagscheduler-source
  - spark-taskscheduler-source
  - spark-rdd-scaladoc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
claim_ids:
  - spark-claim-0006
  - spark-claim-0012
  - spark-claim-0037
  - spark-claim-0078
  - spark-claim-0079
  - spark-claim-0080
  - spark-claim-0081
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
tags:
  - spark
  - scheduler
  - stage
  - locality
  - straggler
  - knowledge-base
  - production
---
## 调度问题要区分 Stage 切分、Locality 和长尾 Task
Spark 调度要把用户的逻辑计算转换成可在 executor 上运行的 task。Stage 切分、本地性选择、慢任务处理和失败重试都发生在这个调度链路中。理解调度，不是记住 Job、Stage、Task 三个名词，而是要解释 Driver 如何把依赖图切开，哪些 task 可以并行，为什么某些 task 会慢，失败后从哪里恢复。

## DAGScheduler、TaskScheduler、Stage 与 Locality
| 对象 | 职责 | 观察入口 |
| --- | --- | --- |
| DAGScheduler | 根据依赖生成 stage DAG，提交可运行 stage，处理 shuffle 输出丢失 | Driver 日志、Spark UI Jobs/Stages |
| TaskScheduler | 把 task 分配给 executor，处理 locality、重试、资源等待 | Spark UI task 列表、executor 日志 |
| Stage | shuffle 边界之间的一组 task | Stages 页面、DAG 图 |
| TaskSet | 同一 stage 的一组 task attempt | task duration、locality、失败原因 |

## 从 Stage DAG 到 Task 分发
窄依赖可以让上游和下游在同一 stage 内按分区流水执行；宽依赖需要重新组织数据，因此形成 shuffle 边界。DAGScheduler 会沿依赖向上追溯，先提交缺失的父 stage，再提交下游 stage。一个 action 通常对应一个 job，但多个 job 可能共享已经完成的 stage。

## Task 重试和 Stage 重提不是同一层恢复
task 失败通常先按 attempt 重试。若失败原因说明上游 shuffle output 丢失，DAGScheduler 会把对应上游 stage 标记为需要重算并重新提交。executor lost、fetch failed、OOM 和用户代码异常，对应的恢复路径不同。恢复保证的是 Spark 计算链路能继续推进，不保证外部副作用不会重复。

## 长尾 Task 应该看分区、数据本地性和资源差异
慢任务可能来自数据倾斜、单分区输入过大、executor 资源不足、GC、磁盘慢、网络抖动、外部系统慢或代码中单条记录处理异常。排障顺序是先看 Jobs，再看 Stages，再看 task duration、input size、shuffle read/write、spill、locality、scheduler delay 和 executor lost。

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

## 数据本地性、并行度与推测执行的取舍
本地性不是绝对目标。如果为了等本地资源导致长时间排队，整体延迟可能更差。推测执行可以缓解部分硬件或节点导致的 straggler，但不能解决系统性倾斜。若瓶颈是单 key 倾斜或单分区过大，资源扩容只能缓解排队，不能消除长尾。

## 依据与版本边界
本页依据 Spark Job Scheduling、RDD Guide、DAGScheduler/TaskScheduler 源码登记来源和 Tuning 文档。调度细节会受部署模式、资源管理器和配置影响。
