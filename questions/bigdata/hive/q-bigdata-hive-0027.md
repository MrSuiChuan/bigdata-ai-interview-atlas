---
id: q-bigdata-hive-0027
title: 为什么 Hive 的 update/delete 题必须继续讲 ROW__ID，而不能只讲业务主键
domain: bigdata
component: hive
topic: acid-base-delta-row-id-snapshot-read-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - hive-hcatalog-streaming-mutation-api
  - hive-virtual-columns
claim_ids:
  - hive-claim-0130
  - hive-claim-0131
  - hive-claim-0132
  - hive-claim-0133
related_docs:
  - bigdata/hive/acid-base-delta-row-id-and-snapshot-read-path
estimated_minutes: 10
---

# 题目

为什么 Hive 的 `update/delete` 题必须继续讲 `ROW__ID`，而不能只讲业务主键？

# 一句话结论

因为 Hive 真正用来唯一标识 ACID 表内记录的不是业务键，而是系统管理的记录标识。

# 核心机制

1. `ROW__ID` 是 Hive 的虚拟列
2. RecordIdentifier 存在 `ROW__ID` 中，用于唯一标识 ACID 记录
3. mutation 前必须先读当前快照，把业务 key 对齐到对应 `ROW__ID`

# 标准答案

Hive 的 `update/delete` 题如果只讲业务主键，通常还差最关键的一层：官方文档说明，`ROW__ID` 是 Hive 的虚拟列，而 `Streaming Mutation API` 又明确指出，RecordIdentifier 存在 `ROW__ID` 中，用于在 ACID 表内唯一标识记录。也就是说，业务主键只能帮助你在业务语义上找到目标对象，但真正让 Hive 底层 mutation 精确命中记录的，是系统级的 `ROW__ID`。因此 mutation 流程必须先读当前快照，把业务 key 和对应记录的 `ROW__ID` 关联起来，然后才能发起更新或删除。更进一步，官方还要求 mutation 记录按 `ROW__ID.originalTxn` 和 `ROW__ID.rowId` 排序，并在 insert 时带上计算好的 `bucketId`，这进一步说明 Hive 更新删除不是 OLTP 式的主键覆盖模型。

# 必答点

1. 说明 `ROW__ID` 是虚拟列
2. 说明它才是底层记录身份
3. 说明 mutation 前要先读快照做 key 到 `ROW__ID` 的映射

# 常见误答

1. 把 Hive 更新讲成普通主键覆盖
2. 不知道 `ROW__ID` 的存在
3. 不知道 mutation 有排序和 bucket 约束
