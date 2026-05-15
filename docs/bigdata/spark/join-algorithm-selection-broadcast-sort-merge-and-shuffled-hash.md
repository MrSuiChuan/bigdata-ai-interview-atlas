---
kb_id: bigdata/spark/join-algorithm-selection-broadcast-sort-merge-and-shuffled-hash
title: Spark Join 算法选择
description: 解释 Spark Join 算法选择如何接收写入、更新状态、完成提交和暴露结果，并说明失败恢复与幂等边界。
domain: bigdata
component: spark
topic: join-algorithm-selection-broadcast-sort-merge-shuffled-hash
difficulty: advanced
status: reviewed
sidebar_position: 19
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-sql-performance-tuning
  - spark-configuration-doc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-dataset-javadoc
claim_ids:
  - spark-claim-0053
  - spark-claim-0054
  - spark-claim-0055
  - spark-claim-0057
  - spark-claim-0075
  - spark-claim-0103
  - spark-claim-0104
  - spark-claim-0105
  - spark-claim-0106
  - spark-claim-0001
tags:
  - spark
  - join
  - broadcast
  - sort-merge
  - aqe
  - knowledge-base
  - production
---
## Join 策略选择不是只背算子名字
Spark Join 算法选择是 Spark SQL 优化器、统计信息、hint、配置和 AQE 共同作用的结果。它不是固定规则题，也不是广播一定最快。Join 策略要解释的是：两侧数据如何移动，哪一侧构建 hash table，是否需要排序，是否需要 shuffle，以及运行时统计能否改变原计划。

## Broadcast、Sort Merge、Shuffle Hash 与 Join Hint
| 对象 | 作用 | 风险 |
| --- | --- | --- |
| Broadcast Hash Join | 将小表广播到各 executor 后与大表分区内 join | 广播侧过大会压垮 Driver 或 executor |
| Sort Merge Join | 两侧按 join key shuffle 并排序后归并 | 稳定但 shuffle 和 sort 成本高 |
| Shuffle Hash Join | 两侧 shuffle，分区内构建 hash table | 构建侧分区过大时可能 OOM |
| Broadcast Nested Loop Join | 广播一侧后做嵌套循环 | 非等值 join 常见，成本可能很高 |
| Join Hint | 给优化器策略偏好 | 不保证一定采用，受 join 类型和物理约束限制 |

## 优化器如何从逻辑 Join 走到物理 Join
优化器先基于逻辑计划、join 条件、join 类型、统计信息和配置生成物理计划。等值 join 才适合 hash 或 sort merge；非等值 join 可能走 nested loop。若一侧估算大小低于 autoBroadcastJoinThreshold，Spark 会考虑广播 join。统计信息缺失或过期时，小表可能被高估而错过广播，大表也可能被低估而错误广播。

## 统计信息、运行时改写与 Hint 的限制
Spark SQL 支持 BROADCAST、MERGE、SHUFFLE_HASH、SHUFFLE_REPLICATE_NL 等 join strategy hints。hint 有优先级，但不是无条件命令。AQE 启用后，Spark 可以在 shuffle 边界拿到运行时统计，并据此把 sort merge join 转成 broadcast hash join 或 shuffled hash join，合并小 shuffle partition，处理 skewed partition，并启用 local shuffle reader。

## 从 Exchange、Broadcast 与 Spill 判断 Join 问题
先看 explain("formatted")：join 算子、BroadcastExchange、Sort、Exchange、build side 和 scan 裁剪。再看 SQL UI：runtime statistics、shuffle read/write、broadcast time、spill 和 operator duration。若最终计划与预期不同，确认 join 条件是否是等值、统计信息是否可信、hint 是否被忽略、AQE 是否启用、运行时数据是否倾斜。

## 示例：广播 join 观察
~~~python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("join-strategy-demo").getOrCreate()
fact = spark.range(0, 10000).select((F.col("id") % 100).alias("user_id"), F.col("id").alias("order_id"))
dim = spark.range(0, 100).select(F.col("id").alias("user_id"), F.concat(F.lit("u"), F.col("id")).alias("name"))
joined = fact.join(F.broadcast(dim), "user_id").groupBy("name").count()
joined.explain("formatted")
print(joined.orderBy("name").take(5))
spark.stop()
~~~

## 小表广播、稳定排序归并与内存哈希的取舍
小而稳定的维表适合广播；两侧都大且 join key 分布相对均匀时，sort merge join 更稳；构建侧分区可控时，shuffle hash join 可能更快；高度倾斜 key 需要 salting、拆分热点或 AQE skew join 支持。不要把 join hint 当长期治理方式。

## 依据与版本边界
本页依据 Spark SQL Performance Tuning、Configuration、Dataset API 和 Spark SQL 文档。默认阈值、AQE 规则和 hint 支持范围以当前 Spark 版本为准。
