---
id: q-bigdata-flink-0018
title: 为什么 Flink 的状态升级题必须继续讲 TTL migration、POJO/Avro 和 key schema 限制
domain: bigdata
component: flink
topic: state-ttl-cleanup-migration-schema-evolution
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-state-ttl-migration
  - flink-state-schema-evolution
claim_ids:
  - flink-claim-0084
  - flink-claim-0085
  - flink-claim-0087
  - flink-claim-0088
  - flink-claim-0089
  - flink-claim-0090
  - flink-claim-0091
related_docs:
  - bigdata/flink/state-ttl-cleanup-migration-and-schema-evolution-boundaries
estimated_minutes: 12
---

# 题目

为什么 Flink 的状态升级题必须继续讲 TTL migration、POJO/Avro 和 key schema 限制？

# 一句话结论

因为 savepoint 能不能安全恢复，取决于状态元数据与序列化兼容边界，不是“改了代码再恢复”这么简单。

# 核心机制

1. Flink 2.2 才完整支持 TTL enable/disable migration
2. schema evolution 主要支持 POJO 和 Avro
3. key schema evolution 不支持
4. Kryo 不支持 schema evolution

# 标准答案

Flink 的状态升级题如果只回答“打个 savepoint 再恢复”，通常还没有讲到兼容性边界。官方文档说明，Flink 2.2 起才完整支持在已有状态上无缝启用或禁用 TTL，而不需要改 savepoint；但这只解决 TTL 元数据兼容，不代表状态 schema 可以随便改。状态 schema evolution 主要支持 POJO 和 Avro：POJO 可以增删字段，但不能改字段类型、类名或 namespace；Avro 要遵守 Avro 自身的兼容规则。而 key schema evolution 明确不支持，因为它会带来 non-deterministic behavior；Kryo 也不支持 schema evolution。也就是说，真正稳的升级回答必须把 TTL 迁移、状态类型选择和 key 的硬边界一起讲出来。

# 必答点

1. Flink 2.2 的 TTL migration 版本边界
2. POJO/Avro 的演进边界
3. key schema 和 Kryo 的禁区

# 常见误答

1. 以为 savepoint 之后什么都能改
2. 不知道 key schema 不能演进
3. 不知道 Kryo 会破坏演进能力
