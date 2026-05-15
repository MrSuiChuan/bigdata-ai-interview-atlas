---
kb_id: bigdata/spark/partitioning-repartition-coalesce-and-file-size-control
title: Spark Repartition、Coalesce 与文件大小
description: 解释 Spark Repartition、Coalesce 与文件大小的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: partitioning-repartition-coalesce-file-size-control
difficulty: advanced
status: reviewed
sidebar_position: 20
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-dataset-javadoc
  - spark-sql-performance-tuning
  - spark-configuration-doc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
claim_ids:
  - spark-claim-0033
  - spark-claim-0056
  - spark-claim-0107
  - spark-claim-0108
  - spark-claim-0109
  - spark-claim-0110
  - spark-claim-0111
  - spark-claim-0112
  - spark-claim-0113
  - spark-claim-0114
tags:
  - spark
  - partitioning
  - repartition
  - coalesce
  - small-files
  - knowledge-base
  - production
---
## 分区决定并行度，也决定输出文件形态
Spark 分区同时影响并行度、shuffle 成本、单 task 工作集和输出文件数量。repartition、coalesce、SQL partition hint、文件读取切分和写出文件控制分别作用在不同位置。理解这些机制，要先区分运行时分区和存储文件分区。

## Partition、repartition、coalesce 与输出文件
| 对象/配置 | 作用 | 边界 |
| --- | --- | --- |
| repartition | 通过 shuffle 改变分区数或按列分布 | 成本高，但能重新均衡数据 |
| coalesce | 通常不经 shuffle 减少分区数 | 可能降低并行度和造成单 task 过大 |
| spark.sql.files.maxPartitionBytes | 控制文件源读取时单分区最大打包字节数 | 影响扫描 task 数，不直接等同输出文件大小 |
| spark.sql.files.openCostInBytes | 估算打开文件成本 | 影响小文件打包策略 |
| maxRecordsPerFile | 控制写出单文件最大记录数 | 影响输出文件切分，但不解决所有小文件问题 |

## 从输入分区到 Shuffle 重分区再到写出文件
读取文件源时，Spark 会根据文件大小、打开文件成本和分区配置把多个文件打包成扫描分区。repartition(numPartitions) 或 repartition(cols) 会引入 shuffle，使数据按新的分区规则重新分布。coalesce(numPartitions) 减少分区时通常避免 shuffle，适合在数据已经较均匀且只想减少输出文件数时使用。

## 分区调整不等于业务去重或排序保证
输出文件数量通常接近写出时的分区数，每个 task 写一个或多个文件。maxRecordsPerFile 可以限制单文件记录数，避免单文件过大；SQL hints COALESCE、REPARTITION、REPARTITION_BY_RANGE、REBALANCE 可以影响输出前分区布局。AQE 可以根据 map output statistics 合并过小的 post-shuffle partitions，但不等同于湖仓表的长期文件治理。

## 小文件、长尾 Task 与分区倾斜怎么定位
如果 task 太多且每个很小，检查小文件数量、openCost、maxPartitionBytes、shuffle partition 和 AQE 合并。若少数 task 极慢，检查分区倾斜和单分区数据量。若输出小文件过多，检查写出前分区数、动态分区字段、maxRecordsPerFile 和表维护策略。

## 示例：repartition 与 coalesce
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-plan-demo").getOrCreate()
df = spark.range(0, 10000).select((F.col("id") % 100).alias("k"), F.col("id"))
result = df.repartition(8, "k").groupBy("k").count()
result.explain("formatted")
print(result.orderBy("k").take(5))
spark.stop()
~~~

## 增加并行度还是减少文件数
不要用 coalesce(1) 当成通用小文件治理方案。它牺牲并行度，容易形成单点瓶颈。小文件治理不能只靠最后 coalesce，上游分区、动态分区列、高基数字段、并发写入、表格式 compaction 和下游读取模式都要一起设计。

## 依据与版本边界
本页依据 Spark SQL Performance Tuning、Dataset API 和 Configuration 文档。文件源配置和 SQL hint 行为以当前 Spark 版本和数据源实现为准。
