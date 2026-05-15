---
id: q-bigdata-hdfs-0018
title: "对象存储、HBase、Kafka、湖仓表格式分别解决什么问题，该怎么和 HDFS 对比"
domain: bigdata
component: hdfs
topic: comparison
question_type: tradeoff
difficulty: intermediate
status: reviewed
version_scope: "Apache Hadoop 3.3.5 stable HDFS docs as verified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - hadoop-hdfs-design
  - hadoop-hdfs-user-guide
claim_ids:
  - bigdata-hdfs-claim-0020
  - bigdata-hdfs-claim-0006
  - bigdata-hdfs-claim-0017
related_docs:
  - bigdata/hdfs/comparison
estimated_minutes: 8
---

# 题目

对象存储、HBase、Kafka、湖仓表格式分别解决什么问题，该怎么和 HDFS 对比？

# 一句话结论

对比题最重要的不是背表格，而是先按“数据模型、访问模式、提交语义和上层能力”分型，再说明 HDFS 只负责其中的文件与 block 层。

# 面试官真正想考什么

这道题考的是选型边界感。很多人会说 HDFS 是大数据底层，所以什么都能扛；更成熟的回答会说明 HDFS 只是其中一层，很多更高层语义应该交给对象存储、KV、消息系统或表格式。

# 核心原理

1. HDFS 解决大文件分布式存储和高吞吐扫描。
2. 对象存储解决海量对象和云托管持久化。
3. HBase 解决低延迟随机读写与按 key 访问。
4. Kafka 解决事件流顺序消费；湖仓表格式解决表级快照、演进和事务语义。

# 关键对象与状态

1. HDFS：path / file / block / replica。
2. 对象存储：object / bucket / object API。
3. HBase：row key / region / store file。
4. Kafka / 表格式：partition / offset 与 snapshot / metadata tree。

# 标准回答

比较成熟的对比方式，是先判断问题像哪类存储问题。如果业务核心是离线批处理和大文件顺序扫描，那 HDFS 更像答案；如果核心是低延迟随机访问，那是 HBase 或数据库问题；如果核心是事件流和消费位点，那是 Kafka；如果核心是多引擎共享表、快照、演进和 time travel，那还需要 Iceberg、Delta、Hudi 这类表格式来补。
也就是说，HDFS 常常是底层文件层，但不是所有上层语义层本身。真正好的对比答案，应该先划清层次，再说明为什么某种需求必须把能力上移或下移。

# 如果追问到生产场景

1. 如果做架构选型，不要直接问“要不要 HDFS”，先问数据访问模式是什么。
2. 如果线上问题已经暴露成随机查询慢，不要再硬往 HDFS 优化里套。
3. 如果团队在谈表级事务或 time travel，就要主动把讨论拉到表格式层。

# 常见误答

1. 把所有大数据存储都笼统归成 HDFS。
2. 只比快慢，不比数据模型和语义边界。
3. 把底层文件层和上层表层混成一个概念。

# 追问

1. 为什么说 HDFS 能做底座，但不能回答消息和表事务语义？
2. 对象存储和 HDFS 最大的工程差异，为什么不是“能不能放文件”而是“怎样访问和维护文件”？
