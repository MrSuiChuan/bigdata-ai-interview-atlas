import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = process.cwd();
const sparkDir = path.join(repoRoot, "docs", "bigdata", "spark");
const today = "2026-05-05";

function readFrontmatter(file) {
  const full = path.join(sparkDir, file);
  const text = fs.readFileSync(full, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error(`missing frontmatter: ${file}`);
  return { full, data: yaml.load(match[1]) };
}

function writePage(file, body) {
  const { full, data } = readFrontmatter(file);
  data.status = "reviewed";
  data.last_verified_at = today;
  data.version_scope = "Spark 4.1.1 docs as verified on 2026-05-05";
  const frontmatter = yaml.dump(data, { lineWidth: 120, quotingType: '"' }).trimEnd();
  fs.writeFileSync(full, `---\n${frontmatter}\n---\n${body.trim()}\n`, "utf8");
}

function code(lang, text) {
  return `~~~${lang}\n${text.trim()}\n~~~`;
}

function compose(spec) {
  const parts = [
    `## ${spec.h1 ?? "定位与边界"}\n${spec.positioning}`,
    `## 核心对象\n${spec.objects}`,
    `## ${spec.flowTitle ?? "执行链路"}\n${spec.flow}`,
    `## ${spec.stateTitle ?? "状态、容错与边界"}\n${spec.state}`,
    `## ${spec.diagnosisTitle ?? "性能与诊断"}\n${spec.diagnosis}`,
  ];
  if (spec.example) parts.push(`## 示例：${spec.exampleTitle ?? "最小可观察入口"}\n${code(spec.exampleLang ?? "python", spec.example)}`);
  parts.push(`## 设计取舍\n${spec.tradeoff}`);
  parts.push(`## 来源与事实边界\n${spec.sources}`);
  return parts.join("\n\n");
}

const sparkPlanExample = `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-plan-demo").getOrCreate()
df = spark.range(0, 10000).select((F.col("id") % 100).alias("k"), F.col("id"))
result = df.repartition(8, "k").groupBy("k").count()
result.explain("formatted")
print(result.orderBy("k").take(5))
spark.stop()
`;

const pages = {
  "overview.md": compose({
    positioning:
      "Spark 是面向大规模数据处理的统一计算引擎。这里的“统一”不是说所有场景都由一个 API 完成，而是说 SQL、DataFrame、Dataset、RDD、Structured Streaming、MLlib、GraphX 等能力最终共享 Driver、Executor、Task、Shuffle 和外部存储依赖模型。理解 Spark 的第一步，是把它看成“计划生成 + 分布式执行 + 失败恢复”的组合，而不是把它看成某一个 API。\n\nSpark 不直接提供长期数据存储、元数据治理、权限闭环或业务事务语义。数据通常来自 HDFS、对象存储、Hive Metastore、Lakehouse 表格式、Kafka 或数据库；资源通常来自 Standalone、YARN 或 Kubernetes；端到端一致性、权限和审计还要依赖外部系统。因此，Spark 页面讨论的是计算引擎保证什么，而不是整个数据平台保证什么。",
    objects:
      "| 对象 | 作用 | 关键边界 |\n| --- | --- | --- |\n| Driver | 运行用户主程序，创建 SparkContext 或 SparkSession，构建计划并协调执行 | Driver 是控制面和结果面，过大的 collect、计划字符串或广播对象都可能压垮 Driver |\n| Executor | 在工作节点上运行 task，持有缓存、shuffle block 和部分运行时状态 | Executor 丢失会影响本地缓存和 shuffle 输出，但计算可通过 lineage 或 stage 重提恢复 |\n| Job | 一次 action 触发的执行单元 | 多个 job 可以共享上游 stage，也可能因为一次 action 才真正执行 transformation |\n| Stage | 按 shuffle 边界切分的调度阶段 | 宽依赖引入 stage 边界，窄依赖通常可在同一 stage 内流水执行 |\n| Task | 针对一个分区的最小调度执行单元 | task 重试是 attempt 级别，外部副作用需要调用方自己处理幂等 |",
    flow:
      "Spark 程序通常先构造 transformation。RDD transformation 记录 lineage，Dataset/DataFrame transformation 构造逻辑计划；这些步骤默认不会立即运行。action 出现后，Driver 才根据依赖关系或逻辑计划创建 job，生成 stage DAG，把每个 stage 切成多个 task，并交给 executor 并行执行。\n\nSQL、DataFrame、Dataset 与 RDD 的入口不同，但执行时都要面对同类问题：分区数决定并行度上限，shuffle 决定跨分区数据重分布成本，executor 内存决定缓存和执行算子的工作空间，外部存储决定扫描和写出成本。",
    state:
      "Spark 的恢复主要依赖 lineage、shuffle 中间结果、checkpoint 和外部可靠存储。cache/persist 是性能优化，不是业务持久化；checkpoint 能截断 lineage 或保存流式进度，但目录可靠性和查询兼容性需要单独设计。Spark task 或 stage 重试只保证计算链路继续推进，不自动保证外部数据库、消息系统或下游表的业务幂等。",
    diagnosis:
      "Spark 性能不是由单个参数决定，而是由扫描数据量、分区布局、shuffle 范围、join 策略、序列化、缓存、executor 资源、GC、外部存储吞吐和 sink 提交共同决定。可靠的优化顺序是：先看 physical plan，再看 Spark UI 的 Jobs、Stages、SQL、Executors；先确认瓶颈在扫描、shuffle、CPU、内存、GC、网络还是外部系统，再决定是否调参或改写逻辑。",
    exampleTitle: "最小执行链路",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("spark-overview-demo").getOrCreate()
df = spark.range(0, 1000).select((F.col("id") % 10).alias("bucket"), F.col("id"))
result = df.where("id >= 100").groupBy("bucket").count()
result.explain("formatted")
print(result.orderBy("bucket").collect())
spark.stop()
`,
    tradeoff:
      "设计 Spark 作业时，要先确认数据规模、增长速度、延迟目标、失败恢复目标和下游可见性要求。批处理作业更关注吞吐、扫描裁剪、文件大小和重跑成本；流式作业更关注 checkpoint、watermark、state store、trigger 和 sink 语义；交互式查询更关注计划质量、缓存、广播和 Driver 结果面。",
    sources:
      "本页依据 Spark Overview、RDD Guide、SQL/DataFrame/Dataset 文档、Job Scheduling 和 Tuning 文档总结稳定机制。具体默认值、配置名和行为边界可能随版本变化，涉及参数时应以当前集群 Spark 版本的官方文档和运行时配置为准。",
  }),

  "rdd-dataframe-dataset.md": compose({
    positioning:
      "RDD、DataFrame 和 Dataset 是 Spark 的三层常见编程抽象。RDD 更接近底层执行抽象，直接暴露分区、依赖、计算函数和存储级别；DataFrame 是带命名列的 Dataset，面向结构化数据和 SQL 优化；Dataset 在 Scala 和 Java 中提供强类型 API，同时承载逻辑计划。\n\n这三者不是简单的新旧替代关系。RDD 适合需要直接控制分区、依赖或对象级函数的场景；DataFrame/Dataset 适合大多数结构化 ETL、SQL 分析和湖仓查询，因为 Catalyst 能利用 schema、表达式和统计信息做优化。Python 用户主要使用 DataFrame，不能照搬 Scala/Java typed Dataset 的能力。",
    objects:
      "| 抽象 | 内部关键点 | 适合场景 | 风险 |\n| --- | --- | --- | --- |\n| RDD | partitions、dependencies、compute function、partitioner、preferred locations | 自定义分区、底层转换、需要直接控制 lineage 的计算 | 优化器信息少，黑盒函数多 |\n| DataFrame | Dataset[Row]，带 schema 和逻辑计划 | SQL、ETL、聚合、join、湖仓表读写 | 统计信息缺失或 UDF 会降低计划质量 |\n| Dataset | typed logical plan，Scala/Java 强类型接口 | JVM 项目中结合类型安全和结构化优化 | Python 不支持 typed Dataset API |\n| Encoder/Row | 结构化数据和 JVM 对象之间的表示 | Dataset 类型转换和执行计划生成 | 类型转换和 UDF 会增加运行时成本 |",
    flow:
      "RDD transformation 记录的是 lineage，例如 map、filter、flatMap 会生成新的 RDD 依赖关系，直到 action 触发时才按依赖提交 job。Dataset/DataFrame transformation 记录的是逻辑计划，action 触发时先经过分析、优化和物理计划生成，然后才进入 task 执行。\n\n这一区别决定了诊断方法。RDD 程序重点看 lineage、partitioner、persist、shuffle dependency 和 task locality；DataFrame/Dataset 程序要先看 explain 输出、SQL UI、统计信息、filter/project 是否下推、join 策略和 AQE 是否改变运行时计划。",
    state:
      "RDD 的容错核心是 lineage：分区丢失时可以根据依赖重算。persist/cache 可以把中间结果保留在内存或磁盘中以减少重复计算，但缓存不是永久存储，丢失后仍可能重算。DataFrame/Dataset 的 cache 默认使用结构化数据的默认存储级别，逻辑计划仍是恢复和重新执行的重要依据。",
    diagnosis:
      "RDD 性能重点关注分区数量、序列化、窄/宽依赖、缓存级别和函数执行成本。DataFrame/Dataset 性能重点关注扫描裁剪、统计信息、join 策略、shuffle partition、AQE、codegen、列式读写和 UDF 边界。不要把“DataFrame 一定比 RDD 快”当成绝对结论，核心差异是结构化表达能让优化器看见计算意图。",
    exampleTitle: "同一逻辑的两种表达",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("rdd-vs-dataframe-demo").getOrCreate()
rows = [("a", 1), ("a", 2), ("b", 3)]
rdd_result = spark.sparkContext.parallelize(rows).reduceByKey(lambda a, b: a + b)
print(rdd_result.collect())

df = spark.createDataFrame(rows, ["k", "v"])
df_result = df.groupBy("k").agg(F.sum("v").alias("sum_v"))
df_result.explain("formatted")
print(df_result.orderBy("k").collect())
spark.stop()
`,
    tradeoff:
      "新项目优先用 SQL/DataFrame 表达主流程，把复杂逻辑尽量拆成可优化的列运算；少用 Python UDF 或无法下推的黑盒函数。需要底层控制时再使用 RDD，并明确缓存、checkpoint、partitioner 和序列化策略。",
    sources:
      "本页依据 Spark Overview、RDD Guide、Spark SQL Guide 和 Dataset API 文档。语言差异、Dataset typed API 可用性、默认存储级别和优化规则应以当前 Spark 版本为准。",
  }),

  "shuffle-persistence-fault-tolerance.md": compose({
    positioning:
      "Shuffle 是 Spark 中最重要的高成本边界之一，它把上游分区的数据按 key、partitioner 或分布要求重新组织到下游分区。持久化是为了复用中间结果，容错是为了在 task、executor 或节点失败后恢复计算。三者经常同时出现，但语义不同：shuffle 是数据重分布，persist/cache 是性能优化，容错依赖 lineage、shuffle 中间文件、checkpoint 和外部存储共同完成。",
    objects:
      "| 对象 | 作用 | 风险 |\n| --- | --- | --- |\n| ShuffleMapStage | 产生 shuffle map output 的上游 stage | 输出丢失会导致下游 fetch failure 和 stage 重提 |\n| ResultStage | 产生 action 结果或写出结果的下游 stage | 可能因上游 shuffle block 不可用而失败重试 |\n| BlockManager | 管理 executor 上的缓存块和 shuffle 块 | executor 丢失会带走本地块 |\n| StorageLevel | 控制缓存数据放在内存、磁盘、是否序列化、是否复制 | 选择不当会导致 GC、磁盘压力或恢复慢 |",
    flow:
      "宽依赖算子会触发 shuffle。上游 task 按目标分区写出 shuffle block，下游 task 再通过 shuffle read 拉取对应 block。这个过程涉及序列化、磁盘 I/O、网络传输、内存缓冲、排序和聚合，因此通常比窄依赖昂贵得多。\n\nRDD 默认每次 action 都可能重新计算 transformation 链路。persist/cache 会把分区保留下来，以便后续 action 复用。RDD 的 cache 是 MEMORY_ONLY 的快捷方式；DataFrame/Dataset 的 cache 使用其默认存储级别，通常是 MEMORY_AND_DISK。",
    state:
      "Spark 的缓存是容错的：缓存分区丢失后，可以通过 lineage 重算。shuffle 中间结果也会被 Spark 自动保留一部分，以避免节点失败时从最初输入完全重算。fetch failure 出现时，DAGScheduler 可能判断上游 map output 丢失，并重新提交相关 stage。这个恢复保证的是计算可恢复，不保证外部副作用自动幂等。",
    diagnosis:
      "Shuffle 性能主要由 shuffle 数据量、分区数、key 倾斜、序列化、压缩、磁盘、网络和 reduce 侧聚合内存决定。判断是否该 cache，要看数据是否被重复使用、重算成本是否高、缓存是否会挤占执行内存、缓存丢失后是否可接受。判断 shuffle 是否要优化，要看 exchange 数量、shuffle read/write、spill、task duration 分布和 skewed partition。",
    exampleTitle: "观察 cache 与 shuffle",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("shuffle-cache-demo").getOrCreate()
base = spark.range(0, 10000).select((F.col("id") % 100).alias("k"), F.col("id").alias("v"))
cached = base.repartition(8, "k").cache()
print("first action materializes cache", cached.count())
agg = cached.groupBy("k").agg(F.count("*").alias("cnt"), F.sum("v").alias("sum_v"))
agg.explain("formatted")
print(agg.orderBy("k").take(5))
cached.unpersist()
spark.stop()
`,
    tradeoff:
      "不要把 cache 当成可靠存储，也不要把 shuffle 自动持久化理解成用户结果已经持久化。Spark 会为了避免整个输入重算而保留部分 shuffle 中间数据，但如果下游还要复用某个 RDD 或 Dataset，仍需要显式 persist/cache，或把结果写入外部可靠存储。",
    sources:
      "本页依据 Spark RDD Guide、Dataset API、Job Scheduling 和 Tuning 文档。具体 shuffle 实现、external shuffle service、decommission 和 dynamic allocation 行为会受版本与部署模式影响。",
  }),

  "checkpoint-and-plan-truncation.md": compose({
    positioning:
      "Checkpoint 的核心作用是把过长或不稳定的计算依赖切断，把某个中间结果物化到 checkpoint 目录或 executor 本地存储中。它常用于迭代算法、长 lineage、复杂 Dataset 计划、Structured Streaming 状态恢复等场景。Checkpoint 解决的是恢复和计划截断问题，不是普通性能缓存的同义词。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| SparkContext checkpointDir | 可靠 checkpoint 的目标目录 | 应放在可靠存储上，不能依赖 executor 本地目录 |\n| Dataset/RDD checkpoint | 物化结果并截断上游计划或 lineage | 首次 action 才会真正物化，eager 设置影响确定性 |\n| localCheckpoint | 写入 executor 本地存储 | 不可靠，executor 丢失可能破坏后续计算 |\n| Structured Streaming checkpoint | 保存 offset、commit log 和 state | 与查询结构强绑定，重启兼容性有严格限制 |",
    flow:
      "RDD lineage 或 Dataset logical plan 过长时，Driver 管理和优化成本会升高，失败重算成本也会升高。checkpoint 会在某个节点物化数据，使后续计算从 checkpoint 数据继续，而不是从最初输入一路重算。Dataset checkpoint 在迭代算法中尤其有价值，因为每轮迭代都会继续拉长逻辑计划。",
    state:
      "Dataset checkpoint/localCheckpoint 支持 eager 参数。eager=true 会立即执行并物化当前数据快照；eager=false 会等到第一次 action 时才物化。对于包含非确定性表达式、外部输入变化或重试影响的计算，lazy checkpoint 可能导致最终被 checkpoint 的数据与第一次 job 中使用的数据不完全一致。",
    diagnosis:
      "如果 checkpoint 后仍然计划过长，检查是否 checkpoint 位置放错、是否没有触发 action、是否后续又继续叠加复杂 lineage。如果流式任务无法从 checkpoint 恢复，检查输入源、状态操作、schema、watermark、join 类型和 sink 语义是否变更。",
    exampleTitle: "Dataset checkpoint",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("checkpoint-demo").getOrCreate()
spark.sparkContext.setCheckpointDir("/tmp/spark-checkpoint-demo")
df = spark.range(0, 1000).select((F.col("id") % 10).alias("k"), F.col("id"))
checkpointed = df.groupBy("k").count().checkpoint(eager=True)
checkpointed.explain("formatted")
print(checkpointed.orderBy("k").collect())
spark.stop()
`,
    tradeoff:
      "cache/persist 追求复用效率，checkpoint 追求依赖截断和恢复边界。cache 不改变 lineage，本质上是如果缓存还在就复用；checkpoint 改变后续依赖起点，本质上是后续从物化结果继续。localCheckpoint 只能用于可以接受丢失和重算失败风险的场景。",
    sources:
      "本页依据 Spark Dataset API、RDD Guide、Structured Streaming Guide 和 Tuning 文档。checkpoint 目录、存储可靠性和重启兼容性需要结合部署环境验证。",
  }),

  "shared-variables-and-driver-boundaries.md": compose({
    positioning:
      "Spark 的并行计算模型不鼓励多个 task 直接读写同一个普通变量。Driver 上的变量被 task 闭包捕获后，会随闭包序列化发送到 executor；executor 中修改的是副本，不会自动回写 Driver。Spark 提供 broadcast variables 和 accumulators 两类共享变量，用来覆盖只读共享数据和只增统计这两种受控场景。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| Driver 变量 | 用户主程序中的普通变量 | task 捕获后是副本，不能当作分布式共享状态 |\n| Closure | task 执行所需的函数和被捕获变量集合 | 会被序列化发送到 executor，过大闭包会增加调度和网络成本 |\n| Broadcast Variable | 把只读大对象高效分发给 executor | 适合维表、模型参数等只读数据，不适合频繁更新 |\n| Accumulator | task add、Driver read 的只增变量 | 适合计数和诊断指标，不适合承载业务状态 |",
    flow:
      "Broadcast 变量由 Driver 创建，Spark 将其分发给 executor，task 在执行时读取本地或缓存后的广播值。它避免把同一个大对象重复塞进每个 task 闭包。Accumulator 的设计是 task 只能 add，Driver 才能 read，适合收集错误计数、过滤记录数、质量检查指标等诊断数据。",
    state:
      "Broadcast 不是分布式可变变量。广播后如果 Driver 修改原始对象，executor 上已广播的数据不会自动同步。Accumulator 不应该用于业务决策的精确状态，尤其要注意 transformation 中的 accumulator 更新可能因为 stage 或 task 重新执行而多次应用。",
    diagnosis:
      "如果本地模式看似正常、集群模式错误，优先检查闭包捕获和可变状态。查看 task 序列化大小、executor 日志、Driver OOM、broadcast 创建次数和 accumulator 更新位置。对外部写入，要检查 task retry、stage retry 和 speculative execution 是否造成重复副作用。",
    exampleTitle: "broadcast 与 accumulator",
    example: `
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
`,
    tradeoff:
      "只读大对象用 broadcast；诊断计数用 accumulator；业务结果用分布式写出或外部事务系统。不要在 map 中修改 Driver 变量后期望 Driver 读到更新值，也不要把 accumulator 当精确业务计数器。",
    sources:
      "本页依据 Spark RDD Guide 关于 closures、shared variables、broadcast variables 和 accumulators 的说明。Accumulator 的可见性、重试语义和 UI 展示可能随 API 与版本细节变化，业务精确状态不应依赖 accumulator。",
  }),

  "scheduler-stage-cut-locality-and-straggler-boundaries.md": compose({
    positioning:
      "Spark 调度要把用户的逻辑计算转换成可在 executor 上运行的 task。Stage 切分、本地性选择、慢任务处理和失败重试都发生在这个调度链路中。理解调度，不是记住 Job、Stage、Task 三个名词，而是要解释 Driver 如何把依赖图切开，哪些 task 可以并行，为什么某些 task 会慢，失败后从哪里恢复。",
    objects:
      "| 对象 | 职责 | 观察入口 |\n| --- | --- | --- |\n| DAGScheduler | 根据依赖生成 stage DAG，提交可运行 stage，处理 shuffle 输出丢失 | Driver 日志、Spark UI Jobs/Stages |\n| TaskScheduler | 把 task 分配给 executor，处理 locality、重试、资源等待 | Spark UI task 列表、executor 日志 |\n| Stage | shuffle 边界之间的一组 task | Stages 页面、DAG 图 |\n| TaskSet | 同一 stage 的一组 task attempt | task duration、locality、失败原因 |",
    flow:
      "窄依赖可以让上游和下游在同一 stage 内按分区流水执行；宽依赖需要重新组织数据，因此形成 shuffle 边界。DAGScheduler 会沿依赖向上追溯，先提交缺失的父 stage，再提交下游 stage。一个 action 通常对应一个 job，但多个 job 可能共享已经完成的 stage。",
    state:
      "task 失败通常先按 attempt 重试。若失败原因说明上游 shuffle output 丢失，DAGScheduler 会把对应上游 stage 标记为需要重算并重新提交。executor lost、fetch failed、OOM 和用户代码异常，对应的恢复路径不同。恢复保证的是 Spark 计算链路能继续推进，不保证外部副作用不会重复。",
    diagnosis:
      "慢任务可能来自数据倾斜、单分区输入过大、executor 资源不足、GC、磁盘慢、网络抖动、外部系统慢或代码中单条记录处理异常。排障顺序是先看 Jobs，再看 Stages，再看 task duration、input size、shuffle read/write、spill、locality、scheduler delay 和 executor lost。",
    example: sparkPlanExample,
    tradeoff:
      "本地性不是绝对目标。如果为了等本地资源导致长时间排队，整体延迟可能更差。推测执行可以缓解部分硬件或节点导致的 straggler，但不能解决系统性倾斜。若瓶颈是单 key 倾斜或单分区过大，资源扩容只能缓解排队，不能消除长尾。",
    sources:
      "本页依据 Spark Job Scheduling、RDD Guide、DAGScheduler/TaskScheduler 源码登记来源和 Tuning 文档。调度细节会受部署模式、资源管理器和配置影响。",
  }),

  "unified-memory-execution-storage-spill-and-eviction.md": compose({
    positioning:
      "Spark 统一内存模型把执行内存和存储内存放在同一可调区域中协调使用。执行内存服务于 shuffle、join、sort、aggregation 等运行时算子；存储内存服务于 cache/persist 和广播块。统一内存解决的是资源共享问题，不是让内存无限可用。",
    objects:
      "| 对象 | 作用 | 关键风险 |\n| --- | --- | --- |\n| Execution Memory | join、sort、aggregation、shuffle 等执行算子使用 | 不足会 spill 或 OOM |\n| Storage Memory | cache、persist、broadcast 使用 | 过多缓存会挤压执行空间 |\n| M 区域 | Spark 统一管理的内存区域 | 由 spark.memory.fraction 控制 |\n| R 阈值 | storage 不能被 execution 驱逐的保护区域 | storageFraction 设置过高可能影响执行 |\n| Spill | 内存不足时把中间数据落盘 | 避免 OOM，但显著增加磁盘 I/O |",
    flow:
      "在统一内存模型中，execution 和 storage 共享同一大区域。execution 可以把 storage 驱逐到一定阈值以下，storage 不能驱逐正在使用的 execution。这样做的目的是提高资源利用率：没有缓存时，执行可以用更多内存；缓存较多时，仍保留一部分执行空间。",
    state:
      "缓存能减少重算，但缓存过多会导致执行内存紧张、spill 增加和 GC 变重。Spark 会按 LRU 驱逐旧缓存分区，但驱逐本身意味着后续 action 可能重算。Reduce 侧 OOM 常见根因是单 task 输入太大，提升并行度可以降低每个 task 的输入规模。",
    diagnosis:
      "第一步看 Spark UI Stages 中的 spill 指标、task duration 和输入大小。第二步看 Executors 页面中的 storage memory、executor memory、GC time 和 failed tasks。第三步看 SQL plan，确认是否存在大 shuffle、sort merge join、hash aggregate 或广播过大。最后再决定调整并行度、缓存级别、join 策略、序列化或 executor 规格。",
    exampleTitle: "观察 cache 与聚合",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("memory-spill-demo").getOrCreate()
df = spark.range(0, 50000).select((F.col("id") % 100).alias("k"), F.col("id").alias("v"))
cached = df.repartition(8, "k").cache()
print(cached.count())
agg = cached.groupBy("k").agg(F.count("*").alias("cnt"), F.sum("v").alias("sum_v"))
agg.explain("formatted")
print(agg.orderBy("k").take(5))
cached.unpersist()
spark.stop()
`,
    tradeoff:
      "吞吐优先时，可以接受适量 spill 和较高并行度；低延迟优先时，要减少 shuffle、避免大状态聚合和频繁缓存驱逐；成本优先时，要避免把所有中间数据都缓存。统一内存不是调参题，而是执行、缓存、GC、磁盘和并行度之间的资源分配题。",
    sources:
      "本页依据 Spark Tuning Guide 和 Spark 1.6 Unified Memory 相关发布说明。默认值和 JVM 行为需要结合当前 Spark、JDK、部署模式和 executor 配置确认。",
  }),

  "logical-plan-physical-plan-explain-and-runtime-diagnosis.md": compose({
    positioning:
      "Spark SQL/DataFrame/Dataset 的执行不是直接按用户代码逐行运行，而是先形成逻辑计划，再经过分析、优化和物理规划，最终生成分布式执行计划。EXPLAIN 是理解这条链路的核心入口。本页关注 unresolved logical plan、analyzed plan、optimized logical plan、physical plan、runtime statistics 和 SQL UI 之间的关系。",
    objects:
      "| 对象 | 作用 | 观察方式 |\n| --- | --- | --- |\n| Unresolved Logical Plan | 尚未绑定表、列、函数的计划 | extended explain 中可见 |\n| Analyzed Logical Plan | 完成表、列、类型解析 | explain(\"extended\") |\n| Optimized Logical Plan | 应用规则优化后的逻辑计划 | explain(\"extended\") |\n| Physical Plan | 可执行算子、exchange、scan、join 策略 | explain(\"formatted\") |\n| Runtime Statistics | AQE 和 SQL UI 中的运行时统计 | SQL UI Details |",
    flow:
      "用户提交 SQL 或 DataFrame 操作后，Spark 先构造逻辑计划。Analyzer 根据 catalog、schema、函数和类型信息解析计划。Optimizer 应用规则做谓词下推、列裁剪、常量折叠等优化。Planner 再选择物理算子、join 策略和 exchange 边界。只有 action 触发时，Spark 才会优化并执行这些计划。",
    state:
      "explain(\"simple\") 只打印物理计划；extended 打印逻辑和物理计划；codegen 打印可用的生成代码；cost 打印逻辑计划和统计信息；formatted 把物理计划 outline 和节点详情拆开。计划字符串过长时，spark.sql.maxPlanStringLength 可用于限制 UI 和 Driver 上的计划文本大小。",
    diagnosis:
      "先看 physical plan：FileScan 是否裁剪列和分区，Filter 是否下推，Exchange 是否过多，Join 类型是否符合预期，Broadcast 是否出现，Sort 是否必要。再看 SQL UI：operator 耗时、runtime statistics、shuffle read/write、spill、skew 和 task 分布。没有计划证据，不应直接调参。",
    exampleTitle: "多模式 explain",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("explain-demo").getOrCreate()
orders = spark.range(0, 1000).select((F.col("id") % 10).alias("shop_id"), F.col("id").alias("order_id"))
shops = spark.range(0, 10).select(F.col("id").alias("shop_id"))
query = orders.join(shops, "shop_id").groupBy("shop_id").count()
query.explain("formatted")
query.explain("cost")
print(query.orderBy("shop_id").collect())
spark.stop()
`,
    tradeoff:
      "生产 SQL 应尽量让过滤、投影、join key 和聚合表达式对优化器可见。避免把关键逻辑藏进 UDF；维护表统计；对复杂计划控制计划字符串和 UI 开销；对重要作业保存 explain 和 event log，形成可回放证据。",
    sources:
      "本页依据 Dataset API、Spark SQL Performance Tuning 和 Configuration 文档。不同版本 explain 输出格式和 AQE 节点名称可能变化，应以当前版本实际计划为准。",
  }),

  "statistics-cbo-cardinality-estimation-and-plan-misfire.md": compose({
    positioning:
      "统计信息和 CBO 决定 Spark SQL 对数据规模、基数和代价的估计。优化器不能凭空知道表有多大、列有多稀疏、过滤后剩多少行。缺失或过期统计会让 join 策略、join 顺序、广播选择和分区估计失准。CBO 不是万能优化器，它依赖 catalog、数据源和运行时统计。",
    objects:
      "| 对象/配置 | 作用 | 默认或边界 |\n| --- | --- | --- |\n| Table Statistics | 表大小、行数等基础统计 | 影响 sizeInBytes 和广播判断 |\n| Column Statistics | 列基数、空值、最大最小值等 | 影响过滤和 join 估算 |\n| Histogram | 更细粒度的列分布信息 | 生成成本更高，会增加扫描 |\n| spark.sql.cbo.enabled | 启用 CBO | 默认 false |\n| Runtime Statistics | AQE 执行过程中收集的实际统计 | 只能在运行时 exchange 边界后发挥作用 |",
    flow:
      "Spark 计划生成时会读取数据源、catalog 和配置提供的统计信息。对于表和列统计，可以通过 ANALYZE TABLE 维护，通过 DESCRIBE EXTENDED 检查。EXPLAIN COST 或 explain(\"cost\") 可以观察估算计划。没有可靠统计时，Spark 会使用默认估算或保守策略。",
    state:
      "CBO 在编译期用统计信息估算代价；AQE 在运行期利用已经执行完的 shuffle map output statistics 改写后续计划。两者不是替代关系。没有统计信息时，初始计划可能已经很差；没有 exchange 边界或运行时统计时，AQE 也没有足够信息改写。",
    diagnosis:
      "常见误判包括：小表统计过期导致未广播；大表被低估导致错误广播；过滤选择率估算错误导致 join 顺序差；列基数不准导致聚合和 shuffle 分区失衡。先看 explain(\"cost\")，再看 SQL UI runtime statistics，最后检查表和列统计是否存在、更新时间是否合理。",
    exampleTitle: "观察 cost plan",
    example: `
from pyspark.sql import SparkSession

spark = SparkSession.builder.master("local[2]").appName("cbo-cost-demo").getOrCreate()
spark.sql("CREATE OR REPLACE TEMP VIEW orders AS SELECT id, id % 10 AS shop_id FROM range(1000)")
plan = spark.sql("SELECT shop_id, count(*) AS cnt FROM orders GROUP BY shop_id")
plan.explain("cost")
print(plan.orderBy("shop_id").collect())
spark.stop()
`,
    tradeoff:
      "重要湖仓表应建立统计维护策略：哪些表分析、哪些列分析、何时更新、是否开启直方图、是否接受额外扫描成本。对高频写入表，自动更新统计可能影响写入；对关键查询表，缺失统计可能导致更大的查询成本。",
    sources:
      "本页依据 Spark SQL Performance Tuning 和 Configuration 文档。CBO 默认值、统计字段和直方图行为以当前 Spark 版本为准。",
  }),

  "join-algorithm-selection-broadcast-sort-merge-and-shuffled-hash.md": compose({
    positioning:
      "Spark Join 算法选择是 Spark SQL 优化器、统计信息、hint、配置和 AQE 共同作用的结果。它不是固定规则题，也不是广播一定最快。Join 策略要解释的是：两侧数据如何移动，哪一侧构建 hash table，是否需要排序，是否需要 shuffle，以及运行时统计能否改变原计划。",
    objects:
      "| 对象 | 作用 | 风险 |\n| --- | --- | --- |\n| Broadcast Hash Join | 将小表广播到各 executor 后与大表分区内 join | 广播侧过大会压垮 Driver 或 executor |\n| Sort Merge Join | 两侧按 join key shuffle 并排序后归并 | 稳定但 shuffle 和 sort 成本高 |\n| Shuffle Hash Join | 两侧 shuffle，分区内构建 hash table | 构建侧分区过大时可能 OOM |\n| Broadcast Nested Loop Join | 广播一侧后做嵌套循环 | 非等值 join 常见，成本可能很高 |\n| Join Hint | 给优化器策略偏好 | 不保证一定采用，受 join 类型和物理约束限制 |",
    flow:
      "优化器先基于逻辑计划、join 条件、join 类型、统计信息和配置生成物理计划。等值 join 才适合 hash 或 sort merge；非等值 join 可能走 nested loop。若一侧估算大小低于 autoBroadcastJoinThreshold，Spark 会考虑广播 join。统计信息缺失或过期时，小表可能被高估而错过广播，大表也可能被低估而错误广播。",
    state:
      "Spark SQL 支持 BROADCAST、MERGE、SHUFFLE_HASH、SHUFFLE_REPLICATE_NL 等 join strategy hints。hint 有优先级，但不是无条件命令。AQE 启用后，Spark 可以在 shuffle 边界拿到运行时统计，并据此把 sort merge join 转成 broadcast hash join 或 shuffled hash join，合并小 shuffle partition，处理 skewed partition，并启用 local shuffle reader。",
    diagnosis:
      "先看 explain(\"formatted\")：join 算子、BroadcastExchange、Sort、Exchange、build side 和 scan 裁剪。再看 SQL UI：runtime statistics、shuffle read/write、broadcast time、spill 和 operator duration。若最终计划与预期不同，确认 join 条件是否是等值、统计信息是否可信、hint 是否被忽略、AQE 是否启用、运行时数据是否倾斜。",
    exampleTitle: "广播 join 观察",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("join-strategy-demo").getOrCreate()
fact = spark.range(0, 10000).select((F.col("id") % 100).alias("user_id"), F.col("id").alias("order_id"))
dim = spark.range(0, 100).select(F.col("id").alias("user_id"), F.concat(F.lit("u"), F.col("id")).alias("name"))
joined = fact.join(F.broadcast(dim), "user_id").groupBy("name").count()
joined.explain("formatted")
print(joined.orderBy("name").take(5))
spark.stop()
`,
    tradeoff:
      "小而稳定的维表适合广播；两侧都大且 join key 分布相对均匀时，sort merge join 更稳；构建侧分区可控时，shuffle hash join 可能更快；高度倾斜 key 需要 salting、拆分热点或 AQE skew join 支持。不要把 join hint 当长期治理方式。",
    sources:
      "本页依据 Spark SQL Performance Tuning、Configuration、Dataset API 和 Spark SQL 文档。默认阈值、AQE 规则和 hint 支持范围以当前 Spark 版本为准。",
  }),

  "partitioning-repartition-coalesce-and-file-size-control.md": compose({
    positioning:
      "Spark 分区同时影响并行度、shuffle 成本、单 task 工作集和输出文件数量。repartition、coalesce、SQL partition hint、文件读取切分和写出文件控制分别作用在不同位置。理解这些机制，要先区分运行时分区和存储文件分区。",
    objects:
      "| 对象/配置 | 作用 | 边界 |\n| --- | --- | --- |\n| repartition | 通过 shuffle 改变分区数或按列分布 | 成本高，但能重新均衡数据 |\n| coalesce | 通常不经 shuffle 减少分区数 | 可能降低并行度和造成单 task 过大 |\n| spark.sql.files.maxPartitionBytes | 控制文件源读取时单分区最大打包字节数 | 影响扫描 task 数，不直接等同输出文件大小 |\n| spark.sql.files.openCostInBytes | 估算打开文件成本 | 影响小文件打包策略 |\n| maxRecordsPerFile | 控制写出单文件最大记录数 | 影响输出文件切分，但不解决所有小文件问题 |",
    flow:
      "读取文件源时，Spark 会根据文件大小、打开文件成本和分区配置把多个文件打包成扫描分区。repartition(numPartitions) 或 repartition(cols) 会引入 shuffle，使数据按新的分区规则重新分布。coalesce(numPartitions) 减少分区时通常避免 shuffle，适合在数据已经较均匀且只想减少输出文件数时使用。",
    state:
      "输出文件数量通常接近写出时的分区数，每个 task 写一个或多个文件。maxRecordsPerFile 可以限制单文件记录数，避免单文件过大；SQL hints COALESCE、REPARTITION、REPARTITION_BY_RANGE、REBALANCE 可以影响输出前分区布局。AQE 可以根据 map output statistics 合并过小的 post-shuffle partitions，但不等同于湖仓表的长期文件治理。",
    diagnosis:
      "如果 task 太多且每个很小，检查小文件数量、openCost、maxPartitionBytes、shuffle partition 和 AQE 合并。若少数 task 极慢，检查分区倾斜和单分区数据量。若输出小文件过多，检查写出前分区数、动态分区字段、maxRecordsPerFile 和表维护策略。",
    exampleTitle: "repartition 与 coalesce",
    example: sparkPlanExample,
    tradeoff:
      "不要用 coalesce(1) 当成通用小文件治理方案。它牺牲并行度，容易形成单点瓶颈。小文件治理不能只靠最后 coalesce，上游分区、动态分区列、高基数字段、并发写入、表格式 compaction 和下游读取模式都要一起设计。",
    sources:
      "本页依据 Spark SQL Performance Tuning、Dataset API 和 Configuration 文档。文件源配置和 SQL hint 行为以当前 Spark 版本和数据源实现为准。",
  }),

  "columnar-cache-scan-pruning-and-sql-runtime-footprint.md": compose({
    positioning:
      "列式缓存、扫描裁剪和运行时内存共同决定 Spark SQL 查询的基础成本。列式缓存让 Spark 在内存中按列组织数据；扫描裁剪减少读取列和分区；运行时内存决定缓存、向量化读取、聚合和 join 能否稳定执行。这些能力只在优化器能理解数据结构和表达式时效果最好。",
    objects:
      "| 对象/配置 | 作用 | 边界 |\n| --- | --- | --- |\n| In-memory Columnar Cache | 以列式格式缓存表或 DataFrame | 占用 storage memory，可能被驱逐 |\n| spark.sql.inMemoryColumnarStorage.compressed | 自动按列选择压缩 | 默认 true |\n| batchSize | 控制列式缓存批大小 | 默认 10000，过大可能 OOM |\n| Vectorized Reader | 批量读取列式数据 | 依赖格式和数据源支持 |\n| Dynamic Partition Pruning | join 场景下动态生成分区过滤 | 依赖 join key 和分区列匹配 |",
    flow:
      "cacheTable、Dataset.cache 或 SQL CACHE TABLE 会把结构化数据缓存起来。Spark SQL 可以只扫描需要的列，并根据每列统计自动选择压缩编码，以降低内存占用和 GC 压力。列裁剪减少读取列数，谓词下推减少读入行数，分区裁剪减少扫描目录或文件范围，动态分区裁剪可以在 join 运行中基于一侧结果过滤另一侧分区。",
    state:
      "缓存第一次 action 时才会物化。缓存是否有效，要看 Storage 页面和 SQL plan 中是否命中 InMemoryTableScan，而不是只看代码里是否调用了 cache。列式缓存能降低对象开销，但仍占用 storage memory；batchSize 越大，压缩和批处理效率可能越好，但单批占用也更高，OOM 风险增加。",
    diagnosis:
      "先看 physical plan：FileScan/BatchScan 是否显示 PushedFilters、ReadSchema、PartitionFilters，是否出现 InMemoryTableScan。再看 SQL UI 的 scan bytes、operator duration、runtime statistics。最后看 Storage 和 Executors 页面确认缓存大小、命中、驱逐和 GC。",
    exampleTitle: "列裁剪与缓存",
    example: `
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
`,
    tradeoff:
      "缓存适合被反复读取、重算成本高、大小可控的数据。不要缓存一次性中间结果；不要缓存过宽且只用少数列的数据；不要为了避免一次扫描而占满 storage memory。列式格式、分区设计和统计信息维护通常比盲目缓存更重要。",
    sources:
      "本页依据 Spark SQL Performance Tuning、Configuration 和 Spark 1.6/2.0 发布说明。向量化、动态分区裁剪和缓存默认值以当前版本为准。",
  }),

  "closure-serialization-local-vs-cluster-and-mutable-state-traps.md": compose({
    positioning:
      "Spark task 在 executor 上运行，用户函数和被引用变量需要随 task closure 序列化过去。闭包序列化问题解释了为什么本地模式能跑、集群模式失败，为什么修改外部变量没有效果，为什么闭包过大会拖慢调度，为什么不可序列化对象会在提交 task 时暴露。",
    objects:
      "| 对象 | 作用 | 风险 |\n| --- | --- | --- |\n| Closure | task 需要的函数和捕获变量集合 | 过大、不可序列化或捕获外部连接会失败或变慢 |\n| Driver 变量 | 用户主程序本地变量 | executor 修改副本不会回写 Driver |\n| Executor 副本 | 闭包反序列化后的运行时对象 | 与 Driver 生命周期和状态不同步 |\n| Broadcast | 受控分发只读共享对象 | 适合只读数据，不适合动态更新 |\n| Accumulator | 受控汇总 add-only 指标 | 不适合可变业务状态 |",
    flow:
      "Driver 创建 job 后，Spark 会把每个 task 需要执行的函数和被捕获变量形成 closure，并序列化发送给 executor。executor 反序列化后在对应分区上运行。这个过程意味着 task 看到的是 closure 中变量的副本，而不是 Driver 变量本身。",
    state:
      "local 模式可能在同一个 JVM 或同一进程环境中运行，看起来修改外部变量也能得到结果。但集群模式下 task 在 executor 进程中执行，变量副本不会自动同步回 Driver。Spark 官方语义不保证对 closure 外部引用对象的修改行为，业务状态必须通过明确的数据流或外部幂等系统表达。",
    diagnosis:
      "出现本地正常、集群失败时，检查是否捕获了不可序列化对象、是否依赖本地文件路径、是否修改 Driver 变量、是否把外部连接放进 closure。查看 task 序列化大小、executor 反序列化时间、Driver 日志中的 serialization 错误和 Python worker 错误。",
    exampleTitle: "错误与正确写法",
    example: `
from pyspark.sql import SparkSession

spark = SparkSession.builder.master("local[2]").appName("closure-demo").getOrCreate()
sc = spark.sparkContext
counter = 0

def bad_update(x):
    global counter
    counter += x
    return x

print(sc.parallelize([1, 2, 3]).map(bad_update).collect())
print("driver counter is not a distributed result:", counter)
print("distributed sum:", sc.parallelize([1, 2, 3]).sum())
spark.stop()
`,
    tradeoff:
      "正确的分布式写法应把每个分区的结果作为 RDD/DataFrame 的数据流返回，或使用 accumulator 汇总诊断指标，而不是在 task 内修改 Driver 外部变量。连接外部系统时，通常应在 executor 或分区函数内部按分区创建连接，并设计幂等写入。",
    sources:
      "本页依据 Spark RDD Guide 关于 closures、shared variables、broadcast variables 和 accumulators 的说明。不同语言的序列化机制不同，但 Driver/executor 副本边界一致。",
  }),

  "driver-result-surfaces-collect-take-tolocaliterator-and-memory-boundaries.md": compose({
    positioning:
      "Driver 是 Spark 应用的控制面，同时也是 collect、take、tail、collectAsList、toLocalIterator 等 API 的结果接收面。分布式计算可以处理很大数据，但把结果拉回 Driver 时，数据又回到了单进程内存边界。Driver 结果面问题的本质是：计算可以分布式，结果收集不一定分布式。",
    objects:
      "| API/对象 | 行为 | 风险 |\n| --- | --- | --- |\n| collect/collectAsList | 把全部结果收集到 Driver | 大结果可能导致 Driver OOM |\n| take/tail | 收集有限条数 | 条数小较安全，但仍触发 job |\n| toLocalIterator | 以迭代器形式遍历所有行 | 内存约等于最大分区，可能触发多个 job |\n| show | 为展示收集少量数据 | 大 truncate 或误用不等于全量安全 |\n| write | 把结果写到外部存储 | 更适合大结果输出 |",
    flow:
      "collect 会触发 action，executor 完成各分区计算后把结果传回 Driver。只要结果总量超过 Driver 可承受范围，就可能出现 OOM、长时间 GC 或网络传输压力。take 类 API 只取有限条记录，通常比 collect 安全，但仍会触发 Spark job，并可能扫描多个分区。",
    state:
      "toLocalIterator 不会一次性以数组形式返回所有数据，但它仍会把数据逐分区拉到 Driver，内存消耗至少取决于最大分区大小。官方说明它可能触发多个 Spark job；如果输入来自宽依赖，建议先缓存以避免重复计算。",
    diagnosis:
      "Driver OOM 不能只看 executor memory。需要检查 Driver 日志、Spark UI Jobs 中对应 action、结果行数估计、单行大小、分区大小、maxResultSize、Driver heap、计划字符串长度和 UI 展示内容。如果 OOM 发生在 explain、SQL UI 或长计划展示中，还要检查 plan string 是否过长。",
    exampleTitle: "安全采样与写出",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("driver-result-demo").getOrCreate()
df = spark.range(0, 100000).select((F.col("id") % 100).alias("k"), F.col("id"))
print(df.where("k = 1").limit(5).collect())
summary = df.groupBy("k").count()
summary.explain("formatted")
print(summary.orderBy("k").take(5))
spark.stop()
`,
    tradeoff:
      "交互式分析需要方便查看样本，但生产链路要把大结果留在分布式存储中。Driver 内存应按计划复杂度、广播变量、结果面大小和并发 job 设计，而不是只按输入数据量设计。",
    sources:
      "本页依据 Dataset API 对 collect、take、tail、collectAsList、toLocalIterator 和 explain 的说明。不同语言接口名称略有差异，结果面边界相同。",
  }),

  "dependency-distribution-jars-pyfiles-local-uri-and-executor-visibility.md": compose({
    positioning:
      "Spark 应用运行在 Driver 和多个 executor 进程中。Driver 能看到的本地文件、JAR、Python 模块或环境变量，executor 不一定能看到。依赖分发解决的是代码和资源如何到达执行节点的问题，而不是解决所有环境一致性、权限和版本冲突问题。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| application jar | Spark 应用主 JAR | spark-submit 会分发到集群并加入 classpath |\n| --jars | 额外 JVM 依赖 | 会传到 driver/executor classpath，但冲突仍需治理 |\n| --py-files | Python .py/.zip/.egg 依赖 | 分发给 executor 使用，不等同于安装系统包 |\n| file:/ URI | 由 Driver HTTP file server 提供给 executor 拉取 | Driver 必须网络可达，文件传输有成本 |\n| local:/ URI | 要求每个 worker 已经有同一路径文件 | 不产生网络复制，但依赖预置环境一致 |",
    flow:
      "提交应用时，Spark 会把 application jar 和 --jars 中的依赖传输到集群，并放入 Driver 和 executor 的 classpath。Python 应用可以通过 --py-files 分发 .py、.zip 或 .egg 文件，让 executor 能 import 对应代码。绝对路径和 file:/ URI 通常由 Driver 的 HTTP file server 服务，executor 从 Driver 拉取文件；local:/ 表示文件已经存在于每个 worker 的本地路径。",
    state:
      "JAR 和文件会被复制到 executor 节点上每个 SparkContext 的工作目录。长期运行或频繁提交可能积累大量依赖文件。YARN 会自动处理部分清理；Standalone 模式需要通过配置管理 worker 目录清理。磁盘满可能表现为 executor 启动失败、依赖下载失败、shuffle 写失败或临时文件无法创建。",
    diagnosis:
      "依赖问题优先看 executor 日志，而不是只看 Driver。常见错误包括 ClassNotFoundException、NoClassDefFoundError、ModuleNotFoundError、本地路径不存在、权限不足、native library 加载失败和版本冲突。还要检查 deploy mode，因为 client mode 和 cluster mode 下 Driver 所在机器不同。",
    exampleTitle: "提交依赖",
    exampleLang: "shell",
    example: `
spark-submit \\
  --master yarn \\
  --deploy-mode cluster \\
  --jars hdfs:///libs/custom-source.jar \\
  --py-files deps/jobs.zip \\
  jobs/daily_etl.py
`,
    tradeoff:
      "file:/ 依赖分发依赖 Driver 可达性和网络传输；local:/ 不产生网络复制，但要求节点镜像或本地文件完全一致。只有部分 task 失败时，优先怀疑节点环境不一致、local:/ 文件缺失或磁盘清理问题。",
    sources:
      "本页依据 Spark Submitting Applications 和 Cluster Mode Overview 文档。不同资源管理器对依赖缓存、清理和 classpath 处理存在差异，应结合 YARN、Kubernetes 或 Standalone 实际实现验证。",
  }),

};

Object.assign(pages, {
  "shuffle-map-output-fetch-failure-and-stage-resubmit-boundaries.md": compose({
    positioning:
      "Fetch failure 是理解 Spark shuffle 容错的关键入口。下游 reduce 侧 task 需要读取上游 map 侧 task 产生的 shuffle block，如果这些 block 因 executor 丢失、磁盘清理、网络问题或 shuffle 服务异常不可用，下游 task 会失败并把 FetchFailed 信息反馈给 DAGScheduler。Fetch failure 不只是网络报错，它可能意味着上游 stage 已经完成但物化输出丢失。",
    objects:
      "| 对象 | 作用 | 失败影响 |\n| --- | --- | --- |\n| ShuffleMapStage | 产生 map output | 输出丢失时需要重提 |\n| MapOutputTracker | 记录 shuffle map output 位置 | 位置过期或丢失会影响下游读取 |\n| Reduce Task | 拉取上游 block 并执行下游计算 | fetch failed 会触发 task/stage 失败处理 |\n| DAGScheduler | 处理 CompletionEvent 和 FetchFailed | 判断 lost stage 并重新提交 |",
    flow:
      "上游 shuffle map task 完成后，会在 executor 本地写出 shuffle block，并把位置信息汇报给 Driver。DAGScheduler 记住哪些 ShuffleMapStage 已经产生输出，后续 job 可以复用这些输出，而不用每次重算上游。但这些输出不是外部可靠存储，executor 丢失、本地磁盘清理或 shuffle 服务不可用，都可能让 map output 位置失效。",
    state:
      "当下游 task 拉取某个 shuffle block 失败时，Spark 会把失败包装为 FetchFailed 或 ExecutorLost 等事件传回 DAGScheduler。DAGScheduler 会标记相关 map output 不可用，并在必要时重新提交产生这些输出的 stage。stage 可能被多个 job 共享，Stage Finished 不等于其所有物理输出永久可靠。",
    diagnosis:
      "优先收集 Driver 日志中的 FetchFailed、executor lost reason、Stages 页面 retry 次数、shuffle read blocked time、executor 磁盘错误、external shuffle service 日志、节点维护事件和 dynamic allocation 回收日志。大量 fetch failure 通常指向集群稳定性、executor 频繁丢失、磁盘压力、网络抖动或 shuffle 服务配置问题。",
    example: sparkPlanExample,
    tradeoff:
      "如果 executor 因内存或容器限制被杀，fetch failure 是结果不是根因；如果节点磁盘清理了 shuffle 文件，重提 stage 也可能反复失败；如果 dynamic allocation 过早回收持有 shuffle 输出的 executor，需要检查 shuffle tracking 或 external shuffle service 方案。",
    sources:
      "本页依据 Spark RDD Guide、DAGScheduler 源码登记说明和 Job Scheduling 文档。具体重试次数、等待时间和 shuffle 服务行为受版本与部署配置影响。",
  }),

  "tungsten-whole-stage-codegen-off-heap-and-vectorization.md": compose({
    positioning:
      "Tungsten、whole-stage codegen、off-heap 和 vectorization 都围绕 Spark SQL 执行效率展开。它们不是单一功能，而是一组让结构化查询更接近高效执行引擎的优化：减少虚函数和对象开销，生成更紧凑的执行代码，利用列式格式和批处理降低 CPU 与内存成本。这些能力主要作用于 Spark SQL/DataFrame/Dataset 的结构化执行路径。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| Catalyst | 对逻辑计划树做分析、优化、物理规划和代码生成支持 | 依赖结构化表达，UDF 会降低可优化性 |\n| Whole-stage Codegen | 把多个算子融合生成 Java 代码 | 复杂表达式或不支持算子可能回退 |\n| Off-heap Memory | 将部分执行或缓存内存放在堆外 | 需要配置和监控，不消除总内存限制 |\n| Vectorized Reader | 批量读取列式数据 | 依赖数据源和格式支持 |\n| Columnar Cache | 按列缓存 SQL 数据 | 提升扫描裁剪和压缩效率，但仍占用 storage memory |",
    flow:
      "Spark SQL 的计算从 SQL 字符串或 DataFrame API 进入，先形成 unresolved logical plan，再经过 analyzer 绑定表、列、函数和类型，optimizer 进行规则优化，planner 生成 physical plan。Whole-stage codegen 会尝试把相邻算子融合为生成代码，减少每行处理的解释和对象开销。",
    state:
      "Off-heap 可以减少部分 JVM 对象和 GC 压力，但不是免费内存。堆外内存仍需要纳入容器、YARN 或 Kubernetes 的总内存限制。列式读和 vectorized reader 可以一次处理一批值，减少解释开销；Spark SQL 的 in-memory columnar cache 可以只扫描需要列，并根据列统计自动选择压缩方式。",
    diagnosis:
      "先用 explain(\"formatted\") 查看是否出现 WholeStageCodegen、ColumnarToRow、BatchScan、FileScan 等节点。再看 SQL UI 中 operator 耗时、runtime statistics、scan bytes、spill、codegen fallback 和 task CPU 时间。不要把 Tungsten 当成需要手动打开的神秘开关，生产中更重要的是写出优化器看得懂的表达式。",
    exampleTitle: "观察物理计划",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("codegen-plan-demo").getOrCreate()
df = spark.range(0, 10000).select((F.col("id") % 10).alias("k"), (F.col("id") * 2).alias("v"))
result = df.where("v > 100").groupBy("k").agg(F.sum("v").alias("sum_v"))
result.explain("formatted")
print(result.orderBy("k").collect())
spark.stop()
`,
    tradeoff:
      "优先使用内置 SQL 函数、列式数据格式和结构化表达；减少 Python UDF 和对象级 RDD 转换；对大宽表关注列裁剪和动态分区裁剪；对缓存关注 batch size、压缩和 storage memory。需要 off-heap 时，要把容器总内存和监控一起设计。",
    sources:
      "本页依据 Spark SQL 文档、Spark SQL 论文、SQL Performance Tuning 和 Spark 1.6/2.0 发布说明。具体 codegen 回退条件、向量化支持和默认配置以当前版本为准。",
  }),

  "stream-stream-join-state-store-rocksdb-and-restart-compatibility.md": compose({
    positioning:
      "流流 Join 是 Structured Streaming 中最容易误判的状态型算子之一。两个输入流都在不断到达，Spark 必须把过去一段时间的输入缓存在 state store 中，等待未来另一侧可能到来的匹配记录。状态大小、watermark、事件时间约束、checkpoint 和重启兼容性共同决定该查询是否能长期运行。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| State Store | 版本化 key-value 状态存储 | 保存 join 和聚合状态，依赖 checkpoint 恢复 |\n| HDFS-backed Provider | 默认状态存储实现 | 状态管理在 JVM 和 checkpoint 路径中完成 |\n| RocksDB Provider | 把状态管理移到 native memory 和本地磁盘 | 降低 JVM 内存压力，但仍要 checkpoint 变更 |\n| Watermark | 描述事件时间进度和可清理边界 | 不是处理时间，也不是硬性丢弃所有迟到数据 |\n| Event-time Constraint | join 中限定两侧事件时间关系 | outer/semi join 正确输出通常必须依赖它 |",
    flow:
      "stream-static join 不需要维护流式状态，因为静态侧是固定数据集；stream-stream join 必须缓存过去输入，等待未来匹配。每个 micro-batch 会读取一段输入 offset，按 join key 和时间约束读取或更新 state store，然后把状态变更写入 checkpoint。RocksDB provider 可以缓解 JVM GC，但不取消本地磁盘、native memory 和 checkpoint I/O 的成本。",
    state:
      "Watermark 基于每个输入流已观察到的最大事件时间计算。对于流流 join，watermark 必须和事件时间约束一起看。从同一 checkpoint 重启时，输入源数量和类型不能随意改变；状态型操作的 grouping key、聚合、去重列、join schema、等值 join 列和 join 类型也不能随意改变。",
    diagnosis:
      "重点看 stateOperators 指标、numRowsTotal、numRowsUpdated、memoryUsedBytes、batch duration、inputRowsPerSecond、processedRowsPerSecond 和 checkpoint I/O。若 batch 越跑越慢，优先判断状态是否无法清理、watermark 是否推进、慢流是否拖住全局 watermark、RocksDB native memory 是否受限。",
    exampleTitle: "流流 join 结构",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("stream-stream-join-demo").getOrCreate()
left = spark.readStream.format("rate").option("rowsPerSecond", 3).load().select((F.col("value") % 5).alias("id"), F.col("timestamp").alias("left_time")).withWatermark("left_time", "1 minute")
right = spark.readStream.format("rate").option("rowsPerSecond", 3).load().select((F.col("value") % 5).alias("id"), F.col("timestamp").alias("right_time")).withWatermark("right_time", "1 minute")
joined = left.join(right, (left.id == right.id) & (right.right_time.between(left.left_time, left.left_time + F.expr("INTERVAL 30 seconds"))))
query = joined.writeStream.format("memory").queryName("joined_demo").option("checkpointLocation", "/tmp/ss-join-demo").start()
query.stop()
spark.stop()
`,
    tradeoff:
      "结构性变更应使用新 checkpoint 目录、灰度作业或显式状态迁移方案，而不是直接复用旧目录。outer join 和 semi join 需要知道某条记录未来不可能再匹配，才能输出 NULL 或 unmatched 结果并清理状态。",
    sources:
      "本页依据 Structured Streaming API 文档和配置说明。具体 state store 指标、RocksDB 参数和 checkpoint 文件结构会随 Spark 版本变化。",
  }),

  "trigger-micro-batch-continuous-available-now-and-foreach-batch-boundaries.md": compose({
    positioning:
      "Structured Streaming 的 trigger 决定查询如何被驱动执行：默认 micro-batch、processing time micro-batch、available-now、one-time batch 或 continuous processing。Trigger 不只影响延迟，也影响 foreachBatch 是否可用、watermark 推进、sink 提交和故障语义。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| Micro-batch | 把流拆成连续小批执行 | 默认模式，可实现较低延迟和 exactly-once fault-tolerance 语义 |\n| ProcessingTime Trigger | 按处理时间间隔触发 batch | 上一批没完成时不会无限并发新批次 |\n| AvailableNow | 处理启动时可用数据后停止 | 可拆成多批，并推进 watermark |\n| Continuous Processing | 低延迟连续模式 | 延迟可更低，但语义和支持算子有限，通常 at-least-once |\n| foreachBatch | 每个 micro-batch 调用用户函数 | 默认 at-least-once，需用 batchId 做幂等去重 |",
    flow:
      "默认模式下，Spark 每次发现新数据，就计算一个 offset range，执行一次增量计划，更新状态和 sink，然后提交 checkpoint。AvailableNow 用于把当前可用数据处理完就停止的场景，它可以把可用数据拆成多个 micro-batch，并按 batch 推进 watermark。Continuous Processing 目标是更低延迟，但支持范围和容错语义不同。",
    state:
      "foreachBatch 给用户每个 batch 的 DataFrame 和 batchId。默认写出是 at-least-once；如果要实现应用层 exactly-once，需要用 batchId 或业务主键在外部系统做去重或幂等提交。对 stateful query，在 foreachBatch 中对同一个 batch DataFrame 做多个 action，会导致该 batch 被多次计算并可能重复加载状态。",
    diagnosis:
      "看 query progress 中 batch duration、triggerExecution、getOffset、queryPlanning、addBatch、commitOffsets、stateOperators 和 sink 指标。若 batch 堆积，判断是 source 读取慢、状态膨胀、foreachBatch 多 action、sink 慢还是 checkpoint 慢。若输出重复，检查 batchId 幂等表和外部提交逻辑。",
    exampleTitle: "foreachBatch 幂等入口",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("foreachbatch-trigger-demo").getOrCreate()
def write_batch(batch_df, batch_id):
    batch_df.persist()
    print("batch", batch_id, "rows", batch_df.count())
    batch_df.groupBy("bucket").count().show(truncate=False)
    batch_df.unpersist()

stream = spark.readStream.format("rate").option("rowsPerSecond", 5).load().select((F.col("value") % 3).alias("bucket"))
query = stream.writeStream.foreachBatch(write_batch).option("checkpointLocation", "/tmp/foreachbatch-trigger-demo").trigger(processingTime="5 seconds").start()
query.awaitTermination(15)
query.stop()
spark.stop()
`,
    tradeoff:
      "不要把所有流任务都理解成每隔几秒跑一次批处理，也不要把 foreachBatch 当成自动 exactly-once 输出。选择 continuous 前，要确认 source、sink、算子和语义都支持，否则默认 micro-batch 往往更稳。",
    sources:
      "本页依据 Structured Streaming Guide 和 API 文档。Trigger 支持情况、continuous 限制和 sink 语义以当前 Spark 版本和具体 source/sink 为准。",
  }),

  "watermark-late-data-state-cleanup-and-output-finalization.md": compose({
    positioning:
      "Watermark 是 Structured Streaming 中管理迟到数据、状态清理和输出最终性的关键机制。它不是超过时间就一定丢弃的简单开关，而是引擎基于事件时间进度判断哪些状态可以安全清理、哪些结果可以最终输出的边界。Watermark 必须和 output mode、事件时间列、聚合窗口、join 条件和多流策略一起理解。",
    objects:
      "| 对象 | 作用 | 边界 |\n| --- | --- | --- |\n| Event Time | 业务事件发生时间 | 与 processing time 不同 |\n| Watermark Delay | 允许迟到的时间范围 | 小于 delay 的迟到数据保证不被丢弃，大于 delay 的数据可能处理也可能丢弃 |\n| Global Watermark | 多输入流的统一水位线 | 默认取最小，max 策略更激进 |\n| Append Mode | 只输出不会再变化的新增行 | 适合 watermark 后结果最终确定的场景 |\n| Update Mode | 输出本批更新过的结果行 | 聚合更新可见但不是全表输出 |\n| Complete Mode | 每批输出整个结果表 | 支持聚合，成本可能很高 |",
    flow:
      "Spark 跟踪每个输入流看到的最大事件时间，并据此计算该输入的 watermark。多流查询会选择一个全局 watermark；默认使用最小值，以避免慢流数据被过早丢弃。配置为 max 可以让整体进度更快，但慢流迟到数据更容易被丢弃。Watermark 推进通常发生在 batch 边界，与处理时间不同。",
    state:
      "对带 watermark 的聚合，状态能否清理取决于几个条件：output mode 必须是 Append 或 Update；聚合必须使用事件时间列或基于事件时间的 window；withWatermark 必须作用在同一个 timestamp 列；并且 withWatermark 要在 aggregation 前调用。延迟超过 watermark delay 的数据不保证一定被丢弃，也不保证一定处理。",
    diagnosis:
      "看 query progress 中 eventTime watermark、stateOperators、numRowsTotal、numRowsDroppedByWatermark、batch duration 和 inputRows。若状态不降，检查事件时间列是否正确、withWatermark 是否在聚合前、output mode 是否满足条件、多流全局 watermark 是否被慢流拖住。",
    exampleTitle: "窗口聚合 watermark",
    example: `
from pyspark.sql import SparkSession, functions as F

spark = SparkSession.builder.master("local[2]").appName("watermark-demo").getOrCreate()
stream = spark.readStream.format("rate").option("rowsPerSecond", 5).load()
agg = stream.withWatermark("timestamp", "1 minute").groupBy(F.window("timestamp", "30 seconds")).count()
query = agg.writeStream.format("memory").queryName("wm_demo").outputMode("append").option("checkpointLocation", "/tmp/watermark-demo").start()
query.stop()
spark.stop()
`,
    tradeoff:
      "Append mode 只输出新增且未来不会更新的行；Update mode 输出本批更新的结果行；Complete mode 每批输出完整结果表。选择 output mode 时，要同时考虑 sink 是否支持、状态大小、下游是否能处理更新语义和结果何时最终可见。",
    sources:
      "本页依据 Structured Streaming API 文档。watermark 策略、输出模式支持和状态指标以当前 Spark 版本和 sink/source 实现为准。",
  }),

  "system-design-scenarios.md": compose({
    positioning:
      "Spark 系统设计不是问用不用 Spark，而是判断计算模型、数据规模、延迟目标、容错目标、资源模型和下游语义是否匹配。Spark 很适合大规模并行分析，但不负责替代存储系统、调度系统、权限系统、消息系统或业务事务系统。本页把批处理、流处理、交互式分析、特征工程、湖仓 ETL 和结果服务化放到同一设计框架。",
    objects:
      "| 维度 | 需要确认的问题 | 常见取舍 |\n| --- | --- | --- |\n| 数据规模 | 全量、增量、峰值和增长速度 | 决定分区、文件、资源和状态大小 |\n| 延迟目标 | 分钟级、秒级、毫秒级还是离线 | 决定 batch、micro-batch 或其他系统 |\n| 容错目标 | 可重跑、可恢复、端到端 exactly-once | Spark 恢复与外部幂等要分开设计 |\n| 数据布局 | 分区列、文件大小、表格式、统计信息 | 影响扫描裁剪、join 和小文件 |\n| 结果面 | 写表、写文件、写队列还是拉回 Driver | 大结果应留在分布式存储 |",
    flow:
      "批处理关注吞吐、可重跑、数据布局和下游可见性。流处理必须明确 source offset、checkpoint、state store、watermark、trigger、output mode、sink 语义和重启兼容性。交互式分析关注查询延迟、并发、缓存、统计信息和 Driver/UI 稳定性。特征工程常见长 lineage、重复扫描、宽表 join 和中间结果复用。",
    state:
      "Spark 能重算 task 和 stage，但最终表的幂等写入、分区覆盖和提交语义要由表格式或业务流程保证。需要端到端 exactly-once 时，不能只说 Spark 支持 exactly-once fault tolerance，还要确认 source、sink、foreachBatch 幂等、checkpoint 和外部提交协议。",
    diagnosis:
      "Spark 设计必须包含监控：event log、History Server、executor 日志、SQL UI、shuffle、spill、GC、state store、sink 延迟和外部系统指标。批作业常见风险是小文件过多、shuffle 过大、join 统计信息缺失、Driver collect、输出分区不合理和外部存储慢。",
    exampleTitle: "设计检查清单",
    exampleLang: "text",
    example: `
1. 输入：数据源、快照边界、schema、分区和权限。
2. 计算：API、join 策略、shuffle、缓存、checkpoint、状态大小。
3. 输出：文件/表/队列、提交语义、幂等键、下游可见时间。
4. 恢复：失败重跑、checkpoint 复用、版本回滚、补数方案。
5. 观测：Spark UI、event log、业务校验、外部系统指标。
`,
    tradeoff:
      "动态资源可以提高集群利用率，但要和 shuffle 数据可用性、executor 回收、decommission 和 external shuffle service/shuffle tracking 一起设计。队列隔离可以避免单个大作业影响全局，但也可能增加排队延迟。高并发低延迟点查通常应考虑专门 OLAP/Serving 系统，而不是直接用 Spark application 承载在线请求。",
    sources:
      "本页依据 Spark Overview、RDD Guide、Dataset API、Job Scheduling 和 Tuning 文档。系统设计中的端到端语义必须结合具体 source、sink、表格式和调度平台确认。",
  }),

  "release-quality-guide.md": compose({
    positioning:
      "Spark 作业发布质量不是能跑一次就达标，而是要证明在数据规模变化、资源波动、失败重试、版本升级和下游消费下仍然可解释、可恢复、可观测。发布质量清单用于把知识库中的机制转化为上线前检查。本页不是题库清单，而是 Spark 作业进入生产前应完成的工程验证框架。",
    objects:
      "| 检查面 | 重点 | 证据 |\n| --- | --- | --- |\n| 计划质量 | scan、exchange、join、AQE、统计信息 | explain、SQL UI |\n| 数据布局 | 文件大小、分区列、输出文件数 | 文件系统、表元数据 |\n| 资源内存 | executor、Driver、spill、GC、state | Spark UI、executor 日志 |\n| 容错幂等 | 重跑、checkpoint、外部提交 | 重跑演练、提交表 |\n| 观测回放 | event log、History Server、告警 | 监控和日志 |",
    flow:
      "发布前必须保存关键 SQL/DataFrame 的 explain(\"formatted\")。检查 FileScan 是否裁剪列和分区，Exchange 是否过多，Join 策略是否符合预期，Broadcast 是否超出内存边界，Sort/Aggregate 是否会产生大 shuffle，AQE 是否启用并在测试数据上生效。对关键表维护统计信息，并用 explain(\"cost\") 或 SQL UI runtime statistics 对比估算与实际。",
    state:
      "批处理要验证重跑是否幂等、输出路径是否安全覆盖、失败后是否会留下半成品、下游是否会读到部分结果。流处理要验证 checkpoint、offset、state schema、watermark、trigger、sink 语义和 foreachBatch batchId 去重。Spark task/stage 重试只保证计算恢复，不自动保证外部副作用幂等。",
    diagnosis:
      "上线后要监控 job/stage duration、shuffle read/write、spill、GC、executor lost、input/processed rows、state store rows、sink commit latency 和外部存储错误。告警不要只看应用失败。长尾 task、状态持续增长、checkpoint I/O 变慢和输出小文件膨胀，都会在失败前先出现趋势信号。",
    exampleTitle: "发布前核验清单",
    exampleLang: "text",
    example: `
1. 保存 explain("formatted") 和 explain("cost")。
2. 在准生产数据上跑完整链路，记录 Spark UI SQL 与 Stages 指标。
3. 人工触发失败重试或重跑，验证输出幂等。
4. 检查 event log 是否可被 History Server 回放。
5. 对比输入行数、输出行数、空值率、主键重复和分区文件数。
`,
    tradeoff:
      "schema、join key、checkpoint、依赖包、Spark 版本、表格式版本、资源规格和输出模式都属于高风险变更。发布时应提供回滚方案、补数方案和兼容性说明。流式状态型作业尤其不能随意复用旧 checkpoint。",
    sources:
      "本页依据 Spark Overview、RDD Guide、SQL Guide、Job Scheduling 和 Tuning 文档整理发布检查框架。具体发布门禁应结合企业调度平台、表格式、权限系统和数据质量工具落地。",
  }),
});

for (const [file, body] of Object.entries(pages)) {
  if (body) writePage(file, body);
}

// One remaining old wording in the hand-written tuning page is knowledge-style but
// included a question-bank marker. Keep the meaning and remove the marker.
const tuningPath = path.join(sparkDir, "performance-tuning.md");
let tuning = fs.readFileSync(tuningPath, "utf8");
tuning = tuning.replace("Spark 调优不是参数背诵，而是证据驱动的瓶颈定位。", "Spark 调优不是参数清单，而是证据驱动的瓶颈定位。");
fs.writeFileSync(tuningPath, tuning, "utf8");

console.log(JSON.stringify({ repairedPages: Object.keys(pages).length, tuningPatched: true }, null, 2));
