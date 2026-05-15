---
kb_id: bigdata/spark/columnar-cache-scan-pruning-and-sql-runtime-footprint
title: Spark 列式缓存、扫描裁剪与运行时内存
description: 解释 Spark 列式缓存、扫描裁剪与运行时内存如何定位数据、裁剪扫描、并行执行和返回结果，并说明可见性、性能证据与排障入口。
domain: bigdata
component: spark
topic: columnar-cache-scan-pruning-sql-runtime-footprint
difficulty: advanced
status: reviewed
sidebar_position: 23
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-sql-performance-tuning
  - spark-configuration-doc
  - spark-release-1-6-0
  - spark-release-2-0-0
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
claim_ids:
  - spark-claim-0077
  - spark-claim-0085
  - spark-claim-0087
  - spark-claim-0123
  - spark-claim-0124
  - spark-claim-0125
  - spark-claim-0126
  - spark-claim-0127
  - spark-claim-0129
  - spark-claim-0001
tags:
  - spark
  - columnar-cache
  - pruning
  - vectorization
  - memory
  - knowledge-base
  - production
---
## 列式缓存和裁剪决定 SQL 查询的基础成本
列式缓存、扫描裁剪和运行时内存共同决定 Spark SQL 查询的基础成本。列式缓存让 Spark 在内存中按列组织数据；扫描裁剪减少读取列和分区；运行时内存决定缓存、向量化读取、聚合和 join 能否稳定执行。这些能力只在优化器能理解数据结构和表达式时效果最好。

## InMemoryTableScan、Vectorized Reader 与裁剪条件
| 对象/配置 | 作用 | 边界 |
| --- | --- | --- |
| In-memory Columnar Cache | 以列式格式缓存表或 DataFrame | 占用 storage memory，可能被驱逐 |
| spark.sql.inMemoryColumnarStorage.compressed | 自动按列选择压缩 | 默认 true |
| batchSize | 控制列式缓存批大小 | 默认 10000，过大可能 OOM |
| Vectorized Reader | 批量读取列式数据 | 依赖格式和数据源支持 |
| Dynamic Partition Pruning | join 场景下动态生成分区过滤 | 依赖 join key 和分区列匹配 |

## 从 CACHE TABLE 到扫描计划命中
cacheTable、Dataset.cache 或 SQL CACHE TABLE 会把结构化数据缓存起来。Spark SQL 可以只扫描需要的列，并根据每列统计自动选择压缩编码，以降低内存占用和 GC 压力。列裁剪减少读取列数，谓词下推减少读入行数，分区裁剪减少扫描目录或文件范围，动态分区裁剪可以在 join 运行中基于一侧结果过滤另一侧分区。

## 缓存物化、驱逐与 Storage Memory
缓存第一次 action 时才会物化。缓存是否有效，要看 Storage 页面和 SQL plan 中是否命中 InMemoryTableScan，而不是只看代码里是否调用了 cache。列式缓存能降低对象开销，但仍占用 storage memory；batchSize 越大，压缩和批处理效率可能越好，但单批占用也更高，OOM 风险增加。

## 用 Physical Plan 验证裁剪和缓存是否生效
先看 physical plan：FileScan/BatchScan 是否显示 PushedFilters、ReadSchema、PartitionFilters，是否出现 InMemoryTableScan。再看 SQL UI 的 scan bytes、operator duration、runtime statistics。最后看 Storage 和 Executors 页面确认缓存大小、命中、驱逐和 GC。

## 示例：列裁剪与缓存
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("columnar-cache-demo").getOrCreate()
df = spark.range(0, 10000).select((F.col("id") % 10).alias("k"), F.col("id").alias("v"), (F.col("id") * 2).alias("extra"))
cached = df.cache()
print(cached.count())
query = cached.select("k", "v").where("k = 1").groupBy("k").count()
query.explain("formatted")
print(query.collect())
cached.unpersist()
spark.stop()
~~~

## 什么时候缓存，什么时候改文件布局
缓存适合被反复读取、重算成本高、大小可控的数据。不要缓存一次性中间结果；不要缓存过宽且只用少数列的数据；不要为了避免一次扫描而占满 storage memory。列式格式、分区设计和统计信息维护通常比盲目缓存更重要。

## 依据与版本边界
本页依据 Spark SQL Performance Tuning、Configuration 和 Spark 1.6/2.0 发布说明。向量化、动态分区裁剪和缓存默认值以当前版本为准。
