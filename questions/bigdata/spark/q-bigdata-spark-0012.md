---
id: q-bigdata-spark-0012
title: Spark 的 client mode、cluster mode 和不同 cluster manager 该怎么从原理上讲
domain: bigdata
component: spark
topic: deployment-modes
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-23"
last_verified_at: "2026-04-23"
source_ids:
  - spark-cluster-overview
  - spark-submitting-applications
  - spark-running-on-yarn
  - spark-standalone-mode
claim_ids:
  - spark-claim-0045
  - spark-claim-0046
  - spark-claim-0047
  - spark-claim-0048
  - spark-claim-0072
  - spark-claim-0073
  - spark-claim-0074
related_docs:
  - bigdata/spark/deployment-and-cluster-managers
estimated_minutes: 10
---

# 题目

Spark 的 `client mode`、`cluster mode` 和不同 cluster manager 该怎么从原理上讲？

# 一句话结论

原理上最核心的问题不是“名字怎么背”，而是 `driver` 放在哪里、`SparkContext` 怎么向 cluster manager 申请 executors、应用之间如何隔离；`client / cluster` 模式只是围绕 driver 所在位置的两种部署方式。

# 为什么会有这个问题

这是很多候选人会答“知道但不稳”的题，因为容易只背命令，不讲执行对象关系。

# 核心机制

1. `spark-submit` 用统一接口提交应用
2. `SparkContext` 连接 standalone、YARN 或 Kubernetes 等 cluster manager
3. 每个 application 获取自己独立的一组 executors
4. cluster mode 把 driver 放进集群，client mode 把 driver 留在提交端
5. driver 必须可被 worker 访问，并尽量靠近 worker

# 关键对象与状态

1. driver
2. SparkContext
3. cluster manager
4. executor
5. deploy mode

# 完整链路

应用提交后，SparkContext 会向 cluster manager 申请资源，拿到本 application 专属 executors，再由 driver 向 executors 派发代码和 task；deploy mode 只是在决定这个 driver 由谁托管、位于哪里。

# 边界与不保证项

1. 不同 Spark application 之间不能直接共享内存数据
2. driver 如果不具备网络可达性或离 worker 太远，应用可能会很不稳定
3. standalone 的 `--supervise` 是 standalone 特有能力，不是所有 cluster manager 的统一语义

# 故障场景

常见失败是把 client mode 的 driver 放在不稳定的远程机器上，或者把 deploy mode 说成“只是命令参数差异”，结果说不清为什么同样的作业线上行为差别很大。

# 代价与权衡

cluster mode 更有利于把 driver 交给集群托管，client mode 更方便交互式调试；前者更稳，后者更灵活，但对 driver 网络条件要求更高。

# 标准答案

Spark 部署从原理上讲，先要抓住四个对象：driver、SparkContext、cluster manager 和 executor。用户通过 `spark-submit` 提交应用后，SparkContext 会连接 standalone、YARN 或 Kubernetes 这样的 cluster manager 申请 executors，这些 executors 只属于当前 application，并在整个应用生命周期内存在。`client mode` 和 `cluster mode` 的核心差异在于 driver 放哪：cluster mode 由集群托管 driver，client mode 则由提交方持有 driver。因为 driver 必须能被 worker 访问，而且最好靠近 worker，所以 driver 的部署位置会直接影响稳定性和网络代价。进一步在 YARN 上，cluster mode 下 driver 运行在 ApplicationMaster 中，而 standalone cluster mode 还支持 `--supervise` 对非零退出的应用自动重启。

# 必答点

1. deploy mode 其实在决定 driver 位置
2. 每个 application 有独立 executors
3. driver 要可达、最好靠近 worker

# 加分点

1. 提到不同 Spark application 不能共享内存数据
2. 提到 YARN cluster mode 的 ApplicationMaster 边界

# 常见误答

1. 只会背名词，不会讲对象关系
2. 觉得 deploy mode 只影响提交命令，不影响运行时行为
3. 不知道 driver 的网络可达性要求

# 追问

1. 为什么远程办公机上的 client mode 作业会很脆弱？
2. 如果两个 Spark application 想共享结果，为什么必须落外部存储？
