import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const sparkDir = path.join(repoRoot, "docs", "bigdata", "spark");
const today = "2026-05-05";

const commonSparkSources = [
  "spark-docs-home",
  "spark-overview-doc",
  "spark-rdd-guide",
  "spark-sql-guide",
  "spark-dataset-javadoc",
  "spark-job-scheduling",
  "spark-tuning-guide",
  "spark-configuration-doc",
];

const commonSparkClaims = [
  "spark-claim-0001",
  "spark-claim-0002",
  "spark-claim-0004",
  "spark-claim-0005",
  "spark-claim-0011",
  "spark-claim-0012",
  "spark-claim-0014",
  "spark-claim-0015",
];

const corePages = {
  "execution-model.md": {
    title: "Spark 执行模型",
    description: "深入解释 Spark 从 action 触发到 Job、Stage、Task、Executor 执行和失败恢复的完整链路。",
    topic: "execution-model",
    difficulty: "intermediate",
    sidebar_position: 2,
    source_ids: ["spark-rdd-guide", "spark-rdd-scaladoc", "spark-dataset-javadoc", "spark-job-scheduling", "spark-docs-home", "spark-overview-doc", "spark-sql-guide", "spark-tuning-guide"],
    claim_ids: ["spark-claim-0004", "spark-claim-0005", "spark-claim-0006", "spark-claim-0011", "spark-claim-0012", "spark-claim-0013", "spark-claim-0014", "spark-claim-0017", "spark-claim-0024", "spark-claim-0001"],
    tags: ["spark", "driver", "stage", "task", "shuffle", "knowledge-base", "production"],
    body: `## 定位与边界

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

\`\`\`python
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
\`\`\`

## 来源与事实边界

本页依据 Spark RDD、Dataset、Job Scheduling 和 SQL 文档解释稳定执行语义。具体 task 数量、默认并行度、重试次数和 locality 等行为会受版本、部署模式、配置和资源管理器影响，不能把单个集群的默认值当成跨版本事实。`,
  },
  "sql-optimizer-aqe-joins.md": {
    title: "Spark SQL 优化器、AQE 与 Join",
    description: "深入解释 Catalyst、统计信息、Join 策略、AQE 重写和运行时诊断之间的关系。",
    topic: "sql-optimizer-aqe-joins",
    difficulty: "advanced",
    sidebar_position: 10,
    source_ids: ["spark-sql-site", "spark-sql-paper", "spark-sql-performance-tuning", "spark-configuration-doc", "spark-dataset-javadoc", "spark-docs-home", "spark-overview-doc", "spark-sql-guide"],
    claim_ids: ["spark-claim-0049", "spark-claim-0050", "spark-claim-0051", "spark-claim-0052", "spark-claim-0053", "spark-claim-0054", "spark-claim-0055", "spark-claim-0056", "spark-claim-0116", "spark-claim-0118"],
    tags: ["spark", "catalyst", "aqe", "join", "spj", "knowledge-base", "production"],
    body: `## 定位与边界

Spark SQL 优化器的目标不是“永远选出最优计划”，而是在统计信息、规则、代价估计和运行时信息约束下生成足够好的物理执行计划。Catalyst 负责编译期分析和优化，CBO 依赖表和列统计信息估算代价，AQE 在 shuffle 边界之后利用运行时统计信息调整计划。

Join 性能问题通常不在单个 join 算子名称，而在数据规模估计、key 分布、广播边界、shuffle 分区大小、倾斜分区处理和下游算子共同作用。只背 broadcast join、sort merge join、shuffle hash join 的差异，不足以解释生产问题。

## Catalyst 计划链路

Spark SQL 入口通常是 SQL 字符串或 DataFrame/Dataset API。它先形成 unresolved logical plan，然后经过 analyzer 绑定表、列、函数和类型，再由 optimizer 应用规则生成 optimized logical plan，最后由 planner 选择 physical plan。这个链路解释了为什么同一段业务逻辑可以被 SQL、DataFrame 或 Dataset 表达，但最终进入同一执行体系。

诊断时应优先使用 \`EXPLAIN FORMATTED\` 或 \`explain("formatted")\` 看 physical plan outline 和节点细节；需要估算信息时再看 \`EXPLAIN COST\` 或 \`explain("cost")\`。如果统计信息缺失或过期，优化器可能低估大表或高估小表，导致广播、join 顺序和分区数选择失准。

## Join 策略选择

Broadcast Hash Join 适合一侧足够小且可广播的等值 join；Broadcast Nested Loop Join 常见于非等值或缺少等值 key 的广播场景，代价可能非常高。Sort Merge Join 是大规模等值 join 的稳健基线，要求两侧按 join key shuffle 并排序。Shuffle Hash Join 适合构建侧分区足够小、可以在 executor 内存中构建 hash table 的场景。

Join hint 可以影响策略，但不是绕过物理约束的魔法。被 hint 的表如果过大，广播仍可能造成 executor 或 driver 内存压力；缺少等值条件时也不会变成标准 hash join。生产中应把 hint 看成“给优化器的偏好”，而不是无条件命令。

## AQE 的运行时重写

AQE 的价值在于 shuffle 之后拿到真实统计信息，再调整下游计划。常见动作包括合并过小 shuffle partition、处理 skewed partition、把 sort merge join 转成 broadcast hash join 或 shuffled hash join，以及启用 local shuffle reader 减少网络读取。

AQE 不是万能兜底。它需要有可观察的 exchange 边界和运行时统计信息；如果上游数据源裁剪失败、统计信息严重缺失、UDF 阻断优化、join key 本身高度倾斜，AQE 可以缓解部分症状，但无法替代数据建模、分区设计和 SQL 改写。

## Storage Partition Join 与数据源边界

Spark SQL 性能调优文档已覆盖 Storage Partition Join。它的核心思想是利用支持报告分区布局的数据源，尽量避免不必要的 shuffle。但这个能力依赖数据源、catalog、分区表达式、join key 和配置共同满足条件，不能简单理解为“分区表 join 都不需要 shuffle”。

判断 SPJ 是否生效，必须看物理计划中的 exchange 是否消失或变化，同时确认两侧数据源是否提供了可兼容的分区信息。表目录分区、文件布局分区和 Spark 运行时 shuffle 分区不是同一个概念。

## 诊断顺序

1. 先看 \`EXPLAIN FORMATTED\`：确认 join 类型、exchange 数量、broadcast 节点、sort 节点和 scan 裁剪。
2. 再看 SQL UI：确认 runtime statistics、operator 耗时、shuffle read/write、spill 和 skew。
3. 检查统计信息：用 \`ANALYZE TABLE\`、\`DESCRIBE EXTENDED\` 或 catalog 元数据确认 row count、sizeInBytes 和列统计。
4. 最后决定动作：更新统计、调整 join hint、修改广播阈值、处理倾斜 key、改变表布局或拆分查询。

## 示例：观察 join 策略

\`\`\`python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-join-plan-demo").getOrCreate()

orders = spark.range(0, 1000).select((F.col("id") % 20).alias("user_id"), F.col("id").alias("order_id"))
users = spark.range(0, 20).select(F.col("id").alias("user_id"), F.concat(F.lit("u"), F.col("id")).alias("name"))

joined = orders.join(F.broadcast(users), "user_id").groupBy("name").count()
joined.explain("formatted")
print(joined.orderBy("name").take(5))

spark.stop()
\`\`\`

## 来源与事实边界

本页依据 Spark SQL、SQL Performance Tuning、Dataset API 和 Spark SQL 论文解释优化器机制。不同 Spark 版本和不同数据源对统计信息、AQE、SPJ 与 hint 的支持边界可能不同，必须以实际物理计划和运行时统计为准。`,
  },
  "structured-streaming.md": {
    title: "Spark Structured Streaming",
    description: "深入解释 Structured Streaming 的增量执行、checkpoint、offset、state store、watermark 和恢复边界。",
    topic: "structured-streaming",
    difficulty: "advanced",
    sidebar_position: 9,
    source_ids: ["spark-structured-streaming-guide", "spark-structured-streaming-apis", "spark-release-2-0-0", "spark-docs-home", "spark-overview-doc", "spark-sql-guide", "spark-configuration-doc", "spark-tuning-guide"],
    claim_ids: ["spark-claim-0041", "spark-claim-0042", "spark-claim-0043", "spark-claim-0044", "spark-claim-0059", "spark-claim-0060", "spark-claim-0061", "spark-claim-0062", "spark-claim-0063", "spark-claim-0064"],
    tags: ["spark", "structured-streaming", "watermark", "checkpoint", "state-store", "knowledge-base", "production"],
    body: `## 定位与边界

Structured Streaming 不是独立于 Spark SQL 的另一套流引擎，而是把流式输入表示成持续追加或更新的表，并让查询以增量方式不断执行。默认执行模式是 micro-batch：每个 batch 读取一段输入 offset，运行一次增量计划，提交 sink 结果和 checkpoint 进度。

理解它时要把三条线分开：输入进度由 source offset 描述，计算状态由 state store 和 checkpoint 保存，输出可见性由 sink commit 语义决定。checkpoint 能让查询恢复进度和状态，但不能自动让所有外部 sink 具备 exactly-once 业务语义。

## Micro-batch 执行链路

一次 micro-batch 通常经历这些步骤：Driver 发现 source 最新 offset，决定本批次可处理的 offset range，生成增量执行计划，把 task 分发到 executor 读取数据并更新状态，然后写出结果，最后把 offset log、commit log 和状态变更写入 checkpoint。

这个链路解释了为什么流任务延迟变大不能只看 source 速度。可能是 source 积压，也可能是状态 store 读写慢、shuffle 倾斜、sink 提交慢、checkpoint 存储慢，或者 foreachBatch 里重复 action 导致同一批次被多次计算。

## Checkpoint 与恢复

checkpoint 目录保存查询恢复所需的进度和状态。相同 checkpoint 下，输入 source 数量和类型不能随意改变；stateful operation 的 grouping key、聚合 schema、join key 或 join 类型也不能随意改变，因为恢复时 Spark 假设状态 schema 与之前兼容。

因此，生产变更不能只看代码能不能启动。凡是涉及输入源、state schema、watermark、join 条件、聚合字段、sink 语义的修改，都应使用新 checkpoint 灰度，或者设计离线回放和状态迁移方案。

## Watermark 与状态清理

Watermark 是状态清理和迟到数据语义的边界。对于带 watermark 的聚合，Spark 只有在 watermark 列、聚合事件时间列、output mode 和调用顺序都满足要求时，才可以安全清理旧状态。watermark delay 表示 Spark 不会丢弃小于该延迟范围的数据；超过这个延迟的数据可能被处理，也可能因为状态已经清理而被丢弃。

在 stream-stream join 中，inner join 可以不配置 watermark 和时间约束，但状态可能无限增长；outer join 和 semi join 必须有 watermark 和事件时间约束，因为引擎需要知道一条记录何时不可能再匹配未来输入，才能输出 NULL 或未匹配结果并清理状态。

## State Store 与 RocksDB

状态算子会把中间状态放入 state store。默认状态存储和 RocksDB 状态存储在内存、磁盘、GC 压力和恢复速度上的表现不同。RocksDB 不是“开启后一定更快”，它主要把部分状态压力从 JVM 堆转移到本地状态存储和 checkpoint 交互上，适合状态很大且 JVM GC 成为瓶颈的场景。

排查状态问题时应看 numRowsTotal、numRowsUpdated、memoryUsedBytes、stateOperators、batch duration、commit duration、checkpoint 存储延迟和 executor 本地磁盘。只看 inputRowsPerSecond 和 processedRowsPerSecond 不足以判断状态是否健康。

## Sink 语义与 foreachBatch

内置 sink 和外部系统各自有提交语义。foreachBatch 默认只能提供 at-least-once；如果要做到应用级 exactly-once，需要使用 batchId 或外部事务表进行去重。foreachBatch 依赖 micro-batch，因此不能用于 continuous processing。

如果 foreachBatch 内对同一个 micro-batch DataFrame 执行多个 action，Spark 可能多次计算并多次加载状态，建议在 batch 函数内显式 persist 和 unpersist。这个问题在 stateful query 中尤其明显，会直接放大批次延迟。

## 示例：本地 watermark 聚合

\`\`\`python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("structured-streaming-local-demo").getOrCreate()

events = (
    spark.readStream.format("rate")
    .option("rowsPerSecond", 5)
    .load()
    .select(F.col("timestamp").alias("event_time"), (F.col("value") % 3).alias("user_id"))
)

windowed = (
    events.withWatermark("event_time", "2 minutes")
    .groupBy(F.window("event_time", "1 minute"), "user_id")
    .count()
)

query = (
    windowed.writeStream.format("console")
    .outputMode("append")
    .option("checkpointLocation", "/tmp/spark-structured-streaming-demo-checkpoint")
    .option("truncate", False)
    .start()
)

query.awaitTermination(30)
query.stop()
spark.stop()
\`\`\`

## 来源与事实边界

本页依据 Structured Streaming 官方概览和 API 文档。具体 source/sink 是否支持 AvailableNow、exactly-once、metadata log、schema evolution 和恢复兼容，需要查对应 connector 文档和实际 Spark 版本。`,
  },
  "performance-tuning.md": {
    title: "Spark 性能模型与瓶颈定位",
    description: "用 Spark UI、SQL 计划、运行时统计、shuffle、spill、GC 和数据倾斜证据定位性能瓶颈。",
    topic: "performance-tuning",
    difficulty: "advanced",
    sidebar_position: 7,
    source_ids: ["spark-tuning-guide", "spark-sql-performance-tuning", "spark-dataset-javadoc", "spark-job-scheduling", "spark-configuration-doc", "spark-docs-home", "spark-overview-doc", "spark-rdd-guide"],
    claim_ids: ["spark-claim-0015", "spark-claim-0033", "spark-claim-0034", "spark-claim-0035", "spark-claim-0036", "spark-claim-0037", "spark-claim-0038", "spark-claim-0039", "spark-claim-0116", "spark-claim-0118"],
    tags: ["spark", "performance", "spark-ui", "shuffle", "spill", "skew", "knowledge-base", "production"],
    body: `## 定位与边界

Spark 调优不是参数背诵，而是证据驱动的瓶颈定位。一个作业慢，可能来自扫描文件过多、分区过小或过大、join 策略错误、shuffle 数据量大、数据倾斜、内存 spill、GC、executor 丢失、外部存储慢、sink 提交慢或 driver 结果面过大。

因此，调优顺序应从观察开始，而不是从 executor memory、executor cores、shuffle partitions 这些参数开始。没有基线指标和物理计划，直接调参只是在扩大试错空间。

## 证据地图

### Spark UI

Jobs 页面用于定位 action 与 job；Stages 页面用于看 task 分布、duration 分位数、失败重试、shuffle read/write、spill 和 locality；SQL 页面用于看物理计划节点、operator 耗时、runtime statistics；Executors 页面用于看 GC、内存、磁盘、输入输出和 executor 丢失。

### Event Log 与 History Server

线上排障不能只依赖正在运行的 UI。应开启 event log，并通过 History Server 回放已完成或失败的应用。长期治理时，要把 event log、driver/executor 日志、集群资源指标和数据源指标关联起来，否则只能看到 Spark 内部局部现象。

### EXPLAIN 与运行时统计

\`EXPLAIN FORMATTED\` 负责看计划形状，\`EXPLAIN COST\` 或 \`explain("cost")\` 负责看估算，SQL UI 的 runtime statistics 负责看运行时真实数据。估算和运行时差距很大时，要优先怀疑统计信息、数据倾斜、过滤选择率或数据源裁剪能力。

## 常见瓶颈链路

### 扫描与小文件

扫描慢不一定是 CPU 问题。小文件会增加 listing、open cost 和 task 调度开销；过少 split 会导致并行度不足；过多 split 会制造大量短 task。需要结合 input bytes、files count、scan operator、task 数量和文件布局判断。

### Shuffle 与倾斜

Shuffle 是网络、磁盘、序列化和内存压力汇合点。shuffle write 大说明上游重分布成本高，shuffle read 大说明下游拉取成本高，spill 大说明内存不足或单 task 数据过大，少数 task 极慢通常指向数据倾斜、远程读取异常或 executor 资源不均。

### 内存、序列化与 GC

Spark 统一内存把 execution 和 storage 放在共享区域内竞争。cache 占用过多可能挤压 execution，导致排序、聚合和 join spill；execution 压力也可能驱逐 storage。Kryo、列式缓存、off-heap、serializer buffer 和对象结构都会影响内存足迹，但每个调整都要用 GC 时间、spill、storage memory 和 executor lost 证据验证。

### Driver 结果面

collect、toPandas、show 大结果、长 plan string 和过大的 broadcast 都可能把压力集中到 Driver。Driver OOM 不是 executor memory 不够，而是结果面或控制面状态过大。排查时要看 result size、broadcast size、driver log、SQL plan string 和 UI/History Server 是否也受影响。

## 调优决策顺序

1. 看 SQL/Stage 是否存在明显 shuffle 边界和倾斜。
2. 看 scan 是否裁剪有效，文件数量和 split 数是否合理。
3. 看 task 分布，确认是全局慢还是少数 task 拖尾。
4. 看 spill、GC、executor lost，判断内存与稳定性。
5. 看 AQE runtime statistics，确认是否已经合并分区、处理倾斜或改写 join。
6. 最后才选择更新统计、改 SQL、改分区、改文件布局、改资源规格或调配置。

## 示例：本地构造倾斜观察

\`\`\`python
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-skew-observation-demo").getOrCreate()

left = spark.range(0, 10000).select(
    F.when(F.col("id") < 9000, F.lit(0)).otherwise(F.col("id")).alias("k"),
    F.col("id").alias("v"),
)
right = spark.range(0, 100).select(F.col("id").alias("k"))

joined = left.join(right, "k").groupBy("k").count()
joined.explain("formatted")
print(joined.orderBy(F.desc("count")).take(5))

spark.stop()
\`\`\`

## 来源与事实边界

本页依据 Spark Tuning、SQL Performance Tuning、Configuration、Dataset API 和 Job Scheduling 文档。具体默认值会随版本变化，生产结论应以当前 Spark 版本、应用配置、SQL UI 和 event log 为准。`,
  },
  "deployment-and-cluster-managers.md": {
    title: "Spark 部署模式与集群管理器",
    description: "解释 Spark client/cluster mode、Standalone、YARN、Kubernetes、动态资源、shuffle tracking 与 decommission 边界。",
    topic: "deployment-and-cluster-managers",
    difficulty: "advanced",
    sidebar_position: 8,
    source_ids: ["spark-cluster-overview", "spark-submitting-applications", "spark-running-on-yarn", "spark-running-on-kubernetes", "spark-standalone-mode", "spark-job-scheduling", "spark-configuration-doc", "spark-docs-home"],
    claim_ids: ["spark-claim-0045", "spark-claim-0046", "spark-claim-0047", "spark-claim-0048", "spark-claim-0072", "spark-claim-0073", "spark-claim-0074", "spark-claim-0142", "spark-claim-0143", "spark-claim-0144"],
    tags: ["spark", "deploy", "driver", "executor", "cluster-manager", "dynamic-allocation", "knowledge-base", "production"],
    body: `## 定位与边界

部署模式决定 Driver 在哪里运行，集群管理器决定资源如何申请和回收。Spark 的执行语义仍然是 Driver 组织计划、Executor 执行 Task，但 Driver 的位置、网络可达性、日志归属、失败影响和资源生命周期会因 client mode、cluster mode、Standalone、YARN、Kubernetes 而不同。

不要把部署模式和计算模型混为一谈。client mode 不等于本地执行，cluster mode 也不等于更快；它们主要改变 Driver 生命周期和运维边界。

## Client Mode 与 Cluster Mode

client mode 下 Driver 运行在提交应用的客户端进程中，适合交互式调试和本地开发。风险是客户端断开、网络不可达或本机资源不足会直接影响应用，Driver 日志也在客户端侧。

cluster mode 下 Driver 运行在集群内部，适合生产定时任务和长时间运行任务。它降低了客户端机器对应用生命周期的影响，但要求集群侧具备完整依赖、日志、权限、镜像、配置和网络访问能力。

## 集群管理器差异

Standalone 是 Spark 自带的集群管理模式，概念简单，适合独立 Spark 集群。YARN 把 Spark 应用放入 Hadoop 资源队列，重点是队列容量、ApplicationMaster、NodeManager、container 日志和多租户治理。Kubernetes 把 Driver 和 Executor 映射为 Pod，重点是镜像、service account、namespace、pod 调度、volume 和 executor pod 生命周期。

这些模式都不改变 Spark 计划和 stage/task 的核心语义，但会改变资源申请、故障恢复、日志采集、依赖分发和安全隔离的具体操作方式。

## 动态资源与 Shuffle 边界

Dynamic Allocation 会根据 backlog 和空闲状态调整 executor 数量。它能提升集群利用率，但会引入 executor 回收与 shuffle 数据可用性的边界问题。传统做法依赖 external shuffle service；新模式可以依赖 shuffle tracking 等机制避免过早回收仍持有 shuffle 输出的 executor。

判断动态资源是否适合，要看作业是否存在长时间 shuffle 依赖、cache 重用、状态任务、短批次流任务和外部 shuffle 服务稳定性。动态资源不是免费扩缩容，错误配置会造成频繁申请释放、缓存失效、延迟波动和 shuffle fetch failure。

## Executor Decommission

Decommission 的目标是在节点维护、缩容或抢占时尽量迁移 shuffle 或缓存相关状态，降低直接杀 executor 带来的重算和失败风险。它不是事务保证，也不能消除所有 executor 丢失影响；它只是把“突然消失”变成“有机会迁移和通知”的过程。

排查 decommission 问题时，应看 executor removed reason、shuffle fetch failure、block migration 日志、cluster manager 事件和节点维护窗口。不能只看 Spark 应用是否最终成功，还要看重算代价和尾延迟是否被放大。

## 生产检查清单

1. Driver 位置：是否需要集群内长期运行，是否依赖客户端网络。
2. 依赖分发：jar、py-files、conf、native lib、镜像是否对 Driver 和 Executor 都可见。
3. 日志与 UI：Driver、executor、event log、History Server 是否可追踪。
4. 资源隔离：队列、namespace、service account、executor cores/memory/overhead 是否合理。
5. 动态资源：shuffle tracking、external shuffle service、idle timeout、min/max executor 是否匹配负载。
6. 退出语义：失败重试、driver restart、application attempt、pod/container 退出码是否能定位根因。

## 示例：提交参数阅读方式

\`\`\`bash
spark-submit \\
  --deploy-mode cluster \\
  --master yarn \\
  --conf spark.dynamicAllocation.enabled=true \\
  --conf spark.shuffle.service.enabled=true \\
  --conf spark.eventLog.enabled=true \\
  app.py
\`\`\`

这段配置不能只看“开了动态资源”。需要继续确认 YARN 队列是否允许扩容、external shuffle service 是否部署、event log 是否落到可靠存储、Driver 日志是否能从 ResourceManager 或 History Server 找到。

## 来源与事实边界

本页依据 Spark Cluster Mode、Submitting Applications、YARN、Kubernetes、Standalone、Job Scheduling 和 Configuration 文档。不同公司平台可能封装 spark-submit 或替换默认配置，实际生产判断必须以平台文档和当前应用配置为准。`,
  },
};

const newPages = {
  "spark-connect.md": {
    title: "Spark Connect 架构与客户端边界",
    description: "解释 Spark Connect 如何通过客户端/服务端解耦、未解析逻辑计划、gRPC 和 Arrow 改变应用接入边界。",
    topic: "spark-connect",
    difficulty: "advanced",
    sidebar_position: 28,
    source_ids: ["spark-connect-overview", "spark-sql-guide", "spark-docs-home", "spark-overview-doc"],
    claim_ids: ["spark-claim-0145", "spark-claim-0146", "spark-claim-0147", "spark-claim-0002"],
    tags: ["spark", "spark-connect", "client-server", "grpc", "arrow", "knowledge-base", "production"],
    body: `## 定位与边界

Spark Connect 的核心价值是把客户端应用和 Spark Driver 解耦。传统 Spark 应用通常把用户代码和 Driver 放在同一进程模型里，客户端需要携带较多 Spark 运行时依赖；Spark Connect 则让客户端把 DataFrame 操作表达成未解析逻辑计划，通过 gRPC 发送给服务端，由服务端 Spark 会话负责分析、优化和执行。

这改变的是接入边界，不是 Spark SQL 的底层执行语义。计划仍然要经过分析、优化、物理执行和 task 调度；变化在于客户端进程不再直接承载完整 Driver 运行时，应用可以更轻量地嵌入到 IDE、Notebook、服务端应用或远程客户端中。

## 执行链路

客户端构造 DataFrame 操作时，并不在本地立即解析表、列和函数语义，而是形成未解析逻辑计划。计划通过 gRPC 发送到 Spark Connect server，服务端根据 catalog、函数、类型和会话配置完成分析，再进入 Catalyst 和物理执行。结果可以通过 Arrow 等格式返回客户端。

这个链路解释了 Spark Connect 的两个关键边界：客户端 API 表达能力必须能被服务端识别；服务端环境才是权限、catalog、数据访问和执行资源的真实所在地。

## 生产关注点

Spark Connect 适合需要远程 Spark 能力但不想在客户端嵌入完整 Spark Driver 的场景。生产落地时要重点设计认证、会话隔离、请求超时、结果大小限制、服务端资源配额、版本兼容和错误追踪。客户端看到的是 DataFrame API，但真正的失败可能来自服务端 catalog、执行计划、资源不足或网络传输。

## 与传统 spark-submit 的差异

spark-submit 更像提交一个完整应用，由 Driver 组织生命周期；Spark Connect 更像远程会话和计划提交协议。前者适合批任务和生产作业编排，后者适合交互式、服务化或轻客户端接入。两者不是互相替代关系，而是入口模型不同。

## 来源与事实边界

本页依据 Spark Connect 官方概览和 Spark SQL 文档。具体语言客户端、API 覆盖、版本兼容和部署方式需要以当前 Spark 版本的 Connect 文档为准。`,
  },
  "monitoring-history-server-event-log-and-rest-api.md": {
    title: "Spark 监控、History Server 与 Event Log",
    description: "解释 Spark UI、History Server、event log、REST API 和 metrics 如何形成可复核排障证据链。",
    topic: "monitoring-history-server-event-log-rest-api",
    difficulty: "advanced",
    sidebar_position: 29,
    source_ids: ["spark-monitoring-doc", "spark-job-scheduling", "spark-tuning-guide", "spark-docs-home"],
    claim_ids: ["spark-claim-0148", "spark-claim-0149", "spark-claim-0150", "spark-claim-0015"],
    tags: ["spark", "monitoring", "history-server", "event-log", "metrics", "knowledge-base", "production"],
    body: `## 定位与边界

Spark 监控不是只看当前 Web UI。当前 UI 只能反映正在运行或仍保留状态的应用；History Server 依赖 event log 回放已完成应用；REST API 和 metrics system 则提供程序化采集入口。生产排障必须把这些证据串起来，否则无法复盘已经结束的慢任务或失败任务。

## Event Log 与 History Server

开启 event log 后，Spark 会把应用事件写到配置的日志目录。History Server 读取这些日志并重建应用的 Jobs、Stages、SQL、Executors 等视图。这个机制让离线作业、失败作业和历史性能回归可以被复查。

event log 目录应落到可靠存储，并设置保留、压缩、清理和访问权限。日志太少会丢证据，日志太多会拖慢 History Server 并增加存储成本。

## UI 与 REST API

Spark UI 提供人类排障入口，REST API 适合自动化采集。典型证据包括 job/stage/task 状态、task duration 分布、shuffle read/write、spill、executor memory、GC 时间、SQL plan 和 accumulator 指标。

## Metrics 与告警

Metrics system 更适合持续监控，Event Log 更适合事后复盘。告警不应只看 application failed，还应覆盖 executor lost、batch duration、input/processed rows、shuffle spill、driver 内存、GC 时间、队列等待和 History Server 回放延迟。

## 来源与事实边界

本页依据 Spark Monitoring、Job Scheduling 和 Tuning 文档。不同部署平台可能把 UI、event log、metrics 和日志采集接入到不同系统，字段名称和保留策略需要以平台实现为准。`,
  },
  "dynamic-allocation-decommission-and-shuffle-tracking.md": {
    title: "Spark 动态资源、Decommission 与 Shuffle Tracking",
    description: "解释 Spark 动态资源伸缩、executor 回收、shuffle 数据可用性和 decommission 的生产边界。",
    topic: "dynamic-allocation-decommission-shuffle-tracking",
    difficulty: "advanced",
    sidebar_position: 30,
    source_ids: ["spark-job-scheduling", "spark-configuration-doc", "spark-cluster-overview", "spark-tuning-guide"],
    claim_ids: ["spark-claim-0142", "spark-claim-0143", "spark-claim-0144", "spark-claim-0024"],
    tags: ["spark", "dynamic-allocation", "decommission", "shuffle", "executor", "knowledge-base", "production"],
    body: `## 定位与边界

动态资源解决的是 executor 数量随负载变化的问题，但它必须和 shuffle 数据可用性一起设计。Spark 作业在 shuffle 之后可能仍依赖上游 executor 产生的 map output；如果 executor 被过早回收，下游可能出现 fetch failure 或被迫重算上游 stage。

## Dynamic Allocation 链路

当存在 pending task backlog 时，Spark 可以申请更多 executor；当 executor 空闲超过阈值时，Spark 可以释放 executor。这个机制提升集群利用率，但会让缓存、shuffle 输出和 executor 本地状态变得更不稳定。

## Shuffle Tracking 与 External Shuffle Service

external shuffle service 让 executor 退出后仍能提供 shuffle block；shuffle tracking 则让 Spark 跟踪哪些 executor 仍持有被依赖的 shuffle 输出，避免过早移除。两者都是为了解决“计算资源可回收”和“shuffle 数据仍被需要”之间的矛盾。

## Decommission

Decommission 用于在维护、缩容或抢占前尽量迁移 block 或通知 Spark 做有序退出。它减少突然丢失 executor 的冲击，但不能把所有本地状态变成强持久化，也不能替代外部可靠存储。

## 排障证据

需要同时看 executor removed reason、dynamic allocation 日志、shuffle fetch failure、stage retry、block manager 日志、external shuffle service 状态、节点维护事件和集群管理器事件。只看 executor 数量变化无法判断是否安全。

## 来源与事实边界

本页依据 Spark Job Scheduling、Configuration、Cluster Mode 和 Tuning 文档。具体动态资源默认值、shuffle service 支持和 decommission 行为依赖部署模式和 Spark 版本。`,
  },
  "pyspark-arrow-pandas-udf-and-python-boundaries.md": {
    title: "PySpark、Arrow 与 Pandas UDF 边界",
    description: "解释 PySpark 跨语言执行、Arrow 数据交换、Pandas UDF、toPandas 和 Python Worker 的性能与内存边界。",
    topic: "pyspark-arrow-pandas-udf-python-boundaries",
    difficulty: "advanced",
    sidebar_position: 31,
    source_ids: ["spark-pyspark-user-guide", "spark-arrow-pandas-doc", "spark-sql-guide", "spark-configuration-doc"],
    claim_ids: ["spark-claim-0151", "spark-claim-0152", "spark-claim-0153", "spark-claim-0032"],
    tags: ["spark", "pyspark", "arrow", "pandas-udf", "python-worker", "knowledge-base", "production"],
    body: `## 定位与边界

PySpark 让 Python 用户使用 Spark，但执行链路并不是纯 Python。计划构建、调度和 JVM 执行仍在 Spark 侧，Python 代码通常运行在 Python worker 中。跨 JVM 与 Python 的数据交换、序列化、Arrow 批次和 UDF 调用会形成额外边界。

## Arrow 与 Pandas UDF

Arrow 可以降低 JVM 与 Python 之间列式数据交换成本，Pandas UDF 借助 Arrow 批量处理数据。它适合向量化计算，但不适合把任意大数据量搬到 Driver。Arrow 优化的是跨语言传输和批处理成本，不改变 Spark 的分布式调度语义。

## Driver 结果面

toPandas、collect 和大规模 show 都会把数据带回 Driver。即使用 Arrow，结果仍需要放进 Driver 进程内存。生产中应限制结果规模，优先写到分布式存储或用 sample/limit 做诊断。

## Python Worker 风险

Python UDF 可能阻断部分 Catalyst 优化，增加序列化和进程通信成本。排查时要看 physical plan 中 PythonUDF 节点、Arrow batch size、executor CPU、Python worker 内存和 task 运行时间。

## 来源与事实边界

本页依据 PySpark、Arrow/Pandas 和 Spark SQL 文档。具体 Arrow 类型支持、fallback 行为和 Pandas UDF API 会随 Spark 与 PyArrow/Pandas 版本变化。`,
  },
  "security-acl-encryption-redaction-and-ui-protection.md": {
    title: "Spark 安全、ACL、加密与敏感信息保护",
    description: "解释 Spark UI ACL、事件日志保护、配置脱敏、网络加密和运行时权限边界。",
    topic: "security-acl-encryption-redaction-ui-protection",
    difficulty: "advanced",
    sidebar_position: 32,
    source_ids: ["spark-security-doc", "spark-configuration-doc", "spark-monitoring-doc", "spark-submitting-applications"],
    claim_ids: ["spark-claim-0154", "spark-claim-0155", "spark-claim-0156", "spark-claim-0157"],
    tags: ["spark", "security", "acl", "encryption", "redaction", "knowledge-base", "production"],
    body: `## 定位与边界

Spark 安全不是单个开关，而是 UI 访问、事件日志、网络通信、认证、加密、配置脱敏、依赖分发和底层存储权限共同形成的边界。Spark 可以提供应用级控制，但数据访问最终还依赖 HDFS、对象存储、Hive Metastore、Kubernetes、YARN 或外部权限系统。

## UI 与 Event Log 保护

Spark UI 和 History Server 会暴露 job、SQL、环境变量、配置、accumulator、错误栈和部分执行计划信息。生产环境应开启 ACL、限制 History Server 访问，并对 event log 存储做权限控制。否则即使数据本身受保护，执行元数据也可能泄露敏感信息。

## 配置脱敏

Spark 支持对敏感配置做 redaction，避免 token、password、secret 在 UI、日志或 event log 中直接出现。脱敏规则应覆盖自定义配置键、连接串、认证参数和环境变量，而不是只依赖默认规则。

## 网络与存储边界

Spark 网络加密、RPC 认证、shuffle 加密和 I/O 加密需要结合部署模式配置。即使 Spark 内部链路加密，外部数据源、checkpoint 目录、event log 目录和临时目录也需要独立权限和加密策略。

## 来源与事实边界

本页依据 Spark Security、Configuration、Monitoring 和 Submitting Applications 文档。企业平台通常还会叠加 Kerberos、Ranger、Lake Formation、Kubernetes RBAC 或云 IAM，应以实际平台权限链路为准。`,
  },
};

function docFrontmatter(page) {
  return {
    kb_id: `bigdata/spark/${page.topic}`,
    title: page.title,
    description: page.description,
    domain: "bigdata",
    component: "spark",
    topic: page.topic,
    difficulty: page.difficulty,
    status: "reviewed",
    sidebar_position: page.sidebar_position,
    version_scope: "Spark 4.1.1 docs as verified on 2026-05-05",
    last_verified_at: today,
    source_ids: page.source_ids,
    claim_ids: page.claim_ids,
    tags: page.tags,
  };
}

function writeDoc(filename, page) {
  const fm = yaml.dump(docFrontmatter(page), { lineWidth: 120, quotingType: '"', forceQuotes: false }).trimEnd();
  const content = `---\n${fm}\n---\n${page.body.trim()}\n`;
  fs.writeFileSync(path.join(sparkDir, filename), content, "utf8");
}

function appendSources() {
  const file = path.join(repoRoot, "sources", "official", "bigdata.yaml");
  let text = fs.readFileSync(file, "utf8");
  const additions = [
    ["spark-connect-overview", "Spark Connect Overview", "https://spark.apache.org/docs/latest/spark-connect-overview.html", "Use for Spark Connect client/server architecture, unresolved logical plans, gRPC and Arrow result boundaries."],
    ["spark-monitoring-doc", "Spark Monitoring", "https://spark.apache.org/docs/latest/monitoring.html", "Use for Web UI, History Server, event logs, REST API and metrics system boundaries."],
    ["spark-pyspark-user-guide", "PySpark User Guide", "https://spark.apache.org/docs/latest/api/python/user_guide/index.html", "Use for PySpark execution, Python API and user-facing boundaries."],
    ["spark-arrow-pandas-doc", "Apache Arrow in PySpark", "https://spark.apache.org/docs/latest/api/python/tutorial/sql/arrow_pandas.html", "Use for Arrow, Pandas conversion and Pandas UDF boundaries."],
    ["spark-security-doc", "Spark Security", "https://spark.apache.org/docs/latest/security.html", "Use for Spark ACLs, authentication, encryption, redaction and UI/event log protection."],
  ];
  for (const [id, title, url, notes] of additions) {
    if (text.includes(`- id: ${id}\n`)) continue;
    text += `\n- id: ${id}\n  title: ${title}\n  kind: official-doc\n  component: spark\n  url: ${url}\n  version_scope: Spark 4.1.1 docs as verified on 2026-05-05\n  last_verified_at: '2026-05-05'\n  trust_level: primary\n  notes: ${notes}\n`;
  }
  fs.writeFileSync(file, text, "utf8");
}

function appendClaims() {
  const file = path.join(repoRoot, "claims", "bigdata", "spark.yaml");
  let text = fs.readFileSync(file, "utf8");
  const claims = [
    ["spark-claim-0142", "Spark dynamic allocation can request executors when pending tasks build up and remove executors that stay idle, so it changes executor lifecycle rather than the semantics of a stage or task.", ["spark-job-scheduling"]],
    ["spark-claim-0143", "Spark dynamic allocation requires a strategy for preserving shuffle data after executors are removed, such as an external shuffle service or shuffle tracking, depending on deployment and configuration.", ["spark-job-scheduling", "spark-configuration-doc"]],
    ["spark-claim-0144", "Spark decommissioning is designed to reduce the impact of planned executor or node removal by migrating or preserving relevant blocks where supported, but it is not a replacement for durable external storage.", ["spark-configuration-doc", "spark-job-scheduling"]],
    ["spark-claim-0145", "Spark Connect decouples client applications from the Spark driver by sending unresolved logical plans from the client to a remote Spark server.", ["spark-connect-overview"]],
    ["spark-claim-0146", "Spark Connect uses gRPC as the protocol layer between client and server, and can use Arrow-oriented result transfer for efficient data exchange.", ["spark-connect-overview"]],
    ["spark-claim-0147", "Spark Connect changes application access and deployment boundaries, but server-side analysis, optimization and execution still depend on Spark SQL and the Spark runtime.", ["spark-connect-overview", "spark-sql-guide"]],
    ["spark-claim-0148", "Spark monitoring documentation describes application Web UIs and a History Server that reconstructs completed applications from event logs.", ["spark-monitoring-doc"]],
    ["spark-claim-0149", "Spark exposes monitoring information through Web UI pages, REST APIs, metrics and event logs, which should be combined for production diagnosis.", ["spark-monitoring-doc"]],
    ["spark-claim-0150", "Spark event logs are the durable evidence source for post-run analysis, so production deployments need retention, access control and storage planning for them.", ["spark-monitoring-doc"]],
    ["spark-claim-0151", "PySpark execution crosses the JVM and Python boundary, so Python UDF and Pandas UDF workloads can introduce serialization, process and memory overhead beyond the physical Spark plan.", ["spark-pyspark-user-guide", "spark-arrow-pandas-doc"]],
    ["spark-claim-0152", "Apache Arrow support in PySpark is intended to make columnar data transfer between Spark and Python/Pandas more efficient, but it does not remove driver memory limits for collecting large results.", ["spark-arrow-pandas-doc", "spark-dataset-javadoc"]],
    ["spark-claim-0153", "Pandas UDFs process data in batches through the Python worker boundary, so diagnosis should consider Arrow batches, Python worker memory and Catalyst optimization barriers.", ["spark-arrow-pandas-doc", "spark-sql-guide"]],
    ["spark-claim-0154", "Spark security documentation covers authentication, authorization, encryption and UI access controls, but underlying storage and cluster-manager permissions remain separate boundaries.", ["spark-security-doc"]],
    ["spark-claim-0155", "Spark supports redaction of sensitive configuration information so credentials and tokens are not exposed directly through logs or user interfaces.", ["spark-security-doc", "spark-configuration-doc"]],
    ["spark-claim-0156", "Spark UI and History Server can expose execution metadata, configuration and SQL details, so access control and event-log protection are part of production security.", ["spark-security-doc", "spark-monitoring-doc"]],
    ["spark-claim-0157", "Spark network and I/O encryption settings protect Spark internal communication and local data paths only when they are configured consistently with the deployment environment.", ["spark-security-doc", "spark-configuration-doc"]],
  ];
  for (const [id, statement, sourceIds] of claims) {
    if (text.includes(`- id: ${id}\n`)) continue;
    text += `\n- id: ${id}\n  domain: bigdata\n  component: spark\n  statement: ${JSON.stringify(statement)}\n  status: reviewed\n  confidence: high\n  version_scope: "Spark 4.1.1 docs as verified on 2026-05-05"\n  last_verified_at: "2026-05-05"\n  source_ids:\n${sourceIds.map((s) => `    - ${s}`).join("\n")}\n  notes: Added during Spark content deepening to cover modern production boundaries.\n`;
  }
  fs.writeFileSync(file, text, "utf8");
}

function fixSparkCategory() {
  const file = path.join(sparkDir, "_category_.json");
  const data = {
    label: "Spark",
    position: 2,
    link: {
      type: "generated-index",
      title: "Spark",
      description: "Spark 知识库：覆盖 Driver、Executor、Job、Stage、Shuffle、SQL、Streaming、内存模型、部署模式与生产调优。",
    },
  };
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeExamples() {
  const examplesDir = path.join(repoRoot, "examples", "python", "spark");
  const examples = {
    "join_strategy_selection_outline.py": `from pyspark.sql import SparkSession, functions as F\n\nspark = SparkSession.builder.master(\"local[2]\").appName(\"join-strategy-selection-demo\").getOrCreate()\n\nfact = spark.range(0, 10000).select((F.col(\"id\") % 100).alias(\"user_id\"), F.col(\"id\").alias(\"order_id\"))\ndim = spark.range(0, 100).select(F.col(\"id\").alias(\"user_id\"), F.concat(F.lit(\"user_\"), F.col(\"id\")).alias(\"name\"))\n\njoined = fact.join(F.broadcast(dim), \"user_id\").groupBy(\"name\").count()\njoined.explain(\"formatted\")\nprint(joined.orderBy(\"name\").take(5))\n\nspark.stop()\n`,
    "statistics_cbo_outline.py": `from pyspark.sql import SparkSession, functions as F\n\nspark = SparkSession.builder.master(\"local[2]\").appName(\"statistics-cbo-demo\").getOrCreate()\n\nspark.sql(\"CREATE OR REPLACE TEMP VIEW orders AS SELECT id, id % 10 AS shop_id, id * 3 AS amount FROM range(1000)\")\nplan = spark.sql(\"SELECT shop_id, count(*) AS cnt, sum(amount) AS gmv FROM orders GROUP BY shop_id\")\n\n# cost 模式可以观察估算信息；本地临时视图的统计信息有限，生产中应结合 catalog/table stats。\nplan.explain(\"cost\")\nprint(plan.orderBy(\"shop_id\").collect())\n\nspark.stop()\n`,
    "streaming_trigger_foreachbatch_outline.py": `from pyspark.sql import SparkSession, functions as F\n\nspark = SparkSession.builder.master(\"local[2]\").appName(\"foreach-batch-demo\").getOrCreate()\n\nseen_batches = []\n\ndef write_batch(batch_df, batch_id):\n    # 生产中可用 batch_id 做幂等去重；这里仅打印每个 batch 的聚合结果。\n    seen_batches.append(batch_id)\n    batch_df.groupBy(\"bucket\").count().orderBy(\"bucket\").show(truncate=False)\n\nstream = (\n    spark.readStream.format(\"rate\")\n    .option(\"rowsPerSecond\", 5)\n    .load()\n    .select((F.col(\"value\") % 3).alias(\"bucket\"))\n)\n\nquery = (\n    stream.writeStream.foreachBatch(write_batch)\n    .option(\"checkpointLocation\", \"/tmp/spark-foreach-batch-demo-checkpoint\")\n    .trigger(processingTime=\"5 seconds\")\n    .start()\n)\n\nquery.awaitTermination(15)\nquery.stop()\nspark.stop()\n`,
    "unified_memory_outline.py": `from pyspark.sql import SparkSession, functions as F\n\nspark = SparkSession.builder.master(\"local[2]\").appName(\"unified-memory-observation-demo\").getOrCreate()\n\nbase = spark.range(0, 10000).select((F.col(\"id\") % 100).alias(\"k\"), F.col(\"id\").alias(\"v\"))\ncached = base.repartition(4, \"k\").cache()\nprint(\"cached rows\", cached.count())\n\nagg = cached.groupBy(\"k\").agg(F.count(\"*\").alias(\"cnt\"), F.sum(\"v\").alias(\"sum_v\"))\nagg.explain(\"formatted\")\nprint(agg.orderBy(\"k\").take(5))\n\ncached.unpersist()\nspark.stop()\n`,
  };
  for (const [file, content] of Object.entries(examples)) {
    fs.writeFileSync(path.join(examplesDir, file), content, "utf8");
  }
}

appendSources();
appendClaims();
fixSparkCategory();
for (const [file, page] of Object.entries(corePages)) writeDoc(file, page);
for (const [file, page] of Object.entries(newPages)) writeDoc(file, page);
writeExamples();

console.log(JSON.stringify({ rewrittenCorePages: Object.keys(corePages).length, newPages: Object.keys(newPages).length, examplesUpdated: 4 }, null, 2));
