---
id: q-bigdata-kafka-0008
title: 为什么 Kafka 里 Topic 更像逻辑事件流边界，而 Partition 才是真正的存储与并行单元
domain: bigdata
component: kafka
topic: topic-vs-partition
question_type: short_answer
difficulty: intermediate
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-22"
last_verified_at: "2026-04-22"
source_ids:
  - kafka-design-doc
  - kafka-implementation-log
claim_ids:
  - kafka-claim-0001
  - kafka-claim-0023
  - kafka-claim-0024
related_docs:
  - bigdata/kafka/core-objects-deep-dive
  - bigdata/kafka/broker-storage-network
estimated_minutes: 6
---

# 题目

为什么 Kafka 里 `Topic` 更像逻辑事件流边界，而 `Partition` 才是真正的存储与并行单元？

# 标准答案

因为 `Topic` 主要负责表达一条业务事件流的逻辑边界和配置边界，而 Kafka 真正落盘、复制、分配并行度和维持顺序性的单位是 `Partition`。实现文档说明，一个 partition 最终会对应自己的日志目录和 segment 文件，所以存储结构是围绕 partition 组织的，而不是围绕 topic 组织的。面试里如果只说 topic 是消息流名称却不继续讲 partition 才是真正的日志分片，就很难把顺序性、吞吐和 consumer group 并行度这些问题讲透。

# 必答点

1. 说明 topic 是逻辑事件流边界
2. 说明 partition 才是真正的存储、顺序性和并行度单元
3. 说明 partition 会对应自己的日志目录和 segment 文件

# 加分点

1. 能补充 topic 级配置与 partition 级物理组织的区别
2. 能把这个问题继续连到 consumer group 并行度和顺序性权衡

# 常见误答

1. 把 topic 直接当成真实存储结构
2. 只会说 partition 为了并行，却说不清它为什么也是顺序性基本单位

# 追问

1. 为什么分区扩容会影响同 key 顺序？
2. 为什么 retention 和删除通常按 segment 生效而不是按 topic 整体删除？
