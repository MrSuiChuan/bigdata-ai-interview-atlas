import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = process.cwd();
const docsRoot = path.join(repoRoot, "docs", "bigdata");
const sourcesFile = path.join(repoRoot, "sources", "official", "bigdata.yaml");
const claimsDir = path.join(repoRoot, "claims", "bigdata");

const componentProfiles = {
  kafka: {
    label: "Kafka",
    positioning: "分布式事件流平台，核心价值是把可持久化的事件日志、分区并行、消费者进度和复制容错放在同一套模型里。",
    boundary: "Kafka 不是通用数据库，也不是只负责临时缓冲的内存队列；它的语义围绕 Topic、Partition、Offset、Replica、Consumer Group 和保留策略展开。",
    objects: ["Topic", "Partition", "Broker", "Leader Replica", "Follower Replica", "ISR", "Producer", "Consumer", "Consumer Group", "Coordinator", "Offset", "Segment"],
    objectNotes: [
      "Topic 是逻辑事件流名称，Partition 才是追加写日志、并行消费和分区内顺序的基本单位。",
      "Broker 承载分区副本并处理读写请求；Leader Replica 处理该分区的生产和消费路径，Follower Replica 通过复制追赶 leader。",
      "Offset 是分区内位置，不是业务处理完成标记；Consumer Group 通过分区分配把并行消费和故障接管组织起来。"
    ],
    writePath: "Producer 根据元数据定位目标分区 leader，将记录按分区缓冲、批量发送；Broker 把记录追加到分区日志的 active segment，并根据复制与确认配置决定何时向客户端返回成功。",
    readPath: "Consumer 通过分配关系找到自己负责的分区，从指定 offset 向分区 leader 拉取数据；读取位置、已提交 offset、业务处理进度是三个不同层面的状态。",
    stateBoundary: "分区内顺序、已提交日志、ISR 复制、offset 提交和事务可见性属于不同语义层，不应混成一个“消息一定不丢不重”的笼统结论。",
    performance: "吞吐主要受分区数、批量大小、压缩、网络、磁盘顺序写、replica 同步和消费者处理速度影响；延迟主要受 linger、请求排队、复制等待、fetch 设置和下游处理影响。",
    troubleshooting: ["kafka-topics.sh --describe", "kafka-consumer-groups.sh --describe", "UnderReplicatedPartitions", "UnderMinIsrPartitionCount", "records-lag-max", "__consumer_offsets"],
    governance: "生产治理要同时控制 topic 命名、分区数、replication factor、min.insync.replicas、retention、cleanup.policy、ACL、quota 和跨集群复制边界。",
    exampleLang: "bash",
    example: `kafka-topics.sh --bootstrap-server broker:9092 --describe --topic orders
kafka-consumer-groups.sh --bootstrap-server broker:9092 --describe --group order-service
kafka-configs.sh --bootstrap-server broker:9092 --entity-type topics --entity-name orders --describe`
  },
  spark: {
    label: "Spark",
    positioning: "统一的大规模数据计算引擎，核心是 Driver 组织计划，Executor 执行 Task，SQL/DataFrame/Dataset/RDD 最终进入统一执行体系。",
    boundary: "Spark 不是存储系统，也不替代调度平台；它依赖外部存储、集群管理器和输入输出系统提供数据、资源与持久化边界。",
    objects: ["Driver", "Executor", "Application", "Job", "Stage", "Task", "RDD", "DataFrame", "Dataset", "DAG", "Shuffle", "Cache", "Checkpoint"],
    objectNotes: [
      "Driver 是控制面入口，负责构建逻辑、提交 job、切分 stage、调度 task 并接收结果面数据。",
      "Executor 是执行面单元，负责运行 task、缓存数据、写 shuffle 文件，并向 Driver 汇报状态。",
      "Shuffle 是宽依赖切分 stage 的关键边界，也是网络、磁盘、序列化和内存压力集中出现的位置。"
    ],
    writePath: "Spark 写出数据时先由逻辑计划进入物理计划，再按分区并行执行 task；输出文件数量、文件大小、提交协议和目标表格式共同决定最终布局。",
    readPath: "Spark 读取数据时由数据源、catalog、统计信息和 filter/projection 决定扫描计划，再由 task 并行拉取分区数据进入执行算子。",
    stateBoundary: "Spark 的容错依赖 lineage、shuffle 中间结果、checkpoint 和外部存储；cache 是性能优化，不是永久持久化保证。",
    performance: "性能由扫描裁剪、分区数量、shuffle 范围、join 策略、统计信息、AQE、内存执行/存储竞争、序列化和数据倾斜共同决定。",
    troubleshooting: ["Spark UI Jobs", "Stages", "SQL tab", "EXPLAIN FORMATTED", "executor logs", "shuffle read/write", "spill metrics"],
    governance: "生产治理要控制依赖分发、资源规格、队列隔离、动态资源、checkpoint 目录、输出文件大小、SQL 配置和作业版本变更。",
    exampleLang: "python",
    example: `df = spark.read.parquet("s3://warehouse/orders")
result = df.where("dt >= '2026-01-01'").groupBy("shop_id").count()
result.explain("formatted")
result.write.mode("overwrite").parquet("s3://warehouse/order_summary")`
  },
  flink: {
    label: "Flink",
    positioning: "面向有状态流处理和批流统一的计算引擎，核心是持续执行的算子图、事件时间、状态、checkpoint 与恢复语义。",
    boundary: "Flink 不是消息队列，也不是表存储；它负责计算和状态一致性，端到端语义还依赖 source、sink 和外部系统的事务能力。",
    objects: ["JobManager", "TaskManager", "Slot", "JobGraph", "ExecutionGraph", "Operator", "Keyed State", "Operator State", "Checkpoint", "Savepoint", "Watermark", "Window"],
    objectNotes: [
      "JobManager 管理作业图、调度和故障恢复；TaskManager 提供 slot 并执行具体 task。",
      "Keyed State 按 key group 分布，是 rescale、checkpoint 和恢复时必须理解的状态放置单位。",
      "Watermark 表示事件时间进展，窗口触发和迟到数据处理都依赖它，而不是依赖处理时间本身。"
    ],
    writePath: "Flink 计算链路从 source 拉取或接收数据，经 operator chain、keyBy、window/state 处理后写入 sink；checkpoint barrier 在数据流中传播并建立一致性切点。",
    readPath: "读取链路要区分 source offset、算子状态、watermark 推进和下游反压；任一环节变慢都会影响整体事件时间和 checkpoint 完成时间。",
    stateBoundary: "Exactly-once 不是单个算子的属性，而是 source 重放、状态快照、sink 提交协议和恢复流程共同成立的结果。",
    performance: "吞吐与延迟受 slot 并行度、operator chain、key 分布、状态后端、checkpoint 间隔、barrier 对齐、反压和 sink 吞吐共同影响。",
    troubleshooting: ["Flink Web UI", "backpressure", "checkpoint duration", "alignment time", "busy/idle/backpressured", "state size", "watermark lag"],
    governance: "生产治理要控制 savepoint 升级、状态兼容、并行度变更、checkpoint 存储、重启策略、资源隔离和 connector 版本。",
    exampleLang: "bash",
    example: `flink run -d -p 8 jobs/realtime-orders.jar
flink list -r
flink savepoint <job-id> hdfs:///flink/savepoints/orders
flink cancel -s hdfs:///flink/savepoints/orders <job-id>`
  },
  hive: {
    label: "Hive",
    positioning: "建立在分布式存储之上的 SQL 数仓系统，核心是用 Metastore 管理表语义，用编译器和执行引擎把 SQL 转成分布式任务。",
    boundary: "Hive 不是低延迟点查数据库；它更适合批量分析、数仓建模、表元数据治理和基于文件格式的扫描优化。",
    objects: ["HiveServer2", "Metastore", "Database", "Table", "Partition", "Bucket", "SerDe", "InputFormat", "OutputFormat", "ORC", "Tez", "Compaction"],
    objectNotes: [
      "Metastore 保存库、表、分区、列、存储位置和统计信息，是数仓语义控制面。",
      "SerDe、InputFormat、OutputFormat 决定数据如何从文件反序列化成行，以及如何写回存储。",
      "分区、分桶、统计信息、ORC 索引和执行引擎共同影响 SQL 的扫描范围、join 方式和执行代价。"
    ],
    writePath: "Hive 写入时先经过语法解析、语义分析和执行计划生成，再由 Tez、MapReduce 或其他引擎落地文件并更新 Metastore 元数据。",
    readPath: "Hive 查询先从 Metastore 解析表与分区，再进行优化、生成执行 DAG，最后按文件格式和谓词下推能力读取数据。",
    stateBoundary: "表元数据、文件物理布局、事务/锁、compaction 和统计信息是不同状态层；只改文件不等于表语义已经正确更新。",
    performance: "性能受分区裁剪、ORC/Parquet 格式、统计信息、CBO、join 策略、小文件、Tez DAG、LLAP 缓存和压缩格式影响。",
    troubleshooting: ["EXPLAIN", "DESCRIBE FORMATTED", "SHOW PARTITIONS", "ANALYZE TABLE", "compaction history", "HiveServer2 logs", "Metastore logs"],
    governance: "生产治理要控制 Metastore 高可用、schema 变更、权限、表生命周期、分区规范、ACID compaction 和统计信息刷新。",
    exampleLang: "sql",
    example: `EXPLAIN FORMATTED
SELECT shop_id, count(*)
FROM dwd_orders
WHERE dt = '2026-01-01'
GROUP BY shop_id;

ANALYZE TABLE dwd_orders PARTITION (dt='2026-01-01') COMPUTE STATISTICS;`
  },
  iceberg: {
    label: "Iceberg",
    positioning: "湖仓表格式，核心是用 metadata file、snapshot、manifest list 和 manifest 管理表版本、文件集合和演进语义。",
    boundary: "Iceberg 不是计算引擎，也不是对象存储本身；它定义表元数据和提交语义，实际读写由 Spark、Flink、Trino 等引擎执行。",
    objects: ["Catalog", "Metadata File", "Snapshot", "Manifest List", "Manifest", "Data File", "Delete File", "Partition Spec", "Schema Field ID", "Sort Order"],
    objectNotes: [
      "Snapshot 表示一次表状态，指向 manifest list；manifest 记录数据文件和 delete file 的元数据。",
      "Catalog 负责定位当前 metadata file，提交通常围绕原子指针切换和乐观并发控制展开。",
      "隐藏分区、schema field id、delete file 和快照保留共同决定表演进与读写正确性。"
    ],
    writePath: "写入引擎先生成数据文件或 delete file，再生成 manifest、manifest list 和新的 metadata file，最后通过 catalog 提交新表指针。",
    readPath: "读取时先解析 catalog 当前指针，再根据 snapshot、manifest summary、分区信息和列统计裁剪文件，最后由计算引擎读取数据文件并合并删除语义。",
    stateBoundary: "Iceberg 的表级一致性依赖元数据提交成功；底层对象存储上的临时文件或未提交文件不等于已经进入可见表版本。",
    performance: "性能受 manifest 数量、metadata 大小、文件大小、分区演进、delete file 数量、统计信息和引擎侧扫描规划能力影响。",
    troubleshooting: ["snapshots", "manifests", "metadata tables", "EXPLAIN", "expire snapshots", "rewrite manifests", "remove orphan files"],
    governance: "生产治理要控制 catalog、快照保留、孤儿文件清理、schema 演进、分区演进、row-level delete 和多引擎兼容。",
    exampleLang: "sql",
    example: `SELECT * FROM prod.db.orders.snapshots;
SELECT * FROM prod.db.orders.manifests;
EXPLAIN SELECT shop_id, count(*) FROM prod.db.orders WHERE dt = DATE '2026-01-01' GROUP BY shop_id;`
  },
  hdfs: {
    label: "HDFS",
    positioning: "面向大文件、高吞吐和批处理的数据存储系统，核心是 NameNode 管理命名空间与块映射，DataNode 存储 block replica。",
    boundary: "HDFS 不是低延迟随机更新文件系统，也不负责表级索引、消息顺序消费或 SQL 优化；它提供分布式文件与 block 复制语义。",
    objects: ["NameNode", "DataNode", "Block", "Replica", "FsImage", "EditLog", "Checkpoint", "JournalNode", "Client", "Rack Awareness", "Balancer"],
    objectNotes: [
      "NameNode 保存 namespace、文件到 block 的映射和副本放置状态，是控制面核心。",
      "DataNode 保存真实 block replica，通过 heartbeat 和 block report 向 NameNode 汇报状态。",
      "FsImage 与 EditLog 决定元数据恢复成本；HA 模式还需要理解 shared edits、ZKFC 和 fencing。"
    ],
    writePath: "客户端先向 NameNode 申请文件和 block，再按 pipeline 写入多个 DataNode；NameNode 管理元数据，DataNode 负责数据流和副本落盘。",
    readPath: "客户端先从 NameNode 获取 block 位置信息，再优先选择更近的 DataNode 读取副本；NameNode 不在正常数据流中转发文件内容。",
    stateBoundary: "HDFS 的一致性围绕单写者、close、append、truncate 和元数据更新时间展开，不能套用本地 POSIX 文件系统的全部直觉。",
    performance: "性能受 block 大小、副本数、DataNode 磁盘、网络拓扑、小文件数量、NameNode RPC 压力和上层计算本地性影响。",
    troubleshooting: ["hdfs dfsadmin -report", "hdfs fsck", "NameNode web UI", "DataNode logs", "safemode", "decommission", "balancer"],
    governance: "生产治理要控制小文件、容量水位、副本策略、机架感知、HA、权限、审计、冷热数据和上层引擎访问模式。",
    exampleLang: "bash",
    example: `hdfs dfsadmin -report
hdfs fsck /warehouse/orders -files -blocks -locations
hdfs dfs -du -h /warehouse/orders
hdfs dfsadmin -safemode get`
  },
  hbase: {
    label: "HBase",
    positioning: "分布式列族存储，适合大规模稀疏表、按 RowKey 访问和范围扫描，核心是 Region、RegionServer、WAL、MemStore、HFile 与 compaction。",
    boundary: "HBase 不是关系型 SQL 数仓，也不适合无 RowKey 设计的任意条件分析；它的性能首先由 RowKey 和列族设计决定。",
    objects: ["Table", "RowKey", "Column Family", "Region", "RegionServer", "HMaster", "WAL", "MemStore", "HFile", "BlockCache", "Compaction", "Bloom Filter"],
    objectNotes: [
      "Region 是按 RowKey 范围切分的服务单元，RegionServer 承载 Region 并处理读写。",
      "写入先进入 WAL 和 MemStore，flush 后形成 HFile；后台 compaction 合并文件并清理旧版本或删除标记。",
      "BlockCache、Bloom Filter、HFile 索引和 RowKey 范围共同决定读取路径。"
    ],
    writePath: "写入先按 RowKey 定位 RegionServer，追加 WAL 后写入 MemStore；MemStore 达到阈值后 flush 成 HFile，后续通过 compaction 维护文件布局。",
    readPath: "读取先定位 Region，再在 MemStore、BlockCache 和 HFile 中查找对应 RowKey 范围；不同列族和版本会影响实际扫描量。",
    stateBoundary: "HBase 的强项是按 RowKey 的低延迟读写和范围扫描，跨行事务、复杂 SQL join 和任意维度分析不是它的默认能力。",
    performance: "性能受 RowKey 分布、热点、Region 大小、列族数量、WAL、MemStore、BlockCache、HFile 数量、compaction 压力和 RPC 延迟影响。",
    troubleshooting: ["HBase shell status", "RegionServer logs", "Region hot spot", "compaction queue", "WAL sync latency", "BlockCache hit ratio"],
    governance: "生产治理要控制 RowKey 规范、预分区、列族数量、TTL、版本数、压缩、compaction 策略、snapshot 和备份恢复。",
    exampleLang: "bash",
    example: `echo "status 'detailed'" | hbase shell
echo "describe 'orders'" | hbase shell
echo "scan 'orders', {STARTROW => '20260101#', LIMIT => 10}" | hbase shell`
  },
  hudi: {
    label: "Hudi",
    positioning: "湖仓数据管理层，核心是 Timeline、Instant、File Group、File Slice、索引和表服务，用于 upsert、增量处理和文件维护。",
    boundary: "Hudi 不是单独计算引擎；它通过 Spark、Flink 等引擎写读数据，并把提交、文件布局和表服务组织成表级语义。",
    objects: ["Timeline", "Instant", "Commit", "File Group", "File Slice", "Base File", "Log File", "COW", "MOR", "Index", "Compaction", "Clustering", "Cleaner"],
    objectNotes: [
      "Timeline 记录 commit、delta commit、compaction、clustering、clean 等 instant，是表状态演进的主线。",
      "File Group 和 File Slice 决定一组 record 的物理组织；COW 与 MOR 在写放大、读放大和延迟之间取舍。",
      "索引帮助定位 record 所在文件组，表服务负责压缩、聚簇、清理和元数据维护。"
    ],
    writePath: "写入先通过 key 和索引定位目标文件组，生成 base file 或 log file，并在 Timeline 上提交 instant；后续表服务维护文件布局。",
    readPath: "读取时根据查询类型选择 snapshot、read optimized 或 incremental 视图，并结合 base file、log file 和 timeline 状态构建结果。",
    stateBoundary: "Hudi 的可见性以成功提交的 timeline instant 为边界；写入文件存在不等于表版本已经对读者可见。",
    performance: "性能受 record key、precombine、索引类型、文件大小、COW/MOR 选择、compaction/clustering 节奏和小文件治理影响。",
    troubleshooting: ["timeline", "commits", "file groups", "compaction backlog", "clustering plan", "cleaner", "write errors"],
    governance: "生产治理要控制表类型、key 设计、索引、并发写、表服务调度、保留策略、元数据表和多引擎读写兼容。",
    exampleLang: "python",
    example: `hudi_options = {
    "hoodie.table.name": "orders_hudi",
    "hoodie.datasource.write.recordkey.field": "order_id",
    "hoodie.datasource.write.precombine.field": "updated_at",
    "hoodie.datasource.write.operation": "upsert",
}
df.write.format("hudi").options(**hudi_options).mode("append").save("s3://warehouse/orders_hudi")`
  },
  "delta-lake": {
    label: "Delta Lake",
    positioning: "湖仓表格式，核心是用 _delta_log 事务日志在数据湖文件之上提供表版本、ACID 语义、schema 管理和 time travel。",
    boundary: "Delta Lake 不是计算引擎，也不是权限系统；它定义表日志和文件动作，执行、权限和对象存储一致性仍要纳入整体设计。",
    objects: ["_delta_log", "JSON Commit", "Checkpoint", "Protocol", "Metadata", "AddFile", "RemoveFile", "Data File", "Snapshot", "Optimistic Concurrency"],
    objectNotes: [
      "_delta_log 记录表版本、协议、元数据、文件 add/remove 动作和事务信息，是表状态的权威入口。",
      "Snapshot 由日志和 checkpoint 构建，决定某个版本真正可见的数据文件集合。",
      "乐观并发控制和冲突检测决定多个写入者能否安全提交。"
    ],
    writePath: "写入先产生数据文件，再尝试提交事务日志动作；只有日志提交成功，数据文件才进入表的可见版本。",
    readPath: "读取先解析 _delta_log 和 checkpoint 构建 snapshot，再由 Spark 等引擎读取有效数据文件，并应用 schema 和谓词裁剪。",
    stateBoundary: "底层路径上出现数据文件不等于表状态改变；Delta 的表语义以成功提交的日志版本为边界。",
    performance: "性能受小文件、日志长度、checkpoint、分区策略、数据跳过、Z-ORDER/聚簇、OPTIMIZE、VACUUM 和计算引擎计划影响。",
    troubleshooting: ["DESCRIBE HISTORY", "_delta_log", "checkpoint", "conflict exception", "VACUUM", "OPTIMIZE", "file count"],
    governance: "生产治理要控制 schema 演进、日志保留、VACUUM 保留期、并发写、catalog 权限、对象存储权限和多引擎兼容。",
    exampleLang: "sql",
    example: `DESCRIBE HISTORY delta.\`s3://warehouse/orders_delta\`;
DESCRIBE DETAIL delta.\`s3://warehouse/orders_delta\`;
OPTIMIZE delta.\`s3://warehouse/orders_delta\`;
VACUUM delta.\`s3://warehouse/orders_delta\` RETAIN 168 HOURS;`
  },
  clickhouse: {
    label: "ClickHouse",
    positioning: "面向 OLAP 的列式数据库管理系统，核心是 MergeTree 家族、列式存储、稀疏主键索引、part 和后台 merge。",
    boundary: "ClickHouse 不应按高并发小事务 OLTP 系统理解；它的优势在分析扫描、聚合和高吞吐列式执行。",
    objects: ["MergeTree", "Part", "Partition", "ORDER BY", "Primary Key", "Granule", "Mark", "Sparse Index", "Mutation", "TTL", "Replica", "Shard"],
    objectNotes: [
      "MergeTree 表把数据组织为 part，part 内按排序键组织，稀疏索引和 mark 用于减少扫描范围。",
      "后台 merge 改变物理布局，mutation、TTL、物化视图和副本同步都会影响读写与运维。",
      "Distributed 表、shard 和 replica 是集群访问路径，不应和单表本地存储结构混为一谈。"
    ],
    writePath: "写入通常形成新的 part，随后后台 merge 把小 part 合并成更适合查询的物理布局；过多小批量写入会放大 merge 压力。",
    readPath: "查询先经过解析和计划，再利用分区裁剪、主键/稀疏索引、mark、列式读取和向量化执行降低扫描成本。",
    stateBoundary: "ClickHouse 强在分析型读取，不提供传统 OLTP 行级事务模型；副本、分片和后台任务的边界需要单独分析。",
    performance: "性能受 ORDER BY、PARTITION BY、part 数量、压缩、join 内存、低选择性扫描、分布式网络和后台 merge 影响。",
    troubleshooting: ["system.parts", "system.merges", "system.mutations", "system.query_log", "system.replication_queue", "EXPLAIN indexes"],
    governance: "生产治理要控制表引擎、排序键、分区粒度、TTL、冷热分层、资源配额、权限、慢查询和容量水位。",
    exampleLang: "sql",
    example: `EXPLAIN indexes = 1
SELECT shop_id, count()
FROM orders
WHERE dt >= '2026-01-01'
GROUP BY shop_id;

SELECT table, count() AS parts, sum(rows) AS rows
FROM system.parts
WHERE active
GROUP BY table
ORDER BY parts DESC;`
  },
  trino: {
    label: "Trino",
    positioning: "分布式 SQL 查询引擎，核心是 Coordinator 规划查询，Worker 执行 split/task，并通过 Connector 访问多种数据源。",
    boundary: "Trino 不是存储系统，也不负责把外部数据强制变成统一事务模型；它提供联邦查询和执行优化，底层语义仍由各数据源决定。",
    objects: ["Coordinator", "Worker", "Catalog", "Connector", "Schema", "Table", "Split", "Stage", "Task", "Exchange", "Operator", "Memory Pool"],
    objectNotes: [
      "Coordinator 负责解析 SQL、优化计划、拆分 stage 并调度 task。",
      "Worker 执行 task，处理 split、operator、exchange 和内存使用。",
      "Connector 把外部系统接入 Trino，但谓词下推、统计信息和写入能力取决于具体 connector。"
    ],
    writePath: "Trino 写入或 CTAS/INSERT 时由 Coordinator 规划写入任务，Worker 通过 connector 把结果写入目标系统；提交语义取决于 connector 和底层存储。",
    readPath: "读取时先由 connector 提供元数据、统计信息和 split，再由 Worker 并行扫描并通过 exchange 完成聚合、join 和排序。",
    stateBoundary: "Trino 的查询一致性不能脱离数据源讨论；跨 catalog 查询的语义是多个系统能力的组合，而不是单一全局事务。",
    performance: "性能受 split 数量、connector 下推、统计信息、join 顺序、动态过滤、exchange、内存池、spill 和网络影响。",
    troubleshooting: ["EXPLAIN", "EXPLAIN ANALYZE", "Query UI", "stage/task skew", "blocked reason", "memory pool", "connector logs"],
    governance: "生产治理要控制 catalog 权限、资源组、内存限制、查询队列、connector 配置、跨源访问成本和审计。",
    exampleLang: "sql",
    example: `EXPLAIN ANALYZE
SELECT shop_id, count(*)
FROM hive.dwd.orders
WHERE dt = DATE '2026-01-01'
GROUP BY shop_id;

SHOW STATS FOR hive.dwd.orders;`
  },
  yarn: {
    label: "YARN",
    positioning: "Hadoop 集群资源管理与应用调度层，核心是 ResourceManager、NodeManager、ApplicationMaster、Container 和 Scheduler。",
    boundary: "YARN 不负责业务计算逻辑，也不保存业务数据；它管理资源分配、容器生命周期、队列和应用状态。",
    objects: ["ResourceManager", "Scheduler", "NodeManager", "ApplicationMaster", "Container", "Queue", "CapacityScheduler", "Node Label", "Localizer", "Timeline Service"],
    objectNotes: [
      "ResourceManager 负责全局资源和应用状态，Scheduler 根据队列策略分配资源。",
      "NodeManager 管理单节点资源、容器启动、日志和健康状态。",
      "ApplicationMaster 是单个应用的协调者，负责向 Scheduler 申请 container 并编排任务。"
    ],
    writePath: "应用提交后 ResourceManager 接收请求并启动 ApplicationMaster，ApplicationMaster 申请 container，NodeManager 启动容器并汇报状态。",
    readPath: "查询状态时主要读取应用、队列、节点、container 和日志状态，用于判断资源等待、失败重试和调度瓶颈。",
    stateBoundary: "YARN 保证资源分配和容器生命周期管理语义，不保证 Spark、MapReduce、Flink 等上层任务的业务计算正确性。",
    performance: "性能受队列容量、资源规格、container 分配速度、NodeManager 健康、AM 重试、数据本地性和调度策略影响。",
    troubleshooting: ["yarn application -status", "yarn logs", "ResourceManager UI", "NodeManager logs", "queue metrics", "container exit status"],
    governance: "生产治理要控制队列容量、用户限额、节点标签、抢占、日志保留、应用重试、RM HA 和多租户隔离。",
    exampleLang: "bash",
    example: `yarn application -list
yarn application -status <application_id>
yarn logs -applicationId <application_id> | tail -200
yarn queue -status root.production`
  }
};

const categoryDescriptions = {
  kafka: "Kafka 知识库：覆盖 Topic、Partition、Producer、Consumer、复制、事务、保留策略、性能调优与生产排障。",
  spark: "Spark 知识库：覆盖 Driver、Executor、Job、Stage、Shuffle、SQL、Streaming、内存模型与生产调优。",
  flink: "Flink 知识库：覆盖 JobManager、TaskManager、State、Checkpoint、Watermark、Window、反压与恢复边界。",
  hive: "Hive 知识库：覆盖 Metastore、SQL 编译、分区分桶、ORC、ACID、Tez、统计信息与数仓治理。",
  iceberg: "Iceberg 知识库：覆盖 Snapshot、Manifest、Catalog、并发提交、Delete File、分区演进与湖仓治理。",
  hdfs: "HDFS 知识库：覆盖 NameNode、DataNode、Block、副本、HA、权限、容量治理与生产排障。",
  hbase: "HBase 知识库：覆盖 RowKey、Region、WAL、MemStore、HFile、Compaction、热点治理与读写路径。",
  clickhouse: "ClickHouse 知识库：覆盖 MergeTree、Part、稀疏索引、读写路径、分布式查询、性能模型与治理边界。",
  "delta-lake": "Delta Lake 知识库：覆盖 _delta_log、ACID、Snapshot、Time Travel、VACUUM、OPTIMIZE 与并发边界。",
  hudi: "Hudi 知识库：覆盖 Timeline、File Group、COW/MOR、索引、表服务、增量处理与湖仓治理。",
  trino: "Trino 知识库：覆盖 Coordinator、Worker、Connector、Split、Stage、Exchange、资源组与联邦查询。",
  yarn: "YARN 知识库：覆盖 ResourceManager、NodeManager、ApplicationMaster、Container、Queue、调度与多租户治理。"
};

const categoryPositions = {
  kafka: 10,
  spark: 20,
  flink: 30,
  hive: 40,
  iceberg: 45,
  clickhouse: 50,
  hdfs: 60,
  hbase: 70,
  "delta-lake": 80,
  hudi: 90,
  trino: 100,
  yarn: 110
};

const titleByTopic = {
  overview: "整体定位与技术边界",
  architecture: "架构分层与角色协作",
  "architecture-and-roles": "架构分层与角色协作",
  "core-objects-state": "核心对象与状态所有权",
  "core-objects-deep-dive": "核心对象与状态所有权",
  "read-path": "读取路径与可见性边界",
  "write-path": "写入路径与提交边界",
  "write-read-path": "读写路径与状态流转",
  "metadata-state": "元数据与状态管理",
  "partition-layout": "分区、布局与并行度模型",
  "consistency-boundaries": "一致性边界与不保证事项",
  "fault-recovery": "故障恢复与状态重建",
  "failure-recovery": "故障恢复与状态重建",
  "performance-model": "性能模型与瓶颈定位",
  "performance-tuning": "性能模型与调优路径",
  tuning: "调优方法与取舍边界",
  observability: "可观测性与诊断入口",
  troubleshooting: "生产排障路径",
  "security-governance": "安全治理与权限边界",
  "resource-governance": "资源治理与多租户边界",
  "system-design": "系统设计取舍",
  "system-design-scenarios": "系统设计取舍",
  comparison: "相邻系统对比与选型边界",
  lifecycle: "生命周期与状态演进",
  "maintenance-services": "后台服务与维护任务",
  "release-quality-guide": "发布质量与校验清单"
};

const topicFocusRules = [
  [/consumer|offset|rebalance|group/i, "消费者进度、分区分配、成员变化、offset 持久化和重平衡成本是本页的主线。"],
  [/producer|batch|partitioning|idempotence|transaction/i, "生产端需要同时分析分区选择、批量发送、重试、顺序、幂等和事务边界。"],
  [/retention|compaction|segment|log/i, "日志段、保留策略、压缩清理和可见性边界决定数据什么时候仍可读取、什么时候只保留最终状态。"],
  [/kraft|metadata|quorum/i, "元数据状态、控制面选主、快照和恢复路径决定集群管理面是否稳定。"],
  [/shuffle|stage|scheduler|task|executor|driver/i, "调度与执行主题要把 Driver、Stage、Task、Executor、Shuffle 和失败重试串成一条链路。"],
  [/memory|cache|persist|spill/i, "内存主题要区分 execution、storage、cache、spill、序列化和驱逐策略，不能只看总内存大小。"],
  [/stream|watermark|state|checkpoint|trigger/i, "流式主题要把时间语义、状态大小、checkpoint、输出模式和恢复兼容性一起分析。"],
  [/metastore|catalog|schema|serde|orc|partition|bucket/i, "表语义主题要把元数据、物理文件、格式、统计信息和权限边界拆开。"],
  [/acid|transaction|lock|compaction/i, "事务主题要把锁、可见性、写入目录、压缩清理和失败恢复分层说明。"],
  [/manifest|snapshot|delete|concurrency|branch|tag/i, "表格式主题要围绕快照、元数据文件、manifest、delete file 和提交冲突展开。"],
  [/watermark|window|keyed|state|savepoint|restart|failover|backpressure/i, "Flink 主题要把算子状态、checkpoint barrier、反压、重启策略和状态迁移放在同一条执行链路中。"],
  [/region|row|wal|memstore|hfile|compaction/i, "HBase 主题要围绕 RowKey、Region、WAL、MemStore、HFile、BlockCache 和 compaction 展开。"],
  [/namenode|datanode|block|replica|safemode|ha|journal/i, "HDFS 主题要区分 NameNode 元数据、DataNode block、复制、HA 和客户端数据流。"],
  [/timeline|file|slice|cow|mor|cleaner|clustering/i, "Hudi 主题要围绕 Timeline、File Group、File Slice、COW/MOR 和表服务展开。"],
  [/split|stage|task|connector|exchange|memory/i, "Trino 主题要围绕 Coordinator 计划、Connector split、Worker task、exchange 和内存边界展开。"],
  [/queue|container|application|resource|scheduler|node/i, "YARN 主题要围绕队列、资源、ApplicationMaster、Container、NodeManager 和调度策略展开。"],
  [/merge|part|mutation|ttl|distributed|replica/i, "ClickHouse 主题要围绕 MergeTree part、排序键、稀疏索引、后台 merge、mutation 和副本状态展开。"],
  [/delta|checkpoint|vacuum|optimize|zorder/i, "Delta Lake 主题要围绕事务日志、checkpoint、文件动作、保留策略和数据跳过展开。"]
];

const topicTitleRules = [
  [/retention.*compaction/i, "保留策略与日志压缩"],
  [/consumer.*group/i, "Consumer Group 与分区分配"],
  [/consumer.*offset|offsets.*topic/i, "Offset 存储与消费进度"],
  [/producer.*batch/i, "Producer 批量发送、压缩与顺序边界"],
  [/producer.*partition/i, "Producer 分区选择与同 Key 顺序"],
  [/idempotence|transaction/i, "幂等写入与事务语义"],
  [/kraft.*bootstrap/i, "KRaft 启动、元数据日志与调试"],
  [/kraft.*metadata/i, "KRaft 元数据仲裁"],
  [/leader.*epoch/i, "Leader Epoch 与截断检测"],
  [/log.*segment|segment.*offset/i, "日志段与 Offset 查找"],
  [/lag.*monitor/i, "Consumer Lag 监控与定位"],
  [/connect.*distributed/i, "Kafka Connect 分布式运行时"],
  [/geo.*replication|mirrormaker/i, "跨集群复制与 MirrorMaker 2"],
  [/streams.*state/i, "Kafka Streams 有状态处理"],
  [/broker.*storage/i, "Broker 存储与网络路径"],
  [/replication.*durability/i, "副本复制与持久性"],
  [/security.*acl|quota/i, "ACL、Quota 与多租户治理"],

  [/execution.*model/i, "执行模型"],
  [/rdd.*dataframe.*dataset/i, "RDD、DataFrame 与 Dataset"],
  [/shuffle.*persistence|shuffle.*fault/i, "Shuffle、持久化与容错"],
  [/shuffle.*map.*output/i, "Shuffle Map 输出、拉取失败与 Stage 重提"],
  [/sql.*optimizer|aqe|joins/i, "SQL 优化器、AQE 与 Join"],
  [/logical.*physical.*explain/i, "逻辑计划、物理计划与诊断"],
  [/checkpoint.*plan/i, "Checkpoint 与计划截断"],
  [/driver.*result|collect|tolocaliterator/i, "Driver 结果面与内存边界"],
  [/shared.*variables|broadcast|accumulator/i, "Broadcast、Accumulator 与 Driver 边界"],
  [/dependency.*distribution|jars|pyfiles/i, "依赖分发与 Executor 可见性"],
  [/unified.*memory|spill|eviction/i, "统一内存、Spill 与驱逐"],
  [/structured.*streaming/i, "Structured Streaming"],
  [/watermark.*late/i, "Watermark、迟到数据与状态清理"],
  [/trigger.*micro/i, "Trigger、Micro-batch 与 AvailableNow"],
  [/stream.*join.*state/i, "流流 Join、State Store 与重启兼容"],
  [/partitioning.*repartition/i, "Repartition、Coalesce 与文件大小"],
  [/columnar.*cache/i, "列式缓存、扫描裁剪与运行时内存"],
  [/tungsten|codegen|vectorization/i, "Tungsten、Whole-stage Codegen 与向量化"],

  [/checkpointing.*backpressure/i, "背压下的 Checkpoint"],
  [/event.*time.*watermark/i, "Event Time 与 Watermark"],
  [/keyed.*state.*key.*groups/i, "Keyed State 与 Key Group"],
  [/state.*ttl/i, "State TTL、清理与 Schema 演进"],
  [/async.*io/i, "Async I/O 顺序、超时与重试"],
  [/broadcast.*state/i, "Broadcast State 与动态规则"],
  [/monitoring.*backpressure/i, "反压、Busy/Idle 与瓶颈定位"],
  [/kafka.*source.*sink/i, "Kafka Source/Sink 与端到端语义"],

  [/metastore.*catalog/i, "Metastore 与 Catalog"],
  [/architecture.*compiler|optimizer.*execution/i, "架构、编译器、优化器与执行链路"],
  [/partition.*bucketing/i, "分区、分桶与物理布局"],
  [/statistics.*cbo|cbo.*explain/i, "统计信息、CBO 与 EXPLAIN"],
  [/transactions.*compaction|acid.*lock/i, "ACID 事务、锁与 Compaction"],
  [/acid.*base.*delta/i, "ACID Base/Delta 目录与快照读取"],
  [/orc.*stripes/i, "ORC Stripe、索引与小文件合并"],
  [/llap/i, "LLAP Daemon、IO Cache 与混合执行"],
  [/hiveserver2|beeline/i, "HiveServer2、Beeline 与认证"],
  [/materialized.*views/i, "物化视图与查询重写"],
  [/dml.*load.*insert/i, "DML、LOAD DATA 与动态分区写入"],
  [/udtf|lateral.*view/i, "UDTF、LATERAL VIEW 与行展开"],

  [/metadata.*snapshots/i, "元数据与 Snapshot"],
  [/manifests.*planning/i, "Manifest 与查询规划"],
  [/write.*model.*optimistic/i, "写入模型与乐观并发"],
  [/catalog.*atomic/i, "Catalog 原子指针切换与锁边界"],
  [/row.*level.*changes|delete.*files/i, "行级变更与 Delete File"],
  [/partition.*evolution/i, "分区演进与隐藏分区"],
  [/schema.*evolution.*field/i, "Schema 演进与 Field ID"],
  [/branch.*tag|time.*travel/i, "Branch、Tag 与 Time Travel"],
  [/metadata.*retention|orphan/i, "元数据保留、孤儿文件与清理安全"],
  [/scan.*planning/i, "扫描规划、Manifest Summary 与裁剪"],

  [/overview/i, "整体定位与技术边界"],
  [/architecture/i, "架构分层与角色协作"],
  [/core.*objects/i, "核心对象与状态所有权"],
  [/read.*path/i, "读取路径与可见性边界"],
  [/write.*path/i, "写入路径与提交边界"],
  [/metadata.*state/i, "元数据与状态管理"],
  [/partition.*layout/i, "分区、布局与并行度模型"],
  [/consistency.*boundaries/i, "一致性边界与不保证事项"],
  [/fault.*recovery|failure.*recovery/i, "故障恢复与状态重建"],
  [/performance.*model|performance.*tuning/i, "性能模型与瓶颈定位"],
  [/tuning/i, "调优方法与取舍边界"],
  [/observability/i, "可观测性与诊断入口"],
  [/troubleshooting/i, "生产排障路径"],
  [/security.*governance/i, "安全治理与权限边界"],
  [/resource.*governance/i, "资源治理与多租户边界"],
  [/system.*design/i, "系统设计取舍"],
  [/comparison/i, "相邻系统对比与选型边界"],
  [/lifecycle/i, "生命周期与状态演进"],
  [/maintenance.*services/i, "后台服务与维护任务"],
  [/release.*quality/i, "发布质量与校验清单"]
];


const titleOverrides = {
  "flink/broadcast-state-pattern-dynamic-rules-and-determinism": "Broadcast State \u4e0e\u52a8\u6001\u89c4\u5219",
  "flink/dynamic-tables-continuous-queries-and-changelog-encodings": "Dynamic Table \u4e0e Changelog",
  "flink/execution-mode-batch-streaming-and-boundedness": "\u6279\u6d41\u6267\u884c\u6a21\u5f0f\u4e0e\u6709\u754c\u6027",
  "flink/operator-state-and-broadcast-state": "Operator/Broadcast State",
  "flink/process-function-timers-and-low-level-control-boundaries": "ProcessFunction \u4e0e Timer",
  "flink/restart-strategy-and-failover": "\u91cd\u542f\u7b56\u7565\u4e0e\u6545\u969c\u63a5\u7ba1",
  "flink/state-backends-savepoints-recovery": "State Backend \u4e0e Savepoint",
  "flink/state-checkpoint-exactly-once": "State Checkpoint EOS",
  "flink/window-join-interval-join-and-time-boundaries": "Window/Interval Join",
  "flink/windows-triggers-allowed-lateness-and-late-firing": "Window Trigger Late Firing",
  "hive/hive-on-tez-dag-mrr-mpj-and-pipelined-execution": "Hive on Tez \u4e0e DAG \u6267\u884c",
  "hive/managed-external-and-temporary-tables": "Managed\u3001External \u4e0e\u4e34\u65f6\u8868",
  "hive/metastore-cachedstore-notification-and-metadata-drift-boundaries": "Metastore \u7f13\u5b58\u4e0e\u5143\u6570\u636e\u6f02\u79fb",
  "hive/metastore-embedded-remote-standalone-and-schema-governance": "Metastore \u90e8\u7f72\u4e0e Schema \u6cbb\u7406",
  "hive/predicate-pushdown-outer-join-storage-pushdown-and-vectorization-observability": "\u8c13\u8bcd\u4e0b\u63a8\u4e0e\u5411\u91cf\u5316\u89c2\u6d4b",
  "hive/serde-inputformat-outputformat-objectinspector-and-row-format-boundaries": "SerDe \u4e0e InputFormat",
  "hive/vectorization-and-join-optimization": "\u5411\u91cf\u5316\u4e0e Join \u4f18\u5316",
  "iceberg/scan-planning-persistent-tree-manifest-summaries-and-pruning": "\u626b\u63cf\u89c4\u5212\u4e0e Manifest \u88c1\u526a",
  "iceberg/spark-merge-overwrite-distribution-and-file-size-boundaries": "Spark \u5199\u5165\u4e0e\u6587\u4ef6\u5e03\u5c40",
  "iceberg/spark-write-path-and-sql-operations": "Spark \u5199\u5165\u4e0e SQL \u64cd\u4f5c",
  "spark/closure-serialization-local-vs-cluster-and-mutable-state-traps": "\u95ed\u5305\u5e8f\u5217\u5316\u4e0e\u53ef\u53d8\u72b6\u6001\u9677\u9631",
  "spark/deployment-and-cluster-managers": "\u90e8\u7f72\u6a21\u5f0f\u4e0e\u96c6\u7fa4\u7ba1\u7406\u5668",
  "spark/join-algorithm-selection-broadcast-sort-merge-and-shuffled-hash": "Join \u7b97\u6cd5\u9009\u62e9",
  "spark/scheduler-stage-cut-locality-and-straggler-boundaries": "\u8c03\u5ea6\u3001\u672c\u5730\u6027\u4e0e\u6162\u4efb\u52a1\u8fb9\u754c",
  "spark/shared-variables-and-driver-boundaries": "\u5171\u4eab\u53d8\u91cf\u4e0e Driver \u8fb9\u754c",
  "spark/shuffle-map-output-fetch-failure-and-stage-resubmit-boundaries": "Shuffle \u62c9\u53d6\u5931\u8d25\u4e0e Stage \u91cd\u63d0",
  "spark/trigger-micro-batch-continuous-available-now-and-foreach-batch-boundaries": "Trigger \u4e0e Micro-batch \u8fb9\u754c",
  "spark/tungsten-whole-stage-codegen-off-heap-and-vectorization": "Tungsten Codegen"
};

const objectRoleOverrides = {
  kafka: {
    Topic: "逻辑事件流命名空间，承载配置、保留策略和分区集合",
    Partition: "追加写日志分片，是并行度、顺序性和 offset 空间的基本单位",
    Broker: "承载分区副本、处理 produce/fetch 请求并参与控制面状态维护",
    "Leader Replica": "分区当前读写入口，决定生产写入和消费者读取的主路径",
    "Follower Replica": "从 leader 拉取日志并参与 ISR 与故障恢复",
    ISR: "与 leader 保持同步的副本集合，是 acks=all 与 min.insync.replicas 的核心边界",
    Producer: "按元数据、分区器、批量和确认策略写入记录",
    Consumer: "按分区和 offset 拉取记录，并维护本地 position",
    "Consumer Group": "把分区分配给组内成员，实现并行消费和故障接管",
    Coordinator: "管理组成员、offset 提交和重平衡相关状态",
    Offset: "分区内逻辑位置，区分当前 position、committed offset 和业务处理进度",
    Segment: "分区日志的物理文件单位，影响查找、保留和压缩清理"
  },
  spark: {
    Driver: "应用控制面，构建计划、提交 job、跟踪 stage/task 并接收结果",
    Executor: "应用执行面，运行 task、缓存数据、写 shuffle 并汇报状态",
    Application: "一次 SparkContext/SparkSession 驱动的隔离运行单元",
    Job: "由 action 触发的执行单元，包含完成该 action 所需的 task",
    Stage: "按 shuffle 边界切分的调度阶段",
    Task: "在单个分区上执行的最小调度单元",
    RDD: "带 partitions、dependencies、compute function 和 locality 信息的执行抽象",
    DataFrame: "带 schema 的 Dataset，是现代 Spark SQL 优化的主要入口",
    Dataset: "逻辑计划载体，action 触发优化和物理执行",
    DAG: "由依赖关系组成的执行图，决定 stage 切分和失败重算边界",
    Shuffle: "跨分区重分布数据的高成本边界",
    Cache: "性能优化手段，不等于持久化正确性保证",
    Checkpoint: "截断 lineage 或保存流式状态的恢复边界"
  },
  flink: {
    JobManager: "作业控制面，负责图转换、调度、checkpoint 协调和故障恢复",
    TaskManager: "执行面进程，提供 slot 并运行 task",
    Slot: "资源分配单位，影响并行度和资源隔离",
    JobGraph: "用户程序转换后的逻辑执行图",
    ExecutionGraph: "可调度的运行时图，包含并行子任务和执行状态",
    Operator: "流处理逻辑单元，负责转换、聚合、窗口或状态访问",
    "Keyed State": "按 key group 分布的状态，是恢复和 rescale 的核心对象",
    "Operator State": "与算子并行实例绑定的状态",
    Checkpoint: "一致性快照，用于失败恢复",
    Savepoint: "人工触发且可用于升级迁移的状态快照",
    Watermark: "事件时间进展标记，影响窗口触发和状态清理",
    Window: "按时间或计数组织有界计算范围"
  },
  hive: {
    HiveServer2: "SQL 服务入口，处理连接、认证、会话和查询提交",
    Metastore: "表、分区、列、位置、统计信息和事务元数据的控制面",
    Database: "库级命名空间",
    Table: "表语义入口，连接 schema、存储位置和文件格式",
    Partition: "按列值组织数据目录，是裁剪扫描范围的主要手段",
    Bucket: "按 hash 分桶的物理组织方式，影响采样和部分 join 优化",
    SerDe: "序列化/反序列化边界，决定文件字节如何解释成行列",
    InputFormat: "读取文件切分和 record 的接口",
    OutputFormat: "写出文件的接口",
    ORC: "列式文件格式，提供 stripe、索引、压缩和谓词下推能力",
    Tez: "常用执行引擎，把 SQL 计划转换成 DAG 执行",
    Compaction: "ACID 表维护 base/delta 布局和读放大的后台任务"
  },
  iceberg: {
    Catalog: "当前表元数据指针的权威入口",
    "Metadata File": "记录 schema、partition spec、snapshot log 和当前 snapshot 的元数据文件",
    Snapshot: "一次表状态，描述某版本可见的数据文件集合",
    "Manifest List": "某个 snapshot 下 manifest 文件的索引",
    Manifest: "记录数据文件和 delete file 元数据，支持规划和裁剪",
    "Data File": "真正存放业务数据的文件",
    "Delete File": "行级删除语义载体，读取时需要与数据文件合并解释",
    "Partition Spec": "分区规则版本，可随表演进",
    "Schema Field ID": "字段身份标识，支撑安全 schema 演进",
    "Sort Order": "表级排序语义，用于写入布局和扫描优化"
  }
};

const sourceRows = fs.existsSync(sourcesFile) ? yaml.load(fs.readFileSync(sourcesFile, "utf8")) : [];
const claimRows = loadClaimRows();
const sourcesByComponent = groupByComponent(sourceRows);
const claimsByComponent = groupByComponent(claimRows);

let changed = 0;
changed += fixCategoryFiles();

for (const component of fs.readdirSync(docsRoot).sort()) {
  const componentDir = path.join(docsRoot, component);
  if (!fs.statSync(componentDir).isDirectory()) continue;
  const profile = componentProfiles[component];
  if (!profile) continue;

  for (const name of fs.readdirSync(componentDir).filter((item) => item.endsWith(".md")).sort()) {
    const file = path.join(componentDir, name);
    const original = fs.readFileSync(file, "utf8");
    const parsed = parseMarkdown(original);
    if (!parsed) continue;

    const topic = String(parsed.data.topic || path.basename(name, ".md"));
    const updatedData = normalizeFrontmatter(parsed.data, component, topic, name, profile);
    const body = buildBody({ component, topic, fileName: name, data: updatedData, profile });
    const next = `---\n${yaml.dump(updatedData, { lineWidth: 120, noRefs: true, sortKeys: false }).trim()}\n---\n${body}\n`;
    if (next !== original) {
      fs.writeFileSync(file, next, "utf8");
      changed += 1;
    }
  }
}

console.log(JSON.stringify({ changed }, null, 2));

function fixCategoryFiles() {
  let updates = 0;
  const rootCategory = path.join(docsRoot, "_category_.json");
  if (fs.existsSync(rootCategory)) {
    const next = {
      label: "大数据",
      position: 20,
      link: {
        type: "generated-index",
        title: "大数据知识库",
        description: "覆盖 Kafka、Spark、Flink、Hive、Iceberg、HDFS、HBase、ClickHouse、Delta Lake、Hudi、Trino 与 YARN 的核心机制、生产边界和排障路径。"
      }
    };
    updates += writeJsonIfChanged(rootCategory, next);
  }

  for (const [component, profile] of Object.entries(componentProfiles)) {
    const file = path.join(docsRoot, component, "_category_.json");
    if (!fs.existsSync(file)) continue;
    let current = {};
    try {
      current = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      current = {};
    }
    const next = {
      label: profile.label,
      position: current.position ?? categoryPositions[component],
      link: {
        type: "generated-index",
        title: profile.label,
        description: categoryDescriptions[component]
      }
    };
    updates += writeJsonIfChanged(file, next);
  }

  return updates;
}

function writeJsonIfChanged(file, data) {
  const next = `${JSON.stringify(data, null, 2)}\n`;
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (current === next) return 0;
  fs.writeFileSync(file, next, "utf8");
  return 1;
}

function loadClaimRows() {
  const rows = [];
  if (!fs.existsSync(claimsDir)) return rows;
  for (const file of fs.readdirSync(claimsDir).filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))) {
    const parsed = yaml.load(fs.readFileSync(path.join(claimsDir, file), "utf8"));
    if (Array.isArray(parsed)) rows.push(...parsed);
  }
  return rows;
}

function groupByComponent(rows) {
  const out = new Map();
  for (const row of rows || []) {
    if (!row?.component || !row?.id) continue;
    if (!out.has(row.component)) out.set(row.component, []);
    out.get(row.component).push(row.id);
  }
  return out;
}

function parseMarkdown(content) {
  const match = content.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  return {
    data: yaml.load(match[1]) ?? {},
    body: content.slice(match[0].length)
  };
}

function normalizeFrontmatter(data, component, topic, fileName, profile) {
  const sourceCandidates = sourcesByComponent.get(component) || [];
  const claimCandidates = claimsByComponent.get(component) || [];
  const sourceIds = unique([...(Array.isArray(data.source_ids) ? data.source_ids : []), ...sourceCandidates]).slice(0, 8);
  const claimIds = unique([...(Array.isArray(data.claim_ids) ? data.claim_ids : []), ...claimCandidates]).slice(0, 10);
  const ordered = {};
  const fieldOrder = [
    "kb_id",
    "title",
    "description",
    "domain",
    "component",
    "topic",
    "difficulty",
    "status",
    "sidebar_position",
    "version_scope",
    "last_verified_at",
    "source_ids",
    "claim_ids",
    "tags"
  ];

  const clean = { ...data };
  clean.title = `${profile.label} ${topicTitle(topic, fileName, component)}`;
  clean.description = buildDescription(component, topic, fileName, profile);
  clean.domain = "bigdata";
  clean.component = component;
  clean.topic = topic;
  clean.status = clean.status || "reviewed";
  clean.source_ids = sourceIds;
  clean.claim_ids = claimIds.length ? claimIds : Array.isArray(data.claim_ids) ? data.claim_ids : [];
  clean.tags = unique([...(Array.isArray(data.tags) ? data.tags : []), "knowledge-base", "production"]);
  if (clean.last_verified_at instanceof Date) clean.last_verified_at = clean.last_verified_at.toISOString().slice(0, 10);

  for (const field of fieldOrder) {
    if (field in clean) ordered[field] = clean[field];
  }
  for (const [key, value] of Object.entries(clean)) {
    if (!(key in ordered)) ordered[key] = value;
  }
  return ordered;
}

function buildDescription(component, topic, fileName, profile) {
  const normalized = `${component} ${topic} ${fileName}`.toLowerCase();
  const topicLabel = topicTitle(topic, fileName, component);
  if (/read|scan|query|planning|explain/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}如何定位数据、裁剪扫描、并行执行和返回结果，并说明可见性、性能证据与排障入口。`;
  }
  if (/write|commit|producer|insert|merge|upsert|transaction/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}如何接收写入、更新状态、完成提交和暴露结果，并说明失败恢复与幂等边界。`;
  }
  if (/state|checkpoint|savepoint|offset|snapshot|metadata|catalog|metastore|timeline/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。`;
  }
  if (/fault|fail|recovery|restart|ha|quorum|replica|rebalance/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}如何发现故障、隔离影响、重建状态和恢复服务，并说明生产验证与风险边界。`;
  }
  if (/performance|tuning|memory|shuffle|backpressure|lag|bottleneck|optimization/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}的性能瓶颈来源、关键指标、调优顺序和验证方法，避免只靠参数猜测。`;
  }
  if (/security|governance|resource|queue|acl|quota/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}中的权限、资源、隔离、审计和多租户边界，并给出生产治理判断路径。`;
  }
  if (/comparison|design|scenario|architecture|overview/.test(normalized)) {
    return `解释 ${profile.label} ${topicLabel}的定位、对象、链路、适用场景和相邻系统边界，用于建立系统化知识框架。`;
  }
  return `解释 ${profile.label} ${topicLabel}的核心对象、执行链路、状态边界、性能模型和生产排障方法。`;
}

function topicTitle(topic, fileName, component) {
  const normalized = String(topic || path.basename(fileName, ".md")).toLowerCase();
  const overrideKey = component ? `${component}/${path.basename(fileName, ".md")}` : "";
  if (overrideKey && titleOverrides[overrideKey]) return titleOverrides[overrideKey];
  const source = `${normalized} ${String(fileName || "").toLowerCase()}`;
  for (const [pattern, value] of topicTitleRules) {
    if (pattern.test(source)) return value;
  }
  if (titleByTopic[normalized]) return titleByTopic[normalized];
  for (const [key, value] of Object.entries(titleByTopic)) {
    if (normalized.includes(key)) return value;
  }
  return humanizeTopic(normalized);
}

function humanizeTopic(value) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

function buildBody({ component, topic, fileName, data, profile }) {
  const focus = inferFocus(`${topic} ${fileName} ${data.title || ""}`);
  const topicLabel = topicTitle(topic, fileName, component);
  const sourceList = (data.source_ids || []).map((id) => `\`${id}\``).join("、") || "当前页面元数据中的官方来源";
  const claimList = (data.claim_ids || []).slice(0, 8).map((id) => `\`${id}\``).join("、") || "当前页面元数据中的事实声明";

  return `
## 解决什么问题

${profile.label} 的本质定位是：${profile.positioning}

本页聚焦“${topicLabel}”。学习这一页时，应先把主题放回 ${profile.label} 的真实运行路径中：哪些对象拥有状态，哪些对象只负责执行，哪些边界由本组件保证，哪些边界必须依赖外部系统或调用方配合。${focus}

### 不适合混淆的边界

${profile.boundary}

如果把这些边界混在一起，常见后果是：把性能症状当成根因，把执行层问题误判为存储层问题，或者把上层业务语义误认为组件自身已经保证。

## 核心对象

| 对象 | 在本组件中的作用 | 观察重点 |
| --- | --- | --- |
${profile.objects.map((item, index) => `| ${item} | ${objectRole(component, profile, item, index)} | ${objectObserveHint(component, item)} |`).join("\n")}

### 对象之间的关系

${profile.objectNotes.map((item) => `- ${item}`).join("\n")}

这些对象不应孤立记忆。更可靠的理解方式是把它们放到“请求进入、状态变化、结果可见、失败恢复”这条链路中：入口对象负责接收请求，控制面对象负责计划或协调，数据面对象负责读写或计算，元数据对象负责描述可见状态，维护任务负责修正长期运行后的物理布局或状态漂移。

## 核心机制

### 写入或提交路径

${profile.writePath}

写入路径需要重点检查三件事：第一，请求在进入组件后由谁接管；第二，哪些状态会被同步写入或异步维护；第三，客户端看到成功时，哪些结果已经具备可见性，哪些后台工作只是后续优化。

### 读取或执行路径

${profile.readPath}

读取路径要避免只看 API 名称。更完整的链路是：先确定元数据或调度入口，再确定数据切分方式，然后分析执行单元如何读取、过滤、聚合、返回结果。对分析型系统尤其要关注裁剪能力、并行度、网络传输和内存边界。

### 状态变化主线

${profile.stateBoundary}

状态变化通常分为控制面状态、数据面状态、元数据状态和外部依赖状态。生产环境中的故障定位必须先判断状态属于哪一层，再决定看日志、指标、执行计划、文件布局还是元数据。

## 主题展开：${topicLabel}

### 主题切入点

${buildTopicNarrative(component, topic, profile)}

### 本页需要串起来的链路

${buildTopicSteps(component, topic, profile).map((item, index) => `${index + 1}. ${item}`).join("\n")}

### 常见误判

1. 只看单个参数，不看它影响的是控制面、数据面还是资源面。
2. 只看平均吞吐，不看长尾延迟、失败恢复时间和后台维护积压。
3. 只看组件内部状态，不看外部存储、调度系统、权限系统和调用方幂等性。
4. 只看当前成功路径，不看重启、扩缩容、版本升级和并发写入后的边界。

## 性能模型

${profile.performance}

### 判断顺序

1. 先判断瓶颈是 CPU、内存、磁盘、网络、元数据、锁/协调、后台维护还是外部系统。
2. 再判断瓶颈是全局问题、单节点问题、单分区问题、单表问题、单任务问题还是单请求问题。
3. 最后才选择调参、扩容、改布局、改访问模式、改并行度或拆分负载。

性能优化必须建立在证据上。没有基线指标时，不应直接修改核心参数；没有对照实验时，也不应把一次短期改善当成稳定收益。

## 一致性、容错与边界

${profile.stateBoundary}

### 需要明确的边界

1. 组件内保证：由 ${profile.label} 自身机制直接提供的状态、执行或可见性语义。
2. 外部系统保证：由底层存储、调度平台、权限系统、catalog、消息系统或计算引擎提供的能力。
3. 调用方责任：重试、幂等、事务补偿、数据校验、版本变更和业务语义对齐。
4. 运维责任：容量规划、监控告警、备份恢复、升级验证和变更审计。

## 生产排障

### 观察入口

${profile.troubleshooting.map((item) => `- \`${item}\``).join("\n")}

### 排障路径

1. 先确认影响面：全局、单组件、单节点、单任务、单表、单分区或单用户。
2. 再确认最近变化：版本、配置、资源、数据量、schema、权限、依赖服务或访问模式。
3. 然后收集证据：日志、指标、执行计划、元数据、文件布局、队列状态和错误码。
4. 最后处理根因：限流、扩容、回滚、重试、修复元数据、调整布局、清理积压或改造上层调用。

## 可执行示例

下面示例用于建立最小化观察入口。生产环境执行前需要替换集群地址、库表名、路径和权限上下文。

\`\`\`${profile.exampleLang}
${profile.example}
\`\`\`

## 设计取舍

${profile.governance}

### 设计时必须提前决定

1. 数据规模和增长速度：决定分区、文件、队列、状态或资源模型是否会快速膨胀。
2. 读写比例和延迟目标：决定选择吞吐优先、低延迟优先还是恢复速度优先。
3. 失败恢复目标：决定副本、checkpoint、snapshot、日志保留、重试和回滚策略。
4. 多租户边界：决定队列、权限、资源组、quota、catalog、命名空间和审计策略。
5. 变更策略：决定 schema 演进、版本升级、任务重启、数据回放和兼容性验证方式。

## 来源与事实边界

本页只使用当前知识库已登记的来源和事实声明作为边界，重点解释稳定机制，不把具体集群的默认值当成跨版本事实。

### 来源

${sourceList}

### 事实声明

${claimList}
`.trimStart();
}

function objectRole(component, profile, item, index) {
  const override = objectRoleOverrides[component]?.[item];
  if (override) return override;
  const roles = [
    "承载或描述核心状态",
    "连接控制面与数据面",
    "决定并行度、可见性或恢复范围",
    "影响读写路径和性能上限",
    "用于生产诊断和治理闭环"
  ];
  return `${profile.label} 中${roles[index % roles.length]}`;
}

function objectObserveHint(component, item) {
  const name = String(item).toLowerCase();
  if (component === "kafka" && /partition|offset|segment|isr|replica/.test(name)) return "offset、leader、ISR、lag、segment、保留策略";
  if (component === "spark" && /driver|executor|stage|task|shuffle/.test(name)) return "Spark UI、stage 时间、task 分布、shuffle、spill、executor 日志";
  if (component === "flink" && /state|checkpoint|watermark|slot|operator/.test(name)) return "checkpoint 时长、状态大小、watermark lag、backpressure、subtask 分布";
  if (component === "hive" && /metastore|partition|orc|tez|compaction/.test(name)) return "Metastore、EXPLAIN、分区数量、文件数量、Tez DAG、compaction 状态";
  if (component === "iceberg" && /snapshot|manifest|catalog|delete|metadata/.test(name)) return "metadata tables、snapshot log、manifest 数量、delete file、catalog 指针";
  if (component === "hdfs" && /namenode|datanode|block|replica|journal/.test(name)) return "NameNode UI、fsck、block report、DataNode 日志、HA 状态";
  if (component === "hbase" && /region|wal|memstore|hfile|compaction/.test(name)) return "Region 热点、WAL 延迟、MemStore、HFile 数量、compaction 队列";
  if (component === "hudi" && /timeline|file|slice|compaction|clustering/.test(name)) return "timeline、instant 状态、file group、compaction/clustering backlog";
  if (component === "delta-lake" && /log|checkpoint|file|snapshot|concurrency/.test(name)) return "_delta_log、checkpoint、history、文件数量、冲突异常";
  if (component === "clickhouse" && /part|merge|mark|replica|mutation/.test(name)) return "system.parts、system.merges、system.mutations、query_log、replication_queue";
  if (component === "trino" && /split|stage|task|exchange|memory/.test(name)) return "Query UI、stage/task 分布、blocked reason、exchange、memory pool";
  if (component === "yarn" && /resource|node|application|container|queue/.test(name)) return "RM UI、队列指标、container 日志、NodeManager 状态";
  return "状态归属、生命周期、失败影响、与相邻对象的交互";
}

function buildTopicSteps(component, topic, profile) {
  const normalized = `${component} ${topic}`.toLowerCase();
  if (/read|scan|query|planning|explain/.test(normalized)) {
    return [
      "入口：从 SQL、API、consumer fetch、scan 或查询请求进入系统。",
      "规划：读取元数据、分区、索引、manifest、split 或执行计划，先确定扫描范围。",
      "执行：并行读取数据块、文件、segment、part、split 或 task 分片，并在本地完成过滤、解码、聚合或传输。",
      "返回：区分部分结果、最终结果、事务可见结果和客户端消费进度。",
      "诊断：用执行计划、扫描量、裁剪率、I/O、网络、内存和长尾任务判断瓶颈。"
    ];
  }
  if (/write|commit|producer|insert|merge|upsert|transaction/.test(normalized)) {
    return [
      "入口：写入请求携带数据、key、schema、分区信息或事务上下文进入系统。",
      "定位：根据元数据、分区规则、索引、leader、file group 或目标表状态确定写入位置。",
      "落地：生成日志、数据文件、内存状态、WAL、part、HFile、segment 或中间提交信息。",
      "提交：以 offset、snapshot、timeline instant、transaction log、metadata pointer 或 close 操作为可见性边界。",
      "恢复：失败后判断是否需要重试、清理未提交文件、回放日志、重建状态或处理幂等。"
    ];
  }
  if (/state|checkpoint|savepoint|offset|snapshot|metadata|catalog|metastore|timeline/.test(normalized)) {
    return [
      "事实源：先确认权威状态位于 broker、metastore、catalog、metadata file、timeline、checkpoint 还是控制面服务。",
      "缓存层：区分客户端缓存、服务端缓存、执行时状态和持久化状态。",
      "更新路径：分析状态由谁写入、何时刷新、是否异步传播、失败后是否可重放。",
      "可见性：判断读者看到的是哪个版本、哪个 offset、哪个 snapshot 或哪个 checkpoint。",
      "校验：用元数据表、命令行、UI、日志和指标交叉确认状态是否一致。"
    ];
  }
  if (/fault|fail|recovery|restart|ha|quorum|replica|rebalance/.test(normalized)) {
    return [
      "检测：通过心跳、超时、leader 变化、checkpoint 失败、task 失败或副本落后发现异常。",
      "隔离：判断影响范围是节点、分区、队列、应用、表、作业还是单个请求。",
      "接管：由 leader election、rebalance、AM 重启、NameNode HA、task retry 或 snapshot 恢复接管工作。",
      "重建：通过日志、checkpoint、snapshot、replica、lineage 或 metadata 恢复状态。",
      "复核：确认数据可见性、重复处理、丢失风险、积压和长期性能影响。"
    ];
  }
  if (/performance|tuning|memory|shuffle|backpressure|lag|bottleneck|optimization/.test(normalized)) {
    return [
      "基线：记录吞吐、延迟、扫描量、任务时长、队列等待、内存、I/O 和网络。",
      "定位：区分控制面瓶颈、数据面瓶颈、资源瓶颈、外部系统瓶颈和访问模式问题。",
      "验证：用执行计划、指标、日志、UI 和采样数据验证根因。",
      "调整：只做单变量变更，优先改布局、并行度、批量、缓存、索引或状态大小。",
      "回归：确认长尾、失败恢复、成本和资源隔离没有被新配置放大。"
    ];
  }
  return [
    "入口：确认请求、作业、SQL、后台任务或管理命令从哪里进入系统。",
    "对象：把参与对象按控制面、数据面、元数据面和外部依赖分类。",
    "链路：描述请求如何推进、状态如何变化、结果何时可见。",
    "边界：明确组件保证什么，不保证什么，以及调用方需要承担什么。",
    "证据：用指标、日志、元数据、执行计划或命令行形成可复核判断。"
  ];
}

function inferFocus(text) {
  for (const [pattern, message] of topicFocusRules) {
    if (pattern.test(text)) return message;
  }
  return "这一主题需要同时关注对象、链路、状态边界、性能证据和运维治理，不能只停留在术语层面。";
}

function buildTopicNarrative(component, topic, profile) {
  const normalized = `${component} ${topic}`.toLowerCase();
  if (/read|scan|query|planning|explain/.test(normalized)) {
    return `${profile.label} 的读取类主题，关键不是“能读到数据”这一点，而是要解释系统如何根据元数据、分区、索引、split、segment、snapshot 或执行计划缩小扫描范围，并把读取代价映射到 CPU、I/O、网络和内存。`;
  }
  if (/write|commit|transaction|producer|insert|merge|upsert/.test(normalized)) {
    return `${profile.label} 的写入类主题，关键是提交边界。需要区分写入请求被接收、数据文件或日志生成、元数据提交成功、结果对读者可见、后台维护完成这几个阶段。`;
  }
  if (/state|checkpoint|savepoint|offset|snapshot|metadata|catalog|metastore/.test(normalized)) {
    return `${profile.label} 的状态类主题，应先定位权威状态在哪里，再分析缓存状态、运行时状态和持久化状态如何同步。状态不一致时，排障优先看谁是事实来源。`;
  }
  if (/fault|fail|recovery|restart|ha|quorum|replica/.test(normalized)) {
    return `${profile.label} 的恢复类主题，要把检测故障、隔离故障、重建状态、恢复服务和校验数据分开。恢复速度和正确性通常来自不同机制，不能混为一个指标。`;
  }
  if (/performance|tuning|memory|shuffle|backpressure|lag|bottleneck/.test(normalized)) {
    return `${profile.label} 的性能类主题，应先建立指标基线，再判断瓶颈层次。直接堆资源或修改参数通常只能缓解症状，不能替代链路级定位。`;
  }
  if (/security|governance|resource|queue|acl|quota/.test(normalized)) {
    return `${profile.label} 的治理类主题，需要把身份、权限、资源、隔离、审计和成本放在同一张图里。治理不是附加能力，而是系统长期稳定运行的前置条件。`;
  }
  if (/comparison|design|scenario|architecture|overview/.test(normalized)) {
    return `${profile.label} 的架构类主题，应从定位、对象、链路、边界、失败模式和成本模型展开。选型时不要只比较单点功能，而要比较端到端运行后果。`;
  }
  return `${profile.label} 的这个主题应围绕对象、链路、状态、边界和证据展开。先讲系统在什么位置解决什么问题，再讲它通过哪些对象完成工作，最后讲生产中如何观察和治理。`;
}

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value)))];
}
