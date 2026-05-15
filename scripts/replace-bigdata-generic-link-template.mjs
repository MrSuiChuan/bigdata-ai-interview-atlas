import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const bigdataRoot = path.join(repoRoot, "docs", "bigdata");

const genericBlockPattern =
  /### 本页需要串起来的链路\n\n1\. 入口：确认请求、作业、SQL、后台任务或管理命令从哪里进入系统。\n2\. 对象：把参与对象按控制面、数据面、元数据面和外部依赖分类。\n3\. 链路：描述请求如何推进、状态如何变化、结果何时可见。\n4\. 边界：明确组件保证什么，不保证什么，以及调用方需要承担什么。\n5\. 证据：用指标、日志、元数据、执行计划或命令行形成可复核判断。\n\n(?=### 常见误判)/g;

const normalizedBlockPattern =
  /### (?:本页需要串起来的链路|本组件的学习主线|本知识地图的阅读主线|架构协作链路|读写执行链路|性能判断链路|排障证据链路|生产设计链路|发布质量链路|本主题的机制链路)\n\n[\s\S]*?\n(?=### 常见误判)/g;

const componentFlows = {
  clickhouse: {
    name: "ClickHouse",
    overview:
      "ClickHouse 的主线应从 MergeTree 表、Part、主键稀疏索引、后台 merge 和查询 pipeline 串起。写入时数据先形成不可变 Part，后台任务再合并和清理；读取时先做分区、主键、跳数索引和列裁剪，再把扫描结果交给并行 pipeline 聚合或排序。",
    mechanism:
      "ClickHouse 的机制链路要落到 Part、Mark、Primary Key、Projection、Mutation、Merge 和 Query Pipeline 这些对象上。判断一个主题时，重点看它改变的是数据文件布局、后台维护任务、查询裁剪能力，还是分布式查询阶段的网络与内存开销。",
    evidence:
      "可复核证据主要来自 system.query_log、system.parts、system.merges、system.mutations、EXPLAIN PIPELINE、EXPLAIN indexes 和 profile events。不要只看 SQL 是否返回成功，还要看扫描行数、读取字节数、活动 Part 数、merge 积压和内存峰值。",
  },
  "delta-lake": {
    name: "Delta Lake",
    overview:
      "Delta Lake 的主线应从 _delta_log、JSON commit、checkpoint、Snapshot 和数据文件可见性串起。写入不是直接让读者看到新文件，而是先生成事务日志；读者基于快照读取某个版本，因此可见性由日志提交和快照解析决定。",
    mechanism:
      "Delta Lake 的机制链路要落到 AddFile、RemoveFile、Snapshot、Optimistic Commit、Checkpoint、VACUUM 和 OPTIMIZE 上。分析问题时要区分数据文件已经写入、事务日志已经提交、读者快照已经刷新这三个状态。",
    evidence:
      "可复核证据主要来自 _delta_log 文件、DESCRIBE HISTORY、表版本、文件清单、checkpoint 间隔、VACUUM 保留期和 Spark 执行计划。不要只看目录里有没有文件，要看当前快照是否包含这些文件。",
  },
  flink: {
    name: "Flink",
    overview:
      "Flink 的主线应从 Source、Operator Chain、Keyed State、Checkpoint Barrier、State Backend 和 Sink 提交串起。事件进入作业后先经过算子链处理，状态按 key 分片保存，checkpoint 把状态和外部提交点对齐，恢复时再从一致状态继续运行。",
    mechanism:
      "Flink 的机制链路要落到 Task、Slot、Key Group、Watermark、Window、Timer、Checkpoint 和 Savepoint 上。判断一个主题时，要说明它影响事件时间推进、状态大小、barrier 对齐、反压传播，还是失败恢复后的端到端一致性。",
    evidence:
      "可复核证据主要来自 Flink Web UI、checkpoint duration、alignment time、backpressure、busy/idle 指标、TaskManager 日志、savepoint 元数据和 sink 提交记录。不要只看作业 running，要看状态是否持续增长、checkpoint 是否稳定完成。",
  },
  hbase: {
    name: "HBase",
    overview:
      "HBase 的主线应从 RowKey、Region、RegionServer、WAL、MemStore、HFile、BlockCache 和 Compaction 串起。写入先进入 WAL 和 MemStore，flush 后形成 HFile；读取会合并 MemStore、BlockCache 和 HFile 结果，后台 compaction 决定长期读放大。",
    mechanism:
      "HBase 的机制链路要落到 Region 边界、WAL 持久化、MemStore flush、HFile 索引、Bloom Filter、BlockCache 和 compaction 策略上。分析问题时要区分热点 RowKey、Region 分布、读放大、写放大和 GC/内存压力。",
    evidence:
      "可复核证据主要来自 HBase UI、RegionServer 日志、region 分布、storefile 数量、compaction queue、block cache hit ratio、WAL 延迟和请求 P99。不要只看表是否可读写，要看热点和文件数量是否正在放大风险。",
  },
  hdfs: {
    name: "HDFS",
    overview:
      "HDFS 的主线应从 Client、NameNode、Block、DataNode Pipeline、Replica、JournalNode 和 HA 状态串起。写入时 NameNode 分配 block 和副本位置，客户端按 pipeline 写入 DataNode；读取时先取 block 位置信息，再从合适 DataNode 拉取数据。",
    mechanism:
      "HDFS 的机制链路要落到 namespace 元数据、block report、副本放置、租约、pipeline ACK、edit log 和 checkpoint 上。分析主题时要区分 NameNode 控制面、DataNode 数据面、JournalNode 共享日志和客户端重试语义。",
    evidence:
      "可复核证据主要来自 fsck、NameNode UI、DataNode 日志、block report、under-replicated blocks、missing blocks、edit log、safemode 状态和网络错误。不要只看文件路径存在，要看 block 副本是否健康。",
  },
  hive: {
    name: "Hive",
    overview:
      "Hive 的主线应从 HiveServer2、Parser、Semantic Analyzer、Metastore、Optimizer、Execution Engine 和表文件布局串起。SQL 先转成逻辑语义，再依赖元数据、统计信息和文件格式生成执行计划，最后交给 Tez、MR 或 Spark 执行。",
    mechanism:
      "Hive 的机制链路要落到表/分区元数据、SerDe、InputFormat、统计信息、分区裁剪、Join 策略、ACID/锁和执行 DAG 上。分析问题时要区分 SQL 语义、元数据状态、文件物理布局和执行引擎资源。",
    evidence:
      "可复核证据主要来自 EXPLAIN、Metastore 表分区信息、ANALYZE 统计信息、Tez DAG、YARN 日志、文件数量和 ORC/Parquet 读取指标。不要只看 SQL 写法，要看优化器是否拿到了正确元数据。",
  },
  hudi: {
    name: "Hudi",
    overview:
      "Hudi 的主线应从 Timeline、Instant、File Group、File Slice、COW/MOR、Index 和 Table Service 串起。写入会形成新的 instant，文件组内维护不同版本或日志文件，读者根据 timeline 和查询类型决定读取快照、增量还是读优化视图。",
    mechanism:
      "Hudi 的机制链路要落到 commit timeline、file group、base file、log file、compaction、clustering、cleaning 和索引定位上。分析问题时要说明它影响写入放大、读放大、增量消费边界，还是表服务积压。",
    evidence:
      "可复核证据主要来自 .hoodie timeline、commit metadata、file group 数量、compaction/clustering instant、cleaner 保留策略和 Spark/Flink 作业日志。不要只看数据文件数量，要看 timeline 中哪个 instant 对读者可见。",
  },
  iceberg: {
    name: "Iceberg",
    overview:
      "Iceberg 的主线应从 Catalog、Snapshot、Manifest List、Manifest、Data File、Delete File 和乐观提交串起。写入先生成元数据和文件清单，再通过 catalog 原子提交新快照；读取根据快照和 manifest 裁剪文件。",
    mechanism:
      "Iceberg 的机制链路要落到 snapshot isolation、manifest pruning、partition evolution、schema evolution、delete file 和 commit conflict detection 上。分析主题时要区分数据文件写入、元数据提交、快照可见和读计划裁剪。",
    evidence:
      "可复核证据主要来自 snapshots、metadata JSON、manifest 文件、history、files 表、entries 表、EXPLAIN 和 catalog 提交日志。不要只看对象存储目录，要看当前 snapshot 引用了哪些文件。",
  },
  kafka: {
    name: "Kafka",
    overview:
      "Kafka 的主线应从 Topic、Partition、Leader Replica、Follower Replica、ISR、Producer、Consumer Group 和 Offset 串起。消息写入时先进入分区 leader 的追加日志，再复制到 follower；消费者按 group 分配分区，从指定 offset 拉取并提交消费进度。",
    mechanism:
      "Kafka 的机制链路要落到 Producer Batch、Partitioner、Broker Log、Replication、High Watermark、Last Stable Offset、GroupCoordinator 和 Offset Commit 上。分析主题时要区分写入确认、复制耐久、消费可见性和业务处理成功。",
    evidence:
      "可复核证据主要来自 broker 日志、consumer lag、__consumer_offsets、分区 leader/ISR、请求延迟、网络吞吐、磁盘 flush、事务状态和客户端 metrics。不要只看有没有消息，要看它是否已复制、是否可见、是否已提交 offset。",
  },
  spark: {
    name: "Spark",
    overview:
      "Spark 的主线应从 Driver、SparkContext、Catalyst、DAG Scheduler、Stage、TaskScheduler、Executor 和 Shuffle 串起。用户代码先形成 RDD lineage 或 SQL 计划，再切分为 stage 和 task，executor 执行并通过 shuffle 交换中间数据。",
    mechanism:
      "Spark 的机制链路要落到 Logical Plan、Physical Plan、AQE、Stage 切分、Task locality、Shuffle Write/Fetch、Cache、Checkpoint 和 Executor 内存上。分析主题时要说明它影响计划生成、并行度、数据倾斜、内存溢出还是失败重算。",
    evidence:
      "可复核证据主要来自 Spark UI、SQL tab、DAG graph、event log、executor log、shuffle read/write、spill、task skew、GC 时间和 EXPLAIN。不要只看作业完成，要看瓶颈发生在计划、调度、shuffle、内存还是外部存储。",
  },
  trino: {
    name: "Trino",
    overview:
      "Trino 的主线应从 Coordinator、Parser、Planner、Stage、Split、Worker、Connector 和 Page 串起。Coordinator 负责解析和计划，connector 提供元数据与 split，worker 并行读取并通过 exchange 完成跨阶段数据交换。",
    mechanism:
      "Trino 的机制链路要落到 connector metadata、split generation、stage 调度、exchange、动态过滤、内存池和资源组上。分析主题时要区分查询计划问题、数据源连接器问题、worker 执行问题和集群资源治理问题。",
    evidence:
      "可复核证据主要来自 EXPLAIN、Query Info、stage/task 指标、blocked reason、split 数量、exchange 数据量、内存峰值、resource group 状态和 connector 日志。不要只看 SQL 失败，要看失败发生在哪个 stage 和哪个数据源。",
  },
  yarn: {
    name: "YARN",
    overview:
      "YARN 的主线应从 Client、ResourceManager、Scheduler、ApplicationMaster、NodeManager、Container 和 Queue 串起。应用先向 RM 提交，AM 负责申请资源和协调任务，NM 在节点上启动 container，调度器按队列和资源策略分配容量。",
    mechanism:
      "YARN 的机制链路要落到队列容量、资源申请、container 分配、AM 生命周期、NM 心跳、日志聚合和抢占策略上。分析主题时要区分资源调度、应用协调、节点执行和多租户治理边界。",
    evidence:
      "可复核证据主要来自 ResourceManager UI、application attempt、container log、scheduler metrics、queue usage、NodeManager 日志、资源抢占记录和 exit status。不要只看应用失败，要看 AM、container、队列还是节点资源先出问题。",
  },
};

function walkFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith(".md")) out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function pageType(slug) {
  if (slug === "overview") return "overview";
  if (slug === "knowledge-map") return "knowledge-map";
  if (slug.includes("architecture")) return "architecture";
  if (slug.includes("read-path") || slug.includes("write-path")) return "read-write";
  if (slug.includes("performance") || slug.includes("tuning")) return "performance";
  if (slug.includes("troubleshooting") || slug.includes("observability")) return "troubleshooting";
  if (slug.includes("system-design")) return "system-design";
  if (slug.includes("release-quality")) return "release-quality";
  return "mechanism";
}

function frontmatterTitle(markdown, fallback) {
  const match = markdown.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return fallback;
  const data = yaml.load(match[1]) ?? {};
  return data.title || fallback;
}

function replacement(component, slug, pageTitle) {
  const flow = componentFlows[component];
  if (!flow) throw new Error(`Missing component flow for ${component}`);
  const type = pageType(slug);
  const titleByType = {
    overview: "### 本组件的学习主线",
    "knowledge-map": "### 本知识地图的阅读主线",
    architecture: "### 架构协作链路",
    "read-write": "### 读写执行链路",
    performance: "### 性能判断链路",
    troubleshooting: "### 排障证据链路",
    "system-design": "### 生产设计链路",
    "release-quality": "### 发布质量链路",
    mechanism: "### 本主题的机制链路",
  };
  const detailByType = {
    overview:
      `${flow.overview}\n\n学习 ${flow.name} 时不要先背术语清单，而要先把入口、状态变化、可见性和失败恢复串起来。只要能说明一次请求或任务如何进入系统、经过哪些核心对象、在哪个时刻对下游可见，就能避免把配置项、后台任务和用户语义混在一起。`,
    "knowledge-map":
      `${flow.overview}\n\n这张知识地图应按“核心对象、执行路径、状态与一致性、性能与容量、治理与排障”阅读。每一层都要回到 ${flow.name} 的具体对象，避免只用控制面、数据面这类抽象词替代真实机制。`,
    architecture:
      `${flow.overview}\n\n架构页的重点是对象之间如何协作，而不是罗列角色名称。阅读“${pageTitle}”时，要看控制入口由谁负责、数据移动由谁执行、元数据由谁维护、外部系统在哪些位置参与，以及故障时哪个对象拥有恢复所需的权威状态。`,
    "read-write":
      `${flow.mechanism}\n\n读写路径页必须说明状态何时产生、何时持久化、何时对读者可见。判断“${pageTitle}”时，应把客户端入口、服务端执行单元、文件或日志状态、提交点和下游可见性按时间顺序串起来。`,
    performance:
      `${flow.mechanism}\n\n性能页的重点不是列调优参数，而是定位瓶颈属于计划生成、数据裁剪、并行度、网络交换、内存管理、磁盘 IO 还是后台维护。每个优化动作都要能说明它改变了哪段链路，以及可能带来的副作用。`,
    troubleshooting:
      `${flow.evidence}\n\n排障页要按证据推进：先确认用户可见现象，再定位失败发生在入口、调度、执行、存储、元数据还是外部依赖，最后用日志、指标、元数据或执行计划闭环。没有证据支撑的猜测不能直接变成处理动作。`,
    "system-design":
      `${flow.overview}\n\n系统设计页要把适用场景、不适用场景和调用方责任讲清楚。围绕“${pageTitle}”做设计时，应明确容量边界、故障恢复、数据一致性、权限隔离、成本模型和可观测性，不能只给出“可以使用 ${flow.name}”的结论。`,
    "release-quality":
      `${flow.evidence}\n\n发布质量页要把检查项绑定到 ${flow.name} 的真实风险：配置变更是否影响可见性，版本升级是否改变协议或元数据格式，后台任务是否有积压，回滚后状态是否兼容，监控是否能覆盖关键链路。`,
    mechanism:
      `${flow.mechanism}\n\n阅读“${pageTitle}”时，应先确定它影响的是哪一类核心对象，再说明状态如何变化、结果何时可见、失败后由谁恢复。只有把这条机制链路讲清楚，后面的参数、优化和排障才有上下文。`,
  };
  return `${titleByType[type]}\n\n${detailByType[type]}\n\n`;
}

const files = walkFiles(bigdataRoot);
let changed = 0;
const touched = [];
const unmatched = [];

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  if (
    !original.includes("入口：确认请求、作业、SQL、后台任务或管理命令从哪里进入系统。") &&
    !normalizedBlockPattern.test(original)
  ) {
    normalizedBlockPattern.lastIndex = 0;
    continue;
  }
  normalizedBlockPattern.lastIndex = 0;
  const rel = path.relative(bigdataRoot, file);
  const [component, filename] = rel.split(path.sep);
  const slug = path.basename(filename, ".md");
  const pageTitle = frontmatterTitle(original, slug);
  let replacements = 0;
  const pattern = genericBlockPattern.test(original) ? genericBlockPattern : normalizedBlockPattern;
  genericBlockPattern.lastIndex = 0;
  normalizedBlockPattern.lastIndex = 0;
  const next = original.replace(pattern, () => {
    replacements += 1;
    return replacement(component, slug, pageTitle);
  });
  if (replacements !== 1) {
    unmatched.push(path.relative(repoRoot, file).replaceAll("\\", "/"));
    continue;
  }
  if (next !== original) {
    fs.writeFileSync(file, next, "utf8");
    changed += 1;
    touched.push(path.relative(repoRoot, file).replaceAll("\\", "/"));
  }
}

console.log(JSON.stringify({ changed, unmatched: unmatched.length, unmatchedRows: unmatched, sample: touched.slice(0, 20) }, null, 2));
if (unmatched.length) process.exit(1);
