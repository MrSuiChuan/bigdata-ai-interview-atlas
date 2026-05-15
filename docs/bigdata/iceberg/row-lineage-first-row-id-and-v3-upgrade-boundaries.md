---
kb_id: bigdata/iceberg/row-lineage-first-row-id-and-v3-upgrade-boundaries
title: Iceberg Row Lineage
description: 解释 Iceberg Row Lineage的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: iceberg
topic: row-lineage
difficulty: expert
status: reviewed
sidebar_position: 18
version_scope: Iceberg table spec as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - iceberg-spec
  - iceberg-docs-home
  - iceberg-reliability
  - iceberg-maintenance
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
claim_ids:
  - iceberg-claim-0115
  - iceberg-claim-0116
  - iceberg-claim-0117
  - iceberg-claim-0118
  - iceberg-claim-0119
  - iceberg-claim-0120
  - iceberg-claim-0001
  - iceberg-claim-0002
  - iceberg-claim-0003
  - iceberg-claim-0004
tags:
  - iceberg
  - v3
  - row-lineage
  - next-row-id
  - knowledge-base
  - production
---
## Row Lineage 解决的是“新行身份如何在表级被长期追踪”问题
到了 format version 3 及以后，Iceberg 要求表为所有新创建的行跟踪 row lineage。这里的关键不是“又多了几个隐藏列”，而是表格式开始正式维护“这行数据在表生命周期中的身份痕迹”。

如果没有 row lineage，很多更细粒度的变更解释都会停留在“这批文件变了”，而难以进一步回答“新写入的这些行在表级语义上是谁、后来又被谁更新过”。因此，row lineage 的本质是把行身份从纯执行期概念，提升为表版本可以持续理解的对象。

## v3+ 至少要维护哪几类核心字段
规范要求，在支持 row lineage 的 v3+ 表中，至少要维护三类核心状态：

| 状态 | 作用 | 需要怎么理解 |
| --- | --- | --- |
| `next-row-id` | 表级下一个可分配 row id 起点 | 它决定新行身份如何连续分配 |
| `_row_id` | 每行唯一身份 | 行被写入表后，应该能区分“这是一条新的行身份” |
| `_last_updated_sequence_number` | 记录这行最后一次更新关联的 sequence | 让后续变更解释与版本推进关联起来 |

因此，row lineage 不是附着在某个文件上的局部技巧，而是表级字段、行级字段和 sequence 语义共同参与的一套规则。

## 为什么这些值要靠 inheritance 分配
规范指出，row lineage 相关值通过 inheritance 分配，一个核心原因是：commit sequence number 与 starting row ID 在 snapshot commit 成功之前并不知道最终结果。也就是说，writer 在准备阶段能先把文件写出来，但还不能武断地把最终行身份全部拍死。

只有等提交成功、版本真正成立之后，这些与最终提交顺序相关的值才能被稳定解释。这与 Iceberg 整体的“先准备、后发布”思路是一致的：真正决定语义落点的，是提交成功后的表状态，而不是执行任务某一时刻的临时看法。

## 为什么新行文件可以暂时不显式写出这些列
对于只包含新行的数据文件，规范允许省略 `_row_id` 和 `_last_updated_sequence_number` 两列；读取方应把缺失值视作 null，再按 inheritance 规则补上正确解释。

这条规则的价值在于，它把“文件写出时的物理表示”与“提交成功后的最终行身份解释”拆开了。这样 writer 不必在提交前就强行写死所有最终值，reader 也不会因为列暂时缺失就失去正确解释路径。

## 升级到 v3 时，历史数据会不会自动拥有 row lineage
不会。规范明确规定，表升级到 format v3 时，`next-row-id` 会初始化为 0，但已有 snapshots 不会被修改，升级前快照里的行在读取时 row ID 为 null。

这意味着 row lineage 不是一次升级就能把历史所有数据补全的魔法能力，而是从升级后的新写入开始逐步建立的身份体系。这个边界必须讲清楚，否则很容易把“支持 row lineage”误说成“历史全量数据都立刻具备稳定行身份”。

## 为什么 equality delete 形式的更新不会保留原始行身份
规范还强调了一条很容易被忽略的边界：如果更新是通过 equality delete 的方式实现，那么 row lineage 不会保留原始行身份；这类更新会被视为“删掉旧行，再加入一条具有唯一新身份的新行”。

这个结论很重要，因为它告诉你：在 Iceberg 的表语义里，并不是所有“业务上看起来像更新”的动作，都会被当成“同一行延续了原始身份”。有些更新在表格式层就是旧行终止、新行诞生。

## 这一页真正要建立的判断框架
读完 row lineage 这一页之后，最好形成下面的稳定判断：

1. row lineage 是 v3+ 的表级能力，不是所有版本都天然有。
2. 它依赖 `next-row-id`、`_row_id` 与 `_last_updated_sequence_number` 等对象共同成立。
3. 它的值之所以要延迟继承，是因为最终提交顺序在 commit 成功前并不稳定。
4. 升级到 v3 不会给历史快照补造行身份，历史行可能仍然读取为 null row IDs。
5. 某些更新语义在表格式层会被解释为“旧行删除 + 新行创建”，而不是原身份延续。

只要把这五点串起来，row lineage 就不再像一个孤立的高级术语，而会变成 Iceberg v3 能力边界中非常清楚的一块。
