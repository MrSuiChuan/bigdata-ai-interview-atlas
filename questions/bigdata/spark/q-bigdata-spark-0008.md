---
id: q-bigdata-spark-0008
title: Spark 调优应该先看什么，为什么很多问题不该一上来就改 executor 参数
domain: bigdata
component: spark
topic: tuning-principles
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-23"
last_verified_at: "2026-04-23"
source_ids:
  - spark-tuning-guide
  - spark-job-scheduling
claim_ids:
  - spark-claim-0015
  - spark-claim-0034
  - spark-claim-0035
  - spark-claim-0036
  - spark-claim-0037
  - spark-claim-0038
  - spark-claim-0039
related_docs:
  - bigdata/spark/performance-tuning
estimated_minutes: 9
---

# 题目

Spark 调优应该先看什么，为什么很多问题不该一上来就改 executor 参数？

# 一句话结论

因为 Spark 的瓶颈可能在网络、shuffle、序列化、内存、locality、reduce-side working set，而不是简单的 CPU 或 executor 数量不足；不先定位瓶颈，改参数很容易只是把问题换个地方继续暴露。

# 为什么会有这个问题

很多人把 Spark 调优理解成“多给资源”，但官方 tuning guide 的主线其实是先判断真正的限制因素。

# 核心机制

1. Spark 默认 Java serialization，Kryo 常用于降低网络与对象开销
2. Spark 内存由 execution 和 storage 共享统一内存区域
3. locality 会影响任务是否在数据附近执行
4. reduce-side OOM 往往和单 task working set 过大有关
5. dynamic allocation 还和 shuffle 文件保留机制耦合

# 关键对象与状态

1. network bandwidth
2. execution memory / storage memory
3. locality level
4. partition parallelism
5. dynamic allocation

# 完整链路

先定位瓶颈类型，再决定是调序列化、调 partition、调 storage level、调 locality，还是调资源弹性策略；如果连瓶颈类别都没搞清，直接加 executor 只会把问题转移。

# 边界与不保证项

1. Kryo 不会自动解决所有性能问题
2. cache 也可能被 execution 挤掉
3. dynamic allocation 不是随便开就一定稳定

# 故障场景

典型症状包括：

1. CPU 不高但任务很慢，实际卡在 shuffle / 网络
2. 明明总数据量没那么大，却 reduce-side OOM
3. 开了 dynamic allocation 后遇到 shuffle 相关不稳定

# 代价与权衡

调优本质是资源、延迟、稳定性、复杂度之间的权衡，而不是单向追求“更快”。

# 标准答案

Spark 调优不该一上来就改 executor 参数，因为 Spark 的瓶颈未必在 CPU 或资源总量上。官方文档明确提示，如果数据放得进内存，瓶颈往往可能是网络；而 reduce-side OOM 常常是单个 task working set 过大，需要通过增加并行度来拆小任务。真正的调优顺序应该是先识别瓶颈类型，再决定看 Kryo、对象大小、partition 数、统一内存模型、locality，还是 dynamic allocation 与 shuffle 保留机制。只有先找对瓶颈，参数调整才有方向。

# 必答点

1. 先定位瓶颈
2. 网络 / 序列化 / 内存 / locality / 并行度这些方向
3. dynamic allocation 和 shuffle durability 的关系

# 加分点

1. 能提 execution / storage unified memory
2. 能讲 reduce-side working set 和并行度的关系

# 常见误答

1. 认为 Spark 调优就是多给 executor
2. 只会背参数，不会把参数和瓶颈类型对应起来

# 追问

1. 什么时候你会优先考虑 Kryo？
2. 为什么 coalesce / repartition 也应该放进调优回答里？

