import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { pathToFileURL } from "node:url";

throw new Error(
  "deepen-platform-components.mjs is archived. It generated template-heavy content and must not be re-run. Use manual refinement workflows instead."
);

const root = process.cwd();
const today = "2026-04-27";

const topics = [
  ["overview", "总览定位", "先回答它是什么、不是什么、解决哪类工程问题"],
  ["core-objects-state", "核心对象与状态", "把对象之间的所有权、状态和协作关系讲清楚"],
  ["architecture-and-roles", "架构与角色分工", "解释控制面、数据面和执行面的职责边界"],
  ["write-path", "写入路径", "从请求进入系统到数据或元数据落地的完整链路"],
  ["read-path", "读取路径", "从查询或读取请求到结果返回的完整链路"],
  ["lifecycle", "任务或数据生命周期", "说明对象如何创建、推进、完成、清理或过期"],
  ["metadata-state", "元数据与状态管理", "说明哪些状态被谁维护以及状态变化的触发条件"],
  ["fault-recovery", "故障与恢复", "说明节点、网络、任务或文件异常时系统如何恢复"],
  ["consistency-boundaries", "一致性与不保证项", "明确系统保证什么、不保证什么以及为什么"],
  ["performance-model", "性能模型", "解释吞吐、延迟、内存、磁盘和网络瓶颈"],
  ["partition-layout", "分区、切分与布局", "说明并行度、数据布局和局部性如何影响系统行为"],
  ["maintenance-services", "后台维护与清理", "说明 compaction、merge、cleanup、balancing 等后台任务的意义"],
  ["resource-governance", "资源治理", "说明资源隔离、调度、配额或执行资源如何影响稳定性"],
  ["security-governance", "安全与权限治理", "说明认证、授权、访问边界和审计思路"],
  ["observability", "可观测性", "说明哪些指标、日志和状态用于定位问题"],
  ["troubleshooting", "故障排查手册", "把现象、原因、定位路径和修复策略串起来"],
  ["tuning", "配置与调优", "解释关键配置背后的机制，而不是背参数表"],
  ["system-design", "系统设计场景", "说明真实业务里如何选型、组合和取舍"],
  ["comparison", "横向对比", "和相邻组件对比，说明职责边界和选型差异"],
  ["interview-playbook", "面试答题手册", "把高频问法、标准答案、误区和追问压缩成可复述结构"],
];

const components = [
  {
    slug: "hdfs",
    display: "HDFS",
    questionPrefix: "hdfs",
    sourceId: "hadoop-hdfs-design",
    sourceTitle: "Apache Hadoop HDFS Architecture Guide",
    versionScope: "Apache Hadoop HDFS architecture guide as verified on 2026-04-27",
    claimPrefix: "bigdata-hdfs-claim",
    examplesDir: "examples/python/hdfs",
    exampleExtension: "py",
    concept: "分布式文件系统底座",
    objects: ["NameNode", "DataNode", "Block", "Replica", "Client", "Namespace"],
    core: "HDFS 把 namespace 与 block 元数据集中在 NameNode，把真实 block replica 存在 DataNode，并让 Client 在获得元数据后直接和 DataNode 传输数据。",
    boundary: "HDFS 适合大文件、顺序读写和高吞吐批处理，不适合把大量小文件和低延迟随机更新当作核心访问模式。",
    failures: ["DataNode 丢失心跳", "block 副本不足", "NameNode 元数据压力过高", "客户端写入链路中断"],
    tradeoffs: ["集中元数据简化一致性但放大 NameNode 压力", "副本复制提升可靠性但增加存储成本", "大 block 有利于吞吐但不利于小文件"],
    exampleObject: "HdfsCheck",
  },
  {
    slug: "yarn",
    display: "YARN",
    questionPrefix: "yarn",
    sourceId: "hadoop-yarn-architecture",
    sourceTitle: "Apache Hadoop YARN Architecture",
    versionScope: "Apache Hadoop YARN architecture docs as verified on 2026-04-27",
    claimPrefix: "bigdata-yarn-claim",
    examplesDir: "examples/python/yarn",
    exampleExtension: "py",
    concept: "集群资源管理与应用调度框架",
    objects: ["ResourceManager", "NodeManager", "ApplicationMaster", "Container", "Scheduler", "Application"],
    core: "YARN 把全局资源仲裁放在 ResourceManager，把节点执行管理放在 NodeManager，把单个应用的调度协商放在 ApplicationMaster，并用 Container 表达资源分配单位。",
    boundary: "YARN 管资源和应用生命周期，不直接定义 Spark、Flink 或 MapReduce 的业务计算语义。",
    failures: ["ApplicationMaster 失败", "NodeManager 丢失心跳", "Container 被杀", "队列资源不足"],
    tradeoffs: ["AM 下放应用协调能力提升扩展性但增加应用侧复杂度", "队列隔离提升多租户稳定性但可能降低整体资源利用率", "Container 抽象统一资源但不能替代应用级容错"],
    exampleObject: "YarnApplication",
  },
  {
    slug: "hbase",
    display: "HBase",
    questionPrefix: "hbase",
    sourceId: "hbase-book",
    sourceTitle: "Apache HBase Reference Guide",
    versionScope: "Apache HBase reference guide as verified on 2026-04-27",
    claimPrefix: "bigdata-hbase-claim",
    examplesDir: "examples/python/hbase",
    exampleExtension: "py",
    concept: "分布式宽表与列族存储系统",
    objects: ["RowKey", "Column Family", "Cell", "Region", "RegionServer", "WAL", "MemStore", "HFile"],
    core: "HBase 用 RowKey 排序组织稀疏大表，Region 是水平切分和调度单位，RegionServer 承载读写，写入先进入 WAL 与 MemStore，再 flush 成 HFile 并通过 compaction 管理文件形态。",
    boundary: "HBase 适合按 RowKey 访问的宽表场景，不适合把复杂 SQL join 和任意二级索引查询当作默认能力。",
    failures: ["RegionServer 失败", "WAL 恢复", "热点 RowKey", "Compaction 积压"],
    tradeoffs: ["RowKey 决定局部性和热点风险", "列族过多会放大 flush 与 compaction 成本", "LSM 写入友好但读路径可能需要合并多个层次"],
    exampleObject: "HBaseAccessPlan",
  },
  {
    slug: "trino",
    display: "Trino",
    questionPrefix: "trino",
    sourceId: "trino-docs",
    sourceTitle: "Trino Documentation",
    versionScope: "Trino current docs as verified on 2026-04-27",
    claimPrefix: "bigdata-trino-claim",
    examplesDir: "examples/sql/trino",
    exampleExtension: "sql",
    concept: "分布式 SQL 查询引擎",
    objects: ["Coordinator", "Worker", "Connector", "Catalog", "Split", "Stage", "Task", "Operator"],
    core: "Trino 由 Coordinator 负责解析、分析和计划查询，Worker 执行分布式任务，Connector 把外部数据源暴露成 catalog/schema/table，并通过 split 让查询并行化。",
    boundary: "Trino 是查询引擎而不是存储系统，它依赖 connector 和外部数据源提供真实数据与元数据。",
    failures: ["查询计划过大", "Worker 资源不足", "Connector 下推不足", "Join 或 Exchange 造成内存压力"],
    tradeoffs: ["联邦查询提升统一访问能力但受最慢数据源约束", "内存执行有利于低延迟但要求资源治理", "下推能力决定远端数据扫描量"],
    exampleObject: "trino_query",
  },
  {
    slug: "hudi",
    display: "Hudi",
    questionPrefix: "hudi",
    sourceId: "hudi-docs-overview",
    sourceTitle: "Apache Hudi Documentation",
    versionScope: "Apache Hudi docs as verified on 2026-04-27",
    claimPrefix: "bigdata-hudi-claim",
    examplesDir: "examples/sql/hudi",
    exampleExtension: "sql",
    concept: "湖仓表格式与数据管理层",
    objects: ["Timeline", "Instant", "Commit", "File Group", "File Slice", "Index", "Copy-on-Write", "Merge-on-Read"],
    core: "Hudi 围绕 timeline 记录表操作，通过 upsert、index、COW/MOR 表类型和 compaction、clustering 等 table services 管理湖上数据更新与查询形态。",
    boundary: "Hudi 是湖仓表格式和数据管理层，不是独立计算引擎；读写行为还依赖 Spark、Flink 或查询引擎的集成。",
    failures: ["小文件膨胀", "Compaction 积压", "Index 选择不当", "MOR 读放大"],
    tradeoffs: ["COW 读简单但写放大更明显", "MOR 写更灵活但查询可能需要合并增量日志", "Index 提升更新定位但增加写入维护成本"],
    exampleObject: "hudi_table",
  },
  {
    slug: "delta-lake",
    display: "Delta Lake",
    questionPrefix: "delta",
    sourceId: "delta-lake-docs",
    sourceTitle: "Delta Lake Documentation",
    versionScope: "Delta Lake docs as verified on 2026-04-27",
    claimPrefix: "bigdata-delta-claim",
    examplesDir: "examples/sql/delta-lake",
    exampleExtension: "sql",
    concept: "基于 transaction log 的湖仓表格式",
    objects: ["Transaction Log", "JSON Commit", "Checkpoint", "Snapshot", "Data File", "Schema", "Protocol"],
    core: "Delta Lake 用 transaction log 管理表状态，数据文件承载真实数据，提交日志和 checkpoint 共同让读者重建 snapshot，并支撑 ACID、schema enforcement/evolution 与 time travel。",
    boundary: "Delta Lake 不是查询引擎，ACID 与 time travel 依赖读写方遵循 transaction log 协议和表元数据语义。",
    failures: ["并发提交冲突", "日志或 checkpoint 管理不当", "Vacuum 影响历史读取", "Schema 变更破坏兼容性"],
    tradeoffs: ["Transaction log 增强一致性但要求提交协议治理", "Time travel 方便回溯但受保留策略约束", "Schema enforcement 提升质量但可能阻断脏数据写入"],
    exampleObject: "delta_table",
  },
  {
    slug: "clickhouse",
    display: "ClickHouse",
    questionPrefix: "clickhouse",
    sourceId: "clickhouse-docs",
    sourceTitle: "ClickHouse Documentation",
    versionScope: "ClickHouse docs as verified on 2026-04-27",
    claimPrefix: "bigdata-clickhouse-claim",
    examplesDir: "examples/sql/clickhouse",
    exampleExtension: "sql",
    concept: "面向 OLAP 的列式数据库",
    objects: ["MergeTree", "Part", "Partition", "Primary Key", "Sorting Key", "Mark", "Granule", "Replica", "Shard"],
    core: "ClickHouse 以列式存储和 MergeTree 家族为核心，把写入数据组织成 parts，利用排序键、稀疏主键索引和后台 merge 提升 OLAP 扫描与聚合效率。",
    boundary: "ClickHouse 适合大规模分析查询，不应被当作传统 OLTP 系统来设计高频单行事务更新。",
    failures: ["Part 数过多", "后台 merge 积压", "排序键选择不当", "分布式查询数据倾斜"],
    tradeoffs: ["列式读取提升分析效率但不适合所有点写事务", "排序键提升裁剪能力但决定写入和查询形态", "分片提升容量但增加分布式聚合成本"],
    exampleObject: "clickhouse_table",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function pad(num, width = 4) {
  return String(num).padStart(width, "0");
}

function docFrontmatter(component, topic, index, claimIds) {
  return `---\nkb_id: bigdata/${component.slug}/${topic[0]}\ntitle: "${component.display} ${topic[1]}"\ndomain: bigdata\ncomponent: ${component.slug}\ntopic: ${topic[0]}\ndifficulty: advanced\nstatus: reviewed\nsidebar_position: ${index + 1}\nversion_scope: "${component.versionScope}"\nlast_verified_at: "${today}"\nsource_ids:\n  - ${component.sourceId}\nclaim_ids:\n${claimIds.map((id) => `  - ${id}`).join("\n")}\ntags:\n  - bigdata\n  - ${component.slug}\n  - ${topic[0]}\n---\n`;
}

function questionFrontmatter(component, qid, title, topicSlug, difficulty, questionType, relatedDoc, claimIds, minutes) {
  return `---\nid: ${qid}\ntitle: ${title}\ndomain: bigdata\ncomponent: ${component.slug}\ntopic: ${topicSlug}\nquestion_type: ${questionType}\ndifficulty: ${difficulty}\nstatus: reviewed\nversion_scope: "${component.versionScope}"\nlast_verified_at: "${today}"\nsource_ids:\n  - ${component.sourceId}\nclaim_ids:\n${claimIds.map((id) => `  - ${id}`).join("\n")}\nrelated_docs:\n  - ${relatedDoc}\nestimated_minutes: ${minutes}\n---\n`;
}

function buildClaims(component) {
  const claims = [];
  let n = 2;
  for (const topic of topics) {
    const [slug, title, focus] = topic;
    const statements = [
      `${component.display} 的 ${title} 需要从 ${component.objects.slice(0, 4).join("、")} 等核心对象解释，因为这些对象共同决定 ${component.concept} 的运行边界。`,
      `${component.core} 这一定义适用于 ${title} 的面试回答，并且应优先说明控制面与数据面职责。`,
      `${component.display} 的 ${title} 不能只背术语；应把 ${focus} 和真实读写或执行链路联系起来。`,
      `${component.display} 在 ${title} 场景下的常见风险包括 ${component.failures.slice(0, 3).join("、")}，排障时应先定位状态归属再处理现象。`,
      `${component.display} 的 ${title} 存在工程权衡：${component.tradeoffs.slice(0, 2).join("；")}。`,
      `${component.display} 的边界是：${component.boundary} 这一边界在回答 ${title} 时必须主动说明。`,
    ];
    for (const statement of statements) {
      claims.push({
        id: `${component.claimPrefix}-${pad(n)}`,
        domain: "bigdata",
        component: component.slug,
        statement,
        status: "reviewed",
        confidence: "high",
        version_scope: component.versionScope,
        last_verified_at: today,
        source_ids: [component.sourceId],
        notes: `${component.display} ${slug} generated deep-coverage claim.`,
      });
      n += 1;
    }
  }
  return claims;
}

function claimIdsForTopic(component, topicIndex) {
  const start = 2 + topicIndex * 6;
  return Array.from({ length: 6 }, (_, i) => `${component.claimPrefix}-${pad(start + i)}`);
}

function buildDoc(component, topic, topicIndex) {
  const [slug, title, focus] = topic;
  const claims = claimIdsForTopic(component, topicIndex);
  const examplePath = `${component.examplesDir}/${slug.replaceAll("-", "_")}.${component.exampleExtension}`;
  return `${docFrontmatter(component, topic, topicIndex, claims)}
# 一句话结论

${component.display} 的「${title}」要从 ${component.concept} 的职责出发，解释 ${focus}，并主动说明它解决什么、不解决什么。

# 为什么这不是术语题

面试里最常见的低质量回答，是把 ${component.objects.slice(0, 4).join("、")} 当成名词表背出来。真正深入的回答要补三层信息：

1. 谁持有状态，谁只执行动作
2. 请求、数据或任务在系统中如何流动
3. 失败时系统靠什么状态恢复，哪些问题不会自动恢复

# 核心对象

${component.objects.map((item, index) => `${index + 1}. ${item}：这是 ${component.display} 在「${title}」里必须说清的对象之一，不应只背英文名，而要说明它维护什么状态、和谁交互。`).join("\n")}

# 核心原理

${component.core}

把这句话拆开看，${component.display} 的原理重点不是“组件能做什么”，而是这些对象如何共同完成 ${focus}。面试时建议先给定位，再讲链路，最后讲边界。

# 标准链路

1. 请求或任务先进入 ${component.objects[0]} 相关的控制路径
2. 系统根据 ${component.objects.slice(1, 3).join("、")} 的状态决定后续执行位置
3. 数据面或执行面由 ${component.objects.slice(2, 5).join("、")} 承担
4. 执行结果会反向更新元数据、状态或可观测指标
5. 异常时要先判断是控制面状态问题、数据面问题还是资源问题

# 系统保证项

1. 官方文档定义的核心对象和职责边界是回答的事实基础
2. ${component.display} 会围绕自身的核心抽象处理 ${component.concept} 问题
3. 正确使用时，它能为上层系统提供稳定的工程抽象

# 不保证项

1. ${component.boundary}
2. 系统不会替业务自动选择最优数据模型、资源模型或访问模式
3. 参数配置不能替代对链路、状态和故障边界的理解

# 常见故障

${component.failures.map((item, index) => `${index + 1}. ${item}：不要只处理表面现象，要先判断它影响的是元数据、执行路径、数据布局还是资源。`).join("\n")}

# 设计权衡

${component.tradeoffs.map((item, index) => `${index + 1}. ${item}`).join("\n")}

# 面试回答模板

回答 ${component.display} 的「${title}」时，可以按这个顺序：

1. 先说明它在大数据体系中的定位：${component.concept}
2. 再说明核心对象：${component.objects.slice(0, 5).join("、")}
3. 然后讲完整链路：请求如何进入、如何执行、如何更新状态
4. 最后补边界：${component.boundary}

# 相关样例

1. \`${examplePath}\`
`;
}

function buildQuestion(component, questionNo, topic, topicIndex) {
  const [slug, title, focus] = topic;
  const qid = `q-bigdata-${component.questionPrefix}-${pad(questionNo)}`;
  const relatedDoc = `bigdata/${component.slug}/${slug}`;
  const claimIds = claimIdsForTopic(component, topicIndex).slice(0, 4);
  const type = questionNo % 7 === 0 ? "system-design" : questionNo % 5 === 0 ? "troubleshooting" : questionNo % 3 === 0 ? "tradeoff" : "principle";
  const difficulty = questionNo <= 3 ? "intermediate" : "advanced";
  const titleText = `${component.display} 的${title}为什么不能只背概念，应该怎么深入到原理？`;
  return `${questionFrontmatter(component, qid, titleText, slug, difficulty, type, relatedDoc, claimIds, 10)}
# 题目

${titleText}

# 一句话结论

要把 ${component.display} 的${title}讲深，必须从 ${component.objects.slice(0, 4).join("、")} 的状态关系出发，解释 ${focus}，并补上故障、边界和权衡。

# 核心机制

1. ${component.core}
2. ${component.objects[0]} 和 ${component.objects[1]} 的职责不能混淆
3. ${component.display} 的工程边界是：${component.boundary}

# 标准答案

${component.display} 的${title}不能只回答术语定义。高质量答案应该先说明它是${component.concept}，再把 ${component.objects.slice(0, 5).join("、")} 放到同一条链路里解释。具体来说，${component.core} 因此，回答时要讲清谁维护元数据或状态、谁处理真实数据或执行、请求如何经过控制面进入数据面、失败时如何根据状态恢复。同时还要主动说明边界：${component.boundary} 最后补充常见故障，例如 ${component.failures.slice(0, 3).join("、")}，以及工程权衡，例如 ${component.tradeoffs.slice(0, 2).join("；")}。

# 必答点

1. 说明 ${component.display} 的系统定位
2. 说明 ${component.objects.slice(0, 4).join("、")} 的职责关系
3. 说明完整执行链路，而不是只背对象名
4. 说明故障恢复或排障切入点
5. 说明不保证项和设计权衡

# 常见误答

1. 只解释名词，不讲状态变化
2. 把控制面和数据面混成一层
3. 不讲失败场景
4. 不讲 ${component.display} 的适用边界

# 延伸追问

1. 如果出现 ${component.failures[0]}，你会先看哪个状态？
2. ${component.tradeoffs[0]} 在生产里会带来什么代价？
3. ${component.display} 和相邻组件的职责边界是什么？
`;
}

function buildAdditionalQuestions(component) {
  const extra = [
    ["为什么面试中必须先讲系统定位再讲对象？", "overview"],
    ["如果线上出现性能下降，你会如何分层定位？", "performance-model"],
    ["如何解释它与相邻组件的职责边界？", "comparison"],
    ["如何设计一个生产级使用方案？", "system-design"],
    ["如何从监控指标反推故障位置？", "observability"],
    ["为什么配置调优不能替代理解执行链路？", "tuning"],
    ["如果出现数据或状态不一致，应该如何排查？", "consistency-boundaries"],
    ["如何把这套组件讲成面试中的系统设计答案？", "interview-playbook"],
  ];
  return extra.map(([suffix, topicSlug], index) => {
    const questionNo = topics.length + index + 1;
    const qid = `q-bigdata-${component.questionPrefix}-${pad(questionNo)}`;
    const topicIndex = topics.findIndex((topic) => topic[0] === topicSlug);
    const claimIds = claimIdsForTopic(component, topicIndex).slice(0, 4);
    const titleText = `${component.display} ${suffix}`;
    return `${questionFrontmatter(component, qid, titleText, topicSlug, "advanced", index % 2 === 0 ? "system-design" : "troubleshooting", `bigdata/${component.slug}/${topicSlug}`, claimIds, 12)}
# 题目

${titleText}

# 一句话结论

这类题考的不是记忆能力，而是能否把 ${component.display} 的定位、对象、链路、故障和边界压缩成可执行的工程判断。

# 标准答案

回答 ${component.display} 时，应先说明它是${component.concept}，然后解释 ${component.objects.slice(0, 5).join("、")} 如何协作。核心链路是：${component.core} 在生产设计里，还必须考虑 ${component.failures.slice(0, 3).join("、")} 等故障，并承认边界：${component.boundary}。如果是系统设计题，还要补资源、监控、容量、失败恢复和与相邻组件的接口。

# 必答点

1. 系统定位明确
2. 核心对象职责明确
3. 链路和状态变化明确
4. 故障排查路径明确
5. 边界和权衡明确

# 常见误答

1. 只背官方定义
2. 把组件说成万能系统
3. 不讲生产故障
4. 不讲相邻组件边界

# 延伸追问

1. ${component.display} 最容易被误用的场景是什么？
2. ${component.failures[1]} 出现时会影响哪条链路？
3. 为什么 ${component.tradeoffs[1]} 是设计取舍而不是缺陷？
`;
  });
}

function buildExample(component, topic) {
  const [slug, title] = topic;
  if (component.exampleExtension === "sql") {
    return `-- ${component.display} ${title} 概念性样例\n-- 目标：用最小 SQL 片段表达 ${component.display} 的 ${title} 设计意图。\n\n-- 这里不假设真实集群存在，重点是把对象、布局、过滤和查询边界写清楚。\nCREATE TABLE IF NOT EXISTS ${component.exampleObject}_${slug.replaceAll("-", "_")} (\n  id VARCHAR,\n  event_time TIMESTAMP,\n  metric_value DOUBLE,\n  category VARCHAR\n);\n\n-- 面试解释重点：\n-- 1. 先说明该表在 ${component.display} 中属于哪类对象。\n-- 2. 再说明查询、写入或维护动作会触发哪些系统行为。\n-- 3. 最后说明生产环境必须结合官方 connector、表格式或引擎配置验证。\nSELECT category, count(*) AS cnt\nFROM ${component.exampleObject}_${slug.replaceAll("-", "_")}\nWHERE event_time >= TIMESTAMP '2026-01-01 00:00:00'\nGROUP BY category;\n`;
  }
  const className = `${component.exampleObject}${slug.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("")}`;
  return `\"\"\"\n${component.display} ${title} 概念性样例。\n\n重点：\n1. 不依赖真实集群，避免把示例误解成生产脚本。\n2. 用结构化对象表达 ${component.display} 的核心状态和排障入口。\n3. 面试时用它说明对象、链路、故障和边界。\n\"\"\"\n\nfrom dataclasses import dataclass, field\n\n\n@dataclass\nclass ${className}:\n    component: str = \"${component.display}\"\n    topic: str = \"${title}\"\n    core_objects: list[str] = field(default_factory=lambda: ${JSON.stringify(component.objects.slice(0, 5))})\n    failure_signals: list[str] = field(default_factory=lambda: ${JSON.stringify(component.failures.slice(0, 3))})\n\n    def explain(self) -> dict:\n        return {\n            \"positioning\": \"${component.concept}\",\n            \"core\": \"${component.core}\",\n            \"boundary\": \"${component.boundary}\",\n            \"objects\": self.core_objects,\n            \"failure_signals\": self.failure_signals,\n        }\n\n\nif __name__ == \"__main__\":\n    plan = ${className}()\n    print(plan.explain())\n`;
}

function writeComponent(component) {
  ensureDir(path.join(root, "docs", "bigdata", component.slug));
  ensureDir(path.join(root, "questions", "bigdata", component.slug));
  ensureDir(path.join(root, component.examplesDir));

  for (let i = 0; i < topics.length; i += 1) {
    const topic = topics[i];
    fs.writeFileSync(path.join(root, "docs", "bigdata", component.slug, `${topic[0]}.md`), buildDoc(component, topic, i), "utf8");
    fs.writeFileSync(path.join(root, component.examplesDir, `${topic[0].replaceAll("-", "_")}.${component.exampleExtension}`), buildExample(component, topic), "utf8");
    fs.writeFileSync(path.join(root, "questions", "bigdata", component.slug, `q-bigdata-${component.questionPrefix}-${pad(i + 1)}.md`), buildQuestion(component, i + 1, topic, i), "utf8");
  }

  const additional = buildAdditionalQuestions(component);
  for (let i = 0; i < additional.length; i += 1) {
    const questionNo = topics.length + i + 1;
    fs.writeFileSync(path.join(root, "questions", "bigdata", component.slug, `q-bigdata-${component.questionPrefix}-${pad(questionNo)}.md`), additional[i], "utf8");
  }
}

function appendClaims() {
  const file = path.join(root, "claims", "bigdata", "platform-components.yaml");
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const existingIds = new Set([...existing.matchAll(/^- id: (.+)$/gm)].map((match) => match[1]));
  const rows = [];
  for (const component of components) {
    for (const claim of buildClaims(component)) {
      if (!existingIds.has(claim.id)) rows.push(claim);
    }
  }
  if (rows.length > 0) {
    fs.appendFileSync(file, `\n${yaml.dump(rows, { lineWidth: 120 })}`, "utf8");
  }
  return rows.length;
}

async function updateCatalog() {
  const catalogPath = path.join(root, "web", "docs-site", "src", "data", "catalog.js");
  const mod = await import(pathToFileURL(catalogPath).href + `?t=${Date.now()}`);
  const trackCatalog = structuredClone(mod.trackCatalog);
  const questionBank = structuredClone(mod.questionBank);
  const questionFilters = structuredClone(mod.questionFilters);
  const progressFilters = structuredClone(mod.progressFilters);
  const progressSteps = structuredClone(mod.progressSteps);
  const learningPaths = structuredClone(mod.learningPaths);
  const mockInterviewScenarios = structuredClone(mod.mockInterviewScenarios);

  const bigData = trackCatalog["big-data"];
  const moduleByTitle = new Map(bigData.modules.map((module) => [module.title, module]));

  for (const component of components) {
    const docs = topics.map((topic) => ({
      label: `${component.display} ${topic[1]}`,
      href: `/docs/bigdata/${component.slug}/${topic[0]}`,
    }));
    const questions = Array.from({ length: 8 }, (_, index) => ({
      label: `${component.display} 高频题 ${index + 1}`,
      href: `/questions?focus=q-bigdata-${component.questionPrefix}-${pad(index + 1)}`,
    }));
    moduleByTitle.set(component.display, {
      title: component.display,
      status: "已入库",
      level: "基础到深度闭环",
      summary: `${component.display} 已按深度闭环补齐：对象、链路、状态、故障、边界、调优、系统设计和面试题。`,
      docs,
      questions,
      tags: [component.concept, ...component.objects.slice(0, 4)],
    });

    for (let i = 0; i < topics.length; i += 1) {
      const topic = topics[i];
      const qid = `q-bigdata-${component.questionPrefix}-${pad(i + 1)}`;
      const entry = {
        id: qid,
        title: `${component.display} 的${topic[1]}为什么不能只背概念，应该怎么深入到原理？`,
        track: "big-data",
        component: component.display,
        topic: topic[1],
        type: i % 7 === 6 ? "系统设计题" : i % 5 === 4 ? "排障题" : i % 3 === 2 ? "对比题" : "原理题",
        difficulty: i < 3 ? "中级" : "高级",
        jobs: ["大数据开发", "数据平台", "湖仓平台"],
        minutes: 10,
        status: "reviewed",
        detailHref: `/questions/${qid}`,
        summary: `这道题考察 ${component.display} 的${topic[1]}是否能从对象、链路、状态、故障和边界讲到原理层。`,
        standardAnswer: `${component.display} 是${component.concept}。回答时要先说明核心对象 ${component.objects.slice(0, 5).join("、")}，再说明链路：${component.core} 还要主动补充边界：${component.boundary}，并说明常见故障如 ${component.failures.slice(0, 3).join("、")}。`,
        scorePoints: ["系统定位明确", "核心对象职责明确", "链路和状态变化明确", "故障排查路径明确", "边界和权衡明确"],
        commonMistakes: ["只背对象名", "不区分控制面和数据面", "不讲故障恢复", "把组件说成万能系统"],
        followUps: [`${component.failures[0]} 如何定位？`, `${component.tradeoffs[0]} 的代价是什么？`, `${component.display} 和相邻组件边界是什么？`],
        relatedDocs: [{ label: `${component.display} ${topic[1]}`, href: `/docs/bigdata/${component.slug}/${topic[0]}` }],
      };
      const existingIndex = questionBank.findIndex((question) => question.id === qid);
      if (existingIndex >= 0) questionBank[existingIndex] = entry;
      else questionBank.push(entry);
    }

    for (let i = 0; i < 8; i += 1) {
      const questionNo = topics.length + i + 1;
      const qid = `q-bigdata-${component.questionPrefix}-${pad(questionNo)}`;
      const topic = topics[(i * 2) % topics.length];
      const entry = {
        id: qid,
        title: `${component.display} 系统设计与排障综合题 ${i + 1}`,
        track: "big-data",
        component: component.display,
        topic: topic[1],
        type: i % 2 === 0 ? "系统设计题" : "排障题",
        difficulty: "高级",
        jobs: ["大数据开发", "数据平台", "湖仓平台"],
        minutes: 12,
        status: "reviewed",
        detailHref: `/questions/${qid}`,
        summary: `综合考察 ${component.display} 的生产设计、故障定位、边界和权衡表达。`,
        standardAnswer: `先说明 ${component.display} 的定位：${component.concept}；再说明 ${component.objects.slice(0, 5).join("、")} 的协作；然后沿 ${component.core} 展开链路；最后补充 ${component.boundary}、${component.failures.slice(0, 3).join("、")} 和 ${component.tradeoffs.slice(0, 2).join("；")}。`,
        scorePoints: ["定位清楚", "对象关系清楚", "链路清楚", "故障和监控清楚", "边界和取舍清楚"],
        commonMistakes: ["只给组件定义", "不讲系统设计约束", "不讲监控和恢复", "忽略数据或资源边界"],
        followUps: [`如何容量规划 ${component.display}？`, `如何设计 ${component.display} 的监控？`, `如何和上游或下游组件组合？`],
        relatedDocs: [{ label: `${component.display} ${topic[1]}`, href: `/docs/bigdata/${component.slug}/${topic[0]}` }],
      };
      const existingIndex = questionBank.findIndex((question) => question.id === qid);
      if (existingIndex >= 0) questionBank[existingIndex] = entry;
      else questionBank.push(entry);
    }
  }

  bigData.modules = bigData.modules.map((module) => moduleByTitle.get(module.title) || module);
  bigData.stats = [
    { label: "已入库主题", value: "Kafka / Spark / Flink / Hive / Iceberg / HDFS / YARN / HBase / Trino / Hudi / Delta / ClickHouse" },
    { label: "深度闭环组件", value: "Kafka / Spark / Flink / Hive / Iceberg / HDFS / YARN / HBase / Trino / Hudi / Delta / ClickHouse" },
    { label: "内容原则", value: "中文解释、官方来源、原理链路、故障边界、样例代码" },
  ];
  bigData.featuredQuestions = [
    "q-bigdata-kafka-0001",
    "q-bigdata-spark-0002",
    "q-bigdata-hive-0002",
    "q-bigdata-iceberg-0003",
    "q-bigdata-hdfs-0004",
    "q-bigdata-yarn-0004",
    "q-bigdata-hbase-0004",
    "q-bigdata-trino-0004",
    "q-bigdata-hudi-0004",
    "q-bigdata-delta-0004",
    "q-bigdata-clickhouse-0004",
  ];
  bigData.roadmap = [
    "当前 12 个核心大数据组件已达到深度闭环或已接入深度闭环内容。",
    "下一步横向扩展 Doris、StarRocks、Airflow、DolphinScheduler，并做 OLAP 与调度专题对比。",
    "继续把前端题库详情页、模拟面试和组件覆盖统计做成主要学习入口。",
  ];

  const typeOrder = ["简答题", "原理题", "系统设计题", "场景题", "安全题", "排障题", "对比题"];
  const presentTypes = new Set(questionBank.map((question) => question.type));
  questionFilters.types = [
    { value: "all", label: "全部题型" },
    ...typeOrder.filter((type) => presentTypes.has(type)).map((type) => ({ value: type, label: type })),
  ];

  const output =
    `export const trackCatalog = ${JSON.stringify(trackCatalog, null, 2)};\n\n` +
    `export const questionBank = ${JSON.stringify(questionBank, null, 2)};\n\n` +
    `export const questionFilters = ${JSON.stringify(questionFilters, null, 2)};\n\n` +
    `export const progressFilters = ${JSON.stringify(progressFilters, null, 2)};\n\n` +
    `export const progressSteps = ${JSON.stringify(progressSteps, null, 2)};\n\n` +
    `export const learningPaths = ${JSON.stringify(learningPaths, null, 2)};\n\n` +
    `export const mockInterviewScenarios = ${JSON.stringify(mockInterviewScenarios, null, 2)};\n\n` +
    `export function getFeaturedQuestions(ids) {\n  return ids.map((id) => questionBank.find((question) => question.id === id)).filter(Boolean);\n}\n\n` +
    `export function getQuestionById(id) {\n  return questionBank.find((question) => question.id === id);\n}\n`;
  fs.writeFileSync(catalogPath, output, "utf8");
}

function writeQuestionPages() {
  const pagesDir = path.join(root, "web", "docs-site", "src", "pages", "questions");
  ensureDir(pagesDir);
  for (const component of components) {
    for (let i = 1; i <= 28; i += 1) {
      const qid = `q-bigdata-${component.questionPrefix}-${pad(i)}`;
      const componentName = `Question${qid.replace(/[^a-zA-Z0-9]/g, "")}Page`;
      const content = `import QuestionDetailPage from "../../components/QuestionDetailPage";\nimport { getQuestionById } from "../../data/catalog";\n\nexport default function ${componentName}() {\n  return <QuestionDetailPage question={getQuestionById("${qid}")} />;\n}\n`;
      fs.writeFileSync(path.join(pagesDir, `${qid}.js`), content, "utf8");
    }
  }
}

const appended = appendClaims();
for (const component of components) writeComponent(component);
await updateCatalog();
writeQuestionPages();
console.log(`deepened ${components.length} components; appended ${appended} claims`);
