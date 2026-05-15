---
kb_id: bigdata/hive/acid-base-delta-row-id-and-snapshot-read-path
title: Hive ACID Base/Delta 目录与快照读取
description: 解释 Hive ACID 表如何从 base / delta / row-id 目录构建快照读路径，以及为什么读取成本会随着增量累积而变化。
domain: bigdata
component: hive
topic: acid-base-delta-row-id-snapshot-read-path
difficulty: advanced
status: reviewed
sidebar_position: 18
version_scope: Hive latest docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - hive-transactions-acid
  - hive-hcatalog-streaming-mutation-api
  - hive-virtual-columns
  - hive-docs-home
  - hive-introduction
  - hive-language-manual
  - hive-language-manual-ddl
  - hive-managed-external-tables
claim_ids:
  - hive-claim-0126
  - hive-claim-0127
  - hive-claim-0128
  - hive-claim-0130
  - hive-claim-0131
  - hive-claim-0132
  - hive-claim-0133
  - hive-claim-0134
  - hive-claim-0001
  - hive-claim-0002
tags:
  - hive
  - acid
  - mvcc
  - row-id
  - snapshot
  - knowledge-base
  - production
---
## ACID 表为什么不直接改原文件

Hive ACID 的核心思路不是“在原文件上原地覆盖”，而是把稳定数据和增量变化拆开存放，再由读取方在读路径上把当前可见版本拼出来。文档给出的明确事实是：表或分区的稳定数据放在 `base` 文件里，新记录、更新和删除放在 `delta` 文件里，读取器在读时合并 `base` 与 `delta`，并应用更新与删除，最终形成某个时间点的快照结果。

这意味着事务表的“当前结果”不是一个单独静态文件，而是一组目录和文件在某个事务可见范围下形成的逻辑视图。只要先建立这个认识，很多 ACID 现象就能顺着解释出来：为什么目录会越来越多，为什么读会越来越慢，为什么 compaction 不是可有可无，以及为什么更新删除不能简单理解成“按业务主键覆盖一条记录”。

## 物理布局为什么拆成 base 和 delta

对 ACID 感知写入来说，分区目录或非分区表目录不再只有一批普通数据文件，而是会出现两层结构：

1. `base` 目录，用来承载某个较稳定状态下的数据。
2. 多组 `delta` 目录，用来记录后续写入、更新、删除带来的变化。

文档明确指出，ACID 感知写入下，分区或非分区表不再把所有文件都堆在一个目录中，而是包含一个 `base` 目录，以及每一组 `delta` 文件对应的目录。这个设计背后的逻辑很直接：

1. 稳定结果尽量留在 `base`。
2. 新变化先进入 `delta`。
3. 读取时按当前快照把它们叠起来。
4. 后续再由 compaction 重新整理物理布局。

因此，ACID 表的目录数量本身就是读路径复杂度的一部分，而不是无关紧要的存储细节。

## 快照读在读什么

```mermaid
flowchart LR
  A["查询读取事务表"] --> B["定位当前可见的 base"]
  B --> C["收集当前快照需要参与的 delta"]
  C --> D["按记录标识合并更新与删除"]
  D --> E["生成该时刻的可见结果"]
```

这里最重要的不是记流程图，而是理解“快照”这个词在 Hive ACID 里到底是什么意思。根据文档，事务表的存储层实现了 MVCC，并能在并发修改存在时提供 Snapshot Isolation。也就是说，读者看到的是“在自己这次读取可见范围内成立的版本”，而不是目录里所有文件的简单并集。

更可用于系统理解的表述是：Hive ACID 查询不是直接扫一份“最新全量文件”，而是基于事务可见性，把 `base` 和若干 `delta` 合并成一个快照结果。快照边界来自事务视图，不来自目录最后修改时间，也不来自“哪批文件名字看起来最新”。

## 为什么目录里同时存在多批文件也不能直接全扫

ACID 表目录里往往会同时存在多批 `base` 和 `delta`。如果把这些文件全都无差别扫进去，再由上层自己猜哪条记录新，结果既不正确，也会把成本放大。真正的读路径必须先回答两个问题：

1. 当前这次读到底可见哪些事务结果。
2. 在这些可见结果里，哪一批 `base` 与哪些 `delta` 需要共同参与快照构建。

这也是为什么同一张表“文件很多”并不自动等于“所有文件都对当前查询可见”。真正决定读集合的是事务可见性，而不是目录里物理上存在多少对象。

## `ROW__ID` 为什么是行级变更的锚点

Hive 文档把 `ROW__ID` 定义为虚拟列，并明确说明虚拟列不能被当作普通业务列名复用。更关键的是，流式变更文档说明，存放在 `ROW__ID` 虚拟列里的 `RecordIdentifier` 被 Hive 内部用来唯一标识 ACID 表中的记录。

这条事实决定了更新和删除的真实机制：Hive 不是靠你业务表里的某个主键直接回写原记录，而是靠内部记录标识定位目标行。进一步说，若一个外部过程想对 ACID 表执行 mutation，它必须先读取当前快照，并把自己的业务键和对应记录的 `ROW__ID` 关联起来，之后才能发出真正的更新或删除。

因此，“Hive 更新就是按业务主键覆盖”这种说法并不准确。更接近原理的描述应该是：Hive 先在当前快照里找到目标记录对应的 `ROW__ID`，再以该内部标识为锚点表达行级变更。

## 为什么 mutation 之前必须先读快照

文档把这个边界说得很明确：要对 Hive ACID 表发起 mutation，过程必须先读取一份当前快照，再把领域键和目标记录的 `ROW__ID` 关联起来。这个要求直接说明两件事：

1. Hive ACID 的行级修改不是脱离读路径独立发生的。
2. 更新和删除依赖于先识别“当前可见的是哪条记录”。

所以，对 ACID 表的修改天然带有“先识别可见版本，再表达变更”的两阶段意味。忽略这点，就会把 Hive ACID 错看成典型主键存储系统，而这正是很多理解偏差的源头。

## 写入排序和 bucket 边界为什么也重要

流式 mutation 文档还给出了一条更深的实现边界：记录需要按 `ROW__ID.originalTxn`、再按 `ROW__ID.rowId` 排序；插入记录要求在 `ROW__ID` 中带有计算出来的 `bucketId`；并且建议按分区值和 `ROW__ID.bucketId` 分组。

这些约束说明，Hive ACID 的写入和变更并不是“随便把一堆行送进去就行”，而是受内部记录标识和 bucket 组织方式约束。也就是说，行级语义背后并不是纯逻辑层幻象，而是落在一套明确的物理组织规则上。

## delta 为什么会把读取成本越拉越高

只要新变化持续进入 `delta` 而没有被及时整理，读路径就必须处理更多目录和更多增量片段。最直接的后果有三个：

1. 读取器需要合并更多 `delta`。
2. 更新和删除的判定要跨更多增量结果完成。
3. 快照构建本身会越来越重。

这正是 compaction 存在的根本原因。文档明确说明：

1. minor compaction 会把一组已有 `delta` 文件重写成每个 bucket 一个新的 `delta` 文件。
2. major compaction 会把一个或多个 `delta` 文件和 `base` 文件一起重写成每个 bucket 一个新的 `base` 文件。

因此，compaction 的价值不只是“整理文件”，而是降低快照读取需要合并的层数。尤其要分清 minor 和 major 的效果差异：minor 主要收敛增量层数量，major 才会把稳定层和增量层重新折叠成新的 `base`。

## 并发语义为什么和非事务表不同

对于事务表，Hive 文档指出插入操作总是获取共享锁，因为这些表在存储层实现 MVCC，能够在并发修改存在时提供 Snapshot Isolation。这里最值得抓住的不是锁类型名字本身，而是背后的语义差异：

1. ACID 表允许读者在并发写入时继续获得快照一致视图。
2. 写者不必通过“独占整个表的物理文件”才能完成插入。
3. 并发控制的重点转移到了事务、可见性和后续整理，而不是简单文件覆盖。

这也是 ACID 表和普通非事务表在并发行为上最根本的区别。

## 读慢时应该把证据落到哪里

如果一张 ACID 表变慢，最常见的错误做法是只盯 SQL 本身。更稳的判断顺序通常是：

1. 看目录下是否已经累积了过多 `delta`。
2. 看最近是否缺少 compaction，或者 compaction 只做了 minor 还没有 major。
3. 看这条读路径是否同时需要处理大量更新和删除。
4. 看是否误把业务主键逻辑当成了 Hive 内部记录标识逻辑。

这些观察点都围绕同一个核心问题：当前快照的构建成本到底被什么放大了。对于 ACID 表来说，真正的瓶颈往往不是“单个 SQL 写法有多花哨”，而是“这次读要拼多少层历史变化”。

## 示例

```sql
SELECT ROW__ID, *
FROM ods_orders_acid
LIMIT 5;
```

这个示例的重点不是把 `ROW__ID` 暴露给业务长期使用，而是帮助理解一件事：在 ACID 表内部，行级变更不是无锚点发生的，`ROW__ID` 才是 Hive 用来唯一标识记录并支撑 mutation 的内部对象。

## 本页结论

Hive ACID 快照读的本质，是“稳定数据放在 `base`，增量变化放在 `delta`，读取时再按 `ROW__ID` 和事务可见性合成为当前版本”。理解了这条主线，就能自然解释目录膨胀、读取变慢、compaction 必要性，以及为什么 Hive 的更新删除不是简单主键覆盖。

## 来源与事实边界

### 来源

`hive-transactions-acid`、`hive-hcatalog-streaming-mutation-api`、`hive-virtual-columns`、`hive-docs-home`、`hive-introduction`、`hive-language-manual`、`hive-language-manual-ddl`、`hive-managed-external-tables`

### 事实声明

`hive-claim-0126`、`hive-claim-0127`、`hive-claim-0128`、`hive-claim-0130`、`hive-claim-0131`、`hive-claim-0132`、`hive-claim-0133`、`hive-claim-0134`、`hive-claim-0001`、`hive-claim-0002`
