---
id: q-bigdata-spark-0024
title: 为什么 Spark 的 join 题不能只答“小表广播、大表 sort merge”，而必须继续讲 hint、build side 和 AQE
domain: bigdata
component: spark
topic: join-algorithm-selection-broadcast-sort-merge-shuffled-hash
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-sql-performance-tuning
  - spark-configuration-doc
claim_ids:
  - spark-claim-0053
  - spark-claim-0054
  - spark-claim-0055
  - spark-claim-0075
  - spark-claim-0103
  - spark-claim-0104
  - spark-claim-0105
  - spark-claim-0106
related_docs:
  - bigdata/spark/join-algorithm-selection-broadcast-sort-merge-and-shuffled-hash
estimated_minutes: 12
---

# 题目

为什么 Spark 的 join 题不能只答“小表广播、大表 sort merge”，而必须继续讲 hint、build side 和 AQE？

# 一句话结论

因为 Spark 的 join 选择不是静态口诀，而是 planner 基于统计信息、hint 优先级和运行时统计持续决定数据移动路径与 build-side 所有权的过程。

# 核心机制

1. join 计划依赖统计信息，统计缺失会直接影响策略选择
2. hint 影响策略优先级，但不是绝对命令，build side 还要看 join type 和关系大小
3. AQE 能在运行中把 `sort-merge join` 改写为 `broadcast hash join` 或 `shuffled hash join`

# 标准答案

Spark 的 join 题如果只答“小表广播、大表 sort merge”，说明你记住了经验，但还没讲到 planner 真正的决策机制。Spark SQL 官方文档首先说明，Spark 选择最优计划的能力取决于统计信息，统计可能来自数据源、catalog 和 runtime，如果这些统计缺失或不准确，planner 就可能选不到理想的 join 策略。自动广播受 `spark.sql.autoBroadcastJoinThreshold` 控制，默认是 10 MB；但如果显式加了 `BROADCAST` hint，Spark 会优先考虑广播被 hint 的一侧，即便它的统计值已经高于这个阈值，而且是否落成 `broadcast hash join` 还是 `broadcast nested loop join`，还取决于是否存在 equi-join key。官方还明确写到，join strategy hints 的优先级是 `BROADCAST > MERGE > SHUFFLE_HASH > SHUFFLE_REPLICATE_NL`，但并不保证一定采用 hint 指定的策略，因为某些 join type 不支持某些策略；若两侧都带 `BROADCAST` 或 `SHUFFLE_HASH` hint，Spark 还要按 join type 和关系大小选择 build side。再往下一层，AQE 让 join 选择从静态决策变成运行时可改写决策。官方配置文档说明，AQE 开启后 Spark 会基于准确的 runtime statistics 在执行中途重优化；如果原先是 `sort-merge join`，Spark 可以改成 `broadcast hash join`，甚至使用 `local shuffle reader` 降低网络开销；如果每个 post-shuffle partition 都足够小，而且 `spark.sql.adaptive.maxShuffledHashJoinLocalMapThreshold` 满足条件，Spark 还会优先转成 `shuffled hash join`。所以一个成熟答案必须把统计、hint、build side 和 AQE 全部讲出来。

# 必答点

1. 说明 join 选择依赖统计信息而不是纯人工经验
2. 说明 hint 有优先级，但不是绝对命令
3. 说明 build side 不完全由人手工固定，双方都 hint 时 Spark 还会再判断
4. 说明 AQE 会在运行时改写 `sort-merge join`

# 常见误答

1. 把 hint 说成必然生效
2. 只会说“10 MB 以下广播”，不会说 BROADCAST hint 可超阈值优先
3. 不知道 build side 还要看 join type 和两侧大小
4. 不知道 AQE 会继续改写 join 和 shuffle reader
