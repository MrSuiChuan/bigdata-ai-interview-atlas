---
id: q-bigdata-hdfs-0019
title: "如何设计 PB 级离线数据湖底座，才能把 HDFS 讲成系统设计题"
domain: bigdata
component: hdfs
topic: system-design
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Apache Hadoop 3.3.5 stable HDFS docs as verified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - hadoop-hdfs-design
  - hadoop-hdfs-user-guide
  - hadoop-hdfs-permissions
  - hadoop-hdfs-ha-qjm
claim_ids:
  - bigdata-hdfs-claim-0018
  - bigdata-hdfs-claim-0016
  - bigdata-hdfs-claim-0014
  - bigdata-hdfs-claim-0015
  - bigdata-hdfs-claim-0013
related_docs:
  - bigdata/hdfs/system-design
estimated_minutes: 10
---

# 题目

如何设计 PB 级离线数据湖底座，才能把 HDFS 讲成系统设计题？

# 一句话结论

真正的 HDFS 设计题，不是磁盘容量计算题，而是“数据形态、block 布局、HA、拓扑、权限、多租户和上层计算”一起联动的体系设计题。

# 面试官真正想考什么

这道题考的是你能否用 HDFS 组织一整套工程约束。面试官想听的是：你不只知道 HDFS 是什么，还知道在规模、容错、治理和上层作业介入后，它应该怎样落地。

# 核心原理

1. 先确认业务是不是大文件、批处理和顺序扫描型问题。
2. 再设计目录、文件、block 和副本布局，让上层计算能消费本地性和并行度。
3. 同时设计 NameNode HA、拓扑和运维窗口，让控制面和恢复面有明确边界。
4. 最后补上权限、多租户、清理规则和平台写出规范，让系统长期可治理。

# 关键对象与状态

1. 目录层次：租户、环境、数据域、冷热分层。
2. 文件 / block：任务并行度和恢复粒度。
3. HA / JournalNode / ZKFC：NameNode 可用性保障。
4. 上层计算引擎：Spark、Hive 等对 HDFS 形态的消费方。

# 标准回答

一个比较稳的设计题回答，通常会先从数据形态开始：文件会多大、每天增长多少、写出是否会产生碎片；然后进入布局层：目录如何分层、block 与副本如何设计、机架与 HA 如何落地；再进入治理层：权限怎么划、哪些目录要配额、如何做小文件治理、历史数据怎样清理。
最后再把上层作业拉进来：Spark/Hive 怎么消费这些目录和文件，是否能获得足够并行度和本地性，表格式要不要叠在 HDFS 之上。这样答，HDFS 就不是一个单点组件，而是数据湖底座的一整套系统设计。

# 如果追问到生产场景

1. 设计题里一定要带上 HA、机架、目录治理和小文件治理。
2. 如果团队还没明确写出规范，再大的 HDFS 集群也会被碎片化拖坏。
3. 如果题目强调对象存储或云环境，要主动说明什么时候底座可能不再首选 HDFS。

# 常见误答

1. 把设计题答成参数配置题。
2. 只算磁盘和节点，不谈目录治理和上层作业。
3. 只讲容量，不讲恢复窗口和运维流程。

# 追问

1. 为什么目录治理和小文件治理在 PB 级 HDFS 里属于设计问题，而不是运维小修？
2. 为什么 HDFS 设计题一定要带着上层 Spark/Hive 一起讲？
