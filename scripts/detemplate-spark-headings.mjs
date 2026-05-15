import fs from "node:fs";
import path from "node:path";

const sparkDir = path.resolve("docs", "bigdata", "spark");

const headingRewrites = {
  "checkpoint-and-plan-truncation.md": {
    "定位与边界": "Checkpoint 解决的是依赖截断，不是缓存加速",
    "核心对象": "可靠 Checkpoint、Local Checkpoint 与流式 Checkpoint",
    "执行链路": "从长 Lineage 到物化恢复点",
    "状态、容错与边界": "Eager、Lazy 与非确定性计算的差异",
    "性能与诊断": "如何判断 Checkpoint 是否真的截断了计划",
    "设计取舍": "Cache、Persist、Checkpoint 应该怎么选",
    "来源与事实边界": "依据与版本边界",
  },
  "closure-serialization-local-vs-cluster-and-mutable-state-traps.md": {
    "定位与边界": "闭包问题的本质是 Driver 状态被复制到 Executor",
    "核心对象": "Closure、Driver 变量、Executor 副本与共享变量",
    "执行链路": "Task Closure 如何被序列化并发送",
    "状态、容错与边界": "为什么修改外部变量在集群模式下不可靠",
    "性能与诊断": "本地正常、集群失败时先查什么",
    "设计取舍": "分布式状态应通过数据流表达",
    "来源与事实边界": "依据与版本边界",
  },
  "columnar-cache-scan-pruning-and-sql-runtime-footprint.md": {
    "定位与边界": "列式缓存和裁剪决定 SQL 查询的基础成本",
    "核心对象": "InMemoryTableScan、Vectorized Reader 与裁剪条件",
    "执行链路": "从 CACHE TABLE 到扫描计划命中",
    "状态、容错与边界": "缓存物化、驱逐与 Storage Memory",
    "性能与诊断": "用 Physical Plan 验证裁剪和缓存是否生效",
    "设计取舍": "什么时候缓存，什么时候改文件布局",
    "来源与事实边界": "依据与版本边界",
  },
  "dependency-distribution-jars-pyfiles-local-uri-and-executor-visibility.md": {
    "定位与边界": "依赖分发解决的是 Executor 可见性问题",
    "核心对象": "JAR、PyFiles、file URI 与 local URI",
    "执行链路": "spark-submit 如何把依赖送到 Driver 和 Executor",
    "状态、容错与边界": "依赖缓存、工作目录与节点环境一致性",
    "性能与诊断": "ClassNotFound 与 ModuleNotFound 应该看哪侧日志",
    "设计取舍": "file:/ 和 local:/ 的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "driver-result-surfaces-collect-take-tolocaliterator-and-memory-boundaries.md": {
    "定位与边界": "Driver 既是控制面，也是结果接收面",
    "核心对象": "Collect、Take、toLocalIterator 与 Write",
    "执行链路": "Executor 结果如何回到 Driver",
    "状态、容错与边界": "toLocalIterator 不是无限流式安全阀",
    "性能与诊断": "Driver OOM 要和 Executor OOM 分开排查",
    "设计取舍": "大结果写出，小样本拉回",
    "来源与事实边界": "依据与版本边界",
  },
  "join-algorithm-selection-broadcast-sort-merge-and-shuffled-hash.md": {
    "定位与边界": "Join 策略选择不是只背算子名字",
    "核心对象": "Broadcast、Sort Merge、Shuffle Hash 与 Join Hint",
    "执行链路": "优化器如何从逻辑 Join 走到物理 Join",
    "状态、容错与边界": "统计信息、运行时改写与 Hint 的限制",
    "性能与诊断": "从 Exchange、Broadcast 与 Spill 判断 Join 问题",
    "设计取舍": "小表广播、稳定排序归并与内存哈希的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "logical-plan-physical-plan-explain-and-runtime-diagnosis.md": {
    "定位与边界": "Explain 是理解 Spark SQL 的入口，不是格式化输出",
    "核心对象": "Parsed、Analyzed、Optimized 与 Physical Plan",
    "执行链路": "从未解析逻辑计划到可执行算子树",
    "状态、容错与边界": "计划展示与真实运行统计的边界",
    "性能与诊断": "EXPLAIN FORMATTED、COST 与 SQL UI 怎么配合",
    "设计取舍": "先改表达式，再考虑调参",
    "来源与事实边界": "依据与版本边界",
  },
  "overview.md": {
    "定位与边界": "Spark 是统一计算引擎，不是存储或调度平台",
    "核心对象": "Driver、Executor、Job、Stage 与 Task 的职责",
    "执行链路": "Transformation 如何在 Action 时变成分布式执行",
    "状态、容错与边界": "Lineage、Shuffle、Checkpoint 与外部系统",
    "性能与诊断": "优化 Spark 作业要先建立证据链",
    "设计取舍": "批处理、流处理与交互式分析的不同侧重点",
    "来源与事实边界": "依据与版本边界",
  },
  "partitioning-repartition-coalesce-and-file-size-control.md": {
    "定位与边界": "分区决定并行度，也决定输出文件形态",
    "核心对象": "Partition、repartition、coalesce 与输出文件",
    "执行链路": "从输入分区到 Shuffle 重分区再到写出文件",
    "状态、容错与边界": "分区调整不等于业务去重或排序保证",
    "性能与诊断": "小文件、长尾 Task 与分区倾斜怎么定位",
    "设计取舍": "增加并行度还是减少文件数",
    "来源与事实边界": "依据与版本边界",
  },
  "pyspark-arrow-pandas-udf-and-python-boundaries.md": {
    "定位与边界": "PySpark 性能问题常发生在 JVM 与 Python 边界",
    "核心对象": "Python Worker、Arrow、Pandas UDF 与 Driver 结果面",
    "执行链路": "数据如何跨 JVM、Arrow 和 Python Worker",
    "设计取舍": "尽量使用内置表达式，谨慎进入 Python UDF",
    "来源与事实边界": "依据与版本边界",
  },
  "rdd-dataframe-dataset.md": {
    "定位与边界": "RDD、DataFrame、Dataset 表达的是三种计算抽象",
    "核心对象": "RDD、Row、Schema、Encoder 与 Logical Plan",
    "执行链路": "Lineage 和 Logical Plan 的触发方式不同",
    "状态、容错与边界": "Lineage 恢复与结构化计划恢复",
    "性能与诊断": "优化器能看懂什么，运行时就能优化什么",
    "设计取舍": "新流程优先结构化 API，底层控制再用 RDD",
    "来源与事实边界": "依据与版本边界",
  },
  "release-quality-guide.md": {
    "定位与边界": "Spark 发布质量要验证计算语义和运行证据",
    "核心对象": "代码、配置、计划、指标、数据质量与回滚点",
    "执行链路": "从变更提交到生产运行的验证路径",
    "状态、容错与边界": "哪些变更会影响状态、Checkpoint 和输出语义",
    "性能与诊断": "发布前后必须对齐的基线指标",
    "设计取舍": "灰度、回滚与重跑成本",
    "来源与事实边界": "依据与版本边界",
  },
  "scheduler-stage-cut-locality-and-straggler-boundaries.md": {
    "定位与边界": "调度问题要区分 Stage 切分、Locality 和长尾 Task",
    "核心对象": "DAGScheduler、TaskScheduler、Stage 与 Locality",
    "执行链路": "从 Stage DAG 到 Task 分发",
    "状态、容错与边界": "Task 重试和 Stage 重提不是同一层恢复",
    "性能与诊断": "长尾 Task 应该看分区、数据本地性和资源差异",
    "设计取舍": "数据本地性、并行度与推测执行的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "shared-variables-and-driver-boundaries.md": {
    "定位与边界": "共享变量只解决受控共享，不改变 Driver/Executor 边界",
    "核心对象": "Broadcast、Accumulator 与普通 Driver 变量",
    "执行链路": "只读分发和只增汇总的运行方式",
    "状态、容错与边界": "Accumulator 不能承载业务状态",
    "性能与诊断": "广播过大和累加器误用怎么识别",
    "设计取舍": "配置表广播还是外部存储读取",
    "来源与事实边界": "依据与版本边界",
  },
  "shuffle-map-output-fetch-failure-and-stage-resubmit-boundaries.md": {
    "定位与边界": "FetchFailed 暴露的是 Shuffle 输出可用性边界",
    "核心对象": "Map Output、BlockManager、MapOutputTracker 与 FetchFailed",
    "执行链路": "下游 Task 如何定位并拉取上游 Shuffle Block",
    "状态、容错与边界": "Stage Finished 不等于 Shuffle 输出永久可靠",
    "性能与诊断": "Fetch Failure 要同时看网络、磁盘和 Executor 生命周期",
    "设计取舍": "重提 Stage、保留 Shuffle 与降低重分布成本",
    "来源与事实边界": "依据与版本边界",
  },
  "shuffle-persistence-fault-tolerance.md": {
    "定位与边界": "Shuffle、Cache 与容错分别解决不同问题",
    "核心对象": "ShuffleMapStage、ResultStage、BlockManager 与 StorageLevel",
    "执行链路": "Shuffle Write 和 Shuffle Read 的真实代价",
    "状态、容错与边界": "缓存丢失可重算，外部副作用不自动幂等",
    "性能与诊断": "Shuffle 大、Spill 多、长尾明显时怎么拆",
    "设计取舍": "缓存复用、Checkpoint 截断与外部持久化",
    "来源与事实边界": "依据与版本边界",
  },
  "spark-connect.md": {
    "定位与边界": "Spark Connect 解耦客户端和 Driver 运行时",
    "核心对象": "Client、Server、gRPC、Arrow 与 Unresolved Plan",
    "设计取舍": "轻客户端接入和服务端治理的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "statistics-cbo-cardinality-estimation-and-plan-misfire.md": {
    "定位与边界": "统计信息决定优化器对数据规模的判断",
    "核心对象": "Table Statistics、Column Statistics、Cardinality 与 Cost",
    "执行链路": "CBO 如何影响 Join 顺序和物理策略",
    "状态、容错与边界": "统计信息过期不会报错，但会误导计划",
    "性能与诊断": "估算行数和真实行数偏差要怎么找",
    "设计取舍": "维护统计信息还是用运行时自适应补救",
    "来源与事实边界": "依据与版本边界",
  },
  "stream-stream-join-state-store-rocksdb-and-restart-compatibility.md": {
    "定位与边界": "流流 Join 的核心成本是状态生命周期",
    "核心对象": "两侧输入、Join 条件、Watermark 与 State Store",
    "执行链路": "每个 Micro-batch 如何更新 Join 状态",
    "状态、容错与边界": "重启兼容性受状态 Schema 和查询结构约束",
    "性能与诊断": "状态膨胀、Watermark 滞后和 RocksDB 压力怎么查",
    "设计取舍": "Join 完整性、延迟和状态规模的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "system-design-scenarios.md": {
    "定位与边界": "Spark 系统设计题要从计算边界开始",
    "核心对象": "输入、计划、资源、状态、输出与观测证据",
    "执行链路": "从业务目标倒推批处理、流处理和交互式链路",
    "状态、容错与边界": "哪些正确性要交给外部系统保证",
    "性能与诊断": "系统设计必须带容量、指标和排障路径",
    "设计取舍": "吞吐、延迟、成本和可恢复性的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "trigger-micro-batch-continuous-available-now-and-foreach-batch-boundaries.md": {
    "定位与边界": "Trigger 决定流查询推进节奏，不决定端到端语义",
    "核心对象": "Micro-batch、Continuous、AvailableNow 与 foreachBatch",
    "执行链路": "Trigger 如何驱动 Batch 生成和提交",
    "状态、容错与边界": "foreachBatch 默认 at-least-once，需要调用方幂等",
    "性能与诊断": "批次堆积、提交慢和重复计算怎么判断",
    "设计取舍": "低延迟、可恢复性和外部写入语义的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "tungsten-whole-stage-codegen-off-heap-and-vectorization.md": {
    "定位与边界": "Tungsten 优化的是 Spark SQL 的运行时执行效率",
    "核心对象": "UnsafeRow、Whole-stage Codegen、Off-heap 与 Vectorization",
    "执行链路": "表达式如何编译成更紧凑的执行路径",
    "状态、容错与边界": "运行时优化不改变业务语义和容错边界",
    "性能与诊断": "Codegen 失效、向量化失效和内存压力怎么观察",
    "设计取舍": "表达式可优化性比盲目调参更重要",
    "来源与事实边界": "依据与版本边界",
  },
  "unified-memory-execution-storage-spill-and-eviction.md": {
    "定位与边界": "统一内存把执行内存和存储内存放在同一竞争池里",
    "核心对象": "Execution Memory、Storage Memory、Spill 与 Eviction",
    "执行链路": "聚合、Join、排序和缓存如何竞争内存",
    "状态、容错与边界": "Spill 是降级机制，不是容量规划方案",
    "性能与诊断": "从 Spill、GC 和缓存驱逐判断内存瓶颈",
    "设计取舍": "缓存命中率和执行稳定性的取舍",
    "来源与事实边界": "依据与版本边界",
  },
  "watermark-late-data-state-cleanup-and-output-finalization.md": {
    "定位与边界": "Watermark 管的是事件时间进度和状态清理边界",
    "核心对象": "Event Time、Watermark Delay、Output Mode 与 Global Watermark",
    "执行链路": "Watermark 如何随 Micro-batch 推进",
    "状态、容错与边界": "迟到数据的保证是下界，不是精确定时开关",
    "性能与诊断": "状态不降、迟到数据异常时看哪些指标",
    "设计取舍": "结果最终性、迟到容忍和状态成本的取舍",
    "来源与事实边界": "依据与版本边界",
  },
};

let changed = 0;
const changedFiles = [];

for (const [file, rewrites] of Object.entries(headingRewrites)) {
  const fullPath = path.join(sparkDir, file);
  if (!fs.existsSync(fullPath)) continue;
  const original = fs.readFileSync(fullPath, "utf8");
  let next = original;
  for (const [from, to] of Object.entries(rewrites)) {
    next = next.replace(new RegExp(`^## ${escapeRegExp(from)}$`, "gm"), `## ${to}`);
  }
  if (next !== original) {
    fs.writeFileSync(fullPath, next, "utf8");
    changed += 1;
    changedFiles.push(file);
  }
}

console.log(JSON.stringify({ changed, changedFiles }, null, 2));

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
