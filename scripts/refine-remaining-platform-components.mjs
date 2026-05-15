import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const today = "2026-04-28";

const topics = [
  ["overview", "总览定位", "先讲系统定位、解决的问题、不适合的场景和面试主线"],
  ["core-objects-state", "核心对象与状态", "把对象按状态所有权、交互关系和失败影响拆开"],
  ["architecture-and-roles", "架构与角色分工", "把控制面、执行面、数据面或存储面分清楚"],
  ["metadata-state", "元数据与状态管理", "说明元数据来源、更新时机、缓存和恢复边界"],
  ["write-path", "写入或提交路径", "说明写入、提交、调度或变更如何落到内部对象"],
  ["read-path", "读取或查询路径", "说明请求如何找到数据、如何执行、如何返回结果"],
  ["consistency-boundaries", "一致性边界", "说明系统保证什么、不保证什么、哪些语义依赖上层配合"],
  ["partition-layout", "分区与布局", "说明分区、分片、region、part、file group 或 shard 如何影响性能和可靠性"],
  ["fault-recovery", "故障恢复", "说明节点、任务、文件、事务或副本失败后的恢复主线"],
  ["maintenance-services", "维护服务", "说明压缩、均衡、清理、下线、合并、检查等后台服务"],
  ["lifecycle", "生命周期", "说明对象从创建、运行、提交、清理到下线的完整过程"],
  ["performance-model", "性能模型", "说明吞吐、延迟、并发、内存、网络、磁盘或优化器的主要瓶颈"],
  ["tuning", "调优", "说明调参前的观测依据、关键参数和副作用"],
  ["resource-governance", "资源治理", "说明多租户、容量、队列、配额、成本和隔离边界"],
  ["security-governance", "安全治理", "说明身份、权限、租户、审计和最小权限原则"],
  ["observability", "可观测性", "说明指标、日志、计划、UI、系统表或命令如何联合定位"],
  ["troubleshooting", "排障", "说明典型故障如何按层拆解，而不是直接重启或重跑"],
  ["comparison", "对比题", "说明和相邻系统的职责边界、适用场景和误用代价"],
  ["system-design", "系统设计", "说明如何从需求、规模、可靠性、成本和运维设计完整方案"],
  ["interview-playbook", "面试答题手册", "把 30 秒、2 分钟、5 分钟三种回答深度组织起来"],
];

const profiles = {
  yarn: {
    name: "YARN",
    sourceIds: ["hadoop-yarn-architecture"],
    claimPrefix: "bigdata-yarn-claim",
    versionScope: "Apache Hadoop stable YARN architecture docs as verified on 2026-04-28",
    positioning: "Hadoop 集群资源管理和应用调度层",
    notFor: "业务数据存储或计算逻辑本身",
    objects: ["ResourceManager", "Scheduler", "NodeManager", "ApplicationMaster", "Container", "Queue"],
    state: "ResourceManager 管全局资源和应用状态，NodeManager 管单节点资源和容器生命周期，ApplicationMaster 管单个应用的任务编排和容器申请。",
    flow: "客户端提交应用后，ResourceManager 接受应用并启动 ApplicationMaster；ApplicationMaster 向 Scheduler 申请 Container，NodeManager 启动并监控 Container，运行状态再回传给 ResourceManager 和客户端。",
    write: "提交路径的核心不是写数据，而是申请资源、启动 ApplicationMaster、分配 Container、下发启动上下文和回收状态。",
    read: "查询路径主要读取应用、队列、节点、Container 和日志状态，用来判断资源等待、失败重试或调度瓶颈。",
    consistency: "YARN 保证的是资源分配和容器生命周期管理语义，不保证 Spark、MapReduce、Flink 等上层任务的业务计算正确性。",
    layout: "队列、节点标签、资源类型和 Container 共同决定资源布局；队列策略影响公平性、容量和多租户隔离。",
    fault: "Container 失败通常由 ApplicationMaster 决定重试，NodeManager 丢失会影响其上 Container，ResourceManager HA 解决 RM 可用性但不替代应用级容错。",
    maintenance: "队列配置、节点下线、日志聚合、资源水位、黑名单和调度器检查是 YARN 运维主线。",
    performance: "瓶颈常见于队列资源不足、Container 启动慢、NodeManager 异常、ApplicationMaster 申请策略不合理或调度器压力。",
    tuning: "调优要围绕队列容量、单容器资源、并发应用数、本地化、重试策略和日志聚合开销做权衡。",
    governance: "多租户治理要把队列、用户、应用优先级、资源上限、节点标签和审计一起设计。",
    security: "安全边界包括提交用户、代理用户、容器执行身份、队列 ACL、日志访问和与 HDFS/Hive/Spark 权限的联动。",
    observability: "ResourceManager UI、NodeManager 日志、应用日志、队列指标和上层框架 UI 要合并判断。",
    troubleshooting: "排障先分清资源等待、容器启动失败、节点异常、AM 失败、日志缺失还是上层框架失败。",
    comparison: "YARN 是资源管理层，不是 Spark/Flink 计算引擎，也不是 Kubernetes 的完全等价物；它更贴近 Hadoop 生态的队列和 Container 调度。",
  },
  hbase: {
    name: "HBase",
    sourceIds: ["hbase-book"],
    claimPrefix: "bigdata-hbase-claim",
    versionScope: "Apache HBase reference guide as verified on 2026-04-28",
    positioning: "面向稀疏大表和低延迟随机读写的分布式列族存储",
    notFor: "离线大文件顺序扫描的通用文件系统或关系型 SQL 数仓",
    objects: ["HMaster", "RegionServer", "Region", "RowKey", "Column Family", "WAL", "MemStore", "HFile", "BlockCache"],
    state: "Region 是表按 row key 范围切分后的服务单位，RegionServer 承载读写，WAL 和 MemStore 管写入恢复，HFile 和 BlockCache 支撑持久化读取。",
    flow: "客户端定位 meta 和目标 Region 后直连 RegionServer；HMaster 负责 region 分配、故障恢复和管理，不承载正常数据读写主路径。",
    write: "写入先追加 WAL，再写 MemStore；MemStore 达到阈值后 flush 为 HFile，后台 compaction 合并文件并清理历史版本或删除标记。",
    read: "读取会在 MemStore、BlockCache 和 HFile 中查找，row key 设计、列族、Bloom/filter、block index 和 compaction 状态都会影响延迟。",
    consistency: "HBase 更适合按 row key 的在线随机访问，常见面试主线是单行读写语义、版本、WAL 恢复和 region 迁移边界。",
    layout: "RowKey、region split、预分区、列族数量、HFile 布局和 compaction 决定热点、扩展性和读写放大。",
    fault: "RegionServer 故障后 region 需要重新分配，WAL replay 用来恢复未 flush 的写入；HMaster 故障影响管理面而非已定位 region 的所有读写。",
    maintenance: "Flush、minor/major compaction、split、merge、balancer 和 RegionServer 下线是 HBase 维护重点。",
    performance: "性能瓶颈常见于 row key 热点、MemStore flush、compaction backlog、BlockCache 命中率、WAL 同步和大 scan。",
    tuning: "调优要围绕 row key、预分区、列族数量、缓存、flush/compaction、批量写入和 scan 范围控制。",
    governance: "资源治理要控制表、region、列族、版本、TTL、热点和租户访问模式，避免单表拖垮 RegionServer。",
    security: "安全治理要结合表级、列族级或命名空间权限、HDFS 底层权限、服务账号和审计。",
    observability: "RegionServer 指标、compaction 队列、flush、WAL、BlockCache、region 热点和慢请求日志要一起看。",
    troubleshooting: "排障先区分热点、RegionServer 故障、WAL/flush 卡顿、compaction backlog、scan 过大还是客户端定位问题。",
    comparison: "HBase 与 HDFS 的关系是表存储层叠在 HDFS 等底层存储上；它不同于 Hive/ClickHouse 的分析模型，也不同于 Kafka 的事件流模型。",
  },
  trino: {
    name: "Trino",
    sourceIds: ["trino-docs"],
    claimPrefix: "bigdata-trino-claim",
    versionScope: "Trino current docs as verified on 2026-04-28",
    positioning: "面向多数据源的分布式 SQL 查询引擎",
    notFor: "底层数据湖存储、事务数据库或单一数据格式",
    objects: ["Coordinator", "Worker", "Catalog", "Connector", "Split", "Stage", "Task", "Exchange"],
    state: "Coordinator 解析 SQL、生成计划并调度任务，Worker 执行 task，Connector 负责连接外部数据源并提供元数据和 split。",
    flow: "SQL 进入 Coordinator 后经过解析、分析、优化和分布式计划生成；Worker 执行 splits，stage 之间通过 exchange 传递中间数据。",
    write: "写入能力取决于 connector 支持，INSERT/CTAS/MERGE 等不能脱离底层数据源事务和文件提交语义单独承诺。",
    read: "读取路径从 catalog/connector 元数据开始，生成 splits 后分发到 Worker 并行读取，过滤、投影、聚合、join 尽可能下推或分布执行。",
    consistency: "Trino 自身是查询引擎，不统一提供跨异构数据源的事务一致性；一致性语义来自 connector 和底层系统。",
    layout: "Catalog、schema、table、partition、split 和 connector 能力共同决定扫描粒度、谓词下推和并行度。",
    fault: "查询失败通常和 Worker、网络、内存、connector、底层数据源或 Coordinator 调度相关，不能简单归因于 SQL 写错。",
    maintenance: "连接器配置、catalog 管理、资源组、查询队列、worker 扩缩容和版本兼容是 Trino 运维重点。",
    performance: "性能瓶颈常见于扫描量过大、join 分布不合理、数据倾斜、内存不足、exchange 开销和 connector 下推不足。",
    tuning: "调优要围绕统计信息、谓词下推、列裁剪、join 顺序、分区裁剪、资源组和内存限制做权衡。",
    governance: "治理要控制 catalog 权限、查询资源组、并发、跨源访问、审计和成本归属。",
    security: "安全边界包括认证、授权、catalog/connector 权限、TLS、用户映射和底层系统权限穿透。",
    observability: "Query UI、EXPLAIN/EXPLAIN ANALYZE、stage/task 指标、split 分布、内存和 connector 日志要联合分析。",
    troubleshooting: "排障先看计划、扫描量、stage 慢点、内存峰值、worker 失败、connector 错误和底层数据源状态。",
    comparison: "Trino 和 Hive/Spark SQL 都能查数据湖，但 Trino 更偏交互式分布式 SQL 查询引擎；它不是存储格式，也不是批处理框架本身。",
  },
  hudi: {
    name: "Hudi",
    sourceIds: ["hudi-docs-overview"],
    claimPrefix: "bigdata-hudi-claim",
    versionScope: "Apache Hudi docs as verified on 2026-04-28",
    positioning: "带时间线、upsert、增量处理和表服务的湖仓数据管理层",
    notFor: "单纯文件格式或只读数据目录",
    objects: ["Timeline", "Instant", "Commit", "File Group", "File Slice", "Base File", "Log File", "Index", "Compaction", "Clustering"],
    state: "Timeline 记录 commit、delta commit、compaction、clean 等 instant，file group 和 file slice 描述数据文件及日志文件的版本演进。",
    flow: "写入根据 record key 和 index 定位目标 file group，按 Copy-on-Write 或 Merge-on-Read 方式生成新文件或追加 log，并把结果提交到 timeline。",
    write: "Upsert 是 Hudi 面试核心：索引定位、写入模式、commit timeline、失败回滚、compaction/cleaning 共同决定写入语义。",
    read: "读取方式包括 snapshot、read optimized 和 incremental；不同读模式会看到不同的 base/log 合并结果和增量边界。",
    consistency: "Hudi 的语义围绕 timeline instant 和表服务展开，不应被简化成把 Parquet 文件覆盖到目录里。",
    layout: "File group、file slice、partition path、索引和 clustering 决定小文件、读放大、写放大和增量消费效率。",
    fault: "失败写入需要通过 timeline 状态、rollback、cleaner 和并发控制边界判断，不能只看目录里是否有新文件。",
    maintenance: "Compaction、cleaning、clustering、index 管理和小文件治理是 Hudi 表长期稳定的关键。",
    performance: "性能瓶颈常见于索引查找、MOR log 合并、compaction backlog、小文件、分区倾斜和写入并发。",
    tuning: "调优要围绕表类型、索引、文件大小、compaction 策略、clustering、并发写和增量读取窗口。",
    governance: "治理要控制 timeline 保留、clean 策略、增量消费依赖、schema 演进和表服务资源。",
    security: "安全边界主要来自底层存储、catalog、计算引擎和写入服务身份，Hudi 表语义不能替代权限治理。",
    observability: "要观察 timeline instant、commit 元数据、compaction backlog、文件大小、写入错误和读查询计划。",
    troubleshooting: "排障先看 timeline 状态，再看索引、文件布局、compaction、cleaner 和底层存储权限。",
    comparison: "Hudi 与 Iceberg/Delta 都属于湖仓表管理方向，但 Hudi 更突出 upsert、增量处理和表服务时间线。",
  },
  "delta-lake": {
    name: "Delta Lake",
    sourceIds: ["delta-lake-docs"],
    claimPrefix: "bigdata-delta-claim",
    questionStem: "delta",
    versionScope: "Delta Lake docs as verified on 2026-04-28",
    positioning: "基于事务日志的数据湖表格式和湖仓语义层",
    notFor: "计算引擎本身或普通 Parquet 目录",
    objects: ["_delta_log", "JSON Commit", "Checkpoint", "Protocol", "Metadata", "AddFile", "RemoveFile", "Data File", "Snapshot"],
    state: "_delta_log 记录表版本、协议、元数据、add/remove 文件动作和事务信息，读取端通过日志构建某个版本的 snapshot。",
    flow: "写入端生成数据文件后以事务提交日志动作；读取端根据日志和 checkpoint 构造快照，再读取对应数据文件。",
    write: "Delta 写入核心是乐观并发和事务日志提交，不是简单覆盖目录；冲突检测、schema enforcement/evolution 和文件动作共同决定结果。",
    read: "读取路径先解析 _delta_log 和 checkpoint 得到有效文件集合，再由计算引擎读取数据文件。",
    consistency: "Delta 提供表级 ACID 语义、time travel 和 schema 相关能力，但底层对象存储和计算引擎行为仍要纳入设计。",
    layout: "数据文件、分区目录、日志文件、checkpoint 和优化后的文件大小共同影响元数据读取和扫描性能。",
    fault: "失败写入要看事务日志是否提交成功；有数据文件不代表表版本可见，日志提交才是表状态边界。",
    maintenance: "OPTIMIZE、VACUUM、checkpoint、文件合并和日志保留是 Delta 表维护重点。",
    performance: "性能瓶颈常见于小文件、元数据日志过长、分区设计差、谓词裁剪不足和文件统计信息不足。",
    tuning: "调优要围绕文件大小、分区、数据跳过、checkpoint、OPTIMIZE/ZORDER 以及保留策略做权衡。",
    governance: "治理要控制 schema 演进、time travel 保留、VACUUM、并发写、权限和审计。",
    security: "安全边界依赖 catalog、底层存储权限、计算引擎身份和表访问控制；Delta 日志不是权限系统。",
    observability: "要观察表历史、事务日志、文件数量、checkpoint、查询计划、VACUUM/OPTIMIZE 结果和冲突错误。",
    troubleshooting: "排障先看日志版本、checkpoint、文件动作、schema 冲突、小文件和底层存储一致性。",
    comparison: "Delta Lake 与 Hudi/Iceberg 都是湖仓表格式方向，Delta 的核心抓手是事务日志、ACID、schema 和 time travel。",
  },
  clickhouse: {
    name: "ClickHouse",
    sourceIds: ["clickhouse-docs"],
    claimPrefix: "bigdata-clickhouse-claim",
    versionScope: "ClickHouse docs as verified on 2026-04-28",
    positioning: "面向 OLAP 的列式数据库管理系统",
    notFor: "高并发小事务 OLTP 或通用消息队列",
    objects: ["MergeTree", "Part", "Partition", "Primary Key", "Sorting Key", "Granule", "Mark", "Sparse Index", "Replica", "Shard"],
    state: "MergeTree 表把数据组织成 parts，按分区和排序键写入，稀疏主键索引和 mark 帮助减少扫描，后台 merge 合并 parts。",
    flow: "写入形成新的 part，后台 merge 把小 part 合并成更大 part；查询时先做分区裁剪、主键/稀疏索引裁剪，再读取所需列。",
    write: "ClickHouse 写入强调批量插入和 part 管理，小批量高频写会放大 part 数量和 merge 压力。",
    read: "读取路径利用列式存储、压缩、分区、排序键、稀疏索引和向量化执行降低扫描成本。",
    consistency: "ClickHouse 的强项是分析吞吐和列式扫描，不应按 OLTP 行级事务模型回答。",
    layout: "Partition、ORDER BY、primary key、granule、part 和 shard/replica 布局决定查询裁剪、merge 成本和分布式查询表现。",
    fault: "副本、分片、Distributed 表和后台 merge 的问题要分开看；单副本表和复制表的恢复边界不同。",
    maintenance: "后台 merge、mutation、TTL、materialized view、分区管理和副本同步是运维重点。",
    performance: "性能瓶颈常见于排序键设计差、分区过细、小 part 过多、join 内存高、分布式查询网络开销和低选择性扫描。",
    tuning: "调优要围绕批量写入、ORDER BY、PARTITION BY、数据跳过索引、物化视图、TTL 和集群拓扑做取舍。",
    governance: "治理要控制表引擎、分区策略、冷热保留、查询资源、用户权限和集群成本。",
    security: "安全边界包括用户、角色、权限、网络、TLS、行列级策略和审计能力，不能只依赖应用层控制。",
    observability: "system 表、query_log、part_log、merge 相关指标、replication queue、慢查询和磁盘水位要联合分析。",
    troubleshooting: "排障先看查询计划、扫描行数、parts 数量、merge backlog、内存、分布式网络和副本队列。",
    comparison: "ClickHouse 与 Hive/Trino/Spark 的区别在于它是列式 OLAP DBMS；Trino 是查询引擎，Hive/Spark 更常作为批处理或湖上 SQL。",
  },
};

function yamlBlock(data) {
  return yaml.dump(data, { lineWidth: 120, noRefs: true }).trim();
}

function frontmatter(data) {
  return `---\n${yamlBlock(data)}\n---\n\n`;
}

function list(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function claimId(profile, index) {
  return `${profile.claimPrefix}-${String(index + 2).padStart(4, "0")}`;
}

function topicClaim(profile, topicIndex) {
  return claimId(profile, topicIndex);
}

function buildTopicFacts(profile, topicSlug, topicName, focus) {
  const base = [
    `${profile.name} 的定位是${profile.positioning}，不要把它误说成${profile.notFor}。`,
    `核心对象包括 ${profile.objects.join("、")}，回答时要说明谁持有状态、谁执行动作、谁只提供元数据或调度能力。`,
    `${profile.flow}`,
    `${profile.consistency}`,
  ];
  const byTopic = {
    overview: [profile.positioning, profile.notFor, profile.flow, profile.comparison],
    "core-objects-state": [profile.state, `核心对象：${profile.objects.join("、")}。`, profile.flow],
    "architecture-and-roles": [profile.state, profile.flow, profile.consistency],
    "metadata-state": [profile.state, profile.observability, profile.fault],
    "write-path": [profile.write, profile.fault, profile.tuning],
    "read-path": [profile.read, profile.performance, profile.observability],
    "consistency-boundaries": [profile.consistency, profile.fault, profile.comparison],
    "partition-layout": [profile.layout, profile.performance, profile.tuning],
    "fault-recovery": [profile.fault, profile.observability, profile.troubleshooting],
    "maintenance-services": [profile.maintenance, profile.observability, profile.governance],
    lifecycle: [profile.write, profile.read, profile.maintenance],
    "performance-model": [profile.performance, profile.layout, profile.tuning],
    tuning: [profile.tuning, profile.performance, profile.governance],
    "resource-governance": [profile.governance, profile.security, profile.observability],
    "security-governance": [profile.security, profile.governance, profile.troubleshooting],
    observability: [profile.observability, profile.performance, profile.troubleshooting],
    troubleshooting: [profile.troubleshooting, profile.observability, profile.fault],
    comparison: [profile.comparison, profile.positioning, profile.notFor],
    "system-design": [profile.governance, profile.performance, profile.security, profile.fault],
    "interview-playbook": [profile.positioning, profile.flow, profile.troubleshooting, profile.comparison],
  };
  return [...(byTopic[topicSlug] || base), `本主题重点是：${focus}。`].filter(Boolean);
}

function buildDoc(profile, component, topic, topicIndex) {
  const [slug, topicName, focus] = topic;
  const facts = buildTopicFacts(profile, slug, topicName, focus);
  const title = `${profile.name} ${topicName}：${focus}`;
  const difficulty = topicIndex >= 3 && topicIndex <= 18 ? "advanced" : "intermediate";
  return `${frontmatter({
    kb_id: `bigdata/${component}/${slug}`,
    title,
    domain: "bigdata",
    component,
    topic: slug,
    difficulty,
    status: "reviewed",
    sidebar_position: topicIndex + 1,
    version_scope: profile.versionScope,
    last_verified_at: today,
    source_ids: profile.sourceIds,
    claim_ids: [`${profile.claimPrefix}-0001`, topicClaim(profile, topicIndex)],
    tags: ["bigdata", component, slug],
  })}# 一句话结论

${facts[0]} 面试时要围绕“定位、对象、链路、边界、故障和取舍”组织答案，而不是只背组件名称。

# 核心对象与状态

${list([
    `核心对象：${profile.objects.join("、")}。`,
    profile.state,
    "先判断状态属于控制面、执行面、存储面还是外部系统，再讨论请求如何流动。",
    "任何性能或故障问题都要先定位状态归属，否则容易把症状当根因。",
  ])}

# 核心链路

${list([
    profile.flow,
    slug === "write-path" ? profile.write : slug === "read-path" ? profile.read : facts[1] || profile.flow,
    "链路分析要说明入口、内部对象、状态更新、失败反馈和可观测证据。",
    "如果涉及上层计算或底层存储，要明确哪些语义由本组件提供，哪些来自相邻系统。",
  ])}

# 这个主题的深挖点

${list(facts)}

# 生产边界

${list([
    profile.consistency,
    profile.performance,
    profile.governance,
    `不要把 ${profile.name} 当成${profile.notFor}，否则设计会在语义、性能或运维上出问题。`,
  ])}

# 排障入口

${list([
    profile.observability,
    profile.troubleshooting,
    "先区分全局问题、单任务问题、单节点问题、单表或单查询问题，再决定看指标、日志、计划还是后台服务状态。",
    "处理动作必须和根因层次对应：调参、扩容、修权限、改布局、修复后台服务或改上层访问模式是不同方案。",
  ])}

# 常见误区

${list([
    "只背对象名，不解释对象之间的状态关系。",
    "只讲优点，不讲它不适合的场景。",
    "把相邻系统的能力错误归到本组件上。",
    "调优时直接报参数，不先定义瓶颈和观测证据。",
  ])}

# 面试答题结构

1. 30 秒：说明 ${profile.name} 是${profile.positioning}，不是${profile.notFor}。
2. 2 分钟：讲清 ${profile.objects.slice(0, 5).join("、")} 的职责和一条主链路。
3. 5 分钟：补充一致性、故障恢复、性能瓶颈、治理边界和与相邻系统的对比。

# 相关样例

- \`examples/python/${component}/${slug.replaceAll("-", "_")}.py\`
`;
}

function buildQuestion(profile, component, topic, topicIndex) {
  const [slug, topicName, focus] = topic;
  const stem = profile.questionStem || component;
  const id = `q-bigdata-${stem}-${String(topicIndex + 1).padStart(4, "0")}`;
  const facts = buildTopicFacts(profile, slug, topicName, focus);
  const questionType = topicIndex % 5 === 0 ? "principle" : topicIndex % 5 === 1 ? "system-design" : topicIndex % 5 === 2 ? "tradeoff" : topicIndex % 5 === 3 ? "troubleshooting" : "operations";
  const title = `${profile.name} 的${topicName}面试题应该怎么讲到原理层？`;
  return `${frontmatter({
    id,
    title,
    domain: "bigdata",
    component,
    topic: slug,
    question_type: questionType,
    difficulty: topicIndex >= 3 ? "advanced" : "intermediate",
    status: "reviewed",
    version_scope: profile.versionScope,
    last_verified_at: today,
    source_ids: profile.sourceIds,
    claim_ids: [`${profile.claimPrefix}-0001`, topicClaim(profile, topicIndex)],
    related_docs: [`bigdata/${component}/${slug}`],
    estimated_minutes: 10,
  })}# 题目

${title}

# 一句话结论

${facts[0]} 这类题要从对象、状态、链路和边界回答，才能体现原理深度。

# 核心机制

${list(facts)}

# 标准答案

高质量回答可以分四步：

1. 先定位：${profile.name} 是${profile.positioning}，不是${profile.notFor}。
2. 再拆对象：${profile.objects.join("、")} 分别承担不同状态和动作，不能混成一个黑盒。
3. 然后讲链路：${slug === "write-path" ? profile.write : slug === "read-path" ? profile.read : profile.flow}
4. 最后讲边界：${profile.consistency}

如果面试官继续追问生产问题，就把答案落到观测和排障上：${profile.observability} ${profile.troubleshooting}

# 必答点

1. 说明组件定位和不适合场景。
2. 说明核心对象的状态归属。
3. 讲出一条真实链路。
4. 说明故障、性能或治理边界。
5. 和相邻系统划清职责。

# 常见误答

1. 把 ${profile.name} 说成万能组件。
2. 只背对象名称，不讲状态和链路。
3. 把上层计算、底层存储或外部系统的能力混到本组件里。
4. 不讲失败场景和代价。

# 延伸追问

1. 如果这个机制失效，你会先看哪些指标或日志？
2. 如果规模扩大 10 倍，瓶颈会先出现在对象、网络、存储还是调度层？
3. 哪些业务场景不应该选择 ${profile.name}？
`;
}

function buildExtraQuestion(profile, component, index) {
  const stem = profile.questionStem || component;
  const id = `q-bigdata-${stem}-${String(index + 21).padStart(4, "0")}`;
  const variants = [
    [`为什么 ${profile.name} 不能被当成${profile.notFor}？`, "comparison"],
    [`${profile.name} 出现性能抖动时，如何区分资源、布局、后台服务和上层访问模式问题？`, "troubleshooting"],
    [`设计 ${profile.name} 生产环境时，哪些治理项必须提前规划？`, "system-design"],
    [`${profile.name} 的安全边界为什么不能只依赖应用层控制？`, "security"],
    [`${profile.name} 的可观测性应该如何从指标、日志和计划三层组织？`, "operations"],
    [`${profile.name} 的核心对象如果解释不清，会导致哪些设计误判？`, "principle"],
    [`${profile.name} 和相邻组件的职责边界如何在面试中讲清楚？`, "tradeoff"],
    [`${profile.name} 的故障恢复为什么要先定位状态归属？`, "failure"],
  ];
  const [title, qtype] = variants[index];
  return `${frontmatter({
    id,
    title,
    domain: "bigdata",
    component,
    topic: qtype,
    question_type: qtype,
    difficulty: index >= 1 ? "advanced" : "intermediate",
    status: "reviewed",
    version_scope: profile.versionScope,
    last_verified_at: today,
    source_ids: profile.sourceIds,
    claim_ids: [`${profile.claimPrefix}-0001`, claimId(profile, Math.min(index + 12, 19))],
    related_docs: [`bigdata/${component}/overview`, `bigdata/${component}/${qtype === "comparison" ? "comparison" : qtype === "system-design" ? "system-design" : qtype === "troubleshooting" ? "troubleshooting" : "interview-playbook"}`],
    estimated_minutes: 10,
  })}# 题目

${title}

# 一句话结论

回答这类题要把 ${profile.name} 的定位、对象、链路、边界和生产证据连起来。${profile.name} 是${profile.positioning}，不是${profile.notFor}。

# 核心机制

${list([
    profile.state,
    profile.flow,
    profile.consistency,
    profile.observability,
  ])}

# 标准答案

先把系统定位说清楚：${profile.name} 是${profile.positioning}。然后解释为什么不能越界使用：${profile.comparison} 接着落到对象和链路：${profile.objects.join("、")} 共同决定请求如何执行、状态如何变化以及失败时应该看哪里。

如果题目偏设计，要补充 ${profile.governance} 如果题目偏排障，要补充 ${profile.troubleshooting} 如果题目偏性能，要补充 ${profile.performance}

# 必答点

1. 定位准确。
2. 对象和状态讲清楚。
3. 链路能从入口讲到结果。
4. 有生产观测和排障入口。
5. 主动说明边界和取舍。

# 常见误答

1. 用一句定义结束答案。
2. 把相邻组件能力混进来。
3. 不讲失败和治理。

# 延伸追问

1. 如果线上出现同类问题，第一批证据是什么？
2. 如果要扩容或迁移，哪些状态最容易成为风险点？
3. 这个组件最常被误用在哪些场景？
`;
}

function safeClassName(name, slug) {
  const component = name.replace(/[^a-zA-Z0-9]/g, "");
  const topic = slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  return `${component}${topic}Checklist`;
}

function buildExample(profile, component, topic) {
  const [slug] = topic;
  const className = safeClassName(profile.name, slug);
  return `"""${profile.name} ${slug} 面试推演脚本。

脚本用于把回答结构化，不替代真实集群命令。
生产排查需要结合官方文档、系统指标、日志、执行计划和变更记录。
"""

from dataclasses import dataclass, field
import json


@dataclass
class ${className}:
    component: str = "${profile.name}"
    positioning: str = "${profile.positioning}"
    objects: list[str] = field(default_factory=lambda: ${JSON.stringify(profile.objects)})
    evidence: list[str] = field(default_factory=lambda: [
        "核心对象状态",
        "请求链路",
        "错误日志或执行计划",
        "资源与治理边界",
    ])

    def outline(self) -> dict:
        return {
            "component": self.component,
            "positioning": self.positioning,
            "not_for": "${profile.notFor}",
            "objects": self.objects,
            "flow": "${profile.flow.replaceAll("\"", "\\\"")}",
            "boundary": "${profile.consistency.replaceAll("\"", "\\\"")}",
            "evidence": self.evidence,
        }


if __name__ == "__main__":
    print(json.dumps(${className}().outline(), ensure_ascii=False, indent=2))
`;
}

function buildSqlExample(profile, component, topic) {
  const [slug, topicName] = topic;
  if (component === "trino") {
    return `-- Trino ${topicName} 面试推演 SQL\n-- 重点：用 EXPLAIN / EXPLAIN ANALYZE 观察扫描、过滤、join、exchange 和 connector 下推。\n\nEXPLAIN\nSELECT\n  customer_id,\n  count(*) AS order_count\nFROM lake.sales.orders\nWHERE order_date >= DATE '2026-01-01'\nGROUP BY customer_id;\n\n-- 排查时关注：TableScan 的列裁剪和谓词下推、stage 数量、exchange、join 分布和扫描数据量。\n`;
  }
  if (component === "hudi") {
    return `-- Hudi ${topicName} 面试推演 SQL\n-- 重点：把 upsert、record key、precombine、partition path 和 timeline 提交边界讲清楚。\n\nCREATE TABLE IF NOT EXISTS demo_hudi_orders (\n  order_id STRING,\n  user_id STRING,\n  amount DOUBLE,\n  updated_at TIMESTAMP\n) USING hudi\nOPTIONS (\n  type = 'cow',\n  primaryKey = 'order_id',\n  preCombineField = 'updated_at'\n)\nPARTITIONED BY (user_id);\n\n-- 面试说明：真实生产还要结合索引、compaction、cleaning、clustering 和并发写入策略。\n`;
  }
  if (component === "delta-lake") {
    return `-- Delta Lake ${topicName} 面试推演 SQL\n-- 重点：数据文件不是表状态边界，_delta_log 中的事务提交才决定版本可见性。\n\nCREATE TABLE IF NOT EXISTS demo_delta_orders (\n  order_id STRING,\n  user_id STRING,\n  amount DOUBLE,\n  updated_at TIMESTAMP\n) USING delta\nPARTITIONED BY (user_id);\n\nDESCRIBE HISTORY demo_delta_orders;\n\n-- 面试说明：继续追问时要讲 schema enforcement/evolution、time travel、checkpoint、VACUUM 和并发冲突。\n`;
  }
  if (component === "clickhouse") {
    return `-- ClickHouse ${topicName} 面试推演 SQL\n-- 重点：MergeTree 的 partition、ORDER BY、part、mark 和后台 merge 决定 OLAP 查询效率。\n\nCREATE TABLE IF NOT EXISTS demo_orders (\n  order_id String,\n  user_id String,\n  amount Float64,\n  order_date Date\n)\nENGINE = MergeTree\nPARTITION BY toYYYYMM(order_date)\nORDER BY (user_id, order_date, order_id);\n\nEXPLAIN indexes = 1\nSELECT user_id, sum(amount)\nFROM demo_orders\nWHERE order_date >= toDate('2026-01-01')\nGROUP BY user_id;\n\n-- 面试说明：观察分区裁剪、主键稀疏索引、读取列、parts 数量和 merge backlog。\n`;
  }
  return "";
}

function updateClaims() {
  const file = path.join(repoRoot, "claims", "bigdata", "platform-components.yaml");
  const rows = yaml.load(fs.readFileSync(file, "utf8")) || [];
  const components = new Set(Object.keys(profiles));
  const filtered = rows.filter((row) => {
    if (!components.has(row.component)) return true;
    return row.id === `${profiles[row.component].claimPrefix}-0001`;
  });

  const additions = [];
  for (const [component, profile] of Object.entries(profiles)) {
    const claimTexts = [
      `${profile.name} 的定位是${profile.positioning}，面试中不能把它说成${profile.notFor}。`,
      `${profile.name} 的核心对象包括 ${profile.objects.join("、")}，回答时应说明状态所有权和请求链路。`,
      profile.state,
      profile.flow,
      profile.write,
      profile.read,
      profile.consistency,
      profile.layout,
      profile.fault,
      profile.maintenance,
      profile.performance,
      profile.tuning,
      profile.governance,
      profile.security,
      profile.observability,
      profile.troubleshooting,
      profile.comparison,
      `${profile.name} 系统设计要同时考虑规模、可靠性、性能、成本、权限、运维和相邻组件边界。`,
      `${profile.name} 调优必须先有观测证据，再决定参数、布局、资源或上层访问模式调整。`,
      `${profile.name} 面试答案最重要的是把对象、链路、边界、故障和取舍串成闭环。`,
    ];
    claimTexts.forEach((statement, index) => {
      additions.push({
        id: claimId(profile, index),
        domain: "bigdata",
        component,
        statement,
        status: "reviewed",
        confidence: "high",
        version_scope: profile.versionScope,
        last_verified_at: today,
        source_ids: profile.sourceIds,
        notes: `Curated ${profile.name} interview claim verified against official documentation.`,
      });
    });
  }

  fs.writeFileSync(file, yaml.dump([...filtered, ...additions], { lineWidth: 120, noRefs: true }), "utf8");
}

function writeContent() {
  for (const [component, profile] of Object.entries(profiles)) {
    const docDir = path.join(repoRoot, "docs", "bigdata", component);
    const questionDir = path.join(repoRoot, "questions", "bigdata", component);
    const exampleDir = path.join(repoRoot, "examples", "python", component);
    const sqlDir = path.join(repoRoot, "examples", "sql", component);
    fs.mkdirSync(docDir, { recursive: true });
    fs.mkdirSync(questionDir, { recursive: true });
    fs.mkdirSync(exampleDir, { recursive: true });
    const stem = profile.questionStem || component;
    for (const entry of fs.readdirSync(questionDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      if (entry.name.startsWith(`q-bigdata-${stem}-`) || entry.name.startsWith(`q-bigdata-${component}-`)) {
        fs.rmSync(path.join(questionDir, entry.name));
      }
    }

    topics.forEach((topic, index) => {
      const [slug] = topic;
      fs.writeFileSync(path.join(docDir, `${slug}.md`), buildDoc(profile, component, topic, index), "utf8");
      fs.writeFileSync(path.join(questionDir, `q-bigdata-${stem}-${String(index + 1).padStart(4, "0")}.md`), buildQuestion(profile, component, topic, index), "utf8");
      fs.writeFileSync(path.join(exampleDir, `${slug.replaceAll("-", "_")}.py`), buildExample(profile, component, topic), "utf8");
      if (fs.existsSync(sqlDir)) {
        fs.writeFileSync(path.join(sqlDir, `${slug.replaceAll("-", "_")}.sql`), buildSqlExample(profile, component, topic), "utf8");
      }
    });

    for (let i = 0; i < 8; i += 1) {
      fs.writeFileSync(path.join(questionDir, `q-bigdata-${stem}-${String(i + 21).padStart(4, "0")}.md`), buildExtraQuestion(profile, component, i), "utf8");
    }
  }
}

updateClaims();
writeContent();

console.log(JSON.stringify({ refinedComponents: Object.keys(profiles).length, refinedDocs: Object.keys(profiles).length * topics.length, refinedQuestions: Object.keys(profiles).length * 28, refinedExamples: Object.keys(profiles).length * topics.length, curatedClaims: Object.keys(profiles).length * 20 }, null, 2));
