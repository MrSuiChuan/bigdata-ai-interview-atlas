---
kb_id: bigdata/spark/system-design-scenarios
title: Spark 系统设计取舍
description: 解释 Spark 系统设计取舍的定位、对象、链路、适用场景和相邻系统边界，用于建立系统化知识框架。
domain: bigdata
component: spark
topic: system-design-scenarios
difficulty: advanced
status: reviewed
sidebar_position: 11
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-rdd-guide
  - spark-dataset-javadoc
  - spark-job-scheduling
  - spark-tuning-guide
  - spark-docs-home
  - spark-overview-doc
  - spark-rdd-scaladoc
  - spark-sql-guide
claim_ids:
  - spark-claim-0014
  - spark-claim-0017
  - spark-claim-0018
  - spark-claim-0024
  - spark-claim-0028
  - spark-claim-0030
  - spark-claim-0031
  - spark-claim-0032
  - spark-claim-0033
  - spark-claim-0035
tags:
  - spark
  - knowledge
  - scenario
  - troubleshooting
  - knowledge-base
  - production
---
## Spark 系统设计题要从计算边界开始
Spark 系统设计不是问用不用 Spark，而是判断计算模型、数据规模、延迟目标、容错目标、资源模型和下游语义是否匹配。Spark 很适合大规模并行分析，但不负责替代存储系统、调度系统、权限系统、消息系统或业务事务系统。本页把批处理、流处理、交互式分析、特征工程、湖仓 ETL 和结果服务化放到同一设计框架。

## 输入、计划、资源、状态、输出与观测证据
| 维度 | 需要确认的问题 | 常见取舍 |
| --- | --- | --- |
| 数据规模 | 全量、增量、峰值和增长速度 | 决定分区、文件、资源和状态大小 |
| 延迟目标 | 分钟级、秒级、毫秒级还是离线 | 决定 batch、micro-batch 或其他系统 |
| 容错目标 | 可重跑、可恢复、端到端 exactly-once | Spark 恢复与外部幂等要分开设计 |
| 数据布局 | 分区列、文件大小、表格式、统计信息 | 影响扫描裁剪、join 和小文件 |
| 结果面 | 写表、写文件、写队列还是拉回 Driver | 大结果应留在分布式存储 |

## 从业务目标倒推批处理、流处理和交互式链路
批处理关注吞吐、可重跑、数据布局和下游可见性。流处理必须明确 source offset、checkpoint、state store、watermark、trigger、output mode、sink 语义和重启兼容性。交互式分析关注查询延迟、并发、缓存、统计信息和 Driver/UI 稳定性。特征工程常见长 lineage、重复扫描、宽表 join 和中间结果复用。

## 哪些正确性要交给外部系统保证
Spark 能重算 task 和 stage，但最终表的幂等写入、分区覆盖和提交语义要由表格式或业务流程保证。需要端到端 exactly-once 时，不能只说 Spark 支持 exactly-once fault tolerance，还要确认 source、sink、foreachBatch 幂等、checkpoint 和外部提交协议。

## 系统设计必须带容量、指标和排障路径
Spark 设计必须包含监控：event log、History Server、executor 日志、SQL UI、shuffle、spill、GC、state store、sink 延迟和外部系统指标。批作业常见风险是小文件过多、shuffle 过大、join 统计信息缺失、Driver collect、输出分区不合理和外部存储慢。

## 示例：设计检查清单
~~~text
1. 输入：数据源、快照边界、schema、分区和权限。
2. 计算：API、join 策略、shuffle、缓存、checkpoint、状态大小。
3. 输出：文件/表/队列、提交语义、幂等键、下游可见时间。
4. 恢复：失败重跑、checkpoint 复用、版本回滚、补数方案。
5. 观测：Spark UI、event log、业务校验、外部系统指标。
~~~

## 吞吐、延迟、成本和可恢复性的取舍
动态资源可以提高集群利用率，但要和 shuffle 数据可用性、executor 回收、decommission 和 external shuffle service/shuffle tracking 一起设计。队列隔离可以避免单个大作业影响全局，但也可能增加排队延迟。高并发低延迟点查通常应考虑专门 OLAP/Serving 系统，而不是直接用 Spark application 承载在线请求。

## 依据与版本边界
本页依据 Spark Overview、RDD Guide、Dataset API、Job Scheduling 和 Tuning 文档。系统设计中的端到端语义必须结合具体 source、sink、表格式和调度平台确认。
