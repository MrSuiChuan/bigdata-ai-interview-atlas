---
kb_id: bigdata/spark/shared-variables-and-driver-boundaries
title: Spark 共享变量与 Driver 边界
description: 解释 Spark 共享变量与 Driver 边界如何发现故障、隔离影响、重建状态和恢复服务，并说明生产验证与风险边界。
domain: bigdata
component: spark
topic: shared-variables-and-driver-boundaries
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-rdd-guide
  - spark-dataset-javadoc
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-job-scheduling
  - spark-tuning-guide
claim_ids:
  - spark-claim-0025
  - spark-claim-0026
  - spark-claim-0027
  - spark-claim-0028
  - spark-claim-0032
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
  - spark-claim-0004
  - spark-claim-0005
tags:
  - spark
  - broadcast
  - accumulator
  - driver
  - knowledge-base
  - production
---
## 共享变量只解决受控共享，不改变 Driver/Executor 边界
Spark 的并行计算模型不鼓励多个 task 直接读写同一个普通变量。Driver 上的变量被 task 闭包捕获后，会随闭包序列化发送到 executor；executor 中修改的是副本，不会自动回写 Driver。Spark 提供 broadcast variables 和 accumulators 两类共享变量，用来覆盖只读共享数据和只增统计这两种受控场景。

## Broadcast、Accumulator 与普通 Driver 变量
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Driver 变量 | 用户主程序中的普通变量 | task 捕获后是副本，不能当作分布式共享状态 |
| Closure | task 执行所需的函数和被捕获变量集合 | 会被序列化发送到 executor，过大闭包会增加调度和网络成本 |
| Broadcast Variable | 把只读大对象高效分发给 executor | 适合维表、模型参数等只读数据，不适合频繁更新 |
| Accumulator | task add、Driver read 的只增变量 | 适合计数和诊断指标，不适合承载业务状态 |

## 只读分发和只增汇总的运行方式
Broadcast 变量由 Driver 创建，Spark 将其分发给 executor，task 在执行时读取本地或缓存后的广播值。它避免把同一个大对象重复塞进每个 task 闭包。Accumulator 的设计是 task 只能 add，Driver 才能 read，适合收集错误计数、过滤记录数、质量检查指标等诊断数据。

## Accumulator 不能承载业务状态
Broadcast 不是分布式可变变量。广播后如果 Driver 修改原始对象，executor 上已广播的数据不会自动同步。Accumulator 不应该用于业务决策的精确状态，尤其要注意 transformation 中的 accumulator 更新可能因为 stage 或 task 重新执行而多次应用。

## 广播过大和累加器误用怎么识别
如果本地模式看似正常、集群模式错误，优先检查闭包捕获和可变状态。查看 task 序列化大小、executor 日志、Driver OOM、broadcast 创建次数和 accumulator 更新位置。对外部写入，要检查 task retry、stage retry 和 speculative execution 是否造成重复副作用。

## 示例：broadcast 与 accumulator
~~~python
from pyspark.sql import SparkSession

spark = SparkSession.builder.master("local[2]").appName("shared-vars-demo").getOrCreate()
sc = spark.sparkContext
lookup = sc.broadcast({"a": 1, "b": 2})
missing = sc.accumulator(0)

def score(key):
    value = lookup.value.get(key)
    if value is None:
        missing.add(1)
        return (key, 0)
    return (key, value)

print(sc.parallelize(["a", "b", "c", "a"]).map(score).collect())
print("missing", missing.value)
lookup.destroy()
spark.stop()
~~~

## 配置表广播还是外部存储读取
只读大对象用 broadcast；诊断计数用 accumulator；业务结果用分布式写出或外部事务系统。不要在 map 中修改 Driver 变量后期望 Driver 读到更新值，也不要把 accumulator 当精确业务计数器。

## 依据与版本边界
本页依据 Spark RDD Guide 关于 closures、shared variables、broadcast variables 和 accumulators 的说明。Accumulator 的可见性、重试语义和 UI 展示可能随 API 与版本细节变化，业务精确状态不应依赖 accumulator。
