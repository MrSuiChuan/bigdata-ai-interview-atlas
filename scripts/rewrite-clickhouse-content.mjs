import fs from "node:fs";
import path from "node:path";

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function yamlScalar(value) {
  if (typeof value !== "string") {
    return String(value);
  }
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
    return value;
  }
  return JSON.stringify(value);
}

function frontmatter(meta) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(meta)) {
    if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${yamlScalar(item)}`);
      }
      continue;
    }
    lines.push(`${key}: ${yamlScalar(value)}`);
  }
  lines.push("---");
  return lines.join("\n");
}

function write(filePath, text) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, text.trimStart(), "utf8");
}

const commonMeta = {
  domain: "bigdata",
  component: "clickhouse",
  version_scope: "ClickHouse docs as verified on 2026-05-08",
  last_verified_at: "2026-05-08",
  status: "reviewed",
};

const docs = [
  {
    path: "docs/bigdata/clickhouse/overview.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/overview",
      title: "ClickHouse 整体定位与技术边界",
      description: "从列式 OLAP 引擎、MergeTree 存储模型、后台维护机制和分布式访问边界理解 ClickHouse。",
      topic: "overview",
      difficulty: "beginner",
      sidebar_position: 1,
      source_ids: [
        "clickhouse-docs",
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-query-optimization-guide",
        "clickhouse-sparse-primary-indexes-guide",
      ],
      claim_ids: [
        "clickhouse-claim-0001",
        "clickhouse-claim-0002",
        "clickhouse-claim-0003",
        "clickhouse-claim-0004",
        "clickhouse-claim-0005",
        "clickhouse-claim-0007",
        "clickhouse-claim-0019",
      ],
      tags: ["bigdata", "clickhouse", "overview", "knowledge-base", "production"],
    },
    body: String.raw`
## ClickHouse 首先是列式 OLAP 数据库，不是通用事务数据库
ClickHouse 官方定位是面向在线分析处理的列式数据库。真正要抓住的不是“数据库”三个字，而是“列式”和“分析处理”两个约束：它擅长高吞吐写入后的快速聚合、过滤、排序和明细分析，不是为了高并发小事务、频繁单行更新和复杂外键约束而设计。

## 真正决定行为的是 MergeTree 家族
大多数生产表都建立在 MergeTree 家族之上。数据写入后形成 part，part 内数据按 ORDER BY 指定的排序键组织；查询时再利用分区信息、稀疏主键索引、mark、列裁剪和 PREWHERE 来减少需要读取的数据量。理解 ClickHouse，核心不是先记 SQL，而是先理解 part、排序键和后台 merge。

## 最短运行链路
把 ClickHouse 放回最小链路里，系统就很清楚：

1. 写入进入本地 MergeTree 表，或者先进入 Distributed 表。
2. 本地表生成新的 part，并把它加入 active part 集。
3. 后台线程持续执行 merge、mutation、TTL、复制同步和数据发送。
4. 查询根据 partition、排序键、稀疏索引和列裁剪决定实际读取范围。
5. 证据最终落在 system.parts、system.query_log、system.merges、EXPLAIN 等入口里。

## 为什么 part 比“表”更重要
表是用户视角的逻辑对象，part 才是 ClickHouse 大多数性能、可见性和恢复问题的物理载体。一个表慢，常见根因往往不是“表太大”，而是 part 过多、merge 跟不上、排序键不匹配、读取列太多，或者分布式汇总代价过高。

## 不要把边界回答错
ClickHouse 适合分析型读取，不天然替代以下能力：

- 完整的 OLTP 行级事务系统
- 通用联邦查询平台
- 自动兜底的跨系统幂等和事务补偿层
- 不经设计就能长期稳定支撑极碎写入的日志落地器

如果把这些边界混在一起，就很容易把表设计问题误判成机器问题，把业务事务问题误判成组件已经保证。

## 建议的学习顺序
更高效的顺序通常是：先理解 PARTITION BY、ORDER BY、part、granule、mark；再理解写入如何生成 part、后台 merge 和 mutation 如何改变物理布局；然后再看查询如何做裁剪、列读取和分布式汇总；最后进入复制、治理和故障恢复。

## 最小示例：从布局出发看查询路径
~~~sql
CREATE TABLE events_local
(
    event_time DateTime,
    user_id UInt64,
    event_type LowCardinality(String),
    amount Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (event_type, event_time, user_id);

EXPLAIN indexes = 1
SELECT event_type, sum(amount)
FROM events_local
WHERE event_time >= toDateTime('2026-05-01 00:00:00')
  AND event_type = 'pay'
GROUP BY event_type;
~~~

这个例子里真正要观察的不是 SQL 能不能执行，而是月分区裁掉了多少旧数据、排序键前缀是否把读取范围压到足够小、查询到底需要读取多少 granule 和多少列。`,
  },
  {
    path: "docs/bigdata/clickhouse/core-objects-state.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/core-objects-state",
      title: "ClickHouse 核心对象与状态归属",
      description: "把 table、part、partition、granule、mark、replica、shard 等核心对象放回真实的状态归属和观测入口里。",
      topic: "core-objects-state",
      difficulty: "intermediate",
      sidebar_position: 2,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-sparse-primary-indexes-guide",
        "clickhouse-distributed-engine-doc",
        "clickhouse-system-parts-doc",
        "clickhouse-replication-docs",
      ],
      claim_ids: [
        "clickhouse-claim-0002",
        "clickhouse-claim-0003",
        "clickhouse-claim-0004",
        "clickhouse-claim-0006",
        "clickhouse-claim-0007",
        "clickhouse-claim-0009",
      ],
      tags: ["bigdata", "clickhouse", "core-objects", "knowledge-base", "production"],
    },
    body: String.raw`
## 理解 ClickHouse，先抓住 part 而不是先抓 SQL
在 ClickHouse 里，很多“表级问题”最终都会落到 part、granule、replica 或 Distributed 访问层上。逻辑表名只是入口；真正持有状态、消耗资源、决定可见性和恢复方式的，往往是更底层的对象。

## 一张表里到底有哪些关键对象
| 对象 | 本质 | 它持有什么状态 | 最值得看的证据 |
| --- | --- | --- | --- |
| Table | 面向用户的逻辑对象 | 引擎定义、分区和排序规则、列定义 | SHOW CREATE TABLE、system.tables |
| Part | MergeTree 的基础物理单元 | 当前活动数据、字节数、行数、level、磁盘位置 | system.parts、system.part_log |
| Partition | part 的管理分组 | 归档、删除、移动、TTL 和复制边界的一部分 | system.parts |
| Granule | 稀疏索引的最小定位粒度 | 一组连续行的读取边界 | EXPLAIN indexes = 1 |
| Mark | 指向 granule 起点的定位信息 | 列文件偏移和索引跳转依据 | EXPLAIN indexes = 1 |
| Primary Key | 稀疏主键索引定义 | 决定能裁掉哪些 granule 范围 | EXPLAIN indexes = 1 |
| Replica | 同一复制表的一份副本 | 本地 part 集合、复制队列、会话状态 | system.replicas、system.replication_queue |
| Shard | 数据水平切分单元 | 某一批本地表或副本组承载的数据子集 | 集群配置、Distributed 查询路径 |
| Distributed Table | 分布式访问层 | 路由信息、发送策略、本地缓冲目录 | SHOW CREATE TABLE |

## 哪些对象是物理状态，哪些只是访问入口
最容易混淆的三个对象是 Table、Part 和 Distributed Table：

- 本地 MergeTree 表是真正拥有物理数据布局的对象。
- part 才是本地表里真正被读写、合并、复制和恢复的物理单元。
- Distributed 表通常不直接保存分析数据本体，它更像路由层，把查询发到各 shard，把写入转发到远端本地表或本地缓冲目录。

## Primary Key、ORDER BY、Granule、Mark 的真实关系
ClickHouse 里的 PRIMARY KEY 和传统事务数据库里“唯一定位一行”的主键不是一回事。它本质上是稀疏索引规则，用来帮助查询跳过大量不可能命中的 granule。ORDER BY 决定数据在 part 内如何排序；PRIMARY KEY 决定索引覆盖哪些键列；granule 是一组连续行；mark 则记录这些 granule 的起点信息。

## Replica 和 Shard 解决的是不同问题
Replica 主要解决的是同一份数据的高可用和容错，Shard 主要解决的是数据水平切分和并行扩展。副本多了，不代表查询天然更快；真正决定横向扩展上限的通常是 shard 划分和本地表布局。

## 状态从哪里看，不能凭想象
核心对象一旦落到生产环境，就必须有稳定的观察入口：

- 看 part 是否爆炸：system.parts
- 看 part 是怎么产生和合并的：system.part_log
- 看复制是否健康：system.replicas
- 看复制任务卡在哪：system.replication_queue
- 看查询到底读了多少：system.query_log 和 EXPLAIN indexes = 1

## 示例：一次性把对象关系看清楚
~~~sql
SELECT
    database,
    table,
    partition,
    name AS part_name,
    active,
    rows,
    bytes_on_disk,
    level
FROM system.parts
WHERE database = 'analytics' AND table = 'events_local'
ORDER BY partition, name;
~~~`,
  },
  {
    path: "docs/bigdata/clickhouse/architecture-and-roles.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/architecture-and-roles",
      title: "ClickHouse 架构分层与角色协作",
      description: "从客户端、Server、本地表、Distributed 表、Replica、Shard 和 Keeper 的协作链路理解 ClickHouse 架构。",
      topic: "architecture-and-roles",
      difficulty: "intermediate",
      sidebar_position: 3,
      source_ids: [
        "clickhouse-docs",
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-replication-docs",
        "clickhouse-system-replicas-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0001",
        "clickhouse-claim-0005",
        "clickhouse-claim-0006",
        "clickhouse-claim-0007",
        "clickhouse-claim-0008",
        "clickhouse-claim-0015",
      ],
      tags: ["bigdata", "clickhouse", "architecture", "knowledge-base", "production"],
    },
    body: String.raw`
## 单机表、本地表、Distributed 表、副本与 Keeper 如何协作
ClickHouse 看起来像是“一个进程 + 一堆表”，但真正运行起来时至少同时包含四层：客户端请求入口、本地数据面、分布式访问层和复制协调层。只有把这四层分开，才能看清不同异常应该落在哪一层分析。

## 请求入口层：客户端只看见 SQL，Server 需要做更多事
无论客户端来自 HTTP、原生 TCP 还是 JDBC，最先接住请求的都是 ClickHouse Server。Server 要做的事情远不只是解析 SQL：识别访问的是本地表还是 Distributed 表，解析读取路径，必要时把请求路由到远端 shard，对复制表维护与 Keeper 的会话和状态。

## 本地数据面：真正保存数据的是本地 MergeTree 表
无论最终对外暴露的是不是 Distributed 表，真正落数据、产生 part、执行 merge、维护 TTL 和 mutation 的，都是本地 MergeTree 表。生产架构里常常会把本地表命名成 xxx_local，再在上面包装 xxx_all 之类的 Distributed 表，这样职责最清楚。

## 分布式访问层：Distributed 表解决访问统一，不解决布局质量
Distributed 引擎的价值，是把多个 shard 上的本地表组织成统一入口，让查询和写入不必由调用方手工枚举节点。它能路由查询、汇总结果，也能按设置选择前台或后台发送插入数据；但它不会替你解决本地表布局差的问题。

## 复制协调层：Keeper 关心的是元数据和顺序
ReplicatedMergeTree 通过 ClickHouse Keeper 或 ZooKeeper 维护复制相关元数据、日志和队列。Keeper 不是主数据存储，它不替代本地磁盘里的 part 文件；真正的数据仍然在各 replica 本地，只是复制行为、顺序和状态由 Keeper 协调。

## 一条典型查询是怎么穿过这些层的
以 SELECT 访问 Distributed 表为例，最小链路大致如下：

1. 客户端把 SQL 发给某个 ClickHouse Server。
2. Server 识别目标是 Distributed 表，并解析远端 shard 列表。
3. 各 shard 上的本地 MergeTree 表各自执行分区裁剪、主键裁剪和列读取。
4. 各节点先完成本地聚合或过滤，再把结果返回协调节点。
5. 协调节点做最终汇总、排序或 LIMIT，返回客户端。

## 一条典型写入是怎么穿过这些层的
如果是本地表写入，Server 直接在本地表上生成 part；如果是 Distributed 表写入，则还要区分发送模式：前台发送更接近同步转发，后台发送则先在本地缓冲目录落地，再由后台任务继续发送到远端。`,
  },
  {
    path: "docs/bigdata/clickhouse/metadata-state.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/metadata-state",
      title: "ClickHouse 元数据与状态管理",
      description: "解释表定义、part 元数据、复制元数据、Distributed 路由和访问控制对象分别由谁管理、何时变化、如何观测。",
      topic: "metadata-state",
      difficulty: "advanced",
      sidebar_position: 4,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-replication-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-system-parts-doc",
        "clickhouse-access-rights-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0002",
        "clickhouse-claim-0006",
        "clickhouse-claim-0007",
        "clickhouse-claim-0009",
        "clickhouse-claim-0022",
      ],
      tags: ["bigdata", "clickhouse", "metadata", "knowledge-base", "production"],
    },
    body: String.raw`
## 元数据不只是一条 CREATE TABLE
谈 ClickHouse 元数据时，最容易犯的错是把“元数据”理解成表结构定义。实际上，线上系统至少同时存在四类元数据：逻辑定义元数据、物理 part 元数据、复制协调元数据和访问治理元数据。它们的更新频率、持久化位置、故障影响面和观测入口都不一样。

## 逻辑定义元数据：描述表是什么
最外层的元数据是数据库、表、列、引擎、PARTITION BY、ORDER BY、TTL、投影、权限对象等定义。它回答的是“这张表应该长什么样”。常见入口包括 SHOW CREATE TABLE、system.tables、system.columns 和 SQL 方式管理的用户、角色、row policy、quota 等访问实体。

## 物理 part 元数据：描述数据当前是什么状态
物理层最关键的元数据是 part 级信息，比如 part 名称、所属 partition、行数、字节数、是否 active、level、所在磁盘、生成时间等。对 MergeTree 来说，这层信息往往比逻辑表定义更能解释线上问题。

## 复制元数据：描述多副本之间谁缺什么、谁卡住了
复制表场景下，还会存在一层与 Keeper 或 ZooKeeper 相关的元数据。它关心的不是“表定义是什么”，而是“这个 replica 当前队列里有哪些任务、会话是否健康、缺哪些 part、是否处于只读或延迟状态”。典型入口是 system.replicas 和 system.replication_queue。

## Distributed 路由元数据：描述请求应该去哪
Distributed 表引入的元数据更像访问路径信息，而不是数据布局信息。它描述的是目标 cluster、shard 和 replica 如何被路由。它不会替你记录本地 part 的细节，但会直接影响查询发到哪些节点、插入是前台发送还是后台发送、节点异常时是否还能从其他 replica 读取。

## 访问治理元数据：描述谁能做什么
ClickHouse 官方把 users、roles、row policy、settings profile 和 quota 也纳入访问控制实体。它们是另一类经常被忽视的元数据。很多生产问题看起来像“查询突然变慢”或“某个账号突然报错”，其实根因并不是数据面，而是 settings profile、quota 或权限对象发生了变化。`,
  },
  {
    path: "docs/bigdata/clickhouse/write-path.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/write-path",
      title: "ClickHouse 写入路径与提交边界",
      description: "解释批量写入如何生成 part、本地表与 Distributed 表写入有何差异、结果何时可见以及失败边界在哪里。",
      topic: "write-path",
      difficulty: "advanced",
      sidebar_position: 5,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-replication-docs",
        "clickhouse-system-parts-doc",
        "clickhouse-system-replication-queue-doc",
        "clickhouse-settings-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0005",
        "clickhouse-claim-0006",
        "clickhouse-claim-0008",
        "clickhouse-claim-0009",
        "clickhouse-claim-0016",
      ],
      tags: ["bigdata", "clickhouse", "write-path", "knowledge-base", "production"],
    },
    body: String.raw`
## INSERT 不会把行追加到旧文件，而是生成新的 part
理解 ClickHouse 写入路径，第一句就要说对：写入 MergeTree 表时，系统不是把新行追加到已有 part 的尾部，而是形成新的数据块并最终生成新的 part。后续查询看到的是 active part 集的变化，而不是某个旧文件被原地修改。

## 本地 MergeTree 写入的最小链路
本地写入大致经历这样几步：请求进入 Server，数据按表定义完成类型处理、必要排序和序列化，系统生成新的 part，并把它提交到活动 part 集；后台 merge 随后决定何时把这些小 part 合并成更大 part。

## 为什么批量大小会直接影响长期性能
因为 part 是写入结果的直接物理单元。写入批次太碎，就意味着 part 生成太快。短期看，客户端很快收到了成功；长期看，后台 merge 需要处理更多 part，查询也需要判断更多 part 和更多文件。这就是 ClickHouse 里“写入成功不等于写得健康”的典型场景。

## 写到 Distributed 表时，多了一层转发边界
如果目标不是本地表，而是 Distributed 表，路径会更复杂。Distributed 表的职责是把写入转发到远端本地表，但转发可以有不同模式：前台发送更贴近远端已接收的时点，后台发送则先在本地缓冲目录落地，再由后台任务继续发送。

## 复制表写入时，要把本地提交和副本传播分开
对于复制表，客户端通常是向某个 replica 所在节点写入。这个节点先完成本地写入并生成 part，随后其他 replica 通过复制元数据和队列逐步拉取或复用相关 part。因此判断“写入完成”必须先说清是本地可见、当前 shard 可见，还是所有 replica 都已经对齐。`,
  },
  {
    path: "docs/bigdata/clickhouse/read-path.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/read-path",
      title: "ClickHouse 读取路径与可见性边界",
      description: "从分区裁剪、稀疏主键索引、PREWHERE、列读取到分布式汇总系统化解释 ClickHouse 查询执行链路。",
      topic: "read-path",
      difficulty: "advanced",
      sidebar_position: 6,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-sparse-primary-indexes-guide",
        "clickhouse-prewhere-doc",
        "clickhouse-explain-doc",
        "clickhouse-distributed-engine-doc",
        "clickhouse-query-optimization-guide",
      ],
      claim_ids: [
        "clickhouse-claim-0002",
        "clickhouse-claim-0003",
        "clickhouse-claim-0004",
        "clickhouse-claim-0007",
        "clickhouse-claim-0017",
        "clickhouse-claim-0018",
        "clickhouse-claim-0019",
      ],
      tags: ["bigdata", "clickhouse", "read-path", "knowledge-base", "production"],
    },
    body: String.raw`
## 一条 SELECT 的成本主要由“裁掉了多少数据”决定
ClickHouse 查询快，不是因为它有某个神秘的执行器，而是因为它能在真正读取列数据之前，尽可能多地判断哪些数据根本不用读。这条读取路径的核心顺序是：先裁 partition，再裁 part 内范围，再尽量少读列，最后才执行聚合、排序、join 或结果汇总。

## 先看分区能不能裁掉整片数据
如果过滤条件能和 PARTITION BY 对齐，系统可以直接跳过一批 partition 对应的 part。这个阶段还没有进入“真正读数据”的成本高区，所以分区裁剪的收益通常非常大。但分区裁剪不是万能的：如果 partition 设计只是为了数据管理，而查询条件并不落在 partition 表达式上，就不能指望它替代排序键。

## 再看稀疏主键索引能不能缩小到更少的 granule
进入具体 part 后，ClickHouse 会利用稀疏主键索引判断哪些 granule 有可能命中条件。主键索引不是定位单行，而是跳过尽可能多的不相关 granule。只要把这一点说清，很多“为什么用了主键还是会读很多行”的现象就不难理解。

## PREWHERE 的价值是少读列
即使某些 granule 仍然必须读，ClickHouse 也会尽量先读更少的列，先把能过滤掉的大部分数据过滤掉，再去读剩余列。PREWHERE 体现的正是 ClickHouse 的列式读取思路：读取不是按行整体搬运，而是按列、按需要逐步加载。

## Distributed 查询还要再加一层远端汇总
如果入口是 Distributed 表，读取路径会在各 shard 本地先重复一遍上面的流程，然后再把中间或最终结果发回协调节点。真正高价值的问题不是“Distributed 做了什么神秘优化”，而是每个 shard 本地已经裁到多小、最终返回的结果集有多大、协调节点还要做多少额外排序和聚合。`,
  },
  {
    path: "docs/bigdata/clickhouse/consistency-boundaries.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/consistency-boundaries",
      title: "ClickHouse 一致性边界与不保证事项",
      description: "拆开说明单机写入、复制传播、Distributed 转发和外部系统协作时 ClickHouse 到底保证什么、不保证什么。",
      topic: "consistency-boundaries",
      difficulty: "advanced",
      sidebar_position: 7,
      source_ids: [
        "clickhouse-docs",
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-replication-docs",
        "clickhouse-settings-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0001",
        "clickhouse-claim-0005",
        "clickhouse-claim-0006",
        "clickhouse-claim-0008",
      ],
      tags: ["bigdata", "clickhouse", "consistency", "knowledge-base", "production"],
    },
    body: String.raw`
## 一致性问题要拆成四层，不能笼统问“是不是强一致”
很多关于 ClickHouse 的一致性问题，之所以越答越乱，是因为把不同层次混在了一起。更稳妥的方式，是把一致性拆成至少四层：本地表写入层、复制传播层、Distributed 转发层和外部系统协作层。

## 本地表提交的可见性边界
对本地 MergeTree 表来说，写入最终表现为新的 part 被提交到 active part 集。查询看到的是 active part 的变化，而不是某种通用 OLTP 行级事务日志。更适合的回答是：它以批量 part 为单位暴露写入结果，而不是以高频单行事务为核心抽象。

## 复制传播的完成边界
复制表场景下，还要再问一句：你说的“写入成功”是指当前写入节点本地成功，还是所有 replica 都已经追平？本地成功，不等于全副本同步完成；某个副本延迟，也不等于当前写入节点本地数据不可见。

## Distributed 转发的返回边界
通过 Distributed 表写入时，还要区分是前台发送还是后台发送。如果配置允许先本地缓冲、再后台发送，那么客户端收到成功返回的时刻，可能早于远端 shard 真正可见的时刻。

## 外部系统语义不由 ClickHouse 独自兜底
即使 ClickHouse 本地提交、复制传播和 Distributed 转发都工作正常，也不代表跨系统业务语义自然成立。上游消息系统是否重复投递、调用方失败重试是否会重复导入、下游报表是否在同一时刻读取到新数据，这些都超出了单组件保证边界。`,
  },
  {
    path: "docs/bigdata/clickhouse/partition-layout.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/partition-layout",
      title: "ClickHouse 分区、排序键与物理布局模型",
      description: "深入解释 PARTITION BY、ORDER BY、Primary Key、granule、mark 和 part 数量如何共同决定 ClickHouse 的查询与维护成本。",
      topic: "partition-layout",
      difficulty: "advanced",
      sidebar_position: 8,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-sparse-primary-indexes-guide",
        "clickhouse-partitioning-key-doc",
        "clickhouse-system-parts-doc",
        "clickhouse-explain-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0002",
        "clickhouse-claim-0003",
        "clickhouse-claim-0004",
        "clickhouse-claim-0017",
        "clickhouse-claim-0020",
      ],
      tags: ["bigdata", "clickhouse", "partition", "order-by", "knowledge-base", "production"],
    },
    body: String.raw`
## PARTITION BY 负责管理边界，ORDER BY 决定读放大上限
ClickHouse 表设计里，最容易被误解的就是分区键和排序键的职责。更准确的理解是：PARTITION BY 主要定义数据管理边界，而 ORDER BY 才更直接决定 part 内的数据排列方式和后续查询的裁剪效果。

## 先把三层布局分开
ClickHouse 的物理布局至少有三层：

- Partition：把 part 归入不同管理组，便于批量删除、移动、归档和部分 TTL 动作。
- Part：每次写入、merge 或 mutation 的直接物理单元。
- Granule：part 内进一步用于稀疏索引定位的一组连续行。

## ORDER BY 为什么比 PRIMARY KEY 更值得先看
ORDER BY 决定 part 内部的排序规则，也直接决定主键裁剪能不能发挥作用。只要过滤条件能命中排序键前缀，读放大会明显下降；如果过滤条件和排序键几乎无关，即使有主键，仍可能扫描大量 granule。

## 分区切得越细越好吗
通常不是。ClickHouse 官方文档明确提醒分区键不要过于细粒度。在大多数分析型表里，按月、按天做分区更常见；把分区切到用户级、小时级甚至更细，往往会带来更多 part、更高元数据成本和更复杂的后台维护，而不一定明显改善查询。`,
  },
  {
    path: "docs/bigdata/clickhouse/fault-recovery.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/fault-recovery",
      title: "ClickHouse 故障恢复与状态重建",
      description: "围绕 part 丢失、replica 落后、Keeper 异常、mutation 堵塞和备份恢复解释 ClickHouse 的恢复路径。",
      topic: "fault-recovery",
      difficulty: "advanced",
      sidebar_position: 9,
      source_ids: [
        "clickhouse-replication-docs",
        "clickhouse-system-parts-doc",
        "clickhouse-system-replicas-doc",
        "clickhouse-system-replication-queue-doc",
        "clickhouse-system-mutations-doc",
        "clickhouse-backup-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0006",
        "clickhouse-claim-0014",
        "clickhouse-claim-0015",
        "clickhouse-claim-0016",
        "clickhouse-claim-0026",
      ],
      tags: ["bigdata", "clickhouse", "recovery", "knowledge-base", "production"],
    },
    body: String.raw`
## 故障恢复要先判断：你是在恢复 part、恢复副本，还是恢复整张表
ClickHouse 的恢复问题之所以容易说乱，是因为“恢复”这个词覆盖了完全不同的层次。丢一个 part、某个 replica 落后、Keeper 会话异常、整机磁盘损坏、误删表后需要回滚，这些都叫恢复，但处理路径完全不同。

## 本地 part 层面的恢复
如果问题是 part 丢失、损坏、detached 或数量异常，首先应该确认它是逻辑删除、后台处理中间态，还是物理损坏。对 ClickHouse 来说，part 是最小恢复语义的中心对象：很多恢复动作本质上是把 part 重新变回 active，或者从其他副本重新获取缺失的 part。

## 副本层面的恢复
如果本地数据还在，但 replica 长时间落后、只读、队列持续增长，问题就更偏向复制层。此时关注重点不是“这张表有没有数据”，而是当前 replica 是否还能和 Keeper 正常交互、queue 里堆积的是 fetch、merge 还是 mutation 类型任务、absolute_delay 是否持续扩大。

## 备份与恢复
如果问题超出了副本自愈能力，比如误删表、整机不可恢复损坏、多个副本同时丢失关键数据，就需要进入备份恢复层。备份不是复制的替代品，复制也不是备份的替代品；生产恢复设计必须同时考虑二者。`,
  },
  {
    path: "docs/bigdata/clickhouse/maintenance-services.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/maintenance-services",
      title: "ClickHouse 后台服务与维护任务",
      description: "系统化解释 merge、mutation、TTL、fetch、move 等后台任务如何长期影响 ClickHouse 的健康度与性能。",
      topic: "maintenance-services",
      difficulty: "advanced",
      sidebar_position: 10,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-system-merges-doc",
        "clickhouse-system-mutations-doc",
        "clickhouse-system-replicas-doc",
        "clickhouse-system-replication-queue-doc",
        "clickhouse-ttl-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0005",
        "clickhouse-claim-0013",
        "clickhouse-claim-0014",
        "clickhouse-claim-0015",
        "clickhouse-claim-0016",
        "clickhouse-claim-0021",
      ],
      tags: ["bigdata", "clickhouse", "maintenance", "background-services", "knowledge-base", "production"],
    },
    body: String.raw`
## 后台线程不是附属功能，而是 ClickHouse 长期稳定性的主体之一
ClickHouse 很容易给人一种错觉：前台查询快，说明系统健康；前台写入成功，说明系统已经处理完。实际上，大量关键工作都是由后台服务在后续慢慢完成的。merge、mutation、TTL、复制拉取、数据移动，这些任务决定了 part 数会不会失控、磁盘会不会被拖垮、副本会不会持续落后。

## merge：把短期写入形态整理成长期可查询形态
merge 的核心任务是把很多较小的 part 合并成更适合长期查询的大 part。它不是“锦上添花”的清洁工，而是 ClickHouse 能把高吞吐写入和高效分析读取兼容起来的重要机制。

## mutation：逻辑更新删除在后台兑现
ALTER UPDATE 和 ALTER DELETE 之类的动作，本质上通常会转化成 mutation。它的特点不是“立即完成”，而是“后台逐步重写受影响的 part”。这也是为什么更新删除频率高、表又很大时，mutation 会成为持续性压力源。

## TTL 和复制队列也会持续制造工作
TTL 不只是过期判断条件，它还是一条长期执行的物理策略；复制表场景下，后台还要执行 fetch、merge 协调和 mutation 同步等任务。是否健康，不能只看“查询还能不能跑”，还要看后台队列里到底堆了什么。`,
  },
  {
    path: "docs/bigdata/clickhouse/lifecycle.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/lifecycle",
      title: "ClickHouse 数据生命周期与状态演进",
      description: "串起一批数据从写入、成 part、被 merge、被 mutation、被 TTL 处理到归档或删除的完整路径。",
      topic: "lifecycle",
      difficulty: "advanced",
      sidebar_position: 11,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-system-parts-doc",
        "clickhouse-system-part-log-doc",
        "clickhouse-system-merges-doc",
        "clickhouse-system-mutations-doc",
        "clickhouse-ttl-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0005",
        "clickhouse-claim-0010",
        "clickhouse-claim-0013",
        "clickhouse-claim-0014",
        "clickhouse-claim-0021",
      ],
      tags: ["bigdata", "clickhouse", "lifecycle", "knowledge-base", "production"],
    },
    body: String.raw`
## 一行数据在 ClickHouse 里不会静止不动
ClickHouse 的一个显著特征是：写入成功之后，数据通常还会继续经历物理层变化。它会先变成 part，再被后台 merge 合并成更大的 part；如果发生 ALTER TABLE ... DELETE 或 UPDATE，还可能被 mutation 改写；如果配置了 TTL，又会在条件满足后删除、移动或重压缩。

## 生命周期第一阶段：写入形成新 part
批量写入进入 MergeTree 表后，系统会生成新的 part。这里的关键不是“有新数据了”，而是“出现了一个新的物理对象”，后续所有 merge、复制、观察和删除动作都将以 part 为单位发生。

## 后续阶段：merge、mutation、TTL 和复制
后台 merge 会把多个小 part 合并成更大的 part；ALTER UPDATE 和 ALTER DELETE 通常通过 mutation 机制逐步改写受影响的 part；TTL 则会在到期后执行删除、移动或重压缩。只要表是复制表，part 的生命周期还会跨 replica 延伸，进入复制队列和恢复路径。`,
  },
  {
    path: "docs/bigdata/clickhouse/performance-model.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/performance-model",
      title: "ClickHouse 性能模型与瓶颈定位",
      description: "从读放大、part 数量、后台维护、内存压力与分布式网络成本建立 ClickHouse 的性能分析框架。",
      topic: "performance-model",
      difficulty: "advanced",
      sidebar_position: 12,
      source_ids: [
        "clickhouse-query-optimization-guide",
        "clickhouse-mergetree-docs",
        "clickhouse-system-query-log-doc",
        "clickhouse-system-parts-doc",
        "clickhouse-system-metrics-doc",
        "clickhouse-system-events-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0005",
        "clickhouse-claim-0011",
        "clickhouse-claim-0019",
        "clickhouse-claim-0025",
      ],
      tags: ["bigdata", "clickhouse", "performance", "knowledge-base", "production"],
    },
    body: String.raw`
## ClickHouse 的性能问题，先看“处理了多少无效数据”
ClickHouse 官方优化思路强调，最有效的优化往往是减少数据处理量。把这句话展开，就是 ClickHouse 最核心的性能模型：查询慢，优先怀疑读放大；写入越来越拖，优先怀疑小 part 和后台维护；集群越大越慢，优先怀疑分布式汇总和数据倾斜；内存常爆，优先怀疑大聚合、大排序和大 join。

## 五类高频瓶颈
- 读放大：read_rows 和结果行数相差巨大。
- part 过多：文件、元数据和后台维护成本同时上升。
- 后台维护反向吞掉前台性能：merge、mutation、TTL、复制在争资源。
- 聚合、排序和 join 的内存压力：读放大不大，但执行阶段很贵。
- 分布式网络和倾斜：最慢的 shard 或协调节点拖长整体延迟。

## 建立判断顺序，比记参数更重要
更稳的顺序通常是：先看 query_log，到底读了多少、耗时在哪、内存多少；再看 EXPLAIN，能不能裁、裁掉了多少；再看 system.parts，是不是小 part 太多；最后才决定是改表布局、改 SQL、改写入模式还是调设置。`,
  },
  {
    path: "docs/bigdata/clickhouse/tuning.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/tuning",
      title: "ClickHouse 调优方法与取舍边界",
      description: "以证据驱动的方式解释 ClickHouse 调优应先改什么、后改什么，以及每类优化的收益与代价。",
      topic: "tuning",
      difficulty: "advanced",
      sidebar_position: 13,
      source_ids: [
        "clickhouse-query-optimization-guide",
        "clickhouse-mergetree-docs",
        "clickhouse-prewhere-doc",
        "clickhouse-settings-doc",
        "clickhouse-system-query-log-doc",
        "clickhouse-explain-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0011",
        "clickhouse-claim-0017",
        "clickhouse-claim-0018",
        "clickhouse-claim-0019",
      ],
      tags: ["bigdata", "clickhouse", "tuning", "knowledge-base", "production"],
    },
    body: String.raw`
## 调优顺序比调优技巧更重要
ClickHouse 调优最常见的失败方式，不是不会调，而是顺序错了。更合理的顺序应该是：先改能决定数据处理量的因素，再改能影响执行代价的因素，最后才调资源和线程策略。

## 第一优先级：先改表布局和查询路径
只要表布局和查询路径明显不匹配，其他调优往往都是止痛药。优先看排序键是否匹配高频过滤条件、查询是否能利用 PREWHERE 和列裁剪、读取的列是不是远多于真实需要。

## 第二优先级：再改写入模式和 part 形态
如果 system.parts 已经表明 part 很多，那么继续压榨查询执行器通常意义不大。更高价值的动作往往是把高频碎写合并成更大的批次、修正过细分区设计、减少高频 mutation，让 merge 能把 part 收敛回健康区间。

## 调优结果必须能被复核
调优不是“看上去更快就算成功”，而是要能回答哪项证据发生了变化、变化是来自读放大下降还是只是偶然缓存命中、收益会稳定存在还是只在短时间窗口里好看。`,
  },
  {
    path: "docs/bigdata/clickhouse/resource-governance.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/resource-governance",
      title: "ClickHouse 资源治理与多租户边界",
      description: "解释 ClickHouse 如何用 settings、quotas、workload scheduling 和后台资源隔离来治理查询与维护任务。",
      topic: "resource-governance",
      difficulty: "advanced",
      sidebar_position: 14,
      source_ids: [
        "clickhouse-settings-doc",
        "clickhouse-quota-doc",
        "clickhouse-workload-scheduling-doc",
        "clickhouse-access-rights-doc",
        "clickhouse-system-processes-doc",
        "clickhouse-system-metrics-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0022",
        "clickhouse-claim-0023",
        "clickhouse-claim-0024",
        "clickhouse-claim-0025",
      ],
      tags: ["bigdata", "clickhouse", "governance", "resource", "knowledge-base", "production"],
    },
    body: String.raw`
## 资源治理不只是限制前台查询，还要管后台维护
ClickHouse 的资源问题很少只发生在一种负载上。前台查询、批量写入、后台 merge、mutation、TTL、复制 fetch 都会竞争同一组 CPU、内存、磁盘和网络资源。因此，资源治理的真正难点不是“给查询设个上限”，而是让不同类型的工作负载在同一套集群里长期共存。

## settings、quota 和 workload scheduling 的角色差异
settings 更像执行形态控制，解决“单条查询或单次写入不要无限吞资源”；quota 更像周期配额控制，解决“某个用户或租户在一段时间里最多能消耗多少”；workload scheduling 则解决“前台查询、导入、复制、merge 等负载如何不再裸奔竞争”。

## 治理前必须先把证据拿全
更可靠的顺序是：先看 system.processes，当前最重的在线查询是谁；再看 query_log，长期最贵的模式是什么；再看节点级 metrics，CPU、内存、磁盘、网络哪类资源真的紧；最后再进入限额和调度动作。`,
  },
  {
    path: "docs/bigdata/clickhouse/security-governance.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/security-governance",
      title: "ClickHouse 安全治理与权限边界",
      description: "围绕用户、角色、row policy、settings profile、quota 与最小权限原则解释 ClickHouse 的安全治理模型。",
      topic: "security-governance",
      difficulty: "advanced",
      sidebar_position: 15,
      source_ids: [
        "clickhouse-access-rights-doc",
        "clickhouse-role-doc",
        "clickhouse-row-policy-doc",
        "clickhouse-quota-doc",
        "clickhouse-settings-doc",
      ],
      claim_ids: ["clickhouse-claim-0022"],
      tags: ["bigdata", "clickhouse", "security", "rbac", "knowledge-base", "production"],
    },
    body: String.raw`
## 安全治理的核心不是密码，而是权限模型和最小暴露面
ClickHouse 的安全问题很容易被缩小成“有没有账号密码”。但真正决定系统是否可控的，往往是权限对象设计得是否清楚：谁能读哪些表、谁能执行 DDL、谁能拿到高资源设置、谁被 row policy 限制、谁在 quota 下运行。

## 访问控制对象应该成套理解
官方文档把 users、roles、row policies、settings profiles 和 quotas 放在同一套访问控制体系里。这说明安全不是单一开关，而是多层对象组合：user 代表登录主体，role 代表权限聚合，row policy 代表数据可见范围，settings profile 和 quota 则代表运行能力和长期资源边界。

## 更稳的默认模型
生产环境里，更稳的方式通常不是把所有权限直接发给用户，而是先设计角色，再把用户挂到角色上；同时配合 row policy、settings profile 和 quota 形成最小权限模型。`,
  },
  {
    path: "docs/bigdata/clickhouse/observability.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/observability",
      title: "ClickHouse 可观测性与诊断入口",
      description: "用 system.parts、query_log、merges、mutations、replicas、metrics 和 EXPLAIN 形成可复核的 ClickHouse 证据链。",
      topic: "observability",
      difficulty: "advanced",
      sidebar_position: 16,
      source_ids: [
        "clickhouse-system-parts-doc",
        "clickhouse-system-part-log-doc",
        "clickhouse-system-query-log-doc",
        "clickhouse-system-query-thread-log-doc",
        "clickhouse-system-merges-doc",
        "clickhouse-system-mutations-doc",
        "clickhouse-system-replicas-doc",
        "clickhouse-system-replication-queue-doc",
        "clickhouse-system-processes-doc",
        "clickhouse-system-metrics-doc",
        "clickhouse-system-events-doc",
        "clickhouse-system-asynchronous-metrics-doc",
        "clickhouse-errors-doc",
        "clickhouse-explain-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0009",
        "clickhouse-claim-0010",
        "clickhouse-claim-0011",
        "clickhouse-claim-0012",
        "clickhouse-claim-0013",
        "clickhouse-claim-0014",
        "clickhouse-claim-0015",
        "clickhouse-claim-0016",
        "clickhouse-claim-0017",
        "clickhouse-claim-0024",
        "clickhouse-claim-0025",
      ],
      tags: ["bigdata", "clickhouse", "observability", "monitoring", "knowledge-base", "production"],
    },
    body: String.raw`
## 没有 system.* 证据链，就谈不上 ClickHouse 排障
ClickHouse 的可观测性优势之一，是它把大量运行状态直接暴露在 system.* 表里。这意味着我们不需要只靠模糊经验猜测“系统可能哪里有问题”，而是可以把问题一步步收敛到 part、查询、后台任务、副本、进程和节点资源这些具体对象上。

## 按问题类型分组记忆入口
- 查 part 布局：system.parts、system.part_log
- 查查询行为：system.query_log、system.query_thread_log、EXPLAIN
- 查后台维护：system.merges、system.mutations
- 查复制健康：system.replicas、system.replication_queue
- 查当前在线请求：system.processes
- 查节点与服务级指标：system.metrics、system.events、system.asynchronous_metrics、system.errors

## 一个可靠的诊断闭环
更稳的排障顺序通常是：先看症状，再选 system.* 入口，必要时用 EXPLAIN 验证计划，最后再回到节点指标和错误计数确认是不是资源或底层故障。`,
  },
  {
    path: "docs/bigdata/clickhouse/troubleshooting.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/troubleshooting",
      title: "ClickHouse 生产排障路径",
      description: "按慢查询、part 爆炸、merge 堵塞、mutation 积压、复制延迟和 Distributed 路由异常等典型故障面给出排障顺序。",
      topic: "troubleshooting",
      difficulty: "advanced",
      sidebar_position: 17,
      source_ids: [
        "clickhouse-system-parts-doc",
        "clickhouse-system-query-log-doc",
        "clickhouse-system-merges-doc",
        "clickhouse-system-mutations-doc",
        "clickhouse-system-replicas-doc",
        "clickhouse-system-replication-queue-doc",
        "clickhouse-system-processes-doc",
        "clickhouse-explain-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0009",
        "clickhouse-claim-0011",
        "clickhouse-claim-0013",
        "clickhouse-claim-0014",
        "clickhouse-claim-0015",
        "clickhouse-claim-0016",
        "clickhouse-claim-0017",
        "clickhouse-claim-0024",
      ],
      tags: ["bigdata", "clickhouse", "troubleshooting", "knowledge-base", "production"],
    },
    body: String.raw`
## 把故障拆成固定故障面，排障才不会乱
ClickHouse 生产问题看起来很多，但真正高频的故障面其实很固定：查询慢、part 太多、merge 跟不上、mutation 堵住、副本延迟、Distributed 路由异常、磁盘和后台资源压力过高。与其泛泛地说“查日志、查监控”，不如先把问题归到这些故障面之一，再按固定顺序收证据。

## 一套可靠的排障顺序
1. 先确定影响范围：单表、单 query、单 replica、单 shard 还是整集群。
2. 再确定故障面：查询、part、后台维护、复制、Distributed 路由还是节点资源。
3. 再选择 system.* 证据入口和 EXPLAIN。
4. 最后才进入参数、重试、重启或更重的恢复动作。

## 一个通用排障起手式
~~~sql
SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query
FROM system.query_log
WHERE type = 'QueryFinish'
ORDER BY event_time DESC
LIMIT 20;

SELECT partition, count() AS active_parts
FROM system.parts
WHERE database = 'analytics' AND table = 'events_local' AND active
GROUP BY partition
ORDER BY active_parts DESC;

SELECT table, queue_size, absolute_delay, is_readonly
FROM system.replicas
WHERE database = 'analytics';
~~~`,
  },
  {
    path: "docs/bigdata/clickhouse/comparison.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/comparison",
      title: "ClickHouse 与相邻系统的选型边界",
      description: "基于 ClickHouse 的官方定位和运行机制，总结它与 Spark、Trino、Hive、MPP 分析库和 Elasticsearch 的边界差异。",
      topic: "comparison",
      difficulty: "advanced",
      sidebar_position: 18,
      source_ids: [
        "clickhouse-docs",
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-query-optimization-guide",
      ],
      claim_ids: [
        "clickhouse-claim-0001",
        "clickhouse-claim-0005",
        "clickhouse-claim-0007",
        "clickhouse-claim-0019",
      ],
      tags: ["bigdata", "clickhouse", "comparison", "knowledge-base", "production"],
    },
    body: String.raw`
## 这页的对比结论是工程归纳，不是官方单页结论
下面的比较，是基于 ClickHouse 官方定位、MergeTree 机制、Distributed 访问层和优化思路做出的工程化归纳。它不是官方文档里某一页逐项写好的“竞品表”，因此阅读时要把它理解成基于事实边界的选型推断。

## 和 Spark 的边界
ClickHouse 更像常驻的分析型数据库，擅长把数据以适合查询的物理形态长期放在系统里；Spark 更像通用计算引擎，擅长在批处理、SQL、流处理和多种外部存储之间组织计算。两者最大的差异不在“都能跑 SQL”，而在谁拥有长期存储形态、谁负责执行临时计算计划。

## 和 Trino、Hive、MPP 分析库、Elasticsearch 的边界
Trino 更强调联邦访问，ClickHouse 更强调自有物理布局；Hive 更偏离线数仓组织，ClickHouse 更偏交互式分析；与 Doris、StarRocks 这类 MPP 分析库相比，ClickHouse 更强调 MergeTree、part 和列式裁剪；Elasticsearch 则是搜索索引模型，不应简单等同于分析型列存。`,
  },
  {
    path: "docs/bigdata/clickhouse/system-design.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/system-design",
      title: "ClickHouse 系统设计取舍",
      description: "结合本地表、Distributed 表、分片副本、冷热分层与聚合链路解释 ClickHouse 架构设计的常见取舍。",
      topic: "system-design",
      difficulty: "advanced",
      sidebar_position: 19,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-replication-docs",
        "clickhouse-ttl-doc",
        "clickhouse-partitioning-key-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0002",
        "clickhouse-claim-0005",
        "clickhouse-claim-0006",
        "clickhouse-claim-0007",
        "clickhouse-claim-0020",
        "clickhouse-claim-0021",
      ],
      tags: ["bigdata", "clickhouse", "system-design", "knowledge-base", "production"],
    },
    body: String.raw`
## 设计 ClickHouse 架构时，先定本地表模型，再定访问层
ClickHouse 设计最容易走偏的地方，是一开始就把注意力放在集群拓扑上，比如“先建几个 shard、几个 replica”，却没有先把本地表模型定清楚。实际上，本地 MergeTree 表的布局决定了查询和维护的绝大部分成本，Distributed 表和集群拓扑更多是在此基础上做扩展和高可用包装。

## 一个常见而稳妥的骨架
最常见的设计，是每个节点维护本地表，再在集群上层暴露一个 Distributed 表统一访问。本地表负责 part、排序、分区、TTL、merge 和 mutation；Distributed 表负责跨节点查询和统一入口；副本和 Keeper 负责高可用与恢复。

## 三类高频取舍
- 写入吞吐 vs 查询布局：碎写会抬高 part 成本，过度追求查询延迟又可能牺牲写入灵活性。
- 明细查询 vs 预聚合链路：高频固定模式查询常常更适合物化视图或汇总表。
- 高可用 vs 水平扩展：副本主要服务于高可用，shard 才是主要扩展单元。`,
  },
  {
    path: "docs/bigdata/clickhouse/knowledge-map.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/knowledge-map",
      title: "ClickHouse 知识地图与学习路径",
      description: "给出从入门、进阶到生产治理的 ClickHouse 学习顺序，并说明各知识页之间的依赖关系。",
      topic: "knowledge-map",
      difficulty: "intermediate",
      sidebar_position: 20,
      source_ids: [
        "clickhouse-docs",
        "clickhouse-mergetree-docs",
        "clickhouse-query-optimization-guide",
        "clickhouse-access-rights-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0001",
        "clickhouse-claim-0002",
        "clickhouse-claim-0005",
        "clickhouse-claim-0019",
        "clickhouse-claim-0022",
      ],
      tags: ["bigdata", "clickhouse", "knowledge-map", "study-path", "production"],
    },
    body: String.raw`
## 学 ClickHouse 最怕顺序错了
ClickHouse 的知识点非常容易碎片化。只看 SQL，会觉得它像普通数据库；只看机器压测，会觉得它像纯性能产品；只看集群拓扑，又会把它误解成主要靠副本堆出来的系统。更有效的办法，是按“数据如何存、如何查、如何维护、如何治理”的顺序建立一张知识地图。

## 一条推荐学习路径
1. overview
2. core-objects-state
3. partition-layout
4. write-path
5. read-path
6. maintenance-services
7. performance-model
8. observability
9. fault-recovery
10. resource-governance 与 security-governance
11. system-design、comparison、release-quality-guide

## 不同角色的切入点不同
开发同学更适合先看布局和读写路径；平台和运维同学更适合先看架构、维护任务、观测和恢复；数据建模同学更适合先看对象、布局和性能模型；安全治理同学则更适合先看元数据、资源治理和权限边界。`,
  },
  {
    path: "docs/bigdata/clickhouse/release-quality-guide.md",
    meta: {
      ...commonMeta,
      kb_id: "bigdata/clickhouse/release-quality-guide",
      title: "ClickHouse 发布质量与上线校验清单",
      description: "从表布局、写入路径、复制状态、资源治理、备份恢复与观测项完整整理 ClickHouse 上线前必查事项。",
      topic: "release-quality-guide",
      difficulty: "advanced",
      sidebar_position: 90,
      source_ids: [
        "clickhouse-mergetree-docs",
        "clickhouse-distributed-engine-doc",
        "clickhouse-replication-docs",
        "clickhouse-query-optimization-guide",
        "clickhouse-access-rights-doc",
        "clickhouse-backup-doc",
        "clickhouse-system-parts-doc",
        "clickhouse-system-replicas-doc",
      ],
      claim_ids: [
        "clickhouse-claim-0005",
        "clickhouse-claim-0006",
        "clickhouse-claim-0007",
        "clickhouse-claim-0019",
        "clickhouse-claim-0022",
        "clickhouse-claim-0026",
      ],
      tags: ["bigdata", "clickhouse", "release-guide", "quality", "knowledge-base", "production"],
    },
    body: String.raw`
## ClickHouse 上线前最重要的不是“能跑通”，而是“长期能否稳住”
ClickHouse 很多风险不会在开发环境立刻暴露。真正上线后，写入频率、查询并发、part 演进、后台 merge、复制延迟和资源争抢才会同时出现。因此上线前的校验重点，不应该只是“SQL 正不正确”，而应该是“这套表和链路在真实负载下是否会稳定演进”。

## 六组必查项
1. 表布局：为什么这样设计 PARTITION BY 和 ORDER BY。
2. 写入路径：成功返回到底代表本地提交，还是远端也已可见。
3. 复制状态：replicas 和 replication queue 是否健康。
4. 观测入口：关键 system.* 表、EXPLAIN 和节点指标是否可用。
5. 资源与安全：roles、row policy、settings profile、quota 是否已经定义。
6. 恢复能力：副本自愈和备份恢复是否真的走通过。`,
  },
];

for (const doc of docs) {
  write(doc.path, `${frontmatter(doc.meta)}\n${doc.body.trimStart()}\n`);
}

const topics = {
  overview: {
    title: "整体定位与最小链路",
    summary: "确认表布局、查询裁剪和最小证据链。",
    sql: [
      "SHOW CREATE TABLE analytics.events_local;",
      "EXPLAIN indexes = 1 SELECT event_type, sum(amount) FROM analytics.events_local WHERE event_time >= toDateTime('2026-05-01 00:00:00') AND event_type = 'pay' GROUP BY event_type;",
    ],
    questions: [
      "这张表的 ORDER BY 是否服务于高频过滤条件？",
      "这条查询真正裁掉了多少 partition 和 granule？",
      "当前性能问题是读放大，还是后台维护拖慢了读取？",
    ],
  },
  architecture_and_roles: {
    title: "本地表、Distributed 表与副本分层",
    summary: "确认访问层、本地数据面和复制层的职责边界。",
    sql: [
      "SHOW CREATE TABLE analytics.events_local;",
      "SHOW CREATE TABLE analytics.events_all;",
      "SELECT table, is_readonly, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';",
    ],
    questions: [
      "入口表是本地 MergeTree 还是 Distributed？",
      "当前问题发生在本地表、路由层还是复制层？",
    ],
  },
  comparison: {
    title: "选型前的证据采样",
    summary: "用真实读写特征判断是否适合 ClickHouse，而不是先下结论。",
    sql: [
      "SELECT query_duration_ms, read_rows, read_bytes, result_rows FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;",
      "SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND active GROUP BY partition ORDER BY active_parts DESC LIMIT 20;",
    ],
    questions: [
      "我们的主场景是交互式分析，还是联邦查询、离线计算或全文搜索？",
      "是否愿意为高频查询维护专门的数据布局？",
    ],
  },
  consistency_boundaries: {
    title: "一致性边界核查",
    summary: "区分本地提交、复制追平和 Distributed 转发的完成定义。",
    sql: [
      "SELECT name, active, rows FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC LIMIT 10;",
      "SELECT table, queue_size, absolute_delay, is_readonly FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';",
    ],
    questions: [
      "这里的成功是指本地可见、所有副本追平，还是远端 shard 已可见？",
      "调用方有没有重试和幂等策略？",
    ],
  },
  core_objects_state: {
    title: "核心对象状态巡检",
    summary: "围绕 part、partition、replica 和 Distributed 表检查真实状态。",
    sql: [
      "SELECT database, table, partition, name, active, rows, bytes_on_disk, level FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY partition, name;",
      "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';",
    ],
    questions: [
      "当前最该看的对象是表、part、replica 还是 Distributed 路由？",
      "哪个对象真正持有问题现场的状态？",
    ],
  },
  fault_recovery: {
    title: "故障恢复最小证据链",
    summary: "先确认 part、replica 和队列状态，再决定是否进入更重的恢复动作。",
    sql: [
      "SELECT table, partition, name, active, rows, bytes_on_disk FROM system.parts WHERE database = 'analytics' AND table = 'events_local';",
      "SELECT table, is_readonly, queue_size, absolute_delay, lost_part_count FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';",
      "SELECT database, table, type, create_time, num_tries, last_exception FROM system.replication_queue WHERE database = 'analytics' AND table = 'events_local' ORDER BY create_time;",
    ],
    questions: [
      "故障发生在 part、本地副本、复制队列，还是需要进入备份恢复？",
      "系统当前还有没有副本自愈条件？",
    ],
  },
  interview_playbook: {
    title: "端到端巡检串讲",
    summary: "把布局、写入、读取、后台维护和复制健康放到同一条检查链路中。",
    sql: [
      "SHOW CREATE TABLE analytics.events_local;",
      "SELECT partition, count() AS active_parts, sum(rows) AS rows FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;",
      "SELECT query_duration_ms, read_rows, read_bytes, memory_usage FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;",
      "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';",
    ],
    questions: [
      "布局是否匹配主查询？",
      "part 是否在健康区间？",
      "后台 merge 和复制是否跟得上业务写入？",
    ],
  },
  lifecycle: {
    title: "数据生命周期追踪",
    summary: "观察一批数据从新 part 到 merge、mutation、TTL 的演进。",
    sql: [
      "SELECT partition, name, active, rows, bytes_on_disk, level FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC;",
      "SELECT event_type, part_name, rows, size_in_bytes FROM system.part_log WHERE database = 'analytics' AND table = 'events_local' ORDER BY event_time DESC LIMIT 20;",
      "SELECT mutation_id, command, parts_to_do, is_done FROM system.mutations WHERE database = 'analytics' AND table = 'events_local';",
    ],
    questions: [
      "数据现在停在生命周期的哪一步？",
      "是 merge、mutation 还是 TTL 在拖慢演进？",
    ],
  },
  maintenance_services: {
    title: "后台维护状态巡检",
    summary: "判断 merge、mutation、TTL 和复制任务是否在抢资源。",
    sql: [
      "SELECT database, table, elapsed, progress, num_parts, result_part_name FROM system.merges ORDER BY elapsed DESC;",
      "SELECT database, table, mutation_id, command, parts_to_do, is_done FROM system.mutations ORDER BY create_time DESC;",
      "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';",
    ],
    questions: [
      "现在最重的后台任务是谁？",
      "前台查询慢是因为读路径，还是后台任务在吞资源？",
    ],
  },
  metadata_state: {
    title: "三层元数据交叉核验",
    summary: "同时检查逻辑定义、物理 part 状态和复制元数据。",
    sql: [
      "SHOW CREATE TABLE analytics.events_local;",
      "SELECT table, partition, name, active, rows, bytes_on_disk FROM system.parts WHERE database = 'analytics' AND table = 'events_local';",
      "SELECT table, is_readonly, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';",
    ],
    questions: [
      "问题出在逻辑定义、物理 part 还是复制元数据？",
      "哪个层次的状态最先失真？",
    ],
  },
  observability: {
    title: "可观测性入口清单",
    summary: "把 query_log、processes、parts、replicas 和指标表串成现场证据链。",
    sql: [
      "SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;",
      "SELECT user, query_id, elapsed, memory_usage FROM system.processes ORDER BY elapsed DESC LIMIT 10;",
      "SELECT metric, value FROM system.metrics ORDER BY metric LIMIT 20;",
    ],
    questions: [
      "现在需要看的是历史查询、在线请求，还是节点资源？",
      "现象证据是否已经足够支撑下一步判断？",
    ],
  },
  partition_layout: {
    title: "布局设计验证",
    summary: "同时验证 PARTITION BY、ORDER BY、active part 数和索引裁剪效果。",
    sql: [
      "SHOW CREATE TABLE analytics.events_local;",
      "SELECT partition, count() AS active_parts, sum(rows) AS total_rows, sum(bytes_on_disk) AS total_bytes FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY partition;",
      "EXPLAIN indexes = 1 SELECT count() FROM analytics.events_local WHERE event_type = 'pay' AND event_time >= toDateTime('2026-05-01 00:00:00');",
    ],
    questions: [
      "分区是否只承担管理边界，而不是被误用成主加速手段？",
      "排序键前缀是否真的帮助高频过滤条件？",
    ],
  },
  performance_model: {
    title: "性能基线采样",
    summary: "用 query_log、parts 和节点指标判断慢点到底在哪一类成本上。",
    sql: [
      "SELECT query_duration_ms, read_rows, read_bytes, result_rows, memory_usage FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;",
      "SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;",
      "SELECT metric, value FROM system.metrics WHERE metric IN ('Query', 'Merge', 'ReplicatedFetch');",
    ],
    questions: [
      "当前主瓶颈是读放大、part 过多、后台维护还是内存压力？",
      "如果扩容前不改布局，症状会不会只是被放大？",
    ],
  },
  read_path: {
    title: "读取路径验证",
    summary: "把 EXPLAIN 与 query_log 对齐，确认查询到底裁掉了多少。",
    sql: [
      "EXPLAIN indexes = 1 SELECT event_type, count() FROM analytics.events_local WHERE event_time >= toDateTime('2026-05-01 00:00:00') AND event_type = 'pay' GROUP BY event_type;",
      "SELECT query_duration_ms, read_rows, read_bytes, result_rows, memory_usage FROM system.query_log WHERE query LIKE '%event_type = \\'pay\\'%' AND type = 'QueryFinish' ORDER BY event_time DESC LIMIT 5;",
    ],
    questions: [
      "partition、granule 和列读取分别裁掉了多少？",
      "协调节点是否在分布式查询里承受了额外压力？",
    ],
  },
  resource_governance: {
    title: "资源治理最小动作",
    summary: "先看当前重负载，再定义 quota 和工作负载边界。",
    sql: [
      "SELECT user, query_id, elapsed, memory_usage, query FROM system.processes ORDER BY memory_usage DESC LIMIT 20;",
      "CREATE QUOTA analytics_quota FOR INTERVAL 1 hour MAX queries = 50000, execution_time = 36000 TO analytics_role;",
    ],
    questions: [
      "最重的是前台查询，还是后台维护任务？",
      "限制对象应该是单次执行、长期配额，还是工作负载调度层？",
    ],
  },
  security_governance: {
    title: "安全边界定义",
    summary: "用角色、row policy 和 quota 组合出最小权限模型。",
    sql: [
      "CREATE ROLE analytics_reader;",
      "GRANT SELECT ON analytics.events_local TO analytics_reader;",
      "CREATE ROW POLICY only_cn_events ON analytics.events_local FOR SELECT USING region = 'cn' TO analytics_reader;",
      "CREATE QUOTA analytics_reader_quota FOR INTERVAL 1 hour MAX queries = 20000 TO analytics_reader;",
    ],
    questions: [
      "权限是直接发给用户，还是通过角色复用？",
      "数据可见范围和资源边界是否都已经被定义？",
    ],
  },
  system_design: {
    title: "架构骨架检查",
    summary: "确认本地表、Distributed 表、TTL 和副本在设计里各自承担什么职责。",
    sql: [
      "SHOW CREATE TABLE analytics.events_local;",
      "SHOW CREATE TABLE analytics.events_all;",
      "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics';",
    ],
    questions: [
      "本地表模型是否先于集群拓扑被设计清楚？",
      "副本是为了高可用，还是被误当成主要扩容手段？",
    ],
  },
  troubleshooting: {
    title: "通用排障起手式",
    summary: "先缩小故障面，再决定看 query、parts、后台任务还是复制。",
    sql: [
      "SELECT query_duration_ms, read_rows, read_bytes, memory_usage, query FROM system.query_log WHERE type = 'QueryFinish' ORDER BY event_time DESC LIMIT 20;",
      "SELECT partition, count() AS active_parts FROM system.parts WHERE database = 'analytics' AND table = 'events_local' AND active GROUP BY partition ORDER BY active_parts DESC;",
      "SELECT table, queue_size, absolute_delay, is_readonly FROM system.replicas WHERE database = 'analytics';",
    ],
    questions: [
      "这是查询问题、part 问题、后台任务问题，还是复制问题？",
      "下一步应该去 EXPLAIN、replication_queue 还是 system.processes？",
    ],
  },
  tuning: {
    title: "调优闭环模板",
    summary: "先看 EXPLAIN，再看 query_log，最后决定改布局还是改设置。",
    sql: [
      "EXPLAIN indexes = 1 SELECT user_id, sum(amount) FROM analytics.events_local WHERE event_type = 'pay' AND event_time >= toDateTime('2026-05-01 00:00:00') GROUP BY user_id;",
      "SELECT query_duration_ms, read_rows, read_bytes, memory_usage FROM system.query_log WHERE query LIKE '%sum(amount)%' AND type = 'QueryFinish' ORDER BY event_time DESC LIMIT 10;",
    ],
    questions: [
      "收益来自读放大下降，还是只是偶然缓存命中？",
      "当前更应该改表布局、改写入模式，还是改执行设置？",
    ],
  },
  write_path: {
    title: "写入路径核查",
    summary: "确认 part 生成、Distributed 转发和复制传播分别走到哪一步。",
    sql: [
      "INSERT INTO analytics.events_local SELECT now(), number, 'pay', randUniform(1, 100) FROM numbers(100000);",
      "SELECT name, partition, rows, bytes_on_disk, active FROM system.parts WHERE database = 'analytics' AND table = 'events_local' ORDER BY modification_time DESC LIMIT 10;",
      "SELECT table, queue_size, absolute_delay FROM system.replicas WHERE database = 'analytics' AND table = 'events_local';",
    ],
    questions: [
      "当前成功返回代表本地 part 已提交，还是远端和副本也已追平？",
      "part 生成速度是否已经快到会拖垮后台 merge？",
    ],
  },
};

for (const [name, cfg] of Object.entries(topics)) {
  const sqlPath = path.join("examples", "sql", "clickhouse", `${name}.sql`);
  const sqlBody = [
    `-- ClickHouse ${cfg.title} 示例`,
    `-- 目的：${cfg.summary}`,
    ...cfg.sql,
    "",
    "-- 关键追问：",
    ...cfg.questions.map((q, i) => `-- ${i + 1}. ${q}`),
    "",
  ].join("\n");
  write(sqlPath, sqlBody);

  const pyPath = path.join("examples", "python", "clickhouse", `${name}.py`);
  const pyBody = `"""ClickHouse ${cfg.title} 辅助脚本。\n\n该脚本输出排查主题、建议追问和可复核 SQL。\n"""\n\nimport json\nfrom dataclasses import dataclass, asdict, field\n\n\n@dataclass\nclass ClickHouseGuide:\n    topic: str = ${JSON.stringify(name)}\n    title: str = ${JSON.stringify(cfg.title)}\n    summary: str = ${JSON.stringify(cfg.summary)}\n    questions: list[str] = field(default_factory=lambda: ${JSON.stringify(cfg.questions, null, 4)})\n    evidence_sql: list[str] = field(default_factory=lambda: ${JSON.stringify(cfg.sql, null, 4)})\n\n\nif __name__ == "__main__":\n    print(json.dumps(asdict(ClickHouseGuide()), ensure_ascii=False, indent=2))\n`;
  write(pyPath, pyBody);
}
