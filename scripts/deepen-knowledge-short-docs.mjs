import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const shouldWrite = process.argv.includes("--write");
const minChars = Number(process.argv.find((arg) => arg.startsWith("--min="))?.split("=")[1] || 2800);

const roots = [
  path.join(repoRoot, "docs", "bigdata"),
  path.join(repoRoot, "docs", "ai-agent"),
  path.join(repoRoot, "docs", "llm-foundations"),
];

const componentFocus = {
  kafka: {
    state: "分区副本状态、ISR、controller metadata、consumer offset、producer sequence 和事务状态需要分层观察。",
    performance: "吞吐通常由分区数、批量大小、压缩、磁盘顺序写、页缓存、复制确认和消费端处理能力共同决定。",
    governance: "多租户治理要同时考虑 Topic 命名、ACL、quota、保留策略、压缩策略、Schema 管理和消费组隔离。",
  },
  spark: {
    state: "Driver 维护应用级调度状态，Executor 维护任务运行和缓存状态，Shuffle 文件和 checkpoint 决定失败后的恢复边界。",
    performance: "性能判断要从执行计划、Stage 切分、Shuffle、数据倾斜、内存 spill、GC、文件大小和并行度共同分析。",
    governance: "治理重点包括资源队列、依赖发布、数据访问权限、动态分配、事件日志留存和作业级成本归因。",
  },
  flink: {
    state: "状态分为 keyed state、operator state、checkpoint 元数据和外部 sink 提交状态，任何一层不一致都会影响恢复语义。",
    performance: "性能要看反压、checkpoint 对齐、状态后端、序列化、网络缓冲、watermark 滞后和 sink 吞吐。",
    governance: "治理重点包括 savepoint 生命周期、状态兼容、作业升级、权限隔离、外部系统幂等和告警阈值。",
  },
  hive: {
    state: "Hive 的关键状态在 Metastore、表/分区元数据、统计信息、文件布局和执行引擎任务状态中。",
    performance: "性能受分区裁剪、文件格式、压缩、统计信息、join 策略、小文件和底层计算引擎资源影响。",
    governance: "治理重点包括表权限、元数据变更审计、分区生命周期、数据血缘、Schema 变更和存储路径规范。",
  },
  hdfs: {
    state: "NameNode 元数据、EditLog、FsImage、block report、DataNode 心跳和 block 副本分布共同构成 HDFS 的运行状态。",
    performance: "吞吐取决于客户端并发、block 大小、副本 pipeline、DataNode 磁盘、网络拓扑、NameNode RPC 和小文件数量。",
    governance: "治理重点包括配额、权限、快照、冷热分层、机架感知、副本策略和 NameNode 元数据容量控制。",
  },
  yarn: {
    state: "ResourceManager 维护应用、队列和节点状态，NodeManager 维护单节点容器状态，ApplicationMaster 维护单应用任务状态。",
    performance: "调度效率受队列容量、资源请求粒度、本地性、节点健康、AM 策略和上层框架任务拆分影响。",
    governance: "治理重点包括队列容量、用户限额、节点标签、优先级、审计、日志聚合和应用生命周期管理。",
  },
  hbase: {
    state: "Region 分布、MemStore、WAL、HFile、BlockCache、compaction 队列和 ZooKeeper 协调状态共同影响读写。",
    performance: "性能取决于 row key 设计、热点、列族数量、flush、compaction、缓存命中率、WAL 延迟和 HDFS 状态。",
    governance: "治理重点包括表设计评审、预分区、TTL、版本数、权限、备份恢复和 Region 热点监控。",
  },
  trino: {
    state: "Coordinator 保存查询计划和调度状态，Worker 保存 Task、Driver、Operator 和 Exchange 状态，Connector 暴露外部元数据。",
    performance: "性能由 split 生成、join 顺序、统计信息、内存、spill、exchange、connector 下推和底层存储延迟共同决定。",
    governance: "治理重点包括 catalog 权限、资源组、查询限流、审计、连接器配置、数据源隔离和慢查询治理。",
  },
  hudi: {
    state: "Timeline、instant、file group、file slice、base file、log file、索引和表服务状态共同决定可见数据。",
    performance: "性能取决于表类型、索引、写入批量、小文件、compaction、clustering、cleaner 和查询引擎读取模式。",
    governance: "治理重点包括并发写入、commit 清理、增量消费、保留策略、Schema 演进和表服务调度。",
  },
  "delta-lake": {
    state: "_delta_log、protocol、metadata、AddFile、RemoveFile、checkpoint 和 commit 版本共同构成表状态。",
    performance: "性能受小文件、日志长度、checkpoint 周期、数据跳过、Z-order、分区设计和计算引擎优化影响。",
    governance: "治理重点包括 vacuum 保留期、并发提交、协议版本、Schema 演进、审计、权限和历史版本保留。",
  },
  iceberg: {
    state: "Catalog 指针、metadata.json、snapshot、manifest list、manifest file、data file 和 delete file 共同描述表状态。",
    performance: "性能取决于 manifest 数量、文件大小、分区/排序演进、统计信息、delete file 累积和引擎扫描规划。",
    governance: "治理重点包括快照保留、孤儿文件清理、并发提交、Schema ID、分支标签和 catalog 原子性。",
  },
  clickhouse: {
    state: "MergeTree 的 part、partition、primary key mark、后台 merge、replication queue 和 mutation 状态决定查询与写入表现。",
    performance: "性能由排序键、分区粒度、part 数量、压缩、向量化执行、聚合内存、磁盘 IO 和分布式查询网络决定。",
    governance: "治理重点包括 TTL、冷热分层、配额、用户权限、慢查询审计、复制延迟、mutation 控制和容量规划。",
  },
};

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
  if (!match) return { data: {}, body: content, prefix: "" };
  return { data: yaml.load(match[1]) ?? {}, body: content.slice(match[0].length), prefix: match[0] };
}

function domainDefaults(domain) {
  if (domain === "ai-agent") {
    return {
      state: "重点观察模型上下文、工具 schema、tool call 结果、session state、memory 写入、trace span 和人工接管状态。",
      performance: "质量和性能要同时看任务成功率、工具调用正确率、P95 延迟、token 成本、重试率、人工接管率和安全拦截率。",
      governance: "治理重点包括工具权限、审批策略、上下文隔离、敏感数据处理、模型路由、回归评估和可回放 trace。",
    };
  }
  if (domain === "llm-foundations") {
    return {
      state: "重点观察 token 预算、上下文窗口、检索证据、模型版本、推理参数、KV Cache、评估样本和安全策略状态。",
      performance: "质量和性能要同时看准确性、忠实性、拒答正确率、首 token 延迟、生成速度、吞吐、显存、成本和回归波动。",
      governance: "治理重点包括模型版本管理、Prompt 变更审计、评估集、RAG 数据权限、安全红队、成本预算和线上反馈闭环。",
    };
  }
  return {
    state: "重点观察核心对象、元数据、运行状态、外部依赖和失败反馈。",
    performance: "性能要从数据规模、资源瓶颈、执行链路、缓存、并发和外部系统延迟共同判断。",
    governance: "治理重点包括权限、审计、容量、变更、告警、回滚和生命周期管理。",
  };
}

function buildBlock(data) {
  const focus = componentFocus[data.component] || domainDefaults(data.domain);
  const title = data.title || data.topic || data.component || "当前主题";
  return [
    "",
    "# 深度解读补充",
    "",
    "## 状态检查清单",
    "",
    focus.state,
    "",
    "分析状态时不要只看单个指标。更可靠的方法是把控制面状态、数据面状态、元数据状态和外部依赖状态放在同一张链路图里对齐，确认问题是发生在请求进入前、执行过程中、提交阶段还是结果可见阶段。",
    "",
    "## 性能和容量判断",
    "",
    focus.performance,
    "",
    "容量判断应从峰值、均值和长尾三个角度看：峰值决定是否需要限流和扩容，均值决定资源成本，长尾决定用户体验和稳定性。任何调优动作都应该先有基线指标，再做单变量变化，否则无法判断收益来自哪里。",
    "",
    "## 治理和安全边界",
    "",
    focus.governance,
    "",
    "治理不是上线后的附加项，而是架构的一部分。权限、审计、隔离、保留期、变更记录和回滚策略应在设计阶段就明确，否则系统规模扩大后会出现不可追踪、不可恢复或不可解释的问题。",
    "",
    "## 示例化理解",
    "",
    "```text",
    `主题：${title}`,
    "现象：先描述用户可感知的问题，而不是直接猜根因。",
    "定位：确认问题属于控制面、数据面、状态面、资源面还是外部依赖。",
    "证据：收集日志、指标、执行计划、元数据和配置变更记录。",
    "处理：让处理动作和根因一一对应，并保留回滚路径。",
    "复盘：把本次问题沉淀为监控、告警、容量规划或文档更新。",
    "```",
    "",
  ].join("\n");
}

const files = roots.flatMap((root) => walkFiles(root, (_, name) => name.endsWith(".md")));
let updated = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const { data, body, prefix } = parseMarkdown(file);
  if (body.includes("# 深度解读补充")) continue;
  if ([...body].length >= minChars) continue;
  const next = `${prefix}${body.trim()}\n${buildBlock(data)}`;
  updated += 1;
  if (shouldWrite) fs.writeFileSync(file, next, "utf8");
}

console.log(JSON.stringify({ scanned: files.length, updated, minChars, write: shouldWrite }, null, 2));
