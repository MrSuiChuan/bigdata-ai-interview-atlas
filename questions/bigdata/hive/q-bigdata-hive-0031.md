---
id: q-bigdata-hive-0031
title: 为什么 Hive 的 metadata drift 题不能只答 MSCK REPAIR TABLE，而必须区分 external table、notification 和 synchronized cache
domain: bigdata
component: hive
topic: metastore-cachedstore-notification-metadata-drift-boundaries
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - hive-managed-external-tables
  - hive-synchronized-metastore-cache
  - hive-hcatalog-notification
claim_ids:
  - hive-claim-0014
  - hive-claim-0148
  - hive-claim-0149
  - hive-claim-0150
related_docs:
  - bigdata/hive/metastore-cachedstore-notification-and-metadata-drift-boundaries
estimated_minutes: 10
---

# 题目

为什么 Hive 的 `metadata drift` 题不能只答 `MSCK REPAIR TABLE`，而必须区分 `external table`、`notification` 和 `synchronized cache`？

# 一句话结论

因为这三者分别解决目录补录、事件传递和多 HMS cache 一致性，根本不是同一类问题。

# 核心机制

1. `MSCK REPAIR TABLE` 解决外部分区目录变化后的元数据补录
2. `notification` 负责元数据事件和 `LOAD_DONE` 信号
3. `synchronized cache` 解决多 HMS cache 的 freshness 问题，而 external table 还是 eventual consistency

# 标准答案

Hive 的 metadata drift 题如果只会回答 `MSCK REPAIR TABLE`，通常把三类完全不同的问题混到了一起。官方文档说明，`MSCK REPAIR TABLE` 的适用场景是 external table 的目录或分区在 Hive 外部被修改后，需要让 Hive 重新发现并补录 partition 元数据；它解决的是 catalog 缺记录的问题。另一方面，`HCatalog Notification` 负责 addPartition 等事件通知，还支持用 `markPartitionForEvent(..., LOAD_DONE)` 显式标记一组分区加载完成，这解决的是事件传播和下游感知问题。而 `Synchronized Metastore Cache` 则是在多 HMS 实例下增强 cache freshness 的机制，它利用 notification log 和 `ValidWriteIdList` 做一致性判断；但官方也明确指出，external table 因为没有合适的 write id 语义，仍然沿用 eventual consistency 的 cache 模型。因此成熟回答要先分型：是目录没补录、是事件没传播、还是多实例缓存没追平；三者的证据和修复动作完全不同，不能都靠 repair 解决。

# 必答点

1. 说明 `MSCK REPAIR` 的适用边界是 external table 分区补录
2. 说明 notification 解决事件传播
3. 说明 synchronized cache 解决多 HMS freshness，而 external table 仍是例外

# 常见误答

1. 把所有元数据同步问题都推给 `MSCK REPAIR TABLE`
2. 不知道 `LOAD_DONE` 事件语义
3. 不知道 external table 是 synchronized cache 的例外
4. 不区分缓存漂移和目录漂移
