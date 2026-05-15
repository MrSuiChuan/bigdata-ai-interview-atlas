---
id: q-bigdata-kafka-0005
title: Kafka 的 Retention 和 Log Compaction 分别适合什么场景
domain: bigdata
component: kafka
topic: retention-vs-compaction
question_type: short_answer
difficulty: intermediate
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-22"
last_verified_at: "2026-04-22"
source_ids:
  - kafka-topic-configs
  - kafka-design-doc
claim_ids:
  - kafka-claim-0008
  - kafka-claim-0009
related_docs:
  - bigdata/kafka/retention-log-compaction
estimated_minutes: 5
---

# 题目

Kafka 的 `retention` 和 `log compaction` 分别适合什么场景？

# 标准答案

`retention` 更关注日志保留窗口，也就是按时间或大小删除旧数据，适合事件流回放和控制存储成本。`log compaction` 更关注每个 key 的最新状态保留，至少保留每个 key 的最新值，适合 changelog、状态恢复和状态重建。两者关注的不是同一件事，一个偏事件生命周期，一个偏状态保留，而且 Kafka 的 `cleanup.policy` 还可以配置为 `delete`、`compact` 或两者组合。

# 必答点

1. 说明 retention 关注日志保留窗口
2. 说明 compaction 关注 key 的最新状态保留
3. 说明两者适用场景不同，且可以组合

# 加分点

1. 能区分 event log 和 changelog topic
2. 能提到 compaction 不是保留完整历史

# 常见误答

1. 把 compaction 说成完整历史归档
2. 以为 retention 和 compaction 永远互斥

# 追问

1. 为什么状态恢复场景更适合 compaction？
2. `cleanup.policy=delete,compact` 这种配置适合怎样的 topic？
