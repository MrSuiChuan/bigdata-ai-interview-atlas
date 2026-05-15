---
id: q-bigdata-spark-0015
title: 开了 AQE 之后作业还是慢，你会怎么判断问题在统计、join 策略还是数据倾斜
domain: bigdata
component: spark
topic: aqe-troubleshooting
question_type: failure
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - spark-sql-performance-tuning
  - spark-sql-paper
claim_ids:
  - spark-claim-0050
  - spark-claim-0053
  - spark-claim-0054
  - spark-claim-0055
  - spark-claim-0056
  - spark-claim-0057
  - spark-claim-0075
  - spark-claim-0076
related_docs:
  - bigdata/spark/sql-optimizer-aqe-joins
estimated_minutes: 11
---

# 题目

开了 `AQE` 之后作业还是慢，你会怎么判断问题在统计、join 策略还是数据倾斜？

# 一句话结论

`AQE` 很强，但它不是魔法；如果统计质量差、hint 不适用、skew 极端或者表布局本身不能帮助避开 `Exchange`，作业依然可能慢，所以排查要从计划输入、运行时重优化结果和长尾 task 三层看。

# 为什么会有这个问题

很多人把 `AQE` 理解成“打开之后 Spark 会自动把一切调好”，这会让排障失焦。

# 核心机制

1. `AQE` 基于运行时统计重优化 physical plan
2. 统计信息质量会影响计划选择
3. `AQE` 可以合并 post-shuffle partitions、改 join 策略、优化 skewed sort-merge join
4. join hint 有优先级，但不保证一定被采用
5. `Storage Partition Join` 若真的生效，join 前不应再看到 `Exchange`

# 关键对象与状态

1. logical / physical plan
2. runtime statistics
3. join type
4. skewed partitions
5. `Exchange`

# 完整链路

先看 `EXPLAIN` 和实际物理计划，确认 Spark 最终用了什么 join 算法；再看统计来源是否完整、广播阈值和 hint 是否真的适用；如果仍然存在明显长尾 task，再判断是否是 skew 没被有效拆分，或者表布局本身不足以让 `Storage Partition Join` 生效。

# 边界与不保证项

1. `AQE` 不保证所有 query 都能自动转成最优 join
2. hint 不是强制命令
3. 有 `Storage Partition Join` 概念，不等于实际计划就一定没有 `Exchange`

# 故障场景

典型情况包括：

1. 统计缺失，Spark 不敢广播或误判表大小
2. join type 本身不支持你想要的 hint
3. 少数超大 key 导致长尾 task 依然存在
4. 以为表是按 join key 布局的，但 `EXPLAIN` 里仍然出现 `Exchange`

# 代价与权衡

为了让 AQE 更有效，你通常需要付出更好的表建模、统计采集和数据布局成本；它省掉的是大量人工静态调参，但不省掉建模工作。

# 标准答案

开了 AQE 以后作业还慢，我不会先怀疑 AQE “失效”，而是先看三层。第一层看输入：统计信息是否完整、广播阈值是否合理、hint 是否真的适用于当前 join type，因为 AQE 仍然需要可靠输入。第二层看运行时结果：实际 physical plan 是否发生了 join 转换、post-shuffle partitions 是否被合并、是否存在明显 skew 优化痕迹。第三层看长尾现象：如果少数 task 明显拖后腿，很可能是极端数据倾斜没有被完全解决，或者表布局并没有真正支持 `Storage Partition Join`，这时 `EXPLAIN` 里往往还会出现 `Exchange`。所以 AQE 更像“运行时重优化能力”，而不是“自动正确”的保证。

# 必答点

1. 统计质量仍然重要
2. hint 不是强制命令
3. 要看实际 physical plan 和长尾 task

# 加分点

1. 能提到 `Exchange` 是判断 SPJ 是否生效的直接信号
2. 能把 skew 和 join type 支持边界一起讲清

# 常见误答

1. 认为开了 AQE 就不需要看计划
2. 认为 hint 一定生效
3. 只说“数据倾斜”，却不给判断路径

# 追问

1. 为什么统计缺失会让 AQE 的效果打折？
2. 你会怎样向面试官证明 SPJ 真的生效了？

