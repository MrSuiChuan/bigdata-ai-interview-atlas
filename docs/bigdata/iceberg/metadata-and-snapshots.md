---
kb_id: bigdata/iceberg/metadata-and-snapshots
title: Iceberg 元数据与 Snapshot
description: 解释 Iceberg 元数据与 Snapshot中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: iceberg
topic: metadata-snapshots
difficulty: intermediate
status: reviewed
sidebar_position: 2
version_scope: Iceberg latest docs and spec as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - iceberg-reliability
  - iceberg-spec
  - iceberg-branching-and-tagging
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
claim_ids:
  - iceberg-claim-0011
  - iceberg-claim-0012
  - iceberg-claim-0013
  - iceberg-claim-0020
  - iceberg-claim-0021
  - iceberg-claim-0025
  - iceberg-claim-0026
  - iceberg-claim-0001
  - iceberg-claim-0002
  - iceberg-claim-0003
tags:
  - iceberg
  - metadata
  - snapshot
  - manifest
  - knowledge-base
  - production
---
## 读一张 Iceberg 表时，真正被读取的是哪个版本
Iceberg 的读取入口不是“扫到哪些目录”，而是“当前 catalog 指向哪个 metadata file”。这个 metadata file 里保存了表级定义和当前有效 snapshot；读者先拿到这个版本边界，再继续做扫描规划。因此，只要当前 snapshot 没变，同一批读者看到的就是同一份表状态，而不是随着对象存储目录瞬时变化而漂移的结果。

这里一定要把“文件存在”与“文件属于当前表版本”区分开。某个 writer 可能已经把 data file 写到对象存储，但只要新的 metadata file 还没有成为当前表头，这些文件就还不是当前可见表状态的一部分。Iceberg 用 snapshot 明确划出了可见性边界，这正是它能提供一致读的基础。

## metadata file 里到底保存了什么
Iceberg 规范把表元数据定义为 JSON。这个 JSON 不是附属信息，而是整张表的权威描述，里面至少会出现以下几类对象：

| 元数据项 | 作用 | 你应该如何理解它 |
| --- | --- | --- |
| `schema` / `schemas` | 描述列结构和字段 ID | 列身份以 field ID 为准，不以名字和位置为准 |
| `partition-specs` | 描述分区规则及其版本 | 支持分区演进，不要求所有历史文件都用同一种布局 |
| `sort-orders` | 描述表级排序语义 | 写入端可参考，读取端不靠它直接决定结果正确性 |
| `snapshots` | 保存当前仍然有效的 snapshot 集合 | 只有仍然有效的 snapshot 才是表历史的一部分 |
| `snapshot-log` | 记录 current snapshot 变化轨迹 | 用来回答“表头何时切到哪个 snapshot” |
| `metadata-log` | 记录旧 metadata file 的路径和变更时间 | 用来回溯 metadata 层本身是怎样演化的 |
| `refs` | 保存分支和标签等命名引用 | 主分支表头始终与当前 snapshot 对齐 |
| `current-snapshot-id` | 指向主分支当前表头 | 这是“现在读表读到哪个版本”的直接答案 |

因此，排查一张 Iceberg 表时，metadata file 通常比“看目录”更有解释力。目录只能告诉你对象存储里有什么；metadata file 才能告诉你这些对象哪些真正构成表版本、当前主分支到底指向谁、历史是如何变过来的。

## snapshot 如何把“表版本”串成可读状态
可以把一个 snapshot 理解成“这一时刻整张表对读者可见的文件集合说明书”。它本身不会逐行保存数据，而是通过两层间接引用把文件组织起来：

`current-snapshot-id -> snapshot -> manifest list -> manifests -> data files / delete files`

这个链路非常关键：

- `current-snapshot-id` 决定当前主分支表头在哪个 snapshot。
- snapshot 决定本次读应该使用哪份 manifest list。
- manifest list 决定要看哪些 manifests。
- manifests 再列出真正属于这个 snapshot 的 data file 或 delete file。

这条链路带来的最大收益是，读取方拿到的是一个稳定版本，而不是一个边扫边变的目录视图。哪怕此时别的 writer 正在写新文件，只要它们还没有通过新的 metadata file 成为当前 snapshot，这批文件就不会污染当前读结果。

## 为什么这种模型比目录扫描更可靠
Iceberg 的权威文件列表保存在 metadata 中，而不是在查询时临时递归枚举目录。这样做有两层意义。

第一层是正确性。对象存储环境下，依赖目录扫描意味着你很难把“哪些文件已经正式成为表状态”与“哪些文件只是物理上已经存在”区分开；Iceberg 通过 snapshot 把这个边界做成了显式元数据。

第二层是性能与可控性。既然表当前文件集合已经被版本化记录下来，规划器就不必先付出昂贵的目录发现成本，再去猜哪些文件可读，而是可以直接从元数据树进入扫描规划。

## snapshot log 和 metadata log 分别回答什么问题
很多团队在排障时只知道看 snapshot，却搞不清 `snapshot-log` 和 `metadata-log` 的区别。

`snapshot-log` 关注的是“表头怎么变”。每当 `current-snapshot-id` 发生变化，规范要求追加一条记录，说明变化时间和新的 snapshot ID。它回答的是：主分支何时切到了哪个 snapshot。

`metadata-log` 关注的是“metadata file 怎么换代”。每生成一个新的 metadata file，都应该记录变更时间和上一版 metadata file 的位置。它回答的是：元数据文件本身如何迭代，以及上一版 metadata 在哪里。

这两个日志的用途并不重复。一个偏向表版本可见性，一个偏向元数据文件演化。真正做故障回溯时，通常要把两者结合起来看。

## current-snapshot-id 与 main 分支的关系
Iceberg 规范里有一个非常重要但容易被忽略的事实：表的 `current-snapshot-id` 始终等于主分支 `main` 的头指针。也就是说，哪怕表支持 refs、支持 branch 和 tag，默认读表时你拿到的依然是主分支头。

这条规则有两个直接后果：

- 默认读路径只需要知道当前 metadata file，就能知道主分支最新可见状态。
- 当你分析 branch/tag 行为时，必须先分清“默认主分支读取”与“显式引用某个 ref 读取”是不是同一件事。

## 一致性与容错
Iceberg 在元数据与 snapshot 层最重要的容错价值，是把“物理对象存在”和“逻辑版本可见”分开：

1. data file 已经写到对象存储，不等于读者已经可见。
2. 某个 metadata file 已经生成，不等于它已经成为当前表头。
3. 旧文件被 remove 或被新 snapshot 取代，不等于它立刻物理消失。
4. branch、tag、main 可能同时指向不同 snapshot，因此“当前版本”必须带 ref 语义来讲。

### 为什么 Snapshot 模型天然适合排障
因为它提供了一条稳定的版本链。你不需要猜“目录里哪些文件算当前数据”，而是可以精确追溯到 metadata file、snapshot、manifest list 和 manifest。对生产排障来说，这种可解释性比目录扫描强得多。

## 性能模型
metadata 与 snapshot 设计不只是为了正确性，也直接影响规划性能：

1. 当前文件集合已被版本化记录，规划器无需做昂贵目录发现。
2. checkpoint 和 metadata log 决定恢复快照时的元数据开销。
3. manifest list 与 manifests 的组织方式会影响扫描规划成本。
4. 分支、标签和历史保留越丰富，元数据治理就越重要。

### 为什么 Iceberg 的规划成本经常先出现在元数据层
因为读表前并不是直接扫数据文件，而是先走一遍 metadata tree。如果 metadata file、manifest list 和历史保留设计失控，查询还没进数据面就会先在元数据规划层变慢。

## 生产排障
遇到“文件明明已经写上去，但查询看不到”或“时间旅行结果不对”时，建议按元数据链排：

1. 先确认 catalog 当前指向的 metadata file。
2. 再确认 `current-snapshot-id` 或目标 ref 指向的 snapshot。
3. 再检查 manifest list 和 manifests 中是否真的包含预期文件。
4. 最后才去看对象存储中物理文件本体。

### 诊断样例
```sql
SELECT committed_at, snapshot_id, operation
FROM prod.db.orders.snapshots
ORDER BY committed_at DESC;
```

这个样例的意义在于先确认“版本切到了哪里”，而不是先跑去对象存储看目录。

## 观察与排障时优先看什么
如果你怀疑表版本不对、时间旅行结果异常或某次提交之后数据不见了，建议先按下面顺序观察：

1. 先确认当前 metadata file 是否已经切到预期版本。
2. 再确认 `current-snapshot-id` 指向哪个 snapshot，以及这个 snapshot 的时间与操作类型是否符合预期。
3. 然后查看 snapshot 对应的 manifest list 和 manifests，确认新增或删除的文件是否真的在当前版本内。
4. 最后再去看对象存储上的文件本体，避免把“文件在”误判成“版本已可见”。

下面这类查询很适合作为最小观察入口：

```sql
SELECT * FROM prod.db.orders.snapshots;
SELECT * FROM prod.db.orders.manifests;
```

它们的价值不在于背语法，而在于帮助你把“当前读到的表版本”与“底层文件物理存在”区分开。
