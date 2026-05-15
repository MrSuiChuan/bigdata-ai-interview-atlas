import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), "..");
const today = "2026-04-28";
const versionScope = "Apache Hadoop 3.3.5 stable HDFS docs as verified on 2026-04-28";

const sourceEntries = [
  {
    id: "hadoop-hdfs-user-guide",
    title: "Apache Hadoop HDFS Users Guide",
    kind: "official-doc",
    component: "hdfs",
    url: "https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsUserGuide.html",
    version_scope: versionScope,
    last_verified_at: today,
    trust_level: "primary",
    notes: "Use for HDFS administration commands, web UI, fsck, safemode, balancer, checkpoint node, backup node, and user-facing operational workflows.",
  },
  {
    id: "hadoop-hdfs-permissions",
    title: "Apache Hadoop HDFS Permissions Guide",
    kind: "official-doc",
    component: "hdfs",
    url: "https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsPermissionsGuide.html",
    version_scope: versionScope,
    last_verified_at: today,
    trust_level: "primary",
    notes: "Use for HDFS user/group/mode permission behavior, super-user framing, ACL-related boundaries, and security interview questions.",
  },
  {
    id: "hadoop-hdfs-ha-qjm",
    title: "Apache Hadoop HDFS High Availability with QJM",
    kind: "official-doc",
    component: "hdfs",
    url: "https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HDFSHighAvailabilityWithQJM.html",
    version_scope: versionScope,
    last_verified_at: today,
    trust_level: "primary",
    notes: "Use for active/standby NameNode, shared edits through Quorum Journal Manager, ZooKeeper failover controller, fencing, and HA limits.",
  },
  {
    id: "hadoop-hdfs-default-config",
    title: "Apache Hadoop hdfs-default.xml",
    kind: "official-doc",
    component: "hdfs",
    url: "https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/hdfs-default.xml",
    version_scope: versionScope,
    last_verified_at: today,
    trust_level: "primary",
    notes: "Use for configuration names and tuning boundaries. Do not memorize defaults without checking the running cluster version.",
  },
];

const claimEntries = [
  {
    id: "bigdata-hdfs-claim-0002",
    statement: "HDFS 把命名空间、文件到 block 的映射、复制决策等元数据集中在 NameNode，把真实 block replica 存在 DataNode；客户端先向 NameNode 取元数据，再直接和 DataNode 传输数据。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0003",
    statement: "NameNode 维护 namespace 和 block map，并处理 open、close、rename 等命名空间操作；DataNode 负责读写请求以及按 NameNode 指令创建、删除、复制 block。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0004",
    statement: "HDFS 的读路径以元数据查找和数据流分离为核心：客户端从 NameNode 获得 block 位置后，优先选择更近的 replica 从 DataNode 读取。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0005",
    statement: "HDFS 的写路径以单写者、block 分配和 DataNode pipeline 为核心，常见复制因子为 3 时会同时考虑本地性、跨 rack 容灾和写入成本。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0006",
    statement: "HDFS 面向大文件、流式访问和高吞吐批处理场景设计，不应被解释成低延迟随机更新文件系统。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0007",
    statement: "FsImage 保存命名空间快照，EditLog 记录元数据变更；checkpoint 的价值是把 edits 合并进新的 FsImage，控制重启恢复成本。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0008",
    statement: "DataNode 通过 Heartbeat 和 Blockreport 向 NameNode 汇报状态；NameNode 可据此判断 DataNode 存活、block 分布和副本修复需求。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0009",
    statement: "NameNode 启动时会进入 Safemode；在满足可安全复制 block 的阈值之前，不会进行 block 复制，退出后才处理欠复制 block。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0010",
    statement: "HDFS 的 rack-aware replica placement 在可靠性、跨 rack 网络成本和读取可用性之间折中，不能简单说副本越分散越好。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0011",
    statement: "Balancer、fsck、dfsadmin report、safemode、decommission 等工具属于 HDFS 运维面，面试排障时应先定位元数据、block、副本、DataNode 和网络层面的归属。",
    source_ids: ["hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0012",
    statement: "Secondary NameNode 不是热备 NameNode，它的主要作用是周期性合并 FsImage 和 EditLog，不能替代 HA 故障切换。",
    source_ids: ["hadoop-hdfs-user-guide", "hadoop-hdfs-ha-qjm"],
  },
  {
    id: "bigdata-hdfs-claim-0013",
    statement: "QJM 模式下的 HDFS HA 通过 active/standby NameNode、JournalNode 共享 edits、ZooKeeper Failover Controller 和 fencing 降低 NameNode 单点故障风险。",
    source_ids: ["hadoop-hdfs-ha-qjm"],
  },
  {
    id: "bigdata-hdfs-claim-0014",
    statement: "HDFS 权限模型围绕 owner、group、mode 等文件系统访问控制展开；安全治理还需要结合认证、代理用户、审计和上层引擎权限边界理解。",
    source_ids: ["hadoop-hdfs-permissions"],
  },
  {
    id: "bigdata-hdfs-claim-0015",
    statement: "HDFS 小文件问题的本质通常是 NameNode 元数据和调度开销被大量文件、block、目录项放大，而不是 DataNode 磁盘容量不足。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0016",
    statement: "HDFS 性能分析应区分 NameNode RPC、DataNode 磁盘、网络、block 大小、副本数、数据本地性和上层计算框架访问模式。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-default-config"],
  },
  {
    id: "bigdata-hdfs-claim-0017",
    statement: "HDFS 的一致性边界来自写一次读多次、追加和截断能力、单写者约束以及 close/metadata 更新时机，不能套用通用 POSIX 文件系统心智模型。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0018",
    statement: "HDFS 设计题应从数据规模、文件大小、访问模式、容错目标、机架拓扑、计算本地性、权限和运维工具链一起做取舍。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0019",
    statement: "HDFS 观测指标要把 NameNode web UI、dfsadmin report、fsck、DataNode 日志和上层任务失败信息串起来，单看剩余容量不足以定位问题。",
    source_ids: ["hadoop-hdfs-user-guide"],
  },
  {
    id: "bigdata-hdfs-claim-0020",
    statement: "HDFS 与对象存储、HBase、Kafka 的职责边界不同：HDFS 主要解决大文件分布式存储和高吞吐读取，不负责低延迟随机写、消息顺序消费或表级索引查询。",
    source_ids: ["hadoop-hdfs-design"],
  },
  {
    id: "bigdata-hdfs-claim-0021",
    statement: "面试回答 HDFS 时，最有区分度的表达是把对象、状态、请求链路、故障恢复和设计取舍串起来，而不是罗列 NameNode、DataNode、Block 三个名词。",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
  },
];

const docs = [
  {
    slug: "overview",
    topic: "overview",
    title: "HDFS 总览：它为什么是大数据存储底座，而不是普通分布式网盘",
    difficulty: "intermediate",
    order: 1,
    claim_ids: ["bigdata-hdfs-claim-0002", "bigdata-hdfs-claim-0006", "bigdata-hdfs-claim-0021"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 的核心定位是面向大文件、流式访问和高吞吐批处理的分布式文件系统；面试时要把 NameNode 元数据、DataNode block replica、客户端直连数据流、复制和故障恢复放在一条链路里讲。",
    angles: [
      "它解决的是大规模数据集在廉价机器上的可靠存储和高吞吐访问，不是低延迟随机更新。",
      "它把控制面和数据面分开：NameNode 负责元数据和决策，DataNode 承担真实数据读写。",
      "它通过 block、replica、heartbeat、block report、safemode、re-replication 形成容错闭环。",
      "它对上层计算框架的价值不是文件 API，而是数据本地性和大吞吐顺序访问。",
    ],
    chain: [
      "客户端创建或打开文件前先访问 NameNode，NameNode 校验 namespace、权限和 block 位置信息。",
      "读数据时客户端拿到 block locations 后直接连 DataNode，失败时切换到其他 replica。",
      "写数据时 NameNode 选择 DataNode pipeline，客户端把数据包推入 pipeline，副本写入后逐级确认。",
      "DataNode 周期性上报 Heartbeat 和 Blockreport，NameNode 用这些状态做存活判断和副本修复。",
    ],
    boundaries: [
      "适合大文件和顺序吞吐，不适合大量小文件和频繁随机覆盖写。",
      "NameNode 不是数据转发节点，真实文件内容不会经过 NameNode。",
      "Secondary NameNode 不是热备；高可用需要专门的 HA 架构。",
    ],
    mistakes: [
      "只背 NameNode、DataNode、Block，不解释状态归属和请求链路。",
      "把 HDFS 当成普通文件系统，忽略写一次读多次和高吞吐目标。",
      "把副本数等同于绝对可靠，忽略 rack、磁盘、网络和 NameNode 元数据风险。",
    ],
  },
  {
    slug: "core-objects-state",
    topic: "core-objects-state",
    title: "HDFS 核心对象与状态：NameNode、DataNode、Block、Replica 到底各管什么",
    difficulty: "intermediate",
    order: 2,
    claim_ids: ["bigdata-hdfs-claim-0002", "bigdata-hdfs-claim-0003", "bigdata-hdfs-claim-0008"],
    source_ids: ["hadoop-hdfs-design"],
    conclusion: "HDFS 的对象不能按名词背，要按状态所有权理解：NameNode 管 namespace 和 block map，DataNode 管本地 block replica，Client 负责发起元数据请求和实际数据流。",
    angles: [
      "NameNode 的核心状态包括目录树、文件属性、文件到 block 的映射、副本位置和复制决策。",
      "DataNode 的状态来自本地磁盘上的 block 文件、心跳、block report、磁盘容量和失败信息。",
      "Block 是文件拆分后的存储单位，Replica 是 block 在不同 DataNode 上的物理副本。",
      "Client 不是旁观者，它会根据 NameNode 返回的位置直接参与读写链路。",
    ],
    chain: [
      "NameNode 收到客户端请求后先处理 namespace 语义，例如 open、create、rename、delete。",
      "涉及数据读写时，NameNode 返回 block 位置或分配写入 pipeline，而不是转发数据。",
      "DataNode 接收客户端读写请求，同时按 NameNode 指令创建、删除、复制 block。",
      "心跳说明 DataNode 是否在线，block report 说明它持有哪些 block，二者共同驱动副本管理。",
    ],
    boundaries: [
      "NameNode 持有全局元数据，因此小文件和超大 namespace 会放大它的内存与 RPC 压力。",
      "DataNode 不理解 HDFS 文件语义，只知道本地 block 文件和校验相关信息。",
      "Block 大小和副本数是文件级存储行为的重要参数，但不能替代数据建模。",
    ],
    mistakes: [
      "说 DataNode 管理文件目录，这会混淆 namespace 和本地 block 存储。",
      "说 block 等于业务分区，这会把存储切分和计算分区混为一谈。",
      "只讲 NameNode 单点，不解释 HA、checkpoint 和 metadata 持久化边界。",
    ],
  },
  {
    slug: "architecture-and-roles",
    topic: "architecture-and-roles",
    title: "HDFS 架构与角色分工：控制面和数据面为什么必须分开讲",
    difficulty: "intermediate",
    order: 3,
    claim_ids: ["bigdata-hdfs-claim-0002", "bigdata-hdfs-claim-0003", "bigdata-hdfs-claim-0013"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-ha-qjm"],
    conclusion: "HDFS 架构的主线是 master/slave 式元数据集中管理加 DataNode 分布式存储；高质量回答要能说明为什么元数据集中简化了一致性，同时也带来 NameNode 可用性和容量边界。",
    angles: [
      "NameNode 是 namespace 仲裁者和元数据仓库，简化目录操作和 block 决策。",
      "DataNode 通常部署在存储节点上，负责真实数据块的读写、复制、删除和上报。",
      "Client 同时和 NameNode、DataNode 通信，这使数据吞吐不会被 NameNode 转发路径卡住。",
      "HA 模式引入 active/standby、共享 edits、failover controller 和 fencing，解决的是 NameNode 可用性，不改变数据面基本模型。",
    ],
    chain: [
      "命名空间请求进入 NameNode，NameNode 在内存元数据上做校验和更新。",
      "数据访问请求被拆成元数据获取和 DataNode I/O 两段。",
      "DataNode 通过心跳和 block report 把局部事实上报给 NameNode。",
      "HA 场景下 standby 通过共享 edits 追赶 active 状态，故障切换时必须确保旧 active 被隔离。",
    ],
    boundaries: [
      "集中元数据让一致性更容易，但会让 NameNode 内存、GC、RPC 和磁盘持久化变成关键资源。",
      "HA 解决 active NameNode 故障切换，不自动解决错误删除、业务误写和小文件膨胀。",
      "DataNode 数量扩展提升容量和吞吐，但 namespace 规模仍受 NameNode 约束。",
    ],
    mistakes: [
      "把 HDFS 说成完全去中心化存储。",
      "把 standby NameNode 当成实时分担读流量的普通 worker。",
      "忽略 fencing，导致脑裂风险没有被解释清楚。",
    ],
  },
  {
    slug: "metadata-state",
    topic: "metadata-state",
    title: "HDFS 元数据状态：FsImage、EditLog、Checkpoint 和 NameNode 内存压力",
    difficulty: "advanced",
    order: 4,
    claim_ids: ["bigdata-hdfs-claim-0007", "bigdata-hdfs-claim-0012", "bigdata-hdfs-claim-0015"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 元数据不是简单目录信息，而是 namespace、文件属性、block map 和持久化日志的组合；理解 FsImage、EditLog 和 checkpoint，才能讲清 NameNode 重启、恢复和小文件问题。",
    angles: [
      "FsImage 是命名空间快照，EditLog 是元数据变更日志，NameNode 启动时要合并二者形成最新内存状态。",
      "Checkpoint 的目标是把 edits 合并进新的 FsImage，降低后续启动和恢复成本。",
      "Secondary NameNode、Checkpoint Node、Backup Node 都围绕 checkpoint 工作，但不等价于 HA 热备。",
      "小文件问题会放大 inode、block map、RPC 和上层任务调度开销。",
    ],
    chain: [
      "客户端创建、删除、改名、变更副本数等操作会转成元数据变更。",
      "NameNode 把变更记录到 EditLog，并维护内存中的 namespace 和 block map。",
      "Checkpoint 节点周期性拉取 FsImage 和 EditLog，合并后上传新的 FsImage。",
      "重启时 NameNode 读取 FsImage 并回放 EditLog；EditLog 过大时恢复时间会变长。",
    ],
    boundaries: [
      "Checkpoint 降低恢复成本，不提供自动主备切换。",
      "扩容 DataNode 不能直接解决 NameNode 元数据膨胀。",
      "只看磁盘容量无法判断 NameNode 是否接近内存或 GC 边界。",
    ],
    mistakes: [
      "把 FsImage 理解成真实文件数据。",
      "把 Secondary NameNode 当成备用 NameNode。",
      "排查小文件时只看 DataNode 磁盘，而不看文件数、block 数和 NameNode 内存。",
    ],
  },
  {
    slug: "write-path",
    topic: "write-path",
    title: "HDFS 写路径：create、block 分配、pipeline 和 ack 如何串起来",
    difficulty: "advanced",
    order: 5,
    claim_ids: ["bigdata-hdfs-claim-0005", "bigdata-hdfs-claim-0010", "bigdata-hdfs-claim-0017"],
    source_ids: ["hadoop-hdfs-design"],
    conclusion: "HDFS 写入不是客户端把文件发给 NameNode，而是先由 NameNode 建立命名空间和 block 写入计划，再由客户端把数据按 packet 推入 DataNode pipeline。",
    angles: [
      "NameNode 处理 create、权限、路径、lease 和 block 分配，不承载实际数据流。",
      "DataNode pipeline 负责把数据副本沿链路写入多个节点并返回确认。",
      "常见复制因子为 3 时，放置策略会在本地性、跨 rack 容灾和写入网络成本之间折中。",
      "写路径失败要区分客户端失败、pipeline 中某个 DataNode 失败、NameNode lease/metadata 状态异常。",
    ],
    chain: [
      "Client 向 NameNode 发起 create，NameNode 校验 namespace 并授予写入。",
      "当需要新 block 时，NameNode 根据副本数、rack、存储策略和节点状态选择 DataNode。",
      "Client 将数据切成 packet 写入第一个 DataNode，第一个 DataNode 再转发给下游 DataNode。",
      "ack 从 pipeline 末端反向返回，客户端据此推进写入并最终 close 文件。",
    ],
    boundaries: [
      "HDFS 面向顺序写和追加，不适合把随机覆盖更新作为核心访问模式。",
      "增加副本数提升可靠性和读可用性，但会增加写入网络和存储成本。",
      "pipeline 写失败不等同于文件完全损坏，需要看 block、lease 和已确认副本状态。",
    ],
    mistakes: [
      "说数据经过 NameNode，暴露对控制面和数据面的误解。",
      "只说三副本可靠，不说明 rack placement 和写入成本。",
      "把 close 前后的可见性、lease 和失败恢复混成一句话。",
    ],
  },
  {
    slug: "read-path",
    topic: "read-path",
    title: "HDFS 读路径：为什么读取要先找 NameNode，再直连 DataNode",
    difficulty: "intermediate",
    order: 6,
    claim_ids: ["bigdata-hdfs-claim-0004", "bigdata-hdfs-claim-0008", "bigdata-hdfs-claim-0016"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 读路径的关键是 metadata lookup 和 data streaming 分离：NameNode 返回 block locations，客户端按距离、可用性和失败切换策略从 DataNode 拉取数据。",
    angles: [
      "NameNode 负责告诉客户端文件由哪些 block 组成，以及每个 block 的 replica 在哪些 DataNode 上。",
      "客户端通常优先选择更近的 replica，减少网络开销并利用数据本地性。",
      "读取失败时可以切换到同一 block 的其他 replica，坏块或慢节点需要结合日志和 fsck 定位。",
      "上层 Spark、MapReduce 等框架会利用 block location 做任务调度和数据本地性优化。",
    ],
    chain: [
      "Client open 文件，NameNode 返回文件状态、block 列表和位置。",
      "Client 选择一个合适的 DataNode 建立数据流。",
      "DataNode 从本地磁盘读取 block 数据并返回给客户端。",
      "遇到失败或校验问题时，客户端尝试其他 replica，同时错误信息会影响后续排障。",
    ],
    boundaries: [
      "NameNode 不转发数据，因此 NameNode RPC 慢和 DataNode 读慢是两类问题。",
      "读吞吐可能被磁盘、网络、block 分布、客户端并发和上层任务调度共同限制。",
      "replica 存在不代表一定读取快，距离、负载和坏盘都会影响实际表现。",
    ],
    mistakes: [
      "排查读慢时只看客户端机器，而不看 block location 和 DataNode 状态。",
      "把读取失败都归因于 NameNode。",
      "忽略数据本地性对批处理任务吞吐的影响。",
    ],
  },
  {
    slug: "consistency-boundaries",
    topic: "consistency-boundaries",
    title: "HDFS 一致性边界：写一次读多次、追加、截断和单写者约束",
    difficulty: "advanced",
    order: 7,
    claim_ids: ["bigdata-hdfs-claim-0006", "bigdata-hdfs-claim-0017"],
    source_ids: ["hadoop-hdfs-design"],
    conclusion: "HDFS 为高吞吐批处理放松了一些通用 POSIX 假设，核心模型更接近写一次读多次、单写者、追加和截断，而不是任意位置随机更新。",
    angles: [
      "设计目标是大数据集的流式访问，所以强调吞吐而不是低延迟交互。",
      "文件创建、写入、关闭、追加和截断的语义，要和上层任务提交、临时目录、rename 原子切换一起理解。",
      "单写者约束降低一致性复杂度，也限制了把 HDFS 当在线事务文件系统使用。",
      "读到什么取决于文件状态、客户端行为、close/flush 边界和上层协议。",
    ],
    chain: [
      "写入者创建文件并获得 lease，数据沿 pipeline 写入 block replica。",
      "写入过程中的可见性和故障恢复受客户端、lease 和 close 状态影响。",
      "任务型系统常用临时路径写出，再通过 rename 暴露最终结果。",
      "读者按 NameNode 元数据和 block locations 打开文件，而不是参与写入事务。",
    ],
    boundaries: [
      "不能把 HDFS 当支持任意随机覆盖更新的文件系统。",
      "HDFS 的 rename 常被上层用作提交边界，但要结合目录、文件系统实现和作业协议理解。",
      "一致性问题排查要同时看 writer、lease、pipeline、NameNode 元数据和上层框架提交逻辑。",
    ],
    mistakes: [
      "把 HDFS 说成完全 POSIX 兼容。",
      "忽略单写者约束和追加/截断边界。",
      "把作业提交协议问题误判成 DataNode 存储问题。",
    ],
  },
  {
    slug: "partition-layout",
    topic: "partition-layout",
    title: "HDFS Block 与副本布局：block size、replication factor、rack awareness 怎么回答",
    difficulty: "advanced",
    order: 8,
    claim_ids: ["bigdata-hdfs-claim-0005", "bigdata-hdfs-claim-0010", "bigdata-hdfs-claim-0015"],
    source_ids: ["hadoop-hdfs-design"],
    conclusion: "HDFS 的 block 和 replica 布局既影响可靠性，也影响吞吐、网络、NameNode 元数据和上层任务并行度；面试中要把 block size、replication factor 和 rack awareness 联动解释。",
    angles: [
      "Block 是 HDFS 存储切分单位，副本是容错和读取可用性的基础。",
      "Block 太小会增加 block 数和 NameNode 元数据压力，太大可能降低某些任务并行粒度。",
      "副本数越高越可靠但越占空间，写入 pipeline 和跨 rack 流量成本也更高。",
      "Rack awareness 用机架拓扑做副本放置，在节点故障、rack 故障和写入成本之间折中。",
    ],
    chain: [
      "文件写入时被切成 block，NameNode 为每个 block 选择若干 DataNode 放置 replica。",
      "常见三副本策略会优先考虑本地或同 rack、远端 rack 和远端 rack 内不同节点。",
      "DataNode 上报 block report 后，NameNode 才能持续维护全局 block map。",
      "欠复制、过复制和失衡会触发修复、删除或 balancer 相关动作。",
    ],
    boundaries: [
      "Block 不是 Hive 分区，也不是 Kafka Partition，不承载业务顺序语义。",
      "调大 block size 不能解决所有小文件问题，文件数量本身仍会压 NameNode。",
      "跨 rack 副本提升容灾，但会影响写入链路网络成本。",
    ],
    mistakes: [
      "把 block size 当成 SQL 分区参数。",
      "只说三副本，不说明为什么不是三个 rack 各放一个的固定规则。",
      "忽略小文件对 NameNode 和计算任务调度的双重影响。",
    ],
  },
  {
    slug: "fault-recovery",
    topic: "fault-recovery",
    title: "HDFS 故障恢复：Heartbeat、Blockreport、Safemode、Re-replication 与 HA",
    difficulty: "advanced",
    order: 9,
    claim_ids: ["bigdata-hdfs-claim-0008", "bigdata-hdfs-claim-0009", "bigdata-hdfs-claim-0013"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide", "hadoop-hdfs-ha-qjm"],
    conclusion: "HDFS 故障恢复不是一个机制，而是 DataNode 心跳检测、副本修复、Safemode、checkpoint、HA failover 和运维工具共同组成的恢复体系。",
    angles: [
      "DataNode 丢心跳会被 NameNode 标记为不可用，新 I/O 不应继续发给它。",
      "Blockreport 让 NameNode 知道 block 实际分布，从而发现欠复制或丢失风险。",
      "Safemode 保护 NameNode 启动阶段，等待足够 block 达到安全复制阈值。",
      "HA 解决 NameNode 进程或机器故障，但需要共享 edits、故障检测和 fencing 配合。",
    ],
    chain: [
      "DataNode 周期性发送 Heartbeat；网络分区或节点故障会导致心跳缺失。",
      "NameNode 根据 block report 和副本策略识别欠复制 block。",
      "NameNode 选择其他 DataNode 发起 re-replication，直到满足目标副本数。",
      "NameNode 故障时，HA 依赖 standby 状态追赶和 failover 控制完成切换。",
    ],
    boundaries: [
      "副本修复依赖剩余 replica；所有副本都丢失时不能凭空恢复数据。",
      "Safemode 不是故障本身，它是保护状态，要结合 block 安全比例判断。",
      "HA 不等于备份，也不能替代元数据目录、edits 和运维误操作保护。",
    ],
    mistakes: [
      "把 DataNode dead 当成文件立刻丢失。",
      "看到 safemode 就盲目 force leave，不分析欠复制和 block report。",
      "把 Secondary NameNode 当成 HA 方案。",
    ],
  },
  {
    slug: "maintenance-services",
    topic: "maintenance-services",
    title: "HDFS 维护服务：fsck、dfsadmin、Balancer、Decommission 和 Checkpoint 怎么串起来",
    difficulty: "intermediate",
    order: 10,
    claim_ids: ["bigdata-hdfs-claim-0011", "bigdata-hdfs-claim-0012", "bigdata-hdfs-claim-0019"],
    source_ids: ["hadoop-hdfs-user-guide"],
    conclusion: "HDFS 维护能力要围绕“看状态、修副本、均衡数据、隔离节点、控制元数据恢复成本”组织，不能把 fsck、dfsadmin、balancer 当成孤立命令背。",
    angles: [
      "dfsadmin report 和 NameNode web UI 用来观察容量、DataNode、block 和整体健康。",
      "fsck 用来检查文件系统健康、缺失 block、坏块等问题。",
      "Balancer 处理 DataNode 间数据分布不均，不解决 NameNode 元数据膨胀。",
      "Decommission 要让副本迁走后再下线节点，不能直接拔机器。",
    ],
    chain: [
      "先用 UI、report、日志判断是容量、节点、block、网络还是元数据问题。",
      "如果是 block 健康问题，用 fsck 定位文件和 block 状态。",
      "如果是节点下线或扩容后的数据不均，用 decommission 或 balancer 控制迁移。",
      "如果是 NameNode edits 膨胀或重启恢复风险，检查 checkpoint 机制和元数据目录。",
    ],
    boundaries: [
      "Balancer 是均衡工具，不是性能万能药，运行时也会消耗网络和磁盘。",
      "Decommission 要考虑副本数和机架分布，否则会放大欠复制风险。",
      "fsck 发现问题不等于自动修复所有业务影响，还要看 replica 是否可用。",
    ],
    mistakes: [
      "把维护命令当成固定背诵清单。",
      "扩容后只看总容量，不看数据分布和热点。",
      "下线 DataNode 前不走 decommission 流程。",
    ],
  },
  {
    slug: "lifecycle",
    topic: "lifecycle",
    title: "HDFS 生命周期：文件创建、关闭、删除、回收和升级回滚",
    difficulty: "intermediate",
    order: 11,
    claim_ids: ["bigdata-hdfs-claim-0017", "bigdata-hdfs-claim-0011"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 文件生命周期不只是 create/read/delete，而是涉及 lease、block 分配、close、namespace 变更、trash/回收、空间释放、升级和 rollback 的完整运维边界。",
    angles: [
      "创建文件会改变 namespace，并触发后续 block 分配和 pipeline 写入。",
      "close 是很多上层系统判断文件完成的重要边界。",
      "删除文件和空间回收之间可能存在 trash、快照或延迟清理等管理因素。",
      "升级和 rollback 是集群生命周期的一部分，不能只从单文件视角看 HDFS。",
    ],
    chain: [
      "Client 创建路径，NameNode 记录元数据并控制写入 lease。",
      "写入过程中 block replica 被逐步创建和确认。",
      "close 后元数据进入完成状态，上层读者才能稳定消费。",
      "删除、降低副本数或升级回滚会触发后续空间和元数据处理。",
    ],
    boundaries: [
      "文件 close 前后的语义要和上层任务提交协议一起判断。",
      "删除不一定立即等于所有空间立刻可用，要结合回收站、快照和副本删除流程。",
      "升级回滚不是业务层恢复方案，需要提前设计窗口和验证策略。",
    ],
    mistakes: [
      "把写完客户端缓冲等同于文件已经稳定可读。",
      "删除大目录前不评估 NameNode、快照和 trash 影响。",
      "升级只看版本兼容，不看回滚和元数据备份。",
    ],
  },
  {
    slug: "performance-model",
    topic: "performance-model",
    title: "HDFS 性能模型：吞吐、延迟、数据本地性、小文件和 NameNode 压力",
    difficulty: "advanced",
    order: 12,
    claim_ids: ["bigdata-hdfs-claim-0006", "bigdata-hdfs-claim-0015", "bigdata-hdfs-claim-0016"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-default-config"],
    conclusion: "HDFS 性能分析必须先确认访问模式：它擅长大文件顺序吞吐和数据本地性，不擅长海量小文件、低延迟点查和频繁随机更新。",
    angles: [
      "吞吐受 DataNode 磁盘、网络、pipeline、客户端并发、block 分布和上层调度共同影响。",
      "NameNode RPC、内存、GC 和元数据规模决定 namespace 层面的上限。",
      "小文件会增加文件对象、block map、RPC 和上层任务调度开销。",
      "数据本地性可以减少网络搬运，但在资源调度、缓存和远程读取场景下不是绝对保证。",
    ],
    chain: [
      "先区分读慢、写慢、list 慢、任务慢和 NameNode RPC 慢。",
      "读写慢看 DataNode 磁盘、网络、block 分布、pipeline 和客户端并发。",
      "list/open/create 慢看 NameNode RPC、目录规模、文件数和 GC。",
      "任务慢再结合 Spark/MapReduce 的 split、locality、并行度和数据倾斜分析。",
    ],
    boundaries: [
      "调大 block size 可能减少元数据和任务数量，但不能替代小文件治理。",
      "增加 DataNode 能提升容量和数据面吞吐，不直接解决 NameNode 元数据瓶颈。",
      "副本数、压缩格式、文件格式和上层计算框架会共同影响性能。",
    ],
    mistakes: [
      "所有慢都归因于 HDFS。",
      "只看剩余容量，不看文件数、block 数和热点 DataNode。",
      "把小文件合并当成唯一优化，而不评估查询粒度和上层表布局。",
    ],
  },
  {
    slug: "tuning",
    topic: "tuning",
    title: "HDFS 调优：block size、副本数、并发、机架感知和小文件治理",
    difficulty: "advanced",
    order: 13,
    claim_ids: ["bigdata-hdfs-claim-0010", "bigdata-hdfs-claim-0015", "bigdata-hdfs-claim-0016"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-default-config"],
    conclusion: "HDFS 调优不是背参数，而是根据文件大小、吞吐目标、容灾目标、机架拓扑、上层任务并行度和 NameNode 资源做权衡。",
    angles: [
      "Block size 影响 block 数、任务切分和顺序读取粒度。",
      "Replication factor 影响可靠性、读取选择、写入成本和存储成本。",
      "Rack awareness 影响跨 rack 容灾和写入网络路径。",
      "小文件治理要结合文件格式、合并策略、表分区、上层查询和生命周期。",
    ],
    chain: [
      "先用监控确认瓶颈在 NameNode、DataNode、网络、客户端还是上层框架。",
      "如果 NameNode 压力来自小文件，优先减少文件和 block 数。",
      "如果写入慢，检查 pipeline、磁盘、网络、机架、客户端并发和副本数。",
      "如果读取慢，检查 block locality、热点节点、坏盘、压缩格式和任务并行度。",
    ],
    boundaries: [
      "没有通用最优 block size，必须结合数据规模和上层计算方式。",
      "副本数不是越高越好，高副本会放大写入和存储成本。",
      "参数修改需要结合版本和集群配置，不应脱离 hdfs-default.xml 和生产观测。",
    ],
    mistakes: [
      "面试里直接报默认值而不讲为什么。",
      "把 NameNode 内存不足用加 DataNode 解决。",
      "调优前没有定义吞吐、延迟、恢复时间和成本目标。",
    ],
  },
  {
    slug: "resource-governance",
    topic: "resource-governance",
    title: "HDFS 资源治理：容量、配额、副本、热点和多租户边界",
    difficulty: "advanced",
    order: 14,
    claim_ids: ["bigdata-hdfs-claim-0011", "bigdata-hdfs-claim-0015", "bigdata-hdfs-claim-0016"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 资源治理要同时管容量、文件数、block 数、副本数、目录权限、热点访问和运维流程；只看磁盘使用率无法保证集群健康。",
    angles: [
      "容量治理不仅是总空间，还包括副本带来的有效容量折损。",
      "文件数和 block 数会进入 NameNode 元数据模型，是独立于 DataNode 磁盘的资源。",
      "热点目录、热点文件和热点 DataNode 会影响局部吞吐。",
      "多租户环境需要目录规划、权限、配额、生命周期和审计配合。",
    ],
    chain: [
      "先按业务目录和租户拆解容量、文件数、增长速度和访问模式。",
      "再检查副本数、block 大小、冷数据生命周期和小文件合并策略。",
      "对扩容和下线节点，配合 balancer、decommission 和容量水位管理。",
      "对权限和误删风险，配合 owner/group/mode、审计和上层平台流程。",
    ],
    boundaries: [
      "DataNode 还有空间不代表 NameNode 元数据健康。",
      "统一目录权限不能替代租户隔离和上层数仓权限治理。",
      "冷热数据生命周期要考虑快照、回收站和合规保留要求。",
    ],
    mistakes: [
      "把 HDFS 治理等同于清磁盘。",
      "不区分原始数据、明细表、中间结果和临时目录。",
      "忽略副本数对有效容量的影响。",
    ],
  },
  {
    slug: "security-governance",
    topic: "security-governance",
    title: "HDFS 安全治理：权限、认证、代理用户、审计和上层引擎边界",
    difficulty: "advanced",
    order: 15,
    claim_ids: ["bigdata-hdfs-claim-0014"],
    source_ids: ["hadoop-hdfs-permissions", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 安全不能只说 chmod，而要把文件 owner/group/mode、认证、代理用户、服务账号、审计和 Hive/Spark 等上层引擎的权限边界一起讲。",
    angles: [
      "HDFS 权限模型借鉴传统文件系统的 owner、group、mode，但运行在分布式服务环境里。",
      "服务账号和代理用户会影响实际访问身份，面试时要说明谁代表谁访问 HDFS。",
      "上层引擎可能通过自己的权限系统或 metastore 权限控制访问，但底层 HDFS 仍要兜底。",
      "审计日志、目录规范、临时目录和敏感数据路径是生产治理重点。",
    ],
    chain: [
      "用户或服务向上层引擎提交任务，实际 HDFS 访问身份可能是用户、代理用户或服务账号。",
      "HDFS 根据路径、owner、group、mode 等信息判断是否允许访问。",
      "上层 Hive/Spark/调度平台可能增加表级或任务级权限，但不能替代底层路径控制。",
      "审计需要串联应用层用户、代理链路、HDFS 操作和数据目录。",
    ],
    boundaries: [
      "chmod 只能解决一部分访问控制，不能单独解决认证、数据脱敏和审计。",
      "给服务账号过大权限会放大越权访问和误删风险。",
      "HDFS 目录权限和表权限不一致时，容易出现能查不能读或能读绕过表权限的问题。",
    ],
    mistakes: [
      "只回答 chmod 777 这类危险做法。",
      "不说明代理用户和服务账号边界。",
      "把上层数仓权限当成 HDFS 底层权限的完全替代。",
    ],
  },
  {
    slug: "observability",
    topic: "observability",
    title: "HDFS 可观测性：NameNode UI、dfsadmin report、fsck、日志和上层任务怎么联合定位",
    difficulty: "intermediate",
    order: 16,
    claim_ids: ["bigdata-hdfs-claim-0011", "bigdata-hdfs-claim-0019"],
    source_ids: ["hadoop-hdfs-user-guide"],
    conclusion: "HDFS 观测要从全局到局部：先看 NameNode/UI/report 判断集群健康，再用 fsck、DataNode 日志和上层任务错误定位到文件、block、节点和路径。",
    angles: [
      "NameNode web UI 能快速看到 DataNode、容量和基础统计。",
      "dfsadmin report 可以获取 HDFS 基本统计和 DataNode 状态。",
      "fsck 更适合定位文件和 block 健康问题。",
      "上层任务失败要和 HDFS block、网络、权限、路径存在性和 DataNode 状态对齐。",
    ],
    chain: [
      "先判断是全局问题还是单任务、单路径、单节点问题。",
      "全局问题看 NameNode 状态、safemode、容量水位、dead DataNode 和欠复制。",
      "单文件问题用 fsck 定位 block 和 replica。",
      "任务问题结合 Spark/MapReduce 日志，看是否是权限、文件缺失、坏块、慢节点或网络超时。",
    ],
    boundaries: [
      "一个指标无法证明根因，要把 UI、命令、日志、任务错误合并判断。",
      "剩余容量充足不代表无热点、无坏盘、无欠复制。",
      "上层任务失败不一定是 HDFS，也可能是表元数据、输入格式或作业配置问题。",
    ],
    mistakes: [
      "只说看日志，不说明看哪类日志和指标。",
      "看到任务读失败就重跑，不定位 block 和节点。",
      "把监控面板指标和根因画等号。",
    ],
  },
  {
    slug: "troubleshooting",
    topic: "troubleshooting",
    title: "HDFS 排障：读慢、写慢、欠复制、Safemode、小文件和权限失败怎么拆",
    difficulty: "advanced",
    order: 17,
    claim_ids: ["bigdata-hdfs-claim-0008", "bigdata-hdfs-claim-0009", "bigdata-hdfs-claim-0019"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide", "hadoop-hdfs-permissions"],
    conclusion: "HDFS 排障要先分层：NameNode 元数据、DataNode 存储、block 副本、网络、权限和上层任务协议；不要用重启或重跑掩盖根因。",
    angles: [
      "读慢优先看 block location、DataNode 负载、坏盘、网络和客户端并发。",
      "写慢优先看 pipeline、磁盘、网络、机架、副本数和客户端超时。",
      "欠复制看 dead DataNode、磁盘故障、容量水位和 re-replication 进度。",
      "权限失败看实际执行身份、路径权限、代理用户和上层表权限。",
    ],
    chain: [
      "先确认故障范围：全局、单目录、单文件、单租户、单 DataNode 还是单任务。",
      "再用 report、fsck、UI、日志定位层次。",
      "根据层次选择动作：修权限、下线坏节点、等待或触发副本修复、治理小文件、调整上层任务。",
      "最后复盘是否需要容量阈值、告警、目录规范或作业提交协议修复。",
    ],
    boundaries: [
      "Safemode 不应盲目退出，先确认是否有大量 block 未达到安全阈值。",
      "欠复制不是立即不可用，但长期欠复制会降低容错能力。",
      "小文件治理是长期工程，不是一次合并脚本能彻底解决。",
    ],
    mistakes: [
      "所有问题先重启 NameNode。",
      "权限错误只改 777。",
      "读写慢不区分 NameNode RPC 慢和 DataNode I/O 慢。",
    ],
  },
  {
    slug: "comparison",
    topic: "comparison",
    title: "HDFS 对比题：对象存储、HBase、Kafka、湖仓表格式分别解决什么问题",
    difficulty: "intermediate",
    order: 18,
    claim_ids: ["bigdata-hdfs-claim-0020", "bigdata-hdfs-claim-0006"],
    source_ids: ["hadoop-hdfs-design"],
    conclusion: "HDFS 是大文件分布式存储底座，不是消息系统、低延迟 KV 表、对象存储 API 或湖仓事务表；对比题要从访问模式、元数据、事务、索引和计算耦合度拆。",
    angles: [
      "和对象存储相比，HDFS 更贴近 Hadoop 计算本地性和文件系统语义，对象存储更强调对象 API 和云端弹性。",
      "和 HBase 相比，HDFS 不提供行键、列族、MemStore、WAL、HFile 级别的低延迟随机读写表模型。",
      "和 Kafka 相比，HDFS 不负责事件流、offset、consumer group 和消息保留语义。",
      "和 Iceberg/Hudi/Delta 相比，HDFS 是底层文件系统，湖仓表格式提供表级元数据、快照、事务或增量能力。",
    ],
    chain: [
      "先判断业务是顺序批处理、低延迟点查、事件流还是湖仓表管理。",
      "如果是大文件离线处理，HDFS 可能是合适底座。",
      "如果需要行级低延迟更新，考虑 HBase 或其他 KV/OLTP 系统。",
      "如果需要表级 ACID、快照、schema 演进，HDFS 本身不够，需要湖仓表格式。",
    ],
    boundaries: [
      "HDFS 可以作为底层存储承载很多系统文件，但不代表它提供这些系统的上层语义。",
      "对象存储和 HDFS 在一致性、rename、目录语义、吞吐和运维模型上要结合具体实现判断。",
      "湖仓表格式不是替代磁盘，它是叠在文件存储上的表管理层。",
    ],
    mistakes: [
      "把所有大数据存储都说成 HDFS。",
      "用 HDFS 直接回答表事务、消息顺序或低延迟点查问题。",
      "对比时只说快慢，不说数据模型和语义边界。",
    ],
  },
  {
    slug: "system-design",
    topic: "system-design",
    title: "HDFS 系统设计题：如何设计 PB 级离线数据湖底座",
    difficulty: "advanced",
    order: 19,
    claim_ids: ["bigdata-hdfs-claim-0018", "bigdata-hdfs-claim-0016", "bigdata-hdfs-claim-0014"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide", "hadoop-hdfs-permissions"],
    conclusion: "HDFS 设计题不能只画 NameNode 和 DataNode，要从数据规模、文件大小、读写比例、容灾、机架、权限、多租户、计算框架和运维工具链一起设计。",
    angles: [
      "容量设计要考虑原始数据量、增长率、副本数、冷热分层、保留周期和临时数据。",
      "命名空间设计要考虑目录层级、租户、权限、文件数、block 数和小文件治理。",
      "容错设计要考虑副本数、rack awareness、NameNode HA、checkpoint、备份和下线流程。",
      "运维设计要考虑监控、告警、fsck、balancer、decommission、审计和升级回滚。",
    ],
    chain: [
      "先问业务访问模式：批量写入、批量读取、是否低延迟、是否有随机更新。",
      "再设计目录、文件格式、block size、副本数、机架和容量水位。",
      "然后补 NameNode HA、DataNode 扩缩容、监控、权限、审计和备份策略。",
      "最后说明不适合场景：高 QPS 点查、频繁小文件写入、在线事务更新。",
    ],
    boundaries: [
      "PB 级容量不等于 PB 级可用设计，元数据和运维流程同样关键。",
      "HDFS 只解决文件存储底座，上层表格式和计算引擎要另外设计。",
      "多租户场景必须把权限和审计放进方案，而不是上线后补。",
    ],
    mistakes: [
      "只按磁盘容量估算集群规模。",
      "忽略 NameNode HA 和元数据备份。",
      "没有说明小文件、权限和生命周期治理。",
    ],
  },
  {
    slug: "interview-playbook",
    topic: "interview-playbook",
    title: "HDFS 面试答题手册：从 30 秒定位到 5 分钟系统设计",
    difficulty: "intermediate",
    order: 20,
    claim_ids: ["bigdata-hdfs-claim-0021", "bigdata-hdfs-claim-0018", "bigdata-hdfs-claim-0020"],
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    conclusion: "HDFS 面试答案要有层次：30 秒讲定位，2 分钟讲对象和链路，5 分钟讲故障、性能、治理和设计取舍。",
    angles: [
      "定位层：大文件、流式访问、高吞吐、批处理、廉价机器容错。",
      "对象层：NameNode、DataNode、Client、Block、Replica、Rack、FsImage、EditLog。",
      "链路层：读路径、写路径、心跳、block report、pipeline、safemode。",
      "工程层：小文件、NameNode 压力、DataNode 故障、权限、HA、balancer、fsck。",
    ],
    chain: [
      "先用一句话把 HDFS 和普通文件系统、对象存储、HBase、Kafka 区分开。",
      "再选一条链路展开，例如读路径或写路径。",
      "接着补失败场景，例如 DataNode 掉线、欠复制、NameNode HA 或小文件。",
      "最后讲取舍：吞吐优先、元数据集中、非低延迟随机更新、多租户治理成本。",
    ],
    boundaries: [
      "不要在所有题目里套同一个答案，要根据问题选择读、写、元数据、排障或设计主线。",
      "能画链路比能背名词更重要。",
      "讲参数前先讲问题模型，否则调优答案没有依据。",
    ],
    mistakes: [
      "回答过短，只给定义。",
      "回答过散，不形成对象、状态、链路、故障、取舍的闭环。",
      "过度承诺，误把 HDFS 说成万能存储。",
    ],
  },
];

const extraQuestions = [
  {
    id: "q-bigdata-hdfs-0021",
    title: "为什么 HDFS 小文件问题首先压垮的是 NameNode，而不是 DataNode 磁盘？",
    topic: "small-files",
    source_ids: ["hadoop-hdfs-design"],
    claim_ids: ["bigdata-hdfs-claim-0015"],
    related_docs: ["bigdata/hdfs/performance-model", "bigdata/hdfs/metadata-state"],
    summary: "小文件会放大 namespace、文件对象、block map 和任务调度开销，磁盘容量往往不是第一个瓶颈。",
  },
  {
    id: "q-bigdata-hdfs-0022",
    title: "Secondary NameNode 为什么不是 NameNode 热备？",
    topic: "checkpoint",
    source_ids: ["hadoop-hdfs-user-guide", "hadoop-hdfs-ha-qjm"],
    claim_ids: ["bigdata-hdfs-claim-0012", "bigdata-hdfs-claim-0013"],
    related_docs: ["bigdata/hdfs/metadata-state", "bigdata/hdfs/fault-recovery"],
    summary: "Secondary NameNode 主要做 checkpoint，HA 切换需要 active/standby、共享 edits、故障检测和 fencing。",
  },
  {
    id: "q-bigdata-hdfs-0023",
    title: "HDFS 进入 Safemode 时应该先看什么，而不是直接强制退出？",
    topic: "safemode",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    claim_ids: ["bigdata-hdfs-claim-0009"],
    related_docs: ["bigdata/hdfs/fault-recovery", "bigdata/hdfs/troubleshooting"],
    summary: "Safemode 是 NameNode 启动和安全检查状态，要先看 block report、欠复制、dead DataNode 和安全复制比例。",
  },
  {
    id: "q-bigdata-hdfs-0024",
    title: "为什么说 HDFS 读写路径都体现了控制面和数据面分离？",
    topic: "control-data-plane",
    source_ids: ["hadoop-hdfs-design"],
    claim_ids: ["bigdata-hdfs-claim-0002", "bigdata-hdfs-claim-0004", "bigdata-hdfs-claim-0005"],
    related_docs: ["bigdata/hdfs/read-path", "bigdata/hdfs/write-path"],
    summary: "NameNode 决定元数据和位置，DataNode 承担真实数据流，读写都不是 NameNode 转发文件内容。",
  },
  {
    id: "q-bigdata-hdfs-0025",
    title: "HDFS 三副本为什么不等于简单随机放三台机器？",
    topic: "replica-placement",
    source_ids: ["hadoop-hdfs-design"],
    claim_ids: ["bigdata-hdfs-claim-0010"],
    related_docs: ["bigdata/hdfs/partition-layout"],
    summary: "副本放置要考虑本地性、rack awareness、写入成本、读可用性和容灾，而不是纯随机。",
  },
  {
    id: "q-bigdata-hdfs-0026",
    title: "设计 PB 级 HDFS 集群时，为什么不能只按磁盘容量估算？",
    topic: "system-design",
    source_ids: ["hadoop-hdfs-design", "hadoop-hdfs-user-guide"],
    claim_ids: ["bigdata-hdfs-claim-0018"],
    related_docs: ["bigdata/hdfs/system-design", "bigdata/hdfs/resource-governance"],
    summary: "还要估算副本、文件数、block 数、NameNode 内存、机架、HA、权限、运维和生命周期。",
  },
  {
    id: "q-bigdata-hdfs-0027",
    title: "HDFS 权限问题为什么要同时看用户身份、代理用户和上层引擎？",
    topic: "security",
    source_ids: ["hadoop-hdfs-permissions"],
    claim_ids: ["bigdata-hdfs-claim-0014"],
    related_docs: ["bigdata/hdfs/security-governance"],
    summary: "实际访问 HDFS 的身份可能不是提交 SQL 的人，服务账号、代理用户和表权限都会影响边界。",
  },
  {
    id: "q-bigdata-hdfs-0028",
    title: "HDFS 和对象存储、HBase、Kafka 的边界应该怎么讲？",
    topic: "comparison",
    source_ids: ["hadoop-hdfs-design"],
    claim_ids: ["bigdata-hdfs-claim-0020"],
    related_docs: ["bigdata/hdfs/comparison"],
    summary: "HDFS 是大文件分布式文件系统，不提供消息流、低延迟 KV、表级事务或对象存储 API 的完整语义。",
  },
];

function yamlBlock(data) {
  return yaml.dump(data, { lineWidth: 120, noRefs: true }).trim();
}

function mdFrontmatter(data) {
  return `---\n${yamlBlock(data)}\n---\n\n`;
}

function list(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function docBody(spec) {
  return `${mdFrontmatter({
    kb_id: `bigdata/hdfs/${spec.slug}`,
    title: spec.title,
    domain: "bigdata",
    component: "hdfs",
    topic: spec.topic,
    difficulty: spec.difficulty,
    status: "reviewed",
    sidebar_position: spec.order,
    version_scope: versionScope,
    last_verified_at: today,
    source_ids: spec.source_ids,
    claim_ids: spec.claim_ids,
    tags: ["bigdata", "hdfs", spec.topic],
  })}# 一句话结论

${spec.conclusion}

# 面试深挖点

${list(spec.angles)}

# 核心链路

${list(spec.chain)}

# 状态与边界

${list(spec.boundaries)}

# 生产排查入口

1. 先区分问题落在 NameNode 元数据、DataNode 存储、block replica、网络、权限还是上层计算框架。
2. 再选择工具：NameNode UI 和 dfsadmin report 看全局，fsck 看文件和 block，DataNode 日志看本地磁盘和网络，任务日志看上层访问路径。
3. 最后把处理动作落到具体层：副本修复、节点下线、balancer、权限修正、小文件治理、HA/Checkpoint 检查或上层作业改造。

# 常见误区

${list(spec.mistakes)}

# 面试答题结构

1. 先用一句话说明 HDFS 的定位和它不适合的场景。
2. 再讲对象：NameNode、DataNode、Client、Block、Replica、Rack、FsImage、EditLog 中哪些和当前问题相关。
3. 然后讲链路：读、写、元数据、故障恢复或治理流程只能选一条主线展开。
4. 最后补取舍：吞吐、可靠性、成本、NameNode 压力、上层计算框架和运维复杂度。

# 相关样例

- \`examples/python/hdfs/${spec.slug.replaceAll("-", "_")}.py\`
`;
}

function questionBody(spec, index) {
  const id = `q-bigdata-hdfs-${String(index + 1).padStart(4, "0")}`;
  const title = `${spec.title.replace(/^HDFS\s*/, "HDFS ")}这类问题面试应该怎么回答？`;
  return `${mdFrontmatter({
    id,
    title,
    domain: "bigdata",
    component: "hdfs",
    topic: spec.topic,
    question_type: index % 5 === 0 ? "troubleshooting" : index % 5 === 1 ? "system-design" : index % 5 === 2 ? "tradeoff" : "principle",
    difficulty: spec.difficulty === "advanced" ? "advanced" : "intermediate",
    status: "reviewed",
    version_scope: versionScope,
    last_verified_at: today,
    source_ids: spec.source_ids,
    claim_ids: spec.claim_ids,
    related_docs: [`bigdata/hdfs/${spec.slug}`],
    estimated_minutes: 10,
  })}# 题目

${title}

# 一句话结论

${spec.conclusion}

# 核心机制

${list(spec.angles)}

# 标准答案

回答时先把问题落到 HDFS 的对象、状态和链路上。${spec.conclusion} 具体展开时，可以按三层组织：第一层说明 NameNode、DataNode、Client、Block、Replica 的职责归属；第二层说明请求如何经过元数据面进入数据面；第三层说明失败、性能和治理边界。这样答案不只是背概念，而是能解释生产系统为什么会这样设计。

结合本题，主链路可以这样讲：

${list(spec.chain)}

最后补充边界：

${list(spec.boundaries)}

# 必答点

1. 说明 NameNode 与 DataNode 的职责边界。
2. 说明至少一条真实链路，而不是只列对象名。
3. 说明该机制解决什么问题，也说明不解决什么问题。
4. 结合故障、性能或治理场景说明生产排查入口。

# 常见误答

${list(spec.mistakes)}

# 延伸追问

1. 如果这个机制出现异常，你会先看 NameNode、DataNode 还是客户端日志？为什么？
2. 这个设计带来的成本是什么，什么场景下应该换别的存储系统？
3. 如果集群规模扩大 10 倍，这个机制的瓶颈会先出现在哪里？
`;
}

function extraQuestionBody(q) {
  return `${mdFrontmatter({
    id: q.id,
    title: q.title,
    domain: "bigdata",
    component: "hdfs",
    topic: q.topic,
    question_type: q.topic === "system-design" ? "system-design" : q.topic === "comparison" ? "tradeoff" : q.topic === "security" ? "security" : "principle",
    difficulty: q.topic === "system-design" || q.topic === "security" ? "advanced" : "intermediate",
    status: "reviewed",
    version_scope: versionScope,
    last_verified_at: today,
    source_ids: q.source_ids,
    claim_ids: q.claim_ids,
    related_docs: q.related_docs,
    estimated_minutes: 10,
  })}# 题目

${q.title}

# 一句话结论

${q.summary}

# 核心机制

1. 先说明这个问题落在哪一层：元数据、block、副本、读写链路、权限、HA 还是系统设计。
2. 再说明 HDFS 的官方模型如何约束答案，尤其是 NameNode 与 DataNode 的职责边界。
3. 最后说明生产环境里的排查入口和设计取舍。

# 标准答案

${q.summary} 面试时不要把答案停在一句判断上，要继续说明原因。HDFS 的关键是控制面和数据面分离：NameNode 维护 namespace、block map 和复制决策，DataNode 保存真实 block replica，客户端在拿到元数据后直接和 DataNode 读写。围绕这个模型，${q.title.replace("？", "")} 的答案必须补充状态归属、链路、风险和取舍。

如果是排障题，要先缩小范围：全局还是单任务、单路径还是单节点、读写慢还是权限失败。然后组合使用 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志。若是设计题，则要同时说明容量、文件数、block 数、副本、rack、HA、权限、多租户和生命周期，而不是只按磁盘大小估算。

# 必答点

1. 给出明确判断。
2. 解释判断背后的 HDFS 对象和状态。
3. 讲出至少一条真实链路或排查路径。
4. 说明工程边界和替代方案。

# 常见误答

1. 只给结论，不解释 NameNode、DataNode、block replica 的关系。
2. 把 HDFS 当成通用低延迟随机更新存储。
3. 只说参数或命令，不说明为什么使用它。

# 延伸追问

1. 如果线上已经出现这个问题，你会先收集哪些证据？
2. 如果业务量继续增长，这个问题会先压到哪一层？
3. 哪些场景应该不用 HDFS，而选对象存储、HBase、Kafka 或湖仓表格式？
`;
}

function exampleBody(spec) {
  const className = `Hdfs${spec.slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")}Checklist`;
  return `"""HDFS ${spec.topic} 面试推演脚本。

这个脚本不连接真实 HDFS 集群，而是把回答和排障时必须检查的状态结构化。
生产环境要结合 NameNode UI、dfsadmin report、fsck、DataNode 日志和上层任务日志使用。
"""

from dataclasses import dataclass, field
import json


@dataclass
class ${className}:
    topic: str = "${spec.topic}"
    core_objects: list[str] = field(default_factory=lambda: ["NameNode", "DataNode", "Client", "Block", "Replica"])
    first_checks: list[str] = field(default_factory=lambda: [
        "NameNode 元数据和 RPC 状态",
        "DataNode 心跳、磁盘和 block report",
        "block replica 分布和欠复制情况",
        "客户端或上层任务日志",
    ])

    def build_answer_outline(self) -> dict:
        return {
            "conclusion": "${spec.conclusion.replaceAll("\"", "\\\"")}",
            "objects": self.core_objects,
            "chain": ${JSON.stringify(spec.chain, null, 12)},
            "boundaries": ${JSON.stringify(spec.boundaries, null, 12)},
            "checks": self.first_checks,
        }


if __name__ == "__main__":
    checklist = ${className}()
    print(json.dumps(checklist.build_answer_outline(), ensure_ascii=False, indent=2))
`;
}

function ensureSources() {
  const file = path.join(repoRoot, "sources", "official", "bigdata.yaml");
  const rows = yaml.load(fs.readFileSync(file, "utf8")) || [];
  const existing = new Set(rows.map((row) => row.id));
  for (const entry of sourceEntries) {
    if (!existing.has(entry.id)) rows.push(entry);
  }
  fs.writeFileSync(file, yaml.dump(rows, { lineWidth: 120, noRefs: true }), "utf8");
}

function updateClaims() {
  const file = path.join(repoRoot, "claims", "bigdata", "platform-components.yaml");
  const rows = yaml.load(fs.readFileSync(file, "utf8")) || [];
  const filtered = rows.filter((row) => !(row.component === "hdfs" && /^bigdata-hdfs-claim-0\d{3}$/.test(row.id) && row.id !== "bigdata-hdfs-claim-0001"));
  const additions = claimEntries.map((entry) => ({
    id: entry.id,
    domain: "bigdata",
    component: "hdfs",
    statement: entry.statement,
    status: "reviewed",
    confidence: "high",
    version_scope: versionScope,
    last_verified_at: today,
    source_ids: entry.source_ids,
    notes: "Curated HDFS interview claim verified against Apache Hadoop HDFS documentation.",
  }));
  fs.writeFileSync(file, yaml.dump([...filtered, ...additions], { lineWidth: 120, noRefs: true }), "utf8");
}

function writeDocs() {
  const dir = path.join(repoRoot, "docs", "bigdata", "hdfs");
  for (const spec of docs) {
    fs.writeFileSync(path.join(dir, `${spec.slug}.md`), docBody(spec), "utf8");
  }
}

function writeQuestions() {
  const dir = path.join(repoRoot, "questions", "bigdata", "hdfs");
  docs.forEach((spec, index) => {
    fs.writeFileSync(path.join(dir, `q-bigdata-hdfs-${String(index + 1).padStart(4, "0")}.md`), questionBody(spec, index), "utf8");
  });
  for (const q of extraQuestions) {
    fs.writeFileSync(path.join(dir, `${q.id}.md`), extraQuestionBody(q), "utf8");
  }
}

function writeExamples() {
  const dir = path.join(repoRoot, "examples", "python", "hdfs");
  for (const spec of docs) {
    fs.writeFileSync(path.join(dir, `${spec.slug.replaceAll("-", "_")}.py`), exampleBody(spec), "utf8");
  }
}

ensureSources();
updateClaims();
writeDocs();
writeQuestions();
writeExamples();

console.log(JSON.stringify({ refinedDocs: docs.length, refinedQuestions: docs.length + extraQuestions.length, refinedExamples: docs.length, curatedClaims: claimEntries.length }, null, 2));
