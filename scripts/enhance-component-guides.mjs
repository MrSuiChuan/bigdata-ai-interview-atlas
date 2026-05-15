import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = path.resolve(process.cwd());
const shouldWrite = process.argv.includes("--write");
const today = new Date().toISOString().slice(0, 10);

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, predicate));
    else if (predicate(full, entry.name)) out.push(full);
  }
  return out;
}

function loadSourceIds() {
  const ids = new Set();
  for (const file of walkFiles(path.join(repoRoot, "sources"), (_, name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    const parsed = yaml.load(fs.readFileSync(file, "utf8")) || [];
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    for (const row of rows) if (row?.id) ids.add(row.id);
  }
  return ids;
}

const knownSources = loadSourceIds();
const keepSources = (ids) => ids.filter((id) => knownSources.has(id));
const bullet = (items) => items.map((item) => `- ${item}`).join("\n");
const steps = (items) => items.map((item, index) => `${index + 1}. ${item}`).join("\n");
const fence = (lang, body) => `\`\`\`${lang}\n${body.trim()}\n\`\`\``;

function render(profile) {
  const fm = {
    kb_id: profile.kbId,
    title: profile.title,
    domain: profile.domain,
    component: profile.component,
    topic: "release-quality-guide",
    difficulty: "advanced",
    status: "reviewed",
    sidebar_position: profile.pos ?? 90,
    version_scope: `发布级知识指南，基于已登记来源在 ${today} 的整理`,
    last_verified_at: today,
    source_ids: keepSources(profile.sources),
    claim_ids: [],
    tags: [profile.component, "quality", "knowledge"],
  };

  return `---
${yaml.dump(fm, { lineWidth: 120, noRefs: true })}---

# 一句话定位

${profile.positioning}

## 它解决什么问题

这篇文档用于把 ${profile.name} 从“能说概念”提升到“能解释对象、状态、链路、边界、排障和工程取舍”。阅读时不要只记住名词，而要把每个对象放回真实执行链路里：谁创建它、谁维护它、状态什么时候变化、失败后由谁恢复、哪些结论对调用方可见。

## 核心对象

${bullet(profile.objects)}

## 执行链路

${steps(profile.flow)}

## 保证项与边界

${bullet(profile.boundaries)}

边界是知识库质量的分水岭。一个组件通常只保证自己负责的语义，端到端正确性还依赖调用方、存储层、计算层、权限系统、重试策略和运维流程共同成立。

## 性能模型

${bullet(profile.performance)}

性能分析不要从“调大参数”开始，而要先判断瓶颈位于输入、调度、网络、存储、状态、计算、序列化还是下游系统。任何调优动作都应该先有基线指标，再做单变量变更。

## 生产排障入口

${steps(profile.troubleshooting)}

## 状态变化与容量判断

分析 ${profile.name} 时，要把状态变化拆成四层：控制面状态、数据面状态、元数据状态和外部依赖状态。控制面状态决定谁来调度、谁来提交、谁来恢复；数据面状态决定数据是否已经写入、可见、可重放或可清理；元数据状态决定查询和治理能否正确找到对象；外部依赖状态决定端到端链路是否真的完成。

容量判断不能只看平均值。平均值决定长期资源成本，峰值决定限流和扩容，长尾决定用户体验和故障放大概率。任何组件一旦进入生产，都应该有容量基线、增长趋势、保留策略、失败重试上限和降级方案。

## 治理、安全与变更控制

治理不是上线后的附加项，而是架构的一部分。权限、审计、隔离、保留期、变更记录、回滚策略和人工审批应该在设计阶段就明确。否则系统规模扩大后，会出现无法追踪、无法恢复或无法解释的问题。

对于协议、API、表格式、事务、权限和状态恢复这类内容，必须区分官方保证、实现细节和工程经验。官方保证可以写成明确结论；实现细节要标明版本范围；工程经验只能写成适用条件下的建议。

## 发布前验证路径

发布级知识不能只停留在“讲得通”。每个关键结论都要能被验证：第一，用官方文档或已登记来源确认概念边界；第二，用执行计划、日志、指标或 trace 找到运行证据；第三，用一个失败场景检验恢复路径；第四，用一个容量增长场景检验性能模型；第五，用一个相邻技术对比检验职责边界。

如果某个结论无法被这些方式验证，就不要把它写成绝对判断。更稳妥的写法是说明“在什么配置、什么版本、什么数据规模、什么失败条件下成立”。这能避免知识库变成口号，也能让题库答案具备可追溯性。

## 学习时的核对清单

学习 ${profile.name} 时至少核对五件事：对象是否讲清、状态是否讲清、链路是否讲清、边界是否讲清、排障证据是否讲清。只要其中一项缺失，回答就容易停在术语层。真正的掌握应该能把一个现象还原成对象状态变化，再把状态变化还原成可观测证据，最后给出有代价说明的处理动作。

还要避免两个极端：一个极端是只背官方定义，无法解释生产问题；另一个极端是只讲经验参数，无法说明为什么有效。发布级知识应该把定义、机制、证据和操作连起来，让读者既知道“是什么”，也知道“为什么这样设计”“什么时候不成立”“出了问题先看哪里”。

因此，每次补充 ${profile.name} 内容时，都要同时补三类材料：机制图、排障证据和边界说明。机制图帮助理解对象如何协作，排障证据帮助定位真实问题，边界说明帮助避免把组件能力夸大成端到端保证。

## 工程样例

${profile.examples.join("\n\n")}

## 相邻技术边界

${bullet(profile.comparisons)}

## 知识库到题库的派生方式

下面这些题目应该从本篇知识点派生，而不是脱离知识库单独背诵：

${steps(profile.training)}

复盘时如果答不出对象、链路、状态、边界和排障证据，就说明知识库还没有真正掌握，需要回到对应章节补齐。
`;
}

const bigData = [
  {
    name: "Kafka",
    domain: "bigdata",
    component: "kafka",
    kbId: "bigdata/kafka/release-quality-guide",
    file: "docs/bigdata/kafka/release-quality-guide.md",
    title: "Kafka 发布级知识指南：从日志、复制、消费协调到生产排障",
    sources: ["kafka-design-doc", "kafka-consumer-javadoc", "kafka-producer-javadoc", "kafka-topic-configs", "kafka-monitoring"],
    positioning: "Kafka 是以追加写日志为核心的分布式事件流平台，擅长高吞吐写入、分区内顺序、消费者进度管理、保留与重放、复制容错；它不是通用数据库、全局有序队列或跨业务事务协调器。",
    objects: ["Topic 是逻辑事件流名称，Partition 是追加写日志分片，也是顺序性和并行度基本单位。", "Broker 承载分区数据、处理读写请求，并参与副本同步。", "Leader Replica 接收分区读写，Follower Replica 从 Leader 拉取日志并追赶。", "ISR 与 acks、min.insync.replicas 共同影响写入确认和持久性边界。", "Producer 负责分区选择、批量、压缩、重试、幂等和事务边界。", "Consumer Group 维护分区所有权、成员状态、offset 提交和故障接管。"],
    flow: ["Producer 根据 key、partitioner 或显式分区决定目标 Partition。", "请求到达 Leader Replica，Leader 将 batch 追加到本地 log segment。", "Follower 从 Leader 拉取数据，Leader 根据同步进度推进 high watermark。", "Consumer fetch 只能读取满足可见性边界的数据，并按分区维护 position。", "Consumer commit offset 形成重启恢复点，但业务是否成功由应用自己保证。"],
    boundaries: ["Kafka 保证分区内顺序，不保证多分区全局顺序。", "acks=all 与 min.insync.replicas 降低已确认消息丢失概率，但不是任意故障下的绝对不丢。", "同一 Consumer Group 内一个 Partition 同一时刻最多分配给一个消费者。", "Kafka 事务覆盖 Kafka 内 read-process-write 链路，不自动覆盖外部数据库副作用。"],
    performance: ["吞吐主要受 batch、linger、compression、partition 数、broker 磁盘和网络影响。", "消费并行度首先受 partition 数限制，其次才是线程、CPU 和下游写入能力。", "rebalance、慢消费者、热点 key 和下游阻塞都会放大 consumer lag。", "过多小分区会增加元数据、文件句柄、controller 和恢复成本。"],
    troubleshooting: ["先看 broker 是否有磁盘、网络、请求队列或 ISR 收缩问题。", "再看 topic/partition 是否存在热点、分区过多或保留策略不合理。", "消费慢时同时看 consumer lag、poll 间隔、处理耗时、commit 策略和下游写入。", "事务或幂等异常要核对 producer id、sequence、transaction timeout 和 fencing 日志。"],
    examples: [fence("properties", "acks=all\nenable.idempotence=true\nlinger.ms=20\ncompression.type=zstd\nmax.in.flight.requests.per.connection=5"), fence("mermaid", "flowchart LR\n  P[Producer Batch] --> L[Leader Replica Append]\n  L --> F[Follower Fetch]\n  L --> HW[High Watermark]\n  HW --> C[Consumer Fetch]\n  C --> O[Offset Commit]")],
    comparisons: ["Kafka 更像可重放事件日志，不是低延迟任务队列。", "Kafka Connect 负责外部系统数据接入，不负责复杂流计算。", "Kafka Streams 提供轻量状态流处理，但不替代 Flink/Spark。"],
    training: ["Consumer Group 为什么并行度受 Partition 数限制？", "acks=all 和 min.insync.replicas 如何共同影响写入语义？", "为什么 offset commit 不等于业务处理成功？", "ISR 收缩时应该如何排障？"],
  },
  {
    name: "Spark",
    domain: "bigdata",
    component: "spark",
    kbId: "bigdata/spark/release-quality-guide",
    file: "docs/bigdata/spark/release-quality-guide.md",
    title: "Spark 发布级知识指南：从 Catalyst、DAG、Shuffle 到资源调优",
    sources: ["spark-overview-doc", "spark-sql-guide", "spark-rdd-guide", "spark-tuning-guide", "spark-job-scheduling"],
    positioning: "Spark 是面向批处理、交互式 SQL、机器学习和流式微批的分布式计算引擎。核心不是某个 API，而是 Driver 生成计划、调度 Stage、Executor 执行 Task、Shuffle 连接宽依赖的执行模型。",
    objects: ["Driver 维护应用生命周期、生成执行计划并协调调度。", "SparkSession 连接 Catalog、Analyzer、Optimizer 和 Planner。", "Logical Plan 表示语义，Physical Plan 表示实际执行策略。", "DAGScheduler 按宽依赖切分 Stage，TaskScheduler 把 Task 分发到 Executor。", "Executor 执行 Task、缓存数据、读写 Shuffle。", "Shuffle 是跨分区数据重分布，也是多数性能问题的放大器。"],
    flow: ["action 触发作业提交。", "SQL/DataFrame 经过解析、分析、逻辑优化和物理计划生成。", "DAGScheduler 根据 Shuffle 边界切分 Stage。", "TaskScheduler 根据资源和 locality 将 Task 分配给 Executor。", "Executor 执行算子，必要时读写 Shuffle 文件并返回或落盘。"],
    boundaries: ["transformation 只构建计划，action 才触发执行。", "RDD lineage 可重算，但 Shuffle 和缓存有不同恢复成本。", "Catalyst 和 AQE 能优化计划但依赖统计信息和运行时观测。", "Structured Streaming 是持续查询模型，不等同于毫秒级逐条事件引擎。"],
    performance: ["Shuffle 数据量、分区数、倾斜和序列化决定多数 SQL 作业成本。", "内存压力要同时看 execution memory、storage memory、GC 和 spill。", "AQE 可处理部分 join 策略和 skew，但不能替代合理分区和统计信息。", "小文件会放大任务数量、元数据开销和调度成本。"],
    troubleshooting: ["用 Spark UI 判断时间花在调度、计算、Shuffle read/write、GC 还是 spill。", "SQL 慢先看 explain plan、join 顺序、过滤下推、分区裁剪和数据倾斜。", "OOM 要区分 Driver OOM、Executor OOM、Python worker OOM 和 shuffle fetch 失败。", "流任务延迟升高时看 input rate、processing time、state store 和 checkpoint。"],
    examples: [fence("sql", "EXPLAIN FORMATTED\nSELECT user_id, count(*)\nFROM fact_events\nWHERE dt = '2026-04-29'\nGROUP BY user_id;"), fence("mermaid", "flowchart LR\n  SQL[SQL/DataFrame] --> LP[Logical Plan]\n  LP --> OP[Optimized Plan]\n  OP --> PP[Physical Plan]\n  PP --> ST[Stages]\n  ST --> TK[Tasks on Executors]")],
    comparisons: ["Spark 适合批处理和复杂 SQL，不是专门的毫秒级事件处理引擎。", "Spark 更偏计算引擎，Hive 更偏数据仓库语义和 Metastore 生态。", "Flink 的状态和事件时间模型更适合低延迟有状态流。"],
    training: ["Spark 为什么会产生 Stage？", "Shuffle 为什么是性能瓶颈？", "Catalyst 和 AQE 分别解决什么问题？", "Executor OOM 如何定位？"],
  },
  {
    name: "Flink",
    domain: "bigdata",
    component: "flink",
    kbId: "bigdata/flink/release-quality-guide",
    file: "docs/bigdata/flink/release-quality-guide.md",
    title: "Flink 发布级知识指南：从状态、Checkpoint、水位线到端到端语义",
    sources: ["flink-docs-home", "flink-working-with-state", "flink-checkpointing", "flink-generating-watermarks", "flink-task-failure-recovery"],
    positioning: "Flink 是以有状态流处理为核心的分布式计算引擎。重点不是只会写算子，而是理解事件时间、状态、Checkpoint barrier、恢复、反压和外部系统提交语义如何形成生产链路。",
    objects: ["JobGraph/ExecutionGraph 描述作业拓扑和并行实例。", "Operator 是数据处理节点，Task 是实际运行单元。", "Keyed State 归属于 key group，Operator State 归属于算子并行实例。", "Checkpoint Barrier 在数据流中对齐状态快照边界。", "Watermark 表示事件时间进展。", "State Backend/Checkpoint Storage 决定状态访问和快照存储方式。"],
    flow: ["Source 读取数据并生成事件和 watermark。", "keyBy 将相同 key 路由到同一状态分区。", "Operator 读取和更新状态，同时继续向下游输出。", "Checkpoint Coordinator 注入 barrier，算子快照状态并确认。", "故障后从最近成功 checkpoint 恢复状态和 source offset。"],
    boundaries: ["Flink 内部状态可通过 checkpoint 精确恢复，但不自动覆盖所有外部副作用。", "watermark 推动窗口触发并表达乱序容忍，不等于系统处理时间。", "状态按 key group 和并行度管理，不能随便存在本地变量里。", "下游处理慢会沿链路向上游传播反压。"],
    performance: ["反压、状态大小、checkpoint 时长、rocksdb 读写、序列化和下游 sink 是核心瓶颈。", "窗口和定时器会增加状态规模，必须关注 TTL、清理和 key 分布。", "checkpoint 间隔、超时、并发数和对齐策略会影响延迟和恢复点新鲜度。", "热点 key 会导致单个 subtask 饱和。"],
    troubleshooting: ["看 Web UI 的 backpressure、busy time、checkpoint duration 和 alignment time。", "延迟升高时区分 source 堆积、算子计算慢、状态访问慢和 sink 阻塞。", "checkpoint 失败要看 barrier 对齐、状态后端、外部存储、超时和网络。", "窗口不触发时检查 watermark、idle source 和 allowed lateness。"],
    examples: [fence("java", "stream\n  .assignTimestampsAndWatermarks(watermarkStrategy)\n  .keyBy(Event::userId)\n  .window(TumblingEventTimeWindows.of(Time.minutes(5)))\n  .aggregate(new CountAgg());"), fence("mermaid", "flowchart LR\n  S[Source] --> K[keyBy]\n  K --> O[Stateful Operator]\n  O --> W[Window]\n  W --> Sink[Two-phase Sink]\n  C[Checkpoint Coordinator] -. barrier .-> S")],
    comparisons: ["Flink 更强调低延迟有状态流，Spark 更常用于批处理和微批。", "Kafka 提供事件日志和重放，Flink 负责有状态计算。", "数据库事务不等于 Flink 端到端 exactly-once，sink 需要配合提交协议。"],
    training: ["Checkpoint barrier 如何形成一致快照？", "Watermark 为什么不等于系统时间？", "反压应该如何定位？", "Flink exactly-once 的边界是什么？"],
  },
];

const extraBigData = [
  ["hive", "Hive", "Hive 发布级知识指南：从 Metastore、SQL 优化到湖仓治理", "Hive 是建立在分布式存储之上的 SQL 数据仓库系统和元数据生态，核心价值是用表、分区、SerDe、Metastore、执行引擎和权限模型组织离线分析。", ["hive-introduction", "hive-language-manual", "hive-metastore-admin", "hive-transactions", "hive-explain"], ["Metastore 保存 database、table、partition、schema、location 和统计信息。", "Table/Partition 把目录和文件组织成 SQL 可理解的逻辑对象。", "SerDe 负责文件格式和 Hive 行列语义转换。", "Execution Engine 将 SQL 计划转成 MapReduce、Tez 或 Spark 等执行任务。"], ["客户端提交 SQL 到 HiveServer2。", "编译器解析 SQL、解析元数据、做语义分析和优化。", "执行引擎提交 DAG 或任务到集群运行。", "结果从底层存储读取、聚合并返回。"]],
  ["hdfs", "HDFS", "HDFS 发布级知识指南：从 NameNode 元数据、Block 到读写恢复", "HDFS 是面向大文件、高吞吐顺序读写的分布式文件系统，通过 NameNode 管理元数据、DataNode 存储 Block、副本放置和心跳汇报实现可扩展存储。", ["hadoop-hdfs-design", "hadoop-hdfs-user-guide", "hadoop-hdfs-ha-qjm"], ["NameNode 维护命名空间、文件到 block 的映射和副本位置。", "DataNode 存储 block 并发送 heartbeat 与 block report。", "Block 是数据切分和副本管理单位。", "EditLog 记录命名空间变更，FsImage 是元数据快照。"], ["写入时 Client 向 NameNode 申请 block。", "NameNode 返回 DataNode pipeline。", "Client 将 packet 写入 pipeline。", "读取时 Client 先获取 block locations，再直接读 DataNode。"]],
  ["hbase", "HBase", "HBase 发布级知识指南：从 Region、WAL、MemStore 到 RowKey 设计", "HBase 是建立在 HDFS 之上的分布式宽列存储，适合按 RowKey 做大规模随机读写，核心是 Region、RegionServer、WAL、MemStore、HFile 和 compaction。", ["hbase-book"], ["Table 按 RowKey 范围切分为 Region。", "RegionServer 承载 Region 并处理读写请求。", "WAL 在写入 MemStore 前记录变更。", "MemStore flush 后形成 HFile。"], ["Client 根据 RowKey 定位 RegionServer。", "写入先追加 WAL，再写 MemStore。", "MemStore flush 形成 HFile。", "读请求同时查 MemStore、BlockCache 和 HFile。"]],
  ["yarn", "YARN", "YARN 发布级知识指南：从 ResourceManager、ApplicationMaster 到队列调度", "YARN 是 Hadoop 生态的资源管理和应用调度层，负责把集群资源以 Container 形式分配给应用。", ["hadoop-yarn-architecture", "spark-running-on-yarn"], ["ResourceManager 负责全局资源管理和调度。", "NodeManager 负责单节点资源、Container 启停和健康汇报。", "ApplicationMaster 代表单个应用申请资源并协调任务。", "Container 是资源分配单位。"], ["客户端向 ResourceManager 提交应用。", "ResourceManager 分配 Container 启动 ApplicationMaster。", "ApplicationMaster 申请更多 Container。", "NodeManager 启动 Container 并汇报状态。"]],
  ["trino", "Trino", "Trino 发布级知识指南：从 Coordinator、Connector 到分布式 SQL 执行", "Trino 是面向交互式分析的分布式 SQL 查询引擎，通过 Connector 访问多种数据源，由 Coordinator 生成计划，Worker 并行执行。", ["trino-docs"], ["Coordinator 负责解析 SQL、生成计划、调度任务和汇总状态。", "Worker 执行 Task 并通过 Exchange 交换数据。", "Connector 提供元数据、split 枚举和下推能力。", "Split 是底层数据源可并行读取的基本单位。"], ["客户端提交 SQL 到 Coordinator。", "Coordinator 生成分布式计划。", "Connector 枚举 split 并尝试下推。", "Worker 执行 scan、join、aggregation 并交换数据。"]],
  ["clickhouse", "ClickHouse", "ClickHouse 发布级知识指南：从 MergeTree、Part、Mark 到 OLAP 排障", "ClickHouse 是面向 OLAP 的列式数据库管理系统，通过 MergeTree、不可变 part、稀疏主键索引、列式压缩和后台 merge 实现高吞吐分析。", ["clickhouse-docs"], ["MergeTree 表引擎定义分区、排序键、主键索引和合并行为。", "Part 是写入形成的不可变数据片段。", "Granule/Mark 支撑稀疏索引定位。", "Merge 后台合并 part，降低文件数量和读放大。"], ["INSERT 形成新的 part。", "后台 merge 合并小 part。", "查询先做分区裁剪，再利用排序键和稀疏索引跳过数据。", "只读取需要的列并进行向量化执行。"]],
  ["iceberg", "Iceberg", "Iceberg 发布级知识指南：从 Snapshot、Manifest 到多引擎湖仓表", "Iceberg 是开放湖仓表格式，负责在对象存储或分布式文件系统之上提供表级元数据、快照、schema evolution、partition evolution 和并发提交语义。", ["iceberg-docs-home", "iceberg-spec", "iceberg-schemas", "iceberg-partitioning"], ["Table Metadata 保存当前 schema、partition spec、snapshot 和属性。", "Snapshot 表示一次表状态。", "Manifest List 指向本次快照涉及的 manifest。", "Manifest 记录 data file/delete file 的统计信息和分区信息。"], ["写引擎生成 data file 或 delete file。", "写出 manifest 和 manifest list。", "生成新的 table metadata。", "通过 catalog 原子提交。"]],
  ["hudi", "Hudi", "Hudi 发布级知识指南：从 Timeline、File Group 到 Upsert 与 Compaction", "Hudi 是面向数据湖增量写入、upsert、delete 和近实时消费的湖仓表格式，通过 timeline、file group、file slice、index、compaction 和 cleaning 组织文件状态。", ["hudi-docs-overview"], ["Timeline 记录 commit、deltacommit、compaction、clean 等 instant。", "File Group 表示同一逻辑文件组。", "COW 把更新写成新的列式文件，MOR 把更新写入 log。", "Index 用于定位 record key 所在文件组。"], ["写入侧根据 record key 和 index 定位文件组。", "COW 重写数据文件，MOR 追加 log file。", "Timeline 记录 commit 或 deltacommit。", "后台 compaction/cleaning 控制文件数量和历史保留。"]],
  ["delta-lake", "Delta Lake", "Delta Lake 发布级知识指南：从 Transaction Log、Checkpoint 到 ACID 湖仓表", "Delta Lake 是围绕事务日志构建的湖仓表格式，通过 _delta_log、checkpoint、AddFile/RemoveFile action 和乐观并发控制提供 ACID、time travel 和文件治理能力。", ["delta-lake-docs"], ["Transaction Log 记录表状态变更。", "JSON Commit 保存一次提交的 action。", "Checkpoint 将多个提交压缩成列式快照。", "Optimistic Concurrency Control 处理并发写入冲突。"], ["写入任务生成新的数据文件。", "提交前基于当前表版本检查冲突。", "写入新的 JSON commit。", "读请求根据 log 和 checkpoint 还原目标版本文件列表。"]],
];

for (const [component, name, title, positioning, sources, objects, flow] of extraBigData) {
  bigData.push({
    name,
    domain: "bigdata",
    component,
    kbId: `bigdata/${component}/release-quality-guide`,
    file: `docs/bigdata/${component}/release-quality-guide.md`,
    title,
    sources,
    positioning,
    objects,
    flow,
    boundaries: [`${name} 只保证自己负责的核心语义，不自动保证端到端业务正确。`, "元数据、文件、状态和执行引擎要分开理解。", "生产结论必须落到版本、配置、数据规模和失败场景。", "不能把相邻系统能力混到本组件里。"],
    performance: ["先看数据规模、文件数量、并行度、元数据规模和下游瓶颈。", "热点、倾斜、小文件、后台维护任务和错误重试都会放大成本。", "调优前必须有执行计划、指标、日志和基线。"],
    troubleshooting: ["先判断问题属于控制面、数据面、状态面、资源面还是外部依赖。", "收集执行计划、日志、指标、元数据和配置变更记录。", "把处理动作和证据一一对应，保留回滚路径。", "复盘时沉淀为监控、告警、容量规划或文档更新。"],
    examples: [fence("text", `主题：${name} 发布级排障\n现象：先描述用户可感知的问题。\n定位：区分控制面、数据面、状态面、资源面或外部依赖。\n证据：收集日志、指标、执行计划、元数据和配置变更。\n处理：让动作和根因一一对应。`), fence("mermaid", `flowchart LR\n  A[输入请求] --> B[元数据/计划]\n  B --> C[执行/读写]\n  C --> D[状态更新]\n  D --> E[观测与复盘]`)],
    comparisons: [`${name} 的职责要和存储、计算、查询、表格式、资源调度等相邻层分开。`, "选型时先看业务链路，而不是只看组件热度。", "系统设计回答必须说明替代方案和不适用场景。"],
    training: [`${name} 的核心对象分别维护什么状态？`, `${name} 的正常链路和失败链路如何描述？`, `${name} 的性能瓶颈通常在哪里？`, `${name} 和相邻组件如何分工？`],
  });
}

const ai = [
  {
    name: "Agent Runtime",
    domain: "ai-agent",
    component: "agent-runtime",
    kbId: "ai-agent/foundations/agent-runtime-release-quality-guide",
    file: "docs/ai-agent/foundations/agent-runtime-release-quality-guide.md",
    title: "Agent Runtime 发布级知识指南：从执行循环、工具、状态到治理",
    sources: ["openai-agents-sdk-docs", "openai-agents-sdk-tools", "openai-agents-sdk-sessions", "openai-agents-sdk-tracing", "openai-agent-evals-guide"],
    positioning: "Agent Runtime 是把模型、指令、工具、状态、记忆、评估和治理组织成可运行系统的工程层，不是一次模型调用，也不是简单 Prompt 模板。",
    objects: ["Model 负责生成决策和自然语言结果。", "Instruction 定义任务目标、角色边界和行为约束。", "Tool 暴露外部能力，必须有 schema、权限和副作用说明。", "State 保存当前任务上下文、步骤、工具结果和中间结论。", "Trace 记录模型输入输出、工具调用、成本、延迟和错误。", "Guardrail/Eval 用于上线前后质量与安全控制。"],
    flow: ["接收用户目标并构造上下文。", "模型基于 instruction、state 和 tool schema 选择动作。", "运行时校验工具参数、权限和审批策略。", "执行工具并把结果写回 state。", "模型决定继续、终止、交给人工或输出 final answer。"],
    boundaries: ["自主性由工具权限、预算、审批和终止条件限定。", "记忆服务任务连续性，不等于无限制保存所有信息。", "工具受 schema、权限和副作用约束，不天然安全可靠。", "评估要用数据集、trace 和人工抽检验证。"],
    performance: ["延迟由模型调用、工具调用、检索、重试和人工审批共同决定。", "成本受 token、模型路由、工具次数和失败重试影响。", "长任务需要 checkpoint、resume 和幂等工具。"],
    troubleshooting: ["看 trace，确认错误发生在模型决策、工具参数、工具执行、状态写入还是最终输出。", "工具失败要区分 schema 不匹配、权限不足、外部服务错误和副作用冲突。", "成本异常要看循环次数、上下文膨胀、重试和模型路由。"],
    examples: [fence("text", "Agent step = observe state -> decide action -> validate tool call -> execute -> update state -> trace -> continue/stop"), fence("mermaid", "flowchart LR\n  U[User Goal] --> M[Model Decision]\n  M --> V[Tool Validation]\n  V --> T[Tool Execution]\n  T --> S[State Update]\n  S --> M\n  S --> E[Trace and Eval]")],
    comparisons: ["普通 LLM 调用只生成一次响应，Agent Runtime 管理多步任务。", "Workflow 强调显式流程，Agent 强调模型在边界内选择动作。", "RAG 提供知识证据，Agent Runtime 决定如何使用证据和工具。"],
    training: ["Agent 和普通 LLM 调用的本质区别是什么？", "工具调用为什么必须有权限和副作用边界？", "长任务 Agent 如何恢复？", "trace 在 Agent 排障中看什么？"],
  },
  {
    name: "MCP 与 A2A",
    domain: "ai-agent",
    component: "mcp",
    kbId: "ai-agent/protocols/mcp-a2a-release-quality-guide",
    file: "docs/ai-agent/protocols/mcp-a2a-release-quality-guide.md",
    title: "MCP 与 A2A 发布级知识指南：工具上下文协议和 Agent 协作边界",
    sources: ["mcp-introduction", "mcp-architecture", "mcp-server-concepts", "a2a-overview-docs", "a2a-spec-docs"],
    positioning: "MCP 更偏把 AI 应用和外部工具、资源、提示词连接起来，A2A 更偏 Agent 之间发现、通信和任务协作。二者解决的问题层次不同。",
    objects: ["MCP Host 是用户实际使用的 AI 应用或开发环境。", "MCP Client 维护和 Server 的协议连接。", "MCP Server 暴露 tools、resources 和 prompts。", "Tool 是可执行动作，Resource 是可读上下文，Prompt 是工作流模板。", "A2A Agent Card 描述 Agent 能力和发现信息。", "A2A Task/Message/Artifact 表示任务、消息和产物。"],
    flow: ["Host 连接 MCP Client。", "Client 发现 Server 暴露的能力。", "模型决定是否调用工具，Host/Client 做权限和参数校验。", "Server 执行能力并返回结构化结果。", "A2A 场景下 Agent 根据能力发现另一个 Agent 并提交任务。"],
    boundaries: ["MCP 连接模型应用和外部上下文/工具，不负责全部 Agent 协作。", "A2A 解决 Agent 发现和任务通信，不替代所有工具协议。", "Tool 是可执行动作，需要权限和副作用控制。", "Resource 是可读上下文，不是可执行操作。"],
    performance: ["瓶颈通常在工具实现、网络、认证、上下文体积和模型调用次数。", "工具列表过大可能增加模型选择成本和误调用概率。", "跨 Agent 协作会放大延迟、错误传播和审计复杂度。"],
    troubleshooting: ["调用失败先区分协议连接失败、schema 不匹配、认证失败和工具内部错误。", "误调用要检查工具命名、描述、参数约束和可见性过滤。", "A2A 协作失败要检查能力发现、任务状态、消息格式和产物引用。"],
    examples: [fence("json", "{\n  \"name\": \"search_orders\",\n  \"description\": \"按订单号查询订单，只读操作\",\n  \"inputSchema\": { \"type\": \"object\", \"required\": [\"order_id\"] }\n}"), fence("mermaid", "flowchart LR\n  Host --> Client[MCP Client]\n  Client --> Server[MCP Server]\n  Server --> Tool[Tool]\n  AgentA[Agent A] --> AgentB[Agent B via A2A]")],
    comparisons: ["MCP 主要解决工具和上下文接入，A2A 主要解决 Agent 间协作。", "函数调用是模型 API 层能力，MCP 是外部工具生态协议。", "协议接入不等于生产治理，还需要权限、审计和安全策略。"],
    training: ["MCP 的 Host、Client、Server 如何分工？", "Tool、Resource、Prompt 为什么不能混淆？", "A2A 和 MCP 的边界是什么？", "如何排查一次失败的 tool call？"],
  },
  {
    name: "RAG 与 Evaluation",
    domain: "ai-agent",
    component: "agent-patterns",
    kbId: "ai-agent/patterns/rag-evaluation-release-quality-guide",
    file: "docs/ai-agent/patterns/rag-evaluation-release-quality-guide.md",
    title: "RAG 与 Evaluation 发布级知识指南：从检索质量到可验证生成",
    sources: ["rag-paper", "openai-file-search-docs", "openai-retrieval-guide", "azure-rag-evaluators", "openai-evaluation-best-practices"],
    positioning: "RAG 是把检索系统和生成模型组合起来减少无依据生成、增强领域知识和处理私有数据的工程模式。难点是文档治理、召回、排序、证据约束、评估和权限边界。",
    objects: ["Corpus 是可检索知识集合，需要版本、权限和生命周期。", "Chunk 是检索基本片段，影响召回和上下文质量。", "Embedding 将文本映射到向量空间。", "Retriever 负责召回候选文档。", "Reranker 改善候选排序。", "Evaluator 用数据集和指标判断系统质量。"],
    flow: ["文档进入 ingestion pipeline，完成解析、清洗、切分和元数据标注。", "chunk 计算 embedding 并写入索引。", "用户问题经过改写或扩展后进入检索。", "系统用向量、BM25 或混合检索召回候选。", "rerank、过滤和去重后选择证据放入上下文。", "eval 检查检索命中、答案正确性、引用一致性和拒答表现。"],
    boundaries: ["RAG 增强知识证据和可追溯性，但不能彻底消灭幻觉。", "Embedding 提供语义相似召回，不等于事实正确性判断。", "Chunk 策略影响召回和上下文粒度。", "Eval 需要固定样本和指标，不能只看 demo 感觉。"],
    performance: ["质量瓶颈通常在文档解析、chunk、召回覆盖、rerank、权限过滤和提示词约束。", "延迟来自检索、重排、上下文长度和模型生成。", "成本受索引规模、embedding 刷新、rerank 模型和 token 影响。"],
    troubleshooting: ["答非所问先看检索结果是否命中正确文档。", "检索命中但答案错要检查 chunk 粒度、上下文排序和 Prompt 证据约束。", "权限泄露要检查 metadata filter、索引隔离和缓存。"],
    examples: [fence("text", "RAG eval = 检索命中率 + 证据覆盖率 + 答案正确率 + 引用一致性 + 拒答正确率"), fence("mermaid", "flowchart LR\n  D[Documents] --> I[Ingestion]\n  I --> E[Embedding Index]\n  Q[Question] --> R[Retriever]\n  E --> R\n  R --> RR[Rerank and Filter]\n  RR --> G[Grounded Generation]\n  G --> EV[Evaluation]")],
    comparisons: ["RAG 不是 Agent，但 Agent 可以调用 RAG 作为工具。", "向量数据库不是完整 RAG，文档治理和评估同样关键。", "微调改变模型参数，RAG 动态注入外部知识。"],
    training: ["为什么 RAG 不是上传文档就结束？", "chunk 太大或太小分别有什么问题？", "向量检索和 BM25 如何互补？", "如何评估 RAG 的引用可信度？"],
  },
];

const llm = [{
  name: "大模型基础",
  domain: "llm-foundations",
  component: "llm-overview",
  kbId: "llm-foundations/llm-release-quality-guide",
  file: "docs/llm-foundations/llm-release-quality-guide.md",
  title: "大模型基础发布级知识指南：从 Transformer、Tokenizer 到推理、评估和应用边界",
  sources: ["openai-models-guide", "openai-compare-models-guide", "openai-latency-optimization-guide", "openai-cost-optimization-guide", "practice-happy-llm", "practice-base-llm"],
  positioning: "大模型基础知识库要把模型结构、训练目标、tokenization、上下文窗口、推理成本、对齐、评估和应用边界连成一条工程链路。",
  objects: ["Token 是模型处理文本的基本单位，影响上下文长度、成本和截断。", "Embedding 表示语义向量，可用于检索和相似度。", "Transformer 通过注意力和前馈网络建模上下文依赖。", "Context Window 限制一次调用可见信息。", "Sampling 参数影响生成多样性和稳定性。", "Eval 数据集和评分器用于判断模型或应用是否退化。"],
  flow: ["输入文本先被 tokenizer 切成 token。", "模型在上下文窗口内计算条件概率分布。", "解码策略根据概率和采样参数生成后续 token。", "应用层用系统指令、工具、RAG 或结构化输出约束结果。", "上线后通过 eval、trace 和人工抽检监控质量。"],
  boundaries: ["模型能力由训练数据、架构、上下文和推理策略共同决定。", "上下文只影响本次可见信息，不等于长期记忆。", "Prompt 约束任务表达和输出格式，但不能保证事实正确。", "Eval 用于发现回归和风险，不是一次主观体验。"],
  performance: ["延迟受模型规模、输入输出 token、批处理、缓存、网络和工具链路影响。", "成本受 token 数、模型选择、重试、检索和多轮上下文膨胀影响。", "长上下文不等于高质量，检索、压缩和分层摘要仍然重要。"],
  troubleshooting: ["答案不稳定要检查 sampling、提示词歧义和 eval 样本。", "成本高先看上下文长度、重复历史、工具循环和模型路由。", "事实错误要检查知识来源、时效性、RAG 证据和输出约束。"],
  examples: [fence("text", "一次 LLM 应用调用 = instruction + context + optional tools/RAG + model inference + validation + trace/eval"), fence("mermaid", "flowchart LR\n  Text --> Tok[Tokenizer]\n  Tok --> Model[Transformer Inference]\n  Model --> Dec[Decoding]\n  Dec --> Val[Validation]\n  Val --> Eval[Evaluation]")],
  comparisons: ["Prompt Engineering 解决表达和约束，不替代知识来源。", "RAG 解决动态外部知识，不改变模型参数。", "Fine-tuning 调整模型行为或领域模式，但不适合频繁更新事实库。"],
  training: ["Token 为什么影响成本和上下文？", "长上下文为什么不等于长期记忆？", "Prompt、RAG、Fine-tuning 如何分工？", "如何拆分 LLM 应用延迟？"],
}];

const profiles = [...bigData, ...ai, ...llm];
for (const profile of profiles) {
  const file = path.join(repoRoot, profile.file);
  if (shouldWrite) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, render(profile), "utf8");
  }
}

console.log(JSON.stringify({ guides: profiles.length, written: shouldWrite ? profiles.length : 0 }, null, 2));
