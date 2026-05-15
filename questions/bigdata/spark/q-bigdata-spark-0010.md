---
id: q-bigdata-spark-0010
title: Structured Streaming 里的 watermark、output mode 和 checkpoint 分别在解决什么问题
domain: bigdata
component: spark
topic: structured-streaming-semantics
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-23"
last_verified_at: "2026-04-23"
source_ids:
  - spark-structured-streaming-apis
claim_ids:
  - spark-claim-0059
  - spark-claim-0060
  - spark-claim-0061
  - spark-claim-0062
  - spark-claim-0063
  - spark-claim-0064
  - spark-claim-0065
  - spark-claim-0066
  - spark-claim-0068
  - spark-claim-0069
related_docs:
  - bigdata/spark/structured-streaming
estimated_minutes: 12
---

# 题目

Structured Streaming 里的 watermark、output mode 和 checkpoint 分别在解决什么问题？

# 一句话结论

`output mode` 决定每次 trigger 向 sink 暴露什么结果视图，`watermark` 决定旧状态何时可以清理以及结果何时算最终完成，`checkpoint` 决定失败后从哪里恢复以及状态如何延续；三者一起构成流式 query 的核心语义边界。

# 为什么会有这个问题

很多人只会背概念名词，却没把它们放回同一条流式语义链路里，所以一到面试就容易把 trigger、late data、exactly-once 全混在一起。

# 核心机制

1. Append / Update / Complete 三种 output mode 分别对应新增结果、增量更新结果、整张结果表输出
2. `withWatermark` 决定状态保留时间和迟到数据边界
3. 多输入流会合并出一个全局 watermark，默认按最慢流推进
4. checkpoint 保存 offset 范围和状态，用于恢复
5. sink 语义不同，file sink 是 exactly-once，Kafka sink 是 at-least-once

# 关键对象与状态

1. Result Table
2. watermark
3. state store
4. checkpointLocation
5. sink

# 完整链路

数据进入流式 query 后，Spark 先根据 output mode 决定本轮要输出什么，再根据 watermark 判断哪些旧状态还能继续等迟到数据、哪些可以清理，最后把进度和状态写入 checkpoint，以便失败后恢复。

# 边界与不保证项

1. `withWatermark` 对 batch Dataset 是 no-op
2. 多个 stateful operation 不能随便链式组合
3. Structured Streaming 的官方 exactly-once 说法不能脱离 sink 能力单独理解

# 故障场景

典型误用包括：

1. 以为 watermark 是单纯“允许晚到”
2. 以为开了 checkpoint 就任何 sink 都是 exactly-once
3. 把 Update mode 和 Append mode 的输出时机混为一谈

# 代价与权衡

更长的 watermark 会带来更高的迟到容忍，但也会保留更多状态；选择更保守还是更激进的全局 watermark，本质是延迟、准确性和状态成本的权衡。

# 标准答案

Structured Streaming 里，`output mode`、`watermark` 和 `checkpoint` 分别解决三件不同但互相关联的事。`output mode` 决定每次 trigger 往 sink 写什么结果：`Append` 只写最终不会再变化的新结果，`Update` 只写这轮被更新的结果，`Complete` 每轮写整张结果表。`watermark` 的核心不是“一个晚到开关”，而是告诉 Spark 多久以后旧状态可以安全清理，以及像窗口聚合这种结果要等到什么时候才算 final；在多流场景里，Spark 还会把各输入流的 watermark 合成一个全局 watermark，默认按最慢流推进。`checkpoint` 则保存已处理 offset 范围和状态数据，为恢复提供边界。三者组合起来，才构成一个流式 query 的真正语义。

# 必答点

1. output mode 解决“输出什么”
2. watermark 解决“状态保留多久、结果何时 final”
3. checkpoint 解决“失败后从哪恢复”

# 加分点

1. 提到多输入流全局 watermark 默认取最小值
2. 提到 sink 语义差异，例如 Kafka sink 是 at-least-once

# 常见误答

1. 把 watermark 说成纯粹的去重功能
2. 把 checkpoint 说成可选优化
3. 不知道多个 stateful operation 有官方限制

# 追问

1. 为什么 stream-stream join 不加 watermark 和时间约束会导致状态无限增长？
2. RocksDB state store 适合什么场景？

