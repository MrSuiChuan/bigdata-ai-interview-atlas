import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const repoRoot = process.cwd();
const sparkDir = path.join(repoRoot, "docs", "bigdata", "spark");
const today = "2026-05-05";

function writePage(file, body) {
  const full = path.join(sparkDir, file);
  const text = fs.readFileSync(full, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error(`missing frontmatter: ${file}`);
  const data = yaml.load(match[1]);
  data.status = "reviewed";
  data.last_verified_at = today;
  data.version_scope = "Spark 4.1.1 docs as verified on 2026-05-05";
  const frontmatter = yaml.dump(data, { lineWidth: 120, quotingType: '"' }).trimEnd();
  fs.writeFileSync(full, `---\n${frontmatter}\n---\n${body.trim()}\n`, "utf8");
}

function code(lang, text) {
  return `~~~${lang}\n${text.trim()}\n~~~`;
}

const pages = {
  "spark-connect.md": `## 定位与边界
Spark Connect 解决的是客户端应用和 Spark Driver 强耦合的问题。传统模式下，用户代码通常直接运行在 Driver 进程中，客户端依赖 Spark 运行时、类路径、会话生命周期和集群网络。Spark Connect 把客户端和 Spark 服务端解耦：客户端构造 unresolved logical plan，通过协议发送给远端 Spark 服务端，由服务端完成分析、优化和执行。

这种解耦改变的是接入边界，不改变 Spark SQL 的核心执行语义。服务端仍然要使用 Spark SQL、Catalyst、物理计划、stage、task、shuffle 和 executor 完成计算。

## 核心对象
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Spark Connect Client | 在应用侧构造 DataFrame 操作和未解析逻辑计划 | 客户端不直接持有 executor，也不执行 Spark 物理计划 |
| Spark Connect Server | 接收计划、绑定 catalog、优化并提交执行 | 服务端承担 SparkSession、权限、资源和执行生命周期 |
| gRPC | 客户端和服务端通信协议层 | 网络延迟、连接管理和认证需要单独治理 |
| Arrow Result | 高效传输部分结果的数据表示 | 不消除 Driver/客户端结果面大小限制 |
| Unresolved Logical Plan | 客户端发送的逻辑计划表示 | 解析依赖服务端 catalog、函数、权限和配置 |

## 请求链路
客户端 API 看起来仍像普通 DataFrame 操作，但本地主要是在构建计划。action 触发后，客户端把 unresolved logical plan 发送到 Spark Connect 服务端。服务端根据自身 catalog、配置、函数和权限完成分析，生成 optimized logical plan 和 physical plan，再提交到 Spark 集群执行。

结果返回时，可以通过 Arrow 等方式传输数据。需要注意的是，结果高效传输不代表可以无限 collect。大结果仍应写入分布式存储或外部表，而不是全部拉回客户端。

## 与传统模式的差异
Spark Connect 的价值在于应用隔离、轻量客户端、多语言接入和服务端集中治理。客户端可以减少对完整 Spark 运行时的依赖，也更容易嵌入远端应用、Notebook、服务端程序或受控平台。

差异不应被理解为“Spark 变成了 OLTP 服务”。每次 action 仍可能触发分布式作业，延迟仍受计划复杂度、扫描、shuffle、executor 资源和外部存储影响。

## 生产诊断
诊断 Spark Connect 要分两层看。客户端侧看连接、超时、请求重试、结果拉取和 API 兼容性；服务端侧看 Spark SQL plan、Spark UI、event log、executor 日志、权限错误和资源队列。只看客户端异常通常无法定位真实执行瓶颈。

如果客户端报错是 unresolved column、function not found 或权限不足，根因通常在服务端 catalog、函数注册或权限配置。若执行慢，仍按 Spark SQL 计划和 Stage 指标排查。

## 示例：Connect 语义示意
${code("python", `
from pyspark.sql import SparkSession

# 连接地址取决于实际 Spark Connect 服务端部署。
spark = SparkSession.builder.remote("sc://spark-connect-server:15002").getOrCreate()

df = spark.range(0, 1000)
result = df.groupBy((df.id % 10).alias("bucket")).count()
result.explain("formatted")
print(result.limit(5).collect())

spark.stop()
`)}

## 设计取舍
Spark Connect 适合需要轻客户端、远端会话、平台化接入和多语言工具集成的场景。不适合把 Spark 当成高并发低延迟请求数据库。服务端要统一管理认证、授权、会话资源、连接超时、结果大小和 event log，否则客户端解耦会变成服务端集中风险。

## 来源与事实边界
本页依据 Spark Connect Overview、Spark SQL Guide 和 Spark Overview 文档。Spark Connect 的客户端 API 覆盖范围、认证方式和部署参数应以当前 Spark 版本与平台实现为准。`,

  "monitoring-history-server-event-log-and-rest-api.md": `## 定位与边界
Spark 监控不是单一页面，而是一组可复核证据：实时 Web UI、History Server、event log、REST API、metrics system、Driver 日志和 executor 日志。它们分别服务于运行中观察、事后回放、自动采集和根因定位。

生产诊断不能只看“应用成功或失败”。很多问题在失败前已经体现在 stage 长尾、shuffle spill、executor lost、GC 时间、状态增长、checkpoint I/O 或 sink commit 延迟上。

## 核心对象
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Application Web UI | 运行中查看 Jobs、Stages、SQL、Executors、Storage、Environment | 应用结束后默认不可长期访问 |
| Event Log | 记录 SparkListener 事件，用于事后回放 | 需要可靠存储、权限和保留策略 |
| History Server | 从 event log 重建已完成应用 UI | 回放质量依赖 event log 完整性 |
| REST API | 程序化获取应用、job、stage、executor 等信息 | 字段和可用性受版本影响 |
| Metrics System | 面向监控系统导出持续指标 | 需要与企业监控平台集成 |
| Driver/Executor Logs | 保存错误栈、依赖错误、OOM、容器事件 | 需要和集群管理器日志一起看 |

## 证据链路
运行中作业优先看 Web UI。Jobs 页面定位 action 与 job；Stages 页面定位 task 分布、shuffle、spill 和失败；SQL 页面定位物理计划、operator 耗时和 runtime statistics；Executors 页面定位内存、GC、磁盘、输入输出和 executor 丢失。

作业结束后，History Server 通过 event log 重建 UI。没有 event log，很多问题只能依赖零散日志；event log 不完整或权限不可读，History Server 也无法提供可靠回放。

## REST API 与自动化
REST API 适合把 Spark 运行状态接入平台，例如抓取应用状态、stage 指标、executor 指标和失败原因。它不能替代 event log，因为 REST 更偏运行状态查询，event log 更适合完整回放。

Metrics system 适合持续监控和告警，例如 executor 数量、JVM 指标、shuffle 指标、streaming 指标、state store 指标等。生产系统应把 metrics、event log 和业务数据质量指标合并看。

## 排障顺序
先确定影响范围：单个 application、单个 job、单个 stage、单个 executor、单个输入分区还是外部系统。再定位症状：排队慢、扫描慢、shuffle 慢、spill 多、GC 高、executor lost、state 增长、sink 慢。最后收集证据：Spark UI、event log、executor log、Driver log、集群事件和外部存储指标。

不要只看平均耗时。Spark 故障常常表现为少数 task 长尾、少数 executor 异常或少数分区倾斜。

## 示例：需要保留的诊断证据
${code("text", `
1. Spark application id、attempt id、提交时间和 Spark 版本。
2. explain("formatted") 或 SQL UI 中的 physical plan。
3. Stages 页面的 task duration、shuffle read/write、spill、failure reason。
4. Executors 页面的 executor lost、GC time、storage memory、input/output。
5. Driver 与 executor 日志，以及集群管理器的容器或 Pod 事件。
`)}

## 安全与保留
Spark UI、event log 和 History Server 可能暴露 SQL 文本、配置、环境变量、路径、错误栈和部分执行元数据。生产环境应配置 ACL、日志脱敏、event log 存储权限和保留策略。监控可见性不能以泄露凭据为代价。

## 来源与事实边界
本页依据 Spark Monitoring、Job Scheduling 和 Tuning 文档。不同部署平台可能把 UI、event log、metrics 和日志采集接入到不同系统，字段名称和保留策略以平台实现为准。`,

  "dynamic-allocation-decommission-and-shuffle-tracking.md": `## 定位与边界
动态资源解决的是 executor 数量随负载伸缩的问题，但它必须和 shuffle 数据可用性一起设计。Spark 作业在 shuffle 后可能仍依赖上游 executor 产生的 map output；如果 executor 被过早回收，下游可能出现 fetch failure 或被迫重算上游 stage。

Decommission 和 shuffle tracking 解决的是 executor 生命周期变化时如何降低本地块丢失影响。它们提高恢复稳定性，但不等同于把 executor 本地状态变成可靠外部存储。

## 核心对象
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Dynamic Allocation | 根据 pending tasks 和空闲时间申请或释放 executor | 改变资源生命周期，不改变 stage/task 语义 |
| External Shuffle Service | executor 退出后仍提供 shuffle block | 依赖部署和服务稳定性 |
| Shuffle Tracking | 跟踪哪些 executor 持有仍被依赖的 shuffle 输出 | 避免过早回收，但不是永久存储 |
| Decommission | 有序移除 executor 或节点前尽量迁移/保留 block | 不能保证所有本地状态都迁移成功 |
| Executor Idle Timeout | 判断空闲回收的时间阈值 | 阈值过短可能增加重算和 fetch failure |

## 伸缩链路
当存在 pending task backlog 时，Spark 可以申请更多 executor；当 executor 空闲超过阈值时，Spark 可以释放 executor。这个机制提升集群利用率，但也让缓存、shuffle 输出和 executor 本地状态变得更不稳定。

如果作业包含大 shuffle，伸缩策略必须确认 shuffle block 在 executor 退出后是否仍可读。否则资源节省会换来 stage 重提、重复计算和尾延迟放大。

## Shuffle 数据保留
external shuffle service 和 shuffle tracking 都是为了解决“计算资源可回收，但 shuffle 数据仍被需要”的矛盾。external shuffle service 把 shuffle block 服务能力从 executor 生命周期中拆出来；shuffle tracking 则让 Spark 知道哪些 executor 仍持有被依赖输出，从而避免过早释放。

两者的可用性取决于部署模式、Spark 版本和配置。不能简单认为开启 dynamic allocation 后 shuffle 一定安全。

## Decommission
Decommission 用于维护、缩容或抢占前的有序退出。它可以迁移或保存部分 block，减少突然丢失 executor 的冲击。它不是备份系统，也不替代 checkpoint、外部存储或表提交协议。

如果节点被强杀、磁盘故障或容器直接回收，decommission 可能没有足够时间完成迁移。

## 生产排障
需要同时看 executor removed reason、dynamic allocation 日志、shuffle fetch failure、stage retry、block manager 日志、external shuffle service 状态、节点维护事件和集群管理器事件。只看 executor 数量变化无法判断伸缩是否安全。

如果开启动态资源后作业变慢，重点检查 executor 反复申请/释放、缓存频繁丢失、shuffle 输出反复重算和空闲阈值是否过短。

## 示例：配置检查清单
${code("text", `
1. 是否启用 dynamic allocation，以及 min/max/initial executors。
2. shuffle 数据由 external shuffle service、shuffle tracking 还是其他机制保护。
3. executor idle timeout 是否适合作业的 stage 间隔和下游读取时间。
4. 是否启用 decommission，以及节点维护时是否有足够退出时间。
5. History Server 中是否出现 fetch failure、stage retry 和 executor lost 增加。
`)}

## 来源与事实边界
本页依据 Spark Job Scheduling、Configuration、Cluster Mode 和 Tuning 文档。具体动态资源默认值、shuffle service 支持和 decommission 行为依赖部署模式和 Spark 版本。`,

  "pyspark-arrow-pandas-udf-and-python-boundaries.md": `## 定位与边界
PySpark 让 Python 用户使用 Spark，但执行链路并不是纯 Python。计划构建、调度和 JVM 执行仍在 Spark 侧，Python 代码通常运行在 Python worker 中。跨 JVM 与 Python 的数据交换、序列化、Arrow 批次和 UDF 调用会形成额外边界。

因此，PySpark 性能问题不能只看 Python 代码，也不能只看 Spark SQL plan。需要同时看 Catalyst 优化是否被阻断、Python worker 是否成为瓶颈、Arrow 批处理是否合适、Driver 是否收集了过大结果。

## 核心对象
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| JVM Executor | 执行 Spark 物理计划和 task | 与 Python worker 之间需要数据交换 |
| Python Worker | 运行 Python UDF、Pandas UDF 等用户代码 | 有独立进程、内存和序列化成本 |
| Arrow | JVM 与 Python/Pandas 之间的列式交换格式 | 提升批量传输效率，不取消内存限制 |
| Pandas UDF | 基于 Arrow 批处理的 Python 向量化 UDF | 适合批量计算，但可能阻断部分优化 |
| toPandas/collect | 把结果带回 Driver 或客户端 | 大结果会压垮 Driver/客户端内存 |

## 执行链路
普通 DataFrame 列表达式尽量留在 JVM 和 Catalyst 可优化路径中执行。Python UDF 会把数据跨边界发送给 Python worker，再把结果返回 JVM。Pandas UDF 借助 Arrow 批量传输数据，通常比逐行 Python UDF 更高效，但仍然存在批次大小、Python 进程内存和类型兼容问题。

Arrow 优化的是跨语言数据交换方式，不改变 Spark 的分布式调度语义。一个 task 仍然处理一个或多个分区，Python worker 仍然在 executor 侧消耗 CPU 和内存。

## Driver 结果面
toPandas、collect 和大规模 show 都会把数据带回 Driver 或客户端。即使用 Arrow，结果也必须放进 Driver/客户端内存。Arrow 不能把无限大结果变成安全结果。

生产中应优先把大结果写入分布式存储，使用 limit、sample 或聚合结果做本地诊断。

## 诊断方法
先看 physical plan 中是否出现 PythonUDF、ArrowEvalPython 或相关 Python 执行节点。再看 task duration、executor CPU、Python worker 内存、序列化时间、Arrow batch size、失败栈和 Driver 结果大小。若 Python UDF 阻断过滤或投影下推，应优先改写为内置函数或 SQL 表达式。

如果 Pandas UDF OOM，既要看 executor JVM 内存，也要看 Python worker 和 Arrow 批次内存。只调 executor memory 可能不够。

## 示例：Pandas UDF 边界
${code("python", `
from pyspark.sql import SparkSession
from pyspark.sql.functions import pandas_udf
import pandas as pd

spark = SparkSession.builder.master("local[2]").appName("pandas-udf-boundary").getOrCreate()

@pandas_udf("long")
def plus_one(v: pd.Series) -> pd.Series:
    return v + 1

df = spark.range(0, 1000)
result = df.select(plus_one("id").alias("id_plus_one"))
result.explain("formatted")
print(result.limit(5).collect())
spark.stop()
`)}

## 设计取舍
能用 Spark SQL 内置函数表达的逻辑，优先不用 Python UDF。确实需要 Python 生态时，优先使用 Pandas UDF 做批量处理，并控制批次大小、输入列数量和返回结果规模。大规模数据不要用 toPandas 作为输出链路。

## 来源与事实边界
本页依据 PySpark User Guide、Arrow in PySpark、Spark SQL Guide 和 Dataset API 文档。Arrow 类型支持、fallback 行为、Pandas UDF API 和默认配置会随 Spark、PyArrow、Pandas 版本变化。`,

  "security-acl-encryption-redaction-and-ui-protection.md": `## 定位与边界
Spark 安全不是单个开关，而是 UI 访问、event log、网络通信、认证、授权、加密、配置脱敏、依赖分发和底层存储权限共同形成的边界。Spark 可以提供应用级控制，但数据访问最终还依赖 HDFS、对象存储、Hive Metastore、Kubernetes、YARN 或外部权限系统。

本页关注 Spark 自身能保护哪些面，以及哪些面必须交给平台权限、网络和存储系统治理。

## 核心对象
| 对象 | 作用 | 风险 |
| --- | --- | --- |
| Spark UI | 展示 job、SQL、environment、executor、storage 等信息 | 可能暴露 SQL、路径、配置和错误栈 |
| History Server | 回放已完成应用 | event log 权限不当会暴露历史执行元数据 |
| ACL | 控制应用 UI 和操作权限 | 需要和企业身份体系结合 |
| Redaction | 对敏感配置做脱敏 | 默认规则不一定覆盖自定义 secret |
| Network/RPC Encryption | 保护 Spark 内部通信 | 需要与部署模式一致配置 |
| Local/IO Encryption | 保护本地数据和 shuffle 等路径 | 不替代外部存储加密 |

## UI 与 Event Log
Spark UI 和 History Server 会暴露 job、SQL、环境变量、配置、accumulator、错误栈和部分执行计划信息。生产环境应开启访问控制，限制 History Server 访问，并对 event log 存储做权限控制。否则即使原始数据受保护，执行元数据也可能泄露敏感信息。

Event log 是事后排障证据，也是安全资产。它需要可靠存储、保留策略、访问审计和脱敏策略。

## 配置脱敏
Spark 支持对敏感配置做 redaction，避免 token、password、secret 在 UI、日志或 event log 中直接出现。生产中应检查自定义配置键、连接串、环境变量和第三方库日志是否被默认规则覆盖。

不要把脱敏当成权限控制。脱敏减少展示泄露，不能阻止有权限用户读取底层数据或访问外部服务。

## 网络与存储边界
Spark 网络加密、RPC 认证、shuffle 加密和 I/O 加密需要结合部署模式配置。即使 Spark 内部链路加密，外部数据源、checkpoint 目录、event log 目录、临时目录和依赖包仓库也需要独立权限和加密策略。

如果运行在 Kubernetes 或 YARN 上，还要同时检查 service account、Pod 权限、Kerberos、Ranger、云 IAM 或对象存储策略。

## 生产排查
安全问题排查应从访问路径开始：谁提交应用、Driver 运行在哪、executor 使用什么身份访问数据、UI/History Server 谁可见、event log 放在哪、配置是否脱敏、依赖包是否可信。不要只看 Spark 作业是否成功。

权限错误常常表现为读取失败、写出失败、checkpoint 失败、event log 写入失败或 executor 无法访问 secret。

## 示例：安全检查清单
${code("text", `
1. UI 和 History Server 是否启用 ACL，并接入企业身份体系。
2. event log、checkpoint、临时目录和输出目录是否有最小权限。
3. redaction 规则是否覆盖 password、token、secret、自定义连接串。
4. Spark 内部网络、shuffle 和本地 I/O 加密是否按部署模式配置。
5. executor 访问外部存储和 catalog 使用的身份是否可审计。
`)}

## 来源与事实边界
本页依据 Spark Security、Configuration、Monitoring 和 Submitting Applications 文档。企业平台通常还会叠加 Kerberos、Ranger、Lake Formation、Kubernetes RBAC 或云 IAM，应以实际平台权限链路为准。`,
};

for (const [file, body] of Object.entries(pages)) writePage(file, body);
console.log(JSON.stringify({ enhancedPages: Object.keys(pages).length }, null, 2));
