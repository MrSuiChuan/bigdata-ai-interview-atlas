---
kb_id: bigdata/spark/checkpoint-and-plan-truncation
title: Spark Checkpoint 与计划截断
description: 解释 Spark Checkpoint 与计划截断中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: spark
topic: checkpoint-and-plan-truncation
difficulty: advanced
status: reviewed
sidebar_position: 5
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-dataset-javadoc
  - spark-docs-home
  - spark-sql-guide
  - spark-tuning-guide
  - spark-structured-streaming-guide
  - spark-configuration-doc
  - spark-overview-doc
  - spark-rdd-guide
claim_ids:
  - spark-claim-0029
  - spark-claim-0030
  - spark-claim-0031
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
  - spark-claim-0004
  - spark-claim-0005
  - spark-claim-0006
  - spark-claim-0007
tags:
  - spark
  - checkpoint
  - local-checkpoint
  - logical-plan
  - knowledge-base
  - production
---
## Checkpoint 解决的是依赖截断，不是缓存加速
Checkpoint 的核心作用是把过长或不稳定的计算依赖切断，把某个中间结果物化到 checkpoint 目录或 executor 本地存储中。它常用于迭代算法、长 lineage、复杂 Dataset 计划、Structured Streaming 状态恢复等场景。Checkpoint 解决的是恢复和计划截断问题，不是普通性能缓存的同义词。

## 可靠 Checkpoint、Local Checkpoint 与流式 Checkpoint
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| SparkContext checkpointDir | 可靠 checkpoint 的目标目录 | 应放在可靠存储上，不能依赖 executor 本地目录 |
| Dataset/RDD checkpoint | 物化结果并截断上游计划或 lineage | 首次 action 才会真正物化，eager 设置影响确定性 |
| localCheckpoint | 写入 executor 本地存储 | 不可靠，executor 丢失可能破坏后续计算 |
| Structured Streaming checkpoint | 保存 offset、commit log 和 state | 与查询结构强绑定，重启兼容性有严格限制 |

## 从长 Lineage 到物化恢复点
RDD lineage 或 Dataset logical plan 过长时，Driver 管理和优化成本会升高，失败重算成本也会升高。checkpoint 会在某个节点物化数据，使后续计算从 checkpoint 数据继续，而不是从最初输入一路重算。Dataset checkpoint 在迭代算法中尤其有价值，因为每轮迭代都会继续拉长逻辑计划。

## Eager、Lazy 与非确定性计算的差异
Dataset checkpoint/localCheckpoint 支持 eager 参数。eager=true 会立即执行并物化当前数据快照；eager=false 会等到第一次 action 时才物化。对于包含非确定性表达式、外部输入变化或重试影响的计算，lazy checkpoint 可能导致最终被 checkpoint 的数据与第一次 job 中使用的数据不完全一致。

## 如何判断 Checkpoint 是否真的截断了计划
如果 checkpoint 后仍然计划过长，检查是否 checkpoint 位置放错、是否没有触发 action、是否后续又继续叠加复杂 lineage。如果流式任务无法从 checkpoint 恢复，检查输入源、状态操作、schema、watermark、join 类型和 sink 语义是否变更。

## 示例：Dataset checkpoint
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("checkpoint-demo").getOrCreate()
spark.sparkContext.setCheckpointDir("/tmp/spark-checkpoint-demo")
df = spark.range(0, 1000).select((F.col("id") % 10).alias("k"), F.col("id"))
checkpointed = df.groupBy("k").count().checkpoint(eager=True)
checkpointed.explain("formatted")
print(checkpointed.orderBy("k").collect())
spark.stop()
~~~

## Cache、Persist、Checkpoint 应该怎么选
cache/persist 追求复用效率，checkpoint 追求依赖截断和恢复边界。cache 不改变 lineage，本质上是如果缓存还在就复用；checkpoint 改变后续依赖起点，本质上是后续从物化结果继续。localCheckpoint 只能用于可以接受丢失和重算失败风险的场景。

## 依据与版本边界
本页依据 Spark Dataset API、RDD Guide、Structured Streaming Guide 和 Tuning 文档。checkpoint 目录、存储可靠性和重启兼容性需要结合部署环境验证。
