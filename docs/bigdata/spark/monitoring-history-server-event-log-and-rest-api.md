---
kb_id: bigdata/spark/monitoring-history-server-event-log-rest-api
title: Spark 监控、History Server 与 Event Log
description: 解释 Spark UI、History Server、event log、REST API 和 metrics 如何形成可复核排障证据链。
domain: bigdata
component: spark
topic: monitoring-history-server-event-log-rest-api
difficulty: advanced
status: reviewed
sidebar_position: 29
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-monitoring-doc
  - spark-job-scheduling
  - spark-tuning-guide
  - spark-docs-home
claim_ids:
  - spark-claim-0148
  - spark-claim-0149
  - spark-claim-0150
  - spark-claim-0015
tags:
  - spark
  - monitoring
  - history-server
  - event-log
  - metrics
  - knowledge-base
  - production
---
## 定位与边界
Spark 监控不是单一页面，而是一组可复核证据：实时 Web UI、History Server、event log、REST API、metrics system、Driver 日志和 executor 日志。它们分别服务于运行中观察、事后回放、自动采集和根因定位。

生产诊断不能只看“应用成功或失败”。很多问题在失败前已经体现在 stage 长尾、shuffle spill、executor lost、GC 时间、状态增长、checkpoint I/O 或 sink commit 延迟上。

## 核心对象
| 对象 | 作用 | 边界 |
| --- | --- | --- |
| Application Web UI | 运行中查看 Jobs、Stages、SQL、Executors、Storage、Environment | 应用结束后默认不可长期访问 |
| Event Log | 记录 SparkListener 事件，用于事后回放 | 需要可靠存储、权限和保留策略 |
| History Server | 从 event log 重建已完成应用 UI | 回放质量依赖 event log 完整性 |
| REST API | 程序化获取应用、job、stage、executor 等信息 | 字段和可用性受版本影响 |
| Metrics System | 面向监控系统导出持续指标 | 需要与企业监控平台集成 |
| Driver/Executor Logs | 保存错误栈、依赖错误、OOM、容器事件 | 需要和集群管理器日志一起看 |

## 证据链路
运行中作业优先看 Web UI。Jobs 页面定位 action 与 job；Stages 页面定位 task 分布、shuffle、spill 和失败；SQL 页面定位物理计划、operator 耗时和 runtime statistics；Executors 页面定位内存、GC、磁盘、输入输出和 executor 丢失。

作业结束后，History Server 通过 event log 重建 UI。没有 event log，很多问题只能依赖零散日志；event log 不完整或权限不可读，History Server 也无法提供可靠回放。

## REST API 与自动化
REST API 适合把 Spark 运行状态接入平台，例如抓取应用状态、stage 指标、executor 指标和失败原因。它不能替代 event log，因为 REST 更偏运行状态查询，event log 更适合完整回放。

Metrics system 适合持续监控和告警，例如 executor 数量、JVM 指标、shuffle 指标、streaming 指标、state store 指标等。生产系统应把 metrics、event log 和业务数据质量指标合并看。

## 排障顺序
先确定影响范围：单个 application、单个 job、单个 stage、单个 executor、单个输入分区还是外部系统。再定位症状：排队慢、扫描慢、shuffle 慢、spill 多、GC 高、executor lost、state 增长、sink 慢。最后收集证据：Spark UI、event log、executor log、Driver log、集群事件和外部存储指标。

不要只看平均耗时。Spark 故障常常表现为少数 task 长尾、少数 executor 异常或少数分区倾斜。

## 示例：需要保留的诊断证据
~~~text
1. Spark application id、attempt id、提交时间和 Spark 版本。
2. explain("formatted") 或 SQL UI 中的 physical plan。
3. Stages 页面的 task duration、shuffle read/write、spill、failure reason。
4. Executors 页面的 executor lost、GC time、storage memory、input/output。
5. Driver 与 executor 日志，以及集群管理器的容器或 Pod 事件。
~~~

## 安全与保留
Spark UI、event log 和 History Server 可能暴露 SQL 文本、配置、环境变量、路径、错误栈和部分执行元数据。生产环境应配置 ACL、日志脱敏、event log 存储权限和保留策略。监控可见性不能以泄露凭据为代价。

## 来源与事实边界
本页依据 Spark Monitoring、Job Scheduling 和 Tuning 文档。不同部署平台可能把 UI、event log、metrics 和日志采集接入到不同系统，字段名称和保留策略以平台实现为准。
