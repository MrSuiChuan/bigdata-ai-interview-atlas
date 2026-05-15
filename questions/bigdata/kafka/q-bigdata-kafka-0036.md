---
id: q-bigdata-kafka-0036
title: Kafka 跨集群复制延迟升高，如何判断 MirrorMaker 2、网络还是目标集群瓶颈
domain: bigdata
component: kafka
topic: mirrormaker-lag
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Kafka 4.2 docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - kafka-geo-replication
  - kafka-connect-user-guide
claim_ids:
  - kafka-claim-0092
  - kafka-claim-0093
  - kafka-claim-0082
  - kafka-claim-0083
related_docs:
  - bigdata/kafka/geo-replication-mirrormaker
  - bigdata/kafka/connect-distributed-mode
  - bigdata/kafka/capacity-planning-partition-disk-network
estimated_minutes: 10
---

# 题目

MirrorMaker 2 从主集群复制到备集群的延迟突然升高，你如何判断是 MM2 本身、跨地域网络还是目标集群写入能力不足？

# 一句话结论

把 MM2 当作 Connect 应用排查：看 connector/task 状态和 lag，再分别验证源读、网络传输、目标写入、tasks.max 和目标集群 ISR/磁盘网络。

# 核心机制

1. MirrorMaker 2 基于 Kafka Connect 框架。
2. 可复制 topic、配置、group offsets 和 ACL。
3. tasks.max 至少应能让负载跨多个进程分摊。
4. 跨集群复制受源、目标、网络和 Connect worker 共同限制。
5. 故障切换还要关注 offset sync 和重复处理。

# 标准答案

MM2 基于 Connect，所以先通过 Connect REST API 查看 MirrorSourceConnector、task 状态、错误和重启次数。然后拆链路：源集群读是否慢，目标集群写是否出现 request timeout、ISR 缩小或磁盘网络瓶颈，跨地域链路是否有带宽或丢包抖动。继续看 tasks.max 是否过低，worker 数是否足够，任务是否集中在少数进程。若只目标端 lag 高，检查目标 topic 分区、ACL、quota、min.insync.replicas 和 broker 请求延迟。对于 DR 场景，还要验证 checkpoint 和 offset sync 是否满足切换要求。

# 必答点

1. 说明 MM2 基于 Connect
2. 说明分段看源、网络、目标
3. 说明 connector/task 状态
4. 说明 tasks.max 和 worker 分布
5. 说明 offset sync 对切换重要

# 加分点

1. 能把目标集群 ISR/quota 纳入分析
2. 能说明异步复制存在 RPO

# 常见误答

1. 只扩目标 broker
2. 忽略 Connect worker 状态
3. 把 MM2 当同步复制

# 追问

1. 双向复制如何避免 topic 循环？
2. 复制 group offset 后是否就能无损切换？
3. tasks.max 为什么不是越大越好？
