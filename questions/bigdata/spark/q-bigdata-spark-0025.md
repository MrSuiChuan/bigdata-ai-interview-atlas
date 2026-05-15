---
id: q-bigdata-spark-0025
title: 为什么 Spark 的分区与文件布局题不能只答 repartition 会 shuffle、coalesce 不会 shuffle
domain: bigdata
component: spark
topic: partitioning-repartition-coalesce-file-size-control
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-dataset-javadoc
  - spark-sql-performance-tuning
  - spark-configuration-doc
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
related_docs:
  - bigdata/spark/partitioning-repartition-coalesce-and-file-size-control
estimated_minutes: 12
---

# 题目

为什么 Spark 的分区与文件布局题不能只答 `repartition` 会 shuffle、`coalesce` 不会 shuffle？

# 一句话结论

因为真正的工程问题是读侧怎么切分、shuffle 后怎么重排、写侧怎么控文件，而不是只记两个 API 的表层差异。

# 核心机制

1. file source 的读取分区受 `maxPartitionBytes`、`openCostInBytes`、最小/最大 split 分区建议值影响
2. `coalesce` 和 `repartition` 决定的是是否重洗牌、并行度是否被压缩、数据是否被重新均衡
3. AQE 和 `maxRecordsPerFile` 让最终输出布局不再只由“分区数”单独决定

# 标准答案

如果只回答 `repartition` 会 shuffle、`coalesce` 不会 shuffle，这题只能拿到很浅的分。因为 Spark 的分区控制至少要分成读侧、shuffle 侧和写侧三层。先看读侧，Spark 官方配置文档说明 file source 读取时会用 `spark.sql.files.maxPartitionBytes` 控制单个读取分区最多打包多少字节，默认 128 MB；同时用 `spark.sql.files.openCostInBytes` 估计打开文件的固定成本，用于决定怎样把多个小文件放进一个 partition；而 `spark.sql.files.minPartitionNum`、`spark.sql.files.maxPartitionNum` 都只是 suggested，不是 hard guarantee。再看 shuffle 侧，Dataset JavaDoc 说明 `coalesce(numPartitions)` 往更少分区收缩时默认不引入 shuffle，但会把计算压到更少节点；`repartition` 会付一次 shuffle 成本来重新均衡数据。更进一步，`repartition(partitionExprs)` 的结果是 hash partitioned，`repartitionByRange` 的结果是 range partitioned，但分区内的行并不会自动排好序，而且由于依赖 sampling，range 也可能有波动。最后看写侧，控制输出文件不能只靠 `coalesce(1)`，因为这会把写出收敛到单 task，带来单点瓶颈。Spark 还提供 SQL 侧的 `COALESCE`、`REPARTITION`、`REPARTITION_BY_RANGE`、`REBALANCE` hints，以及写侧 `spark.sql.files.maxRecordsPerFile` 来控制单文件记录数；如果 AQE 开启，Spark 还会根据 `spark.sql.adaptive.advisoryPartitionSizeInBytes` 对 post-shuffle 分区做 coalesce。因此这题真正要回答的是：并行度、shuffle 成本、单 task 工作集和输出文件版式是怎么一起被控制的。

# 必答点

1. 说明读侧 split planning 不只是“多少数据除以多少分区”
2. 说明 `coalesce` 与 `repartition` 的区别是是否重洗牌和是否压缩并行度
3. 说明 `repartitionByRange` 不等于分区内有序
4. 说明最终输出文件布局还受 AQE 和 `maxRecordsPerFile` 影响

# 常见误答

1. 把分区问题只理解成写出前最后一步
2. 认为 `coalesce(1)` 是标准答案
3. 不知道小文件问题和 `openCostInBytes` 有关
4. 不知道 AQE 会继续改写 shuffle partition 数
