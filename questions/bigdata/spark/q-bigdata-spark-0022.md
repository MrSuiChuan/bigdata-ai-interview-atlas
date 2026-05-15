---
id: q-bigdata-spark-0022
title: 为什么 Spark 依赖分发问题本质上是可见性边界与分发责任边界问题
domain: bigdata
component: spark
topic: dependency-distribution-jars-pyfiles-local-uri-executor-visibility
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Spark 4.1.1 docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - spark-submitting-applications
  - spark-cluster-overview
claim_ids:
  - spark-claim-0072
  - spark-claim-0073
  - spark-claim-0091
  - spark-claim-0092
  - spark-claim-0093
  - spark-claim-0094
related_docs:
  - bigdata/spark/dependency-distribution-jars-pyfiles-local-uri-and-executor-visibility
estimated_minutes: 10
---

# 题目

为什么 Spark 依赖分发问题本质上是可见性边界与分发责任边界问题？

# 一句话结论

因为 executor 能不能用到某个依赖，决定因素不是“机器上有没有文件”，而是 Spark 通过什么机制分发、谁在提供文件、以及该依赖是否对所有 worker 都一致可见。

# 核心机制

1. `spark-submit` 自动传播 application jar 与 `--jars`
2. `file:` 由 driver HTTP server 分发，`local:` 要求每个 worker 预置文件
3. Python 依赖有单独的 `--py-files` 分发面

# 标准答案

Spark 依赖分发问题本质上是可见性边界与分发责任边界问题，因为官方 Submitting Applications 文档明确说明，`spark-submit` 会自动把 application jar 和 `--jars` 中的 jars 传入集群，并加入 driver 与 executor 的 classpath；这说明依赖传播本身就是 Spark 提交协议的一部分。更关键的边界在 URI 策略上：绝对路径和 `file:/` URI 会由 driver 的 HTTP file server 提供，再由每个 executor 从 driver 拉取；而 `local:/` 则要求文件本来就存在于每个 worker 节点，因此没有网络 I/O。也就是说，`file:` 与 `local:` 不是同义路径，它们对应的是完全不同的分发责任边界。对 Python 应用，Spark 还要求用 `--py-files` 分发 `.py`、`.zip`、`.egg` 文件，这说明 JVM 与 Python 依赖也不是同一个传播面。再往下，官方还指出这些 JAR 和 file 会被复制到 executor 上每个 SparkContext 的 working directory，长期会占磁盘空间，YARN 会自动清理而 Standalone 需要配置清理；结合 Cluster Overview 里“driver 必须对 worker 可达且最好靠近 worker”，可以看出 driver 在某些分发模式下还承担依赖传播入口角色。所以真正的问题不是“机器上有没有这个包”，而是 Spark 的分发机制有没有把它正确暴露给所有 executor。

# 必答点

1. 说明 `spark-submit` 自带依赖传播语义
2. 说明 `file:` 与 `local:` 的分发责任完全不同
3. 说明 Python 依赖通过 `--py-files` 分发
4. 说明依赖会落到 executor working directory 并有运维副作用

# 常见误答

1. 只会说 `--jars`
2. 把 `file:` 与 `local:` 当成一样的本地路径
3. 不知道 Python 依赖是单独传播面
4. 忽略 driver 在分发路径中的角色
