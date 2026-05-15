---
kb_id: bigdata/spark/dependency-distribution-jars-pyfiles-local-uri-and-executor-visibility
title: Spark 依赖分发与 Executor 可见性
description: 解释 Spark 依赖分发与 Executor 可见性的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: spark
topic: dependency-distribution-jars-pyfiles-local-uri-executor-visibility
difficulty: advanced
status: reviewed
sidebar_position: 17
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-submitting-applications
  - spark-cluster-overview
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-guide
  - spark-rdd-scaladoc
  - spark-sql-guide
  - spark-dataset-javadoc
claim_ids:
  - spark-claim-0072
  - spark-claim-0073
  - spark-claim-0091
  - spark-claim-0092
  - spark-claim-0093
  - spark-claim-0094
  - spark-claim-0001
  - spark-claim-0002
  - spark-claim-0003
  - spark-claim-0004
tags:
  - spark
  - dependency
  - spark-submit
  - py-files
  - executor
  - knowledge-base
  - production
---
## 依赖分发解决的是 Executor 可见性问题
Spark 应用运行在 Driver 和多个 executor 进程中。Driver 能看到的本地文件、JAR、Python 模块或环境变量，executor 不一定能看到。依赖分发解决的是代码和资源如何到达执行节点的问题，而不是解决所有环境一致性、权限和版本冲突问题。

## JAR、PyFiles、file URI 与 local URI
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| application jar | Spark 应用主 JAR | spark-submit 会分发到集群并加入 classpath |
| --jars | 额外 JVM 依赖 | 会传到 driver/executor classpath，但冲突仍需治理 |
| --py-files | Python .py/.zip/.egg 依赖 | 分发给 executor 使用，不等同于安装系统包 |
| file:/ URI | 由 Driver HTTP file server 提供给 executor 拉取 | Driver 必须网络可达，文件传输有成本 |
| local:/ URI | 要求每个 worker 已经有同一路径文件 | 不产生网络复制，但依赖预置环境一致 |

## spark-submit 如何把依赖送到 Driver 和 Executor
提交应用时，Spark 会把 application jar 和 --jars 中的依赖传输到集群，并放入 Driver 和 executor 的 classpath。Python 应用可以通过 --py-files 分发 .py、.zip 或 .egg 文件，让 executor 能 import 对应代码。绝对路径和 file:/ URI 通常由 Driver 的 HTTP file server 服务，executor 从 Driver 拉取文件；local:/ 表示文件已经存在于每个 worker 的本地路径。

## 依赖缓存、工作目录与节点环境一致性
JAR 和文件会被复制到 executor 节点上每个 SparkContext 的工作目录。长期运行或频繁提交可能积累大量依赖文件。YARN 会自动处理部分清理；Standalone 模式需要通过配置管理 worker 目录清理。磁盘满可能表现为 executor 启动失败、依赖下载失败、shuffle 写失败或临时文件无法创建。

## ClassNotFound 与 ModuleNotFound 应该看哪侧日志
依赖问题优先看 executor 日志，而不是只看 Driver。常见错误包括 ClassNotFoundException、NoClassDefFoundError、ModuleNotFoundError、本地路径不存在、权限不足、native library 加载失败和版本冲突。还要检查 deploy mode，因为 client mode 和 cluster mode 下 Driver 所在机器不同。

## 示例：提交依赖
~~~shell
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  --jars hdfs:///libs/custom-source.jar \
  --py-files deps/jobs.zip \
  jobs/daily_etl.py
~~~

## file:/ 和 local:/ 的取舍
file:/ 依赖分发依赖 Driver 可达性和网络传输；local:/ 不产生网络复制，但要求节点镜像或本地文件完全一致。只有部分 task 失败时，优先怀疑节点环境不一致、local:/ 文件缺失或磁盘清理问题。

## 依据与版本边界
本页依据 Spark Submitting Applications 和 Cluster Mode Overview 文档。不同资源管理器对依赖缓存、清理和 classpath 处理存在差异，应结合 YARN、Kubernetes 或 Standalone 实际实现验证。
