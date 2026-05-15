---
id: q-bigdata-kafka-0039
title: Kafka 容量规划时为什么不能只按日增数据量估磁盘
domain: bigdata
component: kafka
topic: capacity-planning
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-design-doc
  - kafka-topic-configs
  - kafka-basic-operations
claim_ids:
  - kafka-claim-0001
  - kafka-claim-0014
  - kafka-claim-0033
  - kafka-claim-0034
  - kafka-claim-0008
related_docs:
  - bigdata/kafka/capacity-planning-partition-disk-network
  - bigdata/kafka/system-design-scenarios
  - bigdata/kafka/performance-tuning
estimated_minutes: 10
---

# 题目

做 Kafka 容量规划时，为什么不能只拿“每天写入多少 GB”来估磁盘？还需要哪些输入？

# 一句话结论

磁盘只是容量规划的一部分，还要看 replication factor、retention、压缩率、segment/index、峰值吞吐、consumer fan-out、分区数和未来扩展。

# 核心机制

1. 磁盘需求要乘以 retention 和 replication factor，并考虑压缩率和安全余量。
2. 网络要计算 producer ingress、replica traffic 和 consumer egress。
3. 分区数决定同组消费并行上限，也带来文件和恢复成本。
4. retention 和 compaction 策略会改变可回放和磁盘模型。
5. 扩分区不能减少分区，也不重分布旧数据。

# 标准答案

日增数据量只回答了原始写入规模，不能完整描述 Kafka 资源需求。磁盘至少要按写入量、保留时间、replication factor、压缩率、segment/index 和安全余量估算；网络要算生产写入、follower 复制以及多个 consumer group 的读取 fan-out；CPU 要考虑压缩、解压、请求处理和 TLS；分区数要同时满足同组消费者并行度和未来增长，但不能无限增加，因为它会带来元数据、文件、leader 和恢复成本。还要考虑 cleanup.policy 是 delete 还是 compact，二者对磁盘释放和可回放语义不同。

# 必答点

1. 说明 replication factor 和 retention
2. 说明压缩率和安全余量
3. 说明网络 fan-out
4. 说明分区数并行和成本
5. 说明 retention/compaction

# 加分点

1. 能补充 leader 分布和机架容灾
2. 能说明压测基线不能省

# 常见误答

1. 只按一天数据量乘保留天数
2. 忽略副本复制倍数
3. 分区数随便给一个整数

# 追问

1. 消费者 group 数量为什么影响网络？
2. 分区数太多会有什么成本？
3. 压缩率应该如何获得？
