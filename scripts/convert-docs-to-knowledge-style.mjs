import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");

const knowledgeRoots = [
  path.join(repoRoot, "docs", "bigdata"),
  path.join(repoRoot, "docs", "ai-agent"),
  path.join(repoRoot, "docs", "llm-foundations"),
];

const componentProfiles = {
  kafka: {
    name: "Kafka",
    positioning: "Kafka 是分布式事件流平台，核心抽象是按 Topic 组织的追加写日志，依靠 Partition 提供并行度，依靠复制和 ISR 维护副本可用性。",
    objects: ["Topic", "Partition", "Broker", "Producer", "Consumer", "Consumer Group", "Offset", "Leader Replica", "Follower Replica", "ISR", "Controller"],
    flow: "写入链路通常从 Producer 分区选择、批量压缩、发送到分区 Leader 开始；Leader 追加日志后按确认策略返回，Follower 再从 Leader 拉取复制。读取链路通常由 Consumer Group 协调分区归属，Consumer 从分区 offset 连续拉取并提交消费进度。",
    boundary: "Kafka 保证的是分区内有序追加和基于 offset 的读取位置管理，不保证跨分区全局顺序，也不替业务完成端到端去重。Exactly-once 语义需要生产者幂等、事务和下游处理模型共同配合。",
    troubleshooting: "排障时先区分生产端、Broker、复制、消费组和下游处理：看 broker 日志、controller 状态、under replicated partitions、consumer lag、rebalance 频率、请求延迟和磁盘/网络指标。",
    example: "kafka-consumer-groups --bootstrap-server <broker> --describe --group <group>",
  },
  spark: {
    name: "Spark",
    positioning: "Spark 是通用分布式计算引擎，核心是把用户逻辑转换为逻辑计划、物理计划、Stage 和 Task，再在 Driver 与 Executor 协作下执行。",
    objects: ["Driver", "Executor", "Job", "Stage", "Task", "RDD", "DataFrame", "Dataset", "Catalyst", "Shuffle", "Checkpoint"],
    flow: "执行链路通常从用户 Action 触发，Driver 构建 DAG，按 Shuffle 边界切 Stage，将 Task 分发到 Executor；Executor 读取数据、执行算子、写 Shuffle 或输出结果，Driver 负责调度和状态汇总。",
    boundary: "Spark 不替业务保证结果语义正确，容错主要依赖 lineage、任务重试、checkpoint 和外部存储。性能瓶颈经常来自数据倾斜、Shuffle、序列化、内存压力、文件小碎片和执行计划误判。",
    troubleshooting: "排障时从 Spark UI 的 SQL、Stage、Task、Executor、Storage 页面入手，结合 event log、executor 日志、Shuffle read/write、spill、GC、skew、locality 和失败堆栈定位。",
    example: "df.explain(\"formatted\")",
  },
  flink: {
    name: "Flink",
    positioning: "Flink 是以有状态流处理为核心的计算引擎，核心能力是事件时间、状态、Checkpoint、Exactly-once Sink 协议和低延迟连续执行。",
    objects: ["JobManager", "TaskManager", "Operator", "Subtask", "Keyed State", "Operator State", "Checkpoint", "Watermark", "Timer", "Savepoint"],
    flow: "流任务启动后，JobManager 生成执行图并调度到 TaskManager；数据沿 Operator 链路流动，按 key 访问状态，Checkpoint barrier 在拓扑中传播并触发状态快照。",
    boundary: "Flink 的一致性依赖状态后端、Checkpoint、Source/Sink 协议和故障恢复共同成立。Watermark 只表达事件时间进展，不代表数据一定完整，也不自动修复业务乱序语义。",
    troubleshooting: "排障时重点看 Checkpoint 成功率和耗时、反压、watermark 滞后、状态大小、RocksDB 指标、TaskManager 日志、重启策略和 Sink 事务提交状态。",
    example: "bin/flink list -r",
  },
  hive: {
    name: "Hive",
    positioning: "Hive 是面向数据仓库的 SQL 层，核心是把表、分区、元数据和 SQL 编译成底层计算引擎可执行的任务。",
    objects: ["Metastore", "Database", "Table", "Partition", "SerDe", "Driver", "Compiler", "Optimizer", "Execution Engine"],
    flow: "查询链路从 SQL 解析开始，经语义分析、元数据读取、逻辑优化、物理计划生成，再提交到执行引擎读取存储系统数据并产出结果。",
    boundary: "Hive 管理的是元数据、SQL 编译和仓库语义，不等于底层存储本身。性能问题可能来自分区设计、文件格式、小文件、统计信息、执行引擎和资源队列。",
    troubleshooting: "排障时检查 Metastore 可用性、表/分区元数据、统计信息、执行计划、任务日志、输入文件数量、数据倾斜和资源队列。",
    example: "EXPLAIN FORMATTED SELECT ...",
  },
  iceberg: {
    name: "Iceberg",
    positioning: "Iceberg 是开放表格式，核心是通过快照、manifest、metadata file 和乐观提交协议管理大规模表的元数据演进。",
    objects: ["Catalog", "Table Metadata", "Snapshot", "Manifest List", "Manifest File", "Data File", "Delete File", "Partition Spec", "Schema ID"],
    flow: "写入通常先生成数据文件和 manifest，再基于当前 metadata 做乐观提交；读取时通过 catalog 找到当前 metadata，再按 snapshot、manifest 和统计信息做文件裁剪。",
    boundary: "Iceberg 提供表格式和元数据语义，不负责计算引擎执行算子，也不自动解决所有小文件和数据分布问题。并发写入依赖 catalog 原子提交和冲突检测。",
    troubleshooting: "排障时检查 catalog 指针、metadata.json、snapshot 历史、manifest 数量、文件大小、delete file 累积、分区演进和引擎版本兼容性。",
    example: "SELECT * FROM table.snapshots;",
  },
  hdfs: {
    name: "HDFS",
    positioning: "HDFS 是面向大文件顺序读写的分布式文件系统，NameNode 管理元数据，DataNode 存储 block，复制机制提供容错。",
    objects: ["NameNode", "DataNode", "Block", "Block Report", "EditLog", "FsImage", "JournalNode", "Replication", "Rack Awareness"],
    flow: "写入时客户端向 NameNode 申请文件和 block 分配，再把数据按 pipeline 写入多个 DataNode；读取时客户端从 NameNode 获取 block 位置，再直接向 DataNode 读取。",
    boundary: "HDFS 适合大文件吞吐，不适合大量小文件和低延迟随机更新。NameNode 元数据容量、DataNode 磁盘、网络和副本策略共同决定可用性。",
    troubleshooting: "排障时看 NameNode UI、fsck、DataNode 日志、block missing/corrupt、under replicated blocks、RPC 延迟、GC 和磁盘健康。",
    example: "hdfs fsck /path -files -blocks -locations",
  },
  yarn: {
    name: "YARN",
    positioning: "YARN 是 Hadoop 生态的资源管理和应用调度层，负责把集群资源以 Container 形式分配给应用。",
    objects: ["ResourceManager", "Scheduler", "NodeManager", "ApplicationMaster", "Container", "Queue", "Node Label"],
    flow: "应用提交后 ResourceManager 启动 ApplicationMaster；ApplicationMaster 向 Scheduler 申请 Container，NodeManager 启动并监控 Container，状态再回传给 ResourceManager。",
    boundary: "YARN 管理资源和容器生命周期，不保证上层 Spark、MapReduce 或 Flink 业务逻辑正确。队列、容量、优先级和节点健康会直接影响任务等待时间。",
    troubleshooting: "排障时看 ResourceManager UI、NodeManager 日志、ApplicationMaster 日志、队列容量、container exit status、节点健康和上层框架 UI。",
    example: "yarn application -status <application_id>",
  },
  hbase: {
    name: "HBase",
    positioning: "HBase 是基于 HDFS 的分布式宽表存储，核心是按 row key 范围切分 Region，提供低延迟随机读写能力。",
    objects: ["HMaster", "RegionServer", "Region", "Store", "MemStore", "HFile", "WAL", "Compaction", "BlockCache"],
    flow: "写入先追加 WAL，再写入 MemStore，随后 flush 成 HFile；读取会查 MemStore、BlockCache 和 HFile，并按 row key、列族和版本过滤。",
    boundary: "HBase 适合按 row key 访问的宽表场景，不适合复杂 SQL 分析。热点 row key、过多列族、compaction 压力和 Region 分布会影响稳定性。",
    troubleshooting: "排障时看 RegionServer 日志、Region 热点、WAL 延迟、MemStore flush、Compaction queue、BlockCache 命中率和 HDFS 健康。",
    example: "scan 'table', {LIMIT => 10}",
  },
  trino: {
    name: "Trino",
    positioning: "Trino 是分布式 SQL 查询引擎，Coordinator 负责解析、优化和调度，Worker 负责并行执行 Split 和算子。",
    objects: ["Coordinator", "Worker", "Connector", "Catalog", "Split", "Stage", "Task", "Exchange", "Cost-based Optimizer"],
    flow: "查询进入 Coordinator 后解析并生成计划，通过 Connector 获取元数据和 split，再将 stage/task 分发到 Worker 执行，数据通过 exchange 聚合或重分布。",
    boundary: "Trino 负责查询执行，不负责底层存储事务语义。性能受连接器能力、统计信息、数据布局、join 策略、内存和网络 shuffle 影响。",
    troubleshooting: "排障时查看 query plan、stage 分布、blocked reason、内存峰值、spill、connector 日志、coordinator 日志和底层存储延迟。",
    example: "EXPLAIN (TYPE DISTRIBUTED) SELECT ...",
  },
  hudi: {
    name: "Hudi",
    positioning: "Hudi 是面向数据湖增量写入和更新的表格式/湖仓组件，核心能力包括 timeline、commit、file group、索引和增量读取。",
    objects: ["Timeline", "Instant", "Commit", "File Group", "File Slice", "Base File", "Log File", "Index", "Compaction", "Clustering"],
    flow: "写入会根据表类型和索引定位 file group，生成 commit 或 deltacommit；读侧根据 timeline 选择可见 instant，并组合 base file 与 log file。",
    boundary: "Hudi 提供增量写入、更新和表服务能力，但文件大小、compaction、索引选型和并发控制仍需要按写入模式治理。",
    troubleshooting: "排障时检查 timeline、commit 状态、索引命中、small file、compaction backlog、clustering、cleaner 和引擎写入日志。",
    example: "SELECT * FROM table WHERE _hoodie_commit_time > '...';",
  },
  "delta-lake": {
    name: "Delta Lake",
    positioning: "Delta Lake 是基于事务日志的数据湖表格式，核心是用 _delta_log 记录表版本、文件增删和协议信息。",
    objects: ["Transaction Log", "Commit", "Protocol", "Metadata", "AddFile", "RemoveFile", "Checkpoint", "Optimistic Concurrency"],
    flow: "写入先生成数据文件，再尝试向事务日志提交版本；读取时根据日志重放到指定版本，得到可见文件集合后交给计算引擎扫描。",
    boundary: "Delta Lake 提供表事务和版本语义，不替计算引擎执行查询优化。并发冲突、日志膨胀、小文件和 vacuum 保留期需要谨慎治理。",
    troubleshooting: "排障时检查 _delta_log、commit 失败原因、checkpoint、vacuum 保留期、文件大小、并发写入和引擎兼容性。",
    example: "DESCRIBE HISTORY table_name;",
  },
  clickhouse: {
    name: "ClickHouse",
    positioning: "ClickHouse 是列式 OLAP 数据库，核心是 MergeTree 家族表引擎、分区、排序键、数据 part 和后台 merge。",
    objects: ["MergeTree", "Part", "Partition", "Primary Key", "Order By", "Mark", "Merge", "Replica", "Distributed Table"],
    flow: "写入形成新的 part，后台 merge 合并小 part；读取时根据分区、主键稀疏索引和列式存储裁剪数据，再执行向量化聚合。",
    boundary: "ClickHouse 适合高吞吐分析查询，不适合高频单行事务更新。排序键、分区粒度、part 数量、merge 压力和副本同步决定稳定性。",
    troubleshooting: "排障时看 system.parts、system.merges、system.query_log、system.replication_queue、慢查询、磁盘 IO、内存和分布式查询链路。",
    example: "SELECT * FROM system.parts WHERE table = '<table>';",
  },
};

function profileFor(data) {
  if (componentProfiles[data.component]) return componentProfiles[data.component];
  if (data.domain === "ai-agent") {
    return {
      name: "AI Agent",
      positioning: "AI Agent 是围绕模型、工具、状态、控制循环和观测治理组织起来的应用运行时，不等于单次模型调用。",
      objects: ["Model", "Instruction", "Tool", "State", "Memory", "Planner", "Executor", "Trace", "Evaluation", "Human-in-the-loop"],
      flow: "典型链路是接收目标、组装上下文和可用工具、模型选择动作、执行器校验并调用工具、结果写回状态，再由模型判断继续、停止或交给人工。",
      boundary: "Agent 的能力边界由工具权限、状态质量、模型可靠性、预算、审批和评估共同决定。自主程度越高，越需要可观测性和回退策略。",
      troubleshooting: "排障时看 trace、模型输入输出、工具参数、工具返回、状态写入、重试、人工接管和任务成功率。",
      example: "记录每一步 tool call 的输入、输出、耗时、错误类型和审批状态。",
    };
  }
  if (data.domain === "llm-foundations") {
    return {
      name: "大模型基础",
      positioning: "大模型能力来自数据、Tokenizer、模型结构、训练、后训练、推理和应用链路的共同作用，不能只按 API 调用理解。",
      objects: ["Tokenizer", "Context Window", "Transformer", "Attention", "Training Data", "Post-training", "Inference", "KV Cache", "Evaluation"],
      flow: "完整链路从文本切分为 token 开始，经模型前向计算生成概率分布，再在推理阶段按解码策略生成结果；应用层再结合 Prompt、RAG、工具或 Agent 约束输出。",
      boundary: "模型不能天然保证事实正确、权限正确或业务动作安全。知识更新、外部动作和生产治理通常需要 RAG、工具、权限、评估和监控配合。",
      troubleshooting: "排障时区分数据问题、提示词问题、检索问题、模型能力问题、推理配置问题和评估样本问题。",
      example: "先固定评估集，再比较模型、Prompt、检索策略或后训练版本的变化。",
    };
  }
  return {
    name: data.component || "当前主题",
    positioning: "这个主题需要从目标、对象、链路、状态、边界和排障入口几个层面理解。",
    objects: ["核心对象", "状态", "输入", "输出", "依赖系统", "观测指标"],
    flow: "先明确请求入口和核心对象，再沿着状态变化、外部依赖、失败反馈和观测证据逐层分析。",
    boundary: "不要把相邻系统的能力归到当前主题上，也不要把局部优化当成全局语义保证。",
    troubleshooting: "排障时先定位故障层次，再结合日志、指标、计划、配置和外部依赖判断根因。",
    example: "先确认现象，再收集指标和日志，最后把处理动作映射到具体根因。",
  };
}

function walkFiles(dir, predicate = () => true) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full, entry.name)) out.push(full);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function parseMarkdown(file) {
  const content = fs.readFileSync(file, "utf8");
  const match = content.match(/^\uFEFF?---\n([\s\S]*?)\n---\n/);
  if (!match) return { data: {}, body: content };
  return { data: yaml.load(match[1]) ?? {}, body: content.slice(match[0].length) };
}

function dumpMarkdown(data, body) {
  return `---\n${yaml.dump(data, { lineWidth: 120, noRefs: true }).trimEnd()}\n---\n${body.trim()}\n`;
}

function sanitizeQuestionStyleText(text) {
  return text
    .replaceAll("标准面试答案", "机制解读")
    .replaceAll("标准答案", "机制解读")
    .replaceAll("常见误答", "易混边界")
    .replaceAll("必答点", "核心要点")
    .replaceAll("评分点", "掌握要点")
    .replaceAll("延伸追问", "延伸理解")
    .replaceAll("面试答题结构", "知识表达层次")
    .replaceAll("答题手册", "知识地图")
    .replaceAll("面试回答", "知识表达")
    .replaceAll("面试表达", "技术表达")
    .replaceAll("面试能力", "知识迁移能力")
    .replaceAll("面试问题", "理解问题")
    .replaceAll("面试系统", "知识系统")
    .replaceAll("面试题", "练习题")
    .replaceAll("面试里", "技术复盘中")
    .replaceAll("面试中", "技术复盘中")
    .replaceAll("面试时", "理解这个主题时")
    .replaceAll("面试", "技术复盘")
    .replaceAll("答题", "表达")
    .replaceAll("30 秒", "快速定位")
    .replaceAll("2 分钟", "展开说明")
    .replaceAll("5 分钟", "深入分析");
}

function hasKnowledgeSupplement(body) {
  return body.includes("# 知识解读补充");
}

function needsSupplement(data, body) {
  if (hasKnowledgeSupplement(body)) return false;
  const chars = [...body].length;
  const signals = ["解决什么问题", "核心对象", "核心机制", "执行链路", "状态", "边界", "排障"];
  const present = signals.filter((signal) => body.includes(signal)).length;
  return chars < 3200 || present < 4;
}

function supplementBlock(data) {
  const profile = profileFor(data);
  return [
    "",
    "# 知识解读补充",
    "",
    "## 它解决什么问题",
    "",
    `${profile.positioning}理解 ${profile.name} 时，先看它在系统里的位置，再看它负责的状态和不负责的边界。`,
    "",
    "## 核心对象与状态",
    "",
    profile.objects.map((item) => `- ${item}`).join("\n"),
    "",
    "这些对象不是孤立名词。它们之间通常存在所有权、生命周期、读写路径、失败反馈和观测指标的关系。学习时应把对象放回链路里理解，而不是只背名称。",
    "",
    "## 核心机制和执行链路",
    "",
    profile.flow,
    "",
    "阅读这类链路时，建议按四步拆解：入口在哪里，核心对象如何变化，失败如何反馈，最终结果由谁确认。这样可以避免把单个参数或单个组件误认为完整机制。",
    "",
    "## 边界与不保证事项",
    "",
    profile.boundary,
    "",
    "边界说明很重要：一个组件通常只保证自己负责的语义，端到端正确性往往还依赖调用方、存储层、计算层、权限系统和运维策略共同成立。",
    "",
    "## 生产排障入口",
    "",
    profile.troubleshooting,
    "",
    "排障时不要直接跳到调参。先判断问题属于控制面、数据面、状态面、资源面还是外部依赖，再选择对应的日志、指标、执行计划或元数据进行验证。",
    "",
    "## 示例",
    "",
    "```text",
    profile.example,
    "```",
    "",
  ].join("\n");
}

function sanitizeData(data) {
  const next = { ...data };
  if (typeof next.title === "string") next.title = sanitizeQuestionStyleText(next.title);
  if (typeof next.topic === "string") next.topic = next.topic.replaceAll("interview-playbook", "knowledge-map").replaceAll("interview", "knowledge");
  if (Array.isArray(next.tags)) {
    next.tags = next.tags
      .map((tag) => sanitizeQuestionStyleText(String(tag)).replaceAll("interview-playbook", "knowledge-map").replaceAll("interview", "knowledge"))
      .filter(Boolean);
  }
  if (typeof next.kb_id === "string" && next.kb_id.endsWith("/interview-playbook")) {
    next.kb_id = next.kb_id.replace(/\/interview-playbook$/, "/knowledge-map");
  }
  return next;
}

function convertFile(file) {
  const parsed = parseMarkdown(file);
  let data = sanitizeData(parsed.data);
  let body = sanitizeQuestionStyleText(parsed.body);
  if (needsSupplement(data, body)) body += supplementBlock(data);
  return { data, body };
}

const markdownFiles = knowledgeRoots.flatMap((root) => walkFiles(root, (_, name) => name.endsWith(".md")));
const kbIdRenames = new Map();
const fileRenames = new Map();
let converted = 0;
let supplemented = 0;

for (const file of markdownFiles) {
  const before = fs.readFileSync(file, "utf8");
  const { data: oldData, body: oldBody } = parseMarkdown(file);
  const hadSupplement = hasKnowledgeSupplement(oldBody);
  const { data, body } = convertFile(file);
  if (!hadSupplement && hasKnowledgeSupplement(body)) supplemented += 1;
  const nextContent = dumpMarkdown(data, body);
  if (nextContent !== before) {
    converted += 1;
    if (shouldWrite) fs.writeFileSync(file, nextContent, "utf8");
  }

  if (oldData.kb_id && data.kb_id && oldData.kb_id !== data.kb_id) {
    kbIdRenames.set(oldData.kb_id, data.kb_id);
  }

  if (path.basename(file) === "interview-playbook.md") {
    const target = path.join(path.dirname(file), "knowledge-map.md");
    fileRenames.set(file, target);
  }
}

if (shouldWrite) {
  for (const [source, target] of fileRenames.entries()) {
    if (!fs.existsSync(source)) continue;
    if (fs.existsSync(target)) {
      fs.rmSync(source, { force: true });
    } else {
      fs.renameSync(source, target);
    }
  }
}

function replaceAllReferences() {
  if (!kbIdRenames.size) return 0;
  const referenceRoots = [
    path.join(repoRoot, "docs"),
    path.join(repoRoot, "questions"),
    path.join(repoRoot, "scripts"),
    path.join(repoRoot, "web", "docs-site", "src"),
  ];
  const allMarkdown = referenceRoots.flatMap((root) =>
    walkFiles(root, (_, name) => name.endsWith(".md") || name.endsWith(".js") || name.endsWith(".mjs"))
  );
  let updated = 0;
  for (const file of allMarkdown) {
    if (file.includes(`${path.sep}archive${path.sep}`)) continue;
    if (file.includes(`${path.sep}node_modules${path.sep}`)) continue;
    if (file.includes(`${path.sep}build${path.sep}`)) continue;
    let content = fs.readFileSync(file, "utf8");
    const before = content;
    for (const [oldId, newId] of kbIdRenames.entries()) {
      content = content.split(oldId).join(newId);
      content = content.split(oldId.replaceAll("/", path.sep)).join(newId.replaceAll("/", path.sep));
    }
    if (content !== before) {
      updated += 1;
      if (shouldWrite) fs.writeFileSync(file, content, "utf8");
    }
  }
  return updated;
}

const referencesUpdated = replaceAllReferences();

console.log(JSON.stringify({
  scanned: markdownFiles.length,
  converted,
  supplemented,
  kbIdRenames: kbIdRenames.size,
  fileRenames: fileRenames.size,
  referencesUpdated,
  write: shouldWrite,
}, null, 2));
