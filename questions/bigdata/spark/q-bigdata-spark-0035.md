---
id: q-bigdata-spark-0035
title: 为什么 Spark 高级资源问题不能只靠增加 executor 解决
domain: bigdata
component: spark
topic: advanced-resource-scheduling-barrier-stage-level-gpu-push-based-shuffle
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-05-06"
last_verified_at: "2026-05-06"
source_ids:
  - spark-job-scheduling
  - spark-cluster-overview
  - spark-hardware-provisioning
  - spark-tuning-guide
claim_ids:
  - spark-claim-0166
  - spark-claim-0167
  - spark-claim-0168
related_docs:
  - bigdata/spark/advanced-resource-scheduling-barrier-stage-level-gpu-and-push-based-shuffle
estimated_minutes: 10
---

# 题目

为什么 Spark 高级资源问题不能只靠增加 executor 解决？

# 一句话结论

executor 数量只是资源问题的一层。

# 核心机制

1. 先说明问题属于哪个 Spark 层面，而不是直接背 API。
2. 再把 Driver、Executor、SQL 计划、数据源、状态、提交或外部系统边界分开。
3. 最后用 Spark UI、event log、执行计划、日志、元数据或外部系统指标形成可复核判断。

# 标准答案

executor 数量只是资源问题的一层。Spark 还要区分集群管理器分配、同一 SparkContext 内 fair scheduler、stage/task 资源需求、本地磁盘、网络、shuffle 数据存活和外部系统瓶颈。动态资源必须配合 shuffle 数据存活策略；Barrier 和 stage-level resource 改变 task 启动和资源边界；GPU 或自定义资源需要集群、executor 和 task 三层声明一致。

# 必答点

1. 区分资源调度层级
2. 说明 dynamic allocation 与 shuffle 存活
3. 说明 barrier 和 stage-level resource
4. 把硬件、网络、磁盘纳入证据

# 常见误答

1. 所有慢都加 executor
2. 忽略 shuffle tracking 或 external shuffle service
3. 不区分集群级排队和应用内调度

# 延伸追问

1. 动态资源为什么会引发 fetch failure？
2. GPU stage 为什么要验证资源发现？

