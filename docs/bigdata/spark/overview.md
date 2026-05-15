---
kb_id: bigdata/spark/overview
title: Spark 整体定位与技术边界
description: 解释 Spark 整体定位与技术边界的定位、对象、链路、适用场景和相邻系统边界，用于建立系统化知识框架。
domain: bigdata
component: spark
topic: overview
difficulty: beginner
status: reviewed
sidebar_position: 1
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-sql-guide
  - spark-dataset-javadoc
  - spark-rdd-scaladoc
  - spark-job-scheduling
  - spark-tuning-guide
claim_ids:
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
  - spark-claim-0004
  - spark-claim-0005
  - spark-claim-0007
  - spark-claim-0008
  - spark-claim-0009
  - spark-claim-0010
  - spark-claim-0011
tags:
  - spark
  - overview
  - execution-engine
  - knowledge-base
  - production
---
## Spark 是统一计算引擎，不是存储或调度平台
Spark 是面向大规模数据处理的统一计算引擎。这里的“统一”不是说所有场景都由一个 API 完成，而是说 SQL、DataFrame、Dataset、RDD、Structured Streaming、MLlib、GraphX 等能力最终共享 Driver、Executor、Task、Shuffle 和外部存储依赖模型。理解 Spark 的第一步，是把它看成“计划生成 + 分布式执行 + 失败恢复”的组合，而不是把它看成某一个 API。

Spark 不直接提供长期数据存储、元数据治理、权限闭环或业务事务语义。数据通常来自 HDFS、对象存储、Hive Metastore、Lakehouse 表格式、Kafka 或数据库；资源通常来自 Standalone、YARN 或 Kubernetes；端到端一致性、权限和审计还要依赖外部系统。因此，Spark 页面讨论的是计算引擎保证什么，而不是整个数据平台保证什么。

## Driver、Executor、Job、Stage 与 Task 的职责
| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Driver | 运行用户主程序，创建 SparkContext 或 SparkSession，构建计划并协调执行 | Driver 是控制面和结果面，过大的 collect、计划字符串或广播对象都可能压垮 Driver |
| Executor | 在工作节点上运行 task，持有缓存、shuffle block 和部分运行时状态 | Executor 丢失会影响本地缓存和 shuffle 输出，但计算可通过 lineage 或 stage 重提恢复 |
| Job | 一次 action 触发的执行单元 | 多个 job 可以共享上游 stage，也可能因为一次 action 才真正执行 transformation |
| Stage | 按 shuffle 边界切分的调度阶段 | 宽依赖引入 stage 边界，窄依赖通常可在同一 stage 内流水执行 |
| Task | 针对一个分区的最小调度执行单元 | task 重试是 attempt 级别，外部副作用需要调用方自己处理幂等 |

## Transformation 如何在 Action 时变成分布式执行
Spark 程序通常先构造 transformation。RDD transformation 记录 lineage，Dataset/DataFrame transformation 构造逻辑计划；这些步骤默认不会立即运行。action 出现后，Driver 才根据依赖关系或逻辑计划创建 job，生成 stage DAG，把每个 stage 切成多个 task，并交给 executor 并行执行。

SQL、DataFrame、Dataset 与 RDD 的入口不同，但执行时都要面对同类问题：分区数决定并行度上限，shuffle 决定跨分区数据重分布成本，executor 内存决定缓存和执行算子的工作空间，外部存储决定扫描和写出成本。

## Lineage、Shuffle、Checkpoint 与外部系统
Spark 的恢复主要依赖 lineage、shuffle 中间结果、checkpoint 和外部可靠存储。cache/persist 是性能优化，不是业务持久化；checkpoint 能截断 lineage 或保存流式进度，但目录可靠性和查询兼容性需要单独设计。Spark task 或 stage 重试只保证计算链路继续推进，不自动保证外部数据库、消息系统或下游表的业务幂等。

## 优化 Spark 作业要先建立证据链
Spark 性能不是由单个参数决定，而是由扫描数据量、分区布局、shuffle 范围、join 策略、序列化、缓存、executor 资源、GC、外部存储吞吐和 sink 提交共同决定。可靠的优化顺序是：先看 physical plan，再看 Spark UI 的 Jobs、Stages、SQL、Executors；先确认瓶颈在扫描、shuffle、CPU、内存、GC、网络还是外部系统，再决定是否调参或改写逻辑。

## 示例：最小执行链路
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-overview-demo").getOrCreate()
df = spark.range(0, 1000).select((F.col("id") % 10).alias("bucket"), F.col("id"))
result = df.where("id >= 100").groupBy("bucket").count()
result.explain("formatted")
print(result.orderBy("bucket").collect())
spark.stop()
~~~

## 批处理、流处理与交互式分析的不同侧重点
设计 Spark 作业时，要先确认数据规模、增长速度、延迟目标、失败恢复目标和下游可见性要求。批处理作业更关注吞吐、扫描裁剪、文件大小和重跑成本；流式作业更关注 checkpoint、watermark、state store、trigger 和 sink 语义；交互式查询更关注计划质量、缓存、广播和 Driver 结果面。

## 依据与版本边界
本页依据 Spark Overview、RDD Guide、SQL/DataFrame/Dataset 文档、Job Scheduling 和 Tuning 文档总结稳定机制。具体默认值、配置名和行为边界可能随版本变化，涉及参数时应以当前集群 Spark 版本的官方文档和运行时配置为准。
