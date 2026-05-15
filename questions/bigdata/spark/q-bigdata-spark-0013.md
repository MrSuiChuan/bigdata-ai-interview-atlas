---
id: q-bigdata-spark-0013
title: 如果让你设计一个 TB 级离线聚合作业，你会怎样控制 Spark 的 shuffle、driver 和并行度风险
domain: bigdata
component: spark
topic: batch-system-design
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - spark-dataset-javadoc
  - spark-tuning-guide
  - spark-sql-performance-tuning
claim_ids:
  - spark-claim-0032
  - spark-claim-0033
  - spark-claim-0038
  - spark-claim-0054
  - spark-claim-0056
  - spark-claim-0057
related_docs:
  - bigdata/spark/performance-tuning
  - bigdata/spark/sql-optimizer-aqe-joins
  - bigdata/spark/system-design-scenarios
estimated_minutes: 12
---

# 题目

如果让你设计一个 TB 级离线聚合作业，你会怎样控制 Spark 的 `shuffle`、driver 和并行度风险？

# 一句话结论

这类题不能只答“加 executor”，更稳的设计思路是先把结果留在分布式侧、把大部分优化点放在 `shuffle` 之前和 `shuffle` 过程中，再用合理的并行度和 `AQE` 控制 reduce-side working set，而不是最后靠 driver 或单分区硬接。

# 为什么会有这个问题

TB 级作业最容易出问题的地方，往往不是 API 写不出来，而是边界设计错误：

1. 结果过早拉回 driver
2. join 和聚合前数据分布没想清楚
3. 分区数过小导致单 task working set 过大
4. 为了“减少小文件”过早 `coalesce(1)`

# 核心机制

1. `collect()` / `take()` 会把结果搬回 driver
2. reduce-side OOM 常常是单 task 工作集过大，而不是总数据量唯一原因
3. `AQE` 可在运行时合并 post-shuffle partitions、改 join 策略、处理 skew
4. `coalesce()` 与 `repartition()` 的区别，本质上是在低代价缩分区和维持并行度之间做权衡

# 关键对象与状态

1. driver memory
2. shuffle partition
3. reduce-side working set
4. join strategy
5. runtime statistics

# 完整链路

先用结构化 API 让 Spark 拿到足够的计划信息，在大 join / aggregation 前就考虑过滤、投影、广播维表和数据分布；进入 shuffle 阶段后用足够的并行度拆小单 task 输入，再让 `AQE` 在运行时根据真实统计修正分区和 join 策略；最终结果尽量直接落外部存储，而不是回到 driver。

# 边界与不保证项

1. 开了 `AQE` 不代表可以完全不关心分区设计
2. `coalesce(1)` 不是通用落盘方案
3. 广播 hint 不是绝对强制命令

# 故障场景

典型事故包括：

1. 最后一步 `collect()` 导致 driver OOM
2. 大聚合只有少量 reduce task，尾部 task 极慢
3. 开了 `AQE` 但统计质量差，join 仍然选得不理想

# 代价与权衡

更多并行度会增加 task 数和调度成本，但能降低单 task working set；更少分区可以减少小文件，却可能换来长尾和单节点瓶颈。

# 标准答案

TB 级 Spark 批处理设计最重要的是守住三个边界：结果不要轻易回 driver、reduce-side working set 不要过大、并行度不要被过早压塌。具体做法上，我会优先用 DataFrame / SQL 让 Spark 拿到结构化信息，在 join 前先做过滤和投影，并尽量利用广播维表、统计信息和 `AQE` 来减少不必要的大 shuffle。对真正需要大 shuffle 的 aggregation 或 join，会把分区数设计得足够高，优先控制单个 reduce task 的输入规模；如果最终只是为了输出文件数量变少，不会一上来就 `coalesce(1)`，而是评估 `repartition()` 或让下游存储层做合并。最后结果尽量直接写外部存储，而不是 `collect()` 回 driver。

# 必答点

1. 先守住 driver 边界
2. reduce-side OOM 常和单 task 工作集有关
3. `AQE`、join 策略和分区设计要一起讲

# 加分点

1. 能把 `coalesce()` 和 `repartition()` 的边界讲清
2. 能提到统计信息质量会影响 `AQE` / `CBO`

# 常见误答

1. 一上来就说加 executor
2. 不提 driver 风险
3. 把 `coalesce(1)` 当万能收尾动作

# 追问

1. 为什么有时候 executor 很多，job 还是卡在几个长尾 task？
2. 什么时候你会显式接受一次 `repartition()` 的 shuffle 成本？

