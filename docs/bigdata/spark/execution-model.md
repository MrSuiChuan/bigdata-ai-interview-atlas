---
kb_id: bigdata/spark/execution-model
title: Spark 执行模型
description: 深入解释 Spark 从 action 触发到 Job、Stage、Task、Executor 执行和失败恢复的完整链路。
domain: bigdata
component: spark
topic: execution-model
difficulty: intermediate
status: reviewed
sidebar_position: 2
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-dataset-javadoc
  - spark-job-scheduling
  - spark-docs-home
  - spark-overview-doc
  - spark-sql-guide
  - spark-tuning-guide
claim_ids:
  - spark-claim-0004
  - spark-claim-0005
  - spark-claim-0006
  - spark-claim-0011
  - spark-claim-0012
  - spark-claim-0013
  - spark-claim-0014
  - spark-claim-0017
  - spark-claim-0024
  - spark-claim-0001
tags:
  - spark
  - driver
  - stage
  - task
  - shuffle
  - knowledge-base
  - production
---
## 定位与边界

Spark 执行模型要回答的是：一个看起来像本地集合操作的 DataFrame、Dataset 或 RDD 程序，为什么会被拆成分布式任务，以及这些任务如何被调度、失败后如何恢复。Spark 的核心不是“调用了哪个 API”，而是 Driver 把用户表达的计算转换为可调度的执行图，再把执行图切成可以在 Executor 上并行运行的 Task。

这个边界需要和存储系统、资源管理系统分开。Spark 负责把计算计划拆分、调度、执行和恢复；HDFS、对象存储、Hive Metastore、YARN、Kubernetes 或 Standalone 集群负责提供数据、元数据和资源。Spark 作业成功不代表下游业务事务一定成功，也不代表输出表具备上层业务定义的端到端一致性。

## 从 API 到物理执行

### Action 是执行入口

Spark 的 transformation 默认只记录 lineage 或逻辑计划，直到 action 需要结果时才触发执行。RDD action 会让 Driver 根据 RDD 依赖关系创建 Job；Dataset/DataFrame action 会让 Spark 先优化 logical plan，再生成 physical plan，然后进入统一的调度执行体系。

这意味着一段代码运行慢，不能只看最后一行 action。真正决定代价的是 action 之前积累的依赖图、SQL 逻辑计划、shuffle 边界、数据源扫描规模、缓存状态和输出提交方式。

### Job、Stage、Task 的关系

Job 是一次 action 触发的执行单元。Stage 是调度器根据 shuffle 依赖切出来的阶段：窄依赖可以在同一 stage 内流水执行，宽依赖需要先完成上游 shuffle write，再让下游 stage 拉取 shuffle data。Task 是 stage 内按分区拆出的最小调度单元，通常一个 task 处理一个分区。

因此，“stage 为什么出现”不能只回答“因为有 shuffle”。更准确的说法是：当下游计算需要重新按 key、partitioner 或分布式布局组织数据时，上下游之间出现物化边界；Spark 必须先完成上游 map 输出，再调度下游 reduce 侧读取，这个边界在调度层体现为 stage 切分。

## 调度器内部链路

### DAGScheduler

DAGScheduler 面向 stage。它根据 RDD dependencies 或 physical plan 生成 stage DAG，提交缺失的父 stage，跟踪 map output 是否可用，并在 fetch failure 等场景下决定是否重提上游 stage。它关注的是“哪些 stage 可以运行、哪些 stage 的输出已经成为下游依赖”。

### TaskScheduler

TaskScheduler 面向 task。它把 stage 内 task 交给底层 cluster manager 对应的 executor 运行，处理 task locality、失败重试、推测执行和资源可用性。它关注的是“某个 task 应该放在哪个 executor 上运行、运行失败后如何重试”。

这两个层次不能混在一起。DAGScheduler 的失败通常影响 stage 边界和 shuffle map output；TaskScheduler 的失败通常影响单个 task attempt、executor 可用性和 locality 等调度细节。

## 状态与失败恢复

Spark 的恢复主要依赖三类状态：RDD lineage 或 Dataset logical plan 用于重算；shuffle 中间结果用于避免完全重算；checkpoint 用于截断过长 lineage 或保存流式状态。cache 和 persist 是性能优化，不是永久持久化语义；cache 分区丢失后可以通过 lineage 重算，但重算是否便宜取决于上游依赖和数据源代价。

fetch failure 是理解 Spark 容错的关键入口。下游 task 拉取 shuffle block 失败时，Spark 可能判定上游 map output 丢失，从而重新提交产生这些输出的 stage。这个动作保护的是计算可恢复性，但会放大延迟，并可能暴露 executor 丢失、磁盘清理、网络抖动或 shuffle 服务配置问题。

## 性能观察入口

执行模型问题应优先看 Spark UI 的 Jobs、Stages、SQL、Executors 四个视角。Jobs 页面看 action 与 job 的关系；Stages 页面看 task 分布、失败重试、shuffle read/write、spill 和 locality；SQL 页面看 physical plan、runtime statistics 和 operator 耗时；Executors 页面看 GC、内存、磁盘、输入输出和失败 executor。

不要把所有慢都归因于 executor 配置。更可靠的顺序是：先看 stage DAG 是否因 shuffle 过多而复杂，再看单个 stage 内 task 是否倾斜，然后看 shuffle read/write 与 spill，最后才判断 executor memory、cores、parallelism、serializer 或数据布局是否需要调整。

## 示例：本地观察 action 与 plan

```python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-execution-model-demo").getOrCreate()

orders = spark.createDataFrame(
    [(1, "book", 30), (1, "pen", 5), (2, "book", 20), (3, "bag", 99)],
    ["user_id", "category", "amount"],
)

plan = orders.where(F.col("amount") > 10).groupBy("category").agg(F.sum("amount").alias("gmv"))

# explain 只观察计划；collect 才触发执行。
plan.explain("formatted")
print(plan.collect())

spark.stop()
```

## 来源与事实边界

本页依据 Spark RDD、Dataset、Job Scheduling 和 SQL 文档解释稳定执行语义。具体 task 数量、默认并行度、重试次数和 locality 等行为会受版本、部署模式、配置和资源管理器影响，不能把单个集群的默认值当成跨版本事实。
