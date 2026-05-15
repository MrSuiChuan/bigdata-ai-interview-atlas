---
kb_id: bigdata/iceberg/format-version-delete-vectors-and-sequence-number-inheritance
title: Iceberg Spec Versioning
description: 解释 Iceberg Spec Versioning的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: iceberg
topic: spec-versioning
difficulty: expert
status: reviewed
sidebar_position: 15
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
  - iceberg-claim-0083
  - iceberg-claim-0084
  - iceberg-claim-0085
  - iceberg-claim-0086
  - iceberg-claim-0087
  - iceberg-claim-0088
  - iceberg-claim-0089
  - iceberg-claim-0090
  - iceberg-claim-0091
  - iceberg-claim-0092
tags:
  - iceberg
  - spec
  - delete-vector
  - sequence-number
  - knowledge-base
  - production
---
## 先把这页的主线说清楚：版本能力决定了表格式能表达什么
Iceberg 的 format version 不是装饰字段，而是能力边界。不同版本能表达的删除语义、行级变更方式以及 metadata 复用策略并不相同。如果不先弄清 v2 和 v3 的边界，就很容易把“某个特性在某些表上可用”误讲成“所有 Iceberg 表天生都支持”。

## 为什么说 v2 是行级更新和删除真正进入表格式的起点
Iceberg 规范中，format version 2 增加了对 immutable data files 上行级更新和删除的支持，而它依赖的核心载体就是 delete files。也就是说，v2 不是简单地多了几条 SQL，而是表格式本身开始拥有表达行级变更的标准方式。

在这个版本里，position delete 与 equality delete 成为关键语义对象。前者通过文件路径和从 0 开始的行位置标识删除目标，后者通过一个或多个列值来标识删除目标，并且这些列是按 field ID 记录的。

## equality delete 不是“任意列都能随便选”
规范对 equality delete 列也给出了边界：这些列遵循与 identifier fields 类似的限制，只是允许 optional columns 以及嵌套在 optional struct 下的列。这里要抓住的不是细枝末节，而是一个更重要的事实：equality delete 并不是随手写个 where 条件就完事，它在表格式层有明确、受约束的列语义。

这说明 Iceberg 的删除能力并不是“SQL 看起来支持”，而是格式层对删除载体、删除列身份以及删除解释方式都有正式规定。

## v3 为什么又引入 deletion vectors
到了 format version 3，Iceberg 又引入了 deletion vectors，并明确说明 deletion vectors 不受 v2 及更早版本支持。这意味着 deletion vectors 不是 position delete 的别名，而是新的删除表达能力。

更进一步，规范还规定：v3 表不允许再新增新的 position delete files，但升级前已经存在的 position deletes 仍然有效。这个边界非常关键，因为它说明升级到 v3 不是把历史删除语义全部抹平重来，而是在保留历史有效性的同时，限制未来写入继续沿用旧的新增 position delete 方式。

## 一个数据文件在一个 snapshot 中为什么最多只能有一个 deletion vector
Iceberg 规定，在一个 snapshot 中，一个 data file 至多只能对应一个 deletion vector。如果新的删除动作还要继续作用到同一个 data file，writer 就必须把新的 deletion vector 与已有 deletion vector 或已有 position deletes 合并后再提交。

这条规则的核心意义是：删除状态不能无限碎片化漂浮在外面，而必须在提交时收敛成可确定解释的单一结果。否则 reader 面对同一 data file 时，就会在“到底该叠多少层删除补丁”上付出额外复杂度。

## sequence number inheritance 为什么和重试效率直接相关
Iceberg 里，新写入的数据和元数据文件条目最初会以 null sequence number 写出，真正读取时再从 manifest metadata 继承 sequence number。这个设计的好处，是让 manifest 自身能够在提交成功前保持更稳定、更可复用的状态。

当一个已有条目被写入新的 manifest 时，继承得到的 sequence number 会被显式写下来，避免它在第一次继承之后继续变化。这条规则看起来偏实现细节，但价值很高：它让 sequence number 的解释在重试与重组 manifest 过程中保持稳定。

## 为什么说 sequence-number inheritance 是 commit retry 的工程基础
规范明确指出，sequence-number inheritance 使得新写出的 manifest 可以在 commit retry 场景下继续复用，因此重试时通常只需要重写 manifest list，而不必把前面已经生成的 manifest 全部重新做一遍。

这条能力和 Iceberg 的乐观并发模型天然配套：既然并发提交冲突不可避免，那格式层就必须尽量降低“重试一次就重造整套元数据”的代价。sequence-number inheritance 恰恰就是降低这类代价的关键机制之一。

## 读这页时应该形成哪些边界感
这页最容易被答成一堆零散术语。更好的整理方式是：

1. v2 让 delete files 成为正式行级变更载体。
2. v3 再引入 deletion vectors，并限制未来继续新增 position deletes。
3. sequence number inheritance 负责让 metadata 在重试和复用时仍然保持稳定语义。

把这三点串起来，你看到的就不是“版本号差异清单”，而是一条表格式能力逐步增强、同时兼顾历史兼容与工程复用的演进主线。


### 读版本能力时不要忽略兼容边界
这一页最容易被记成“v2 有 delete，v3 有 deletion vector”，但真正影响系统设计的是兼容边界。比如老表升级到更高 format version 后，历史 snapshot 与历史 delete 语义并不会凭空消失；与此同时，新的写入路径又要开始遵守更新后的格式限制。也就是说，版本升级不是把旧世界抹掉重来，而是在保持历史可读的前提下，限制未来提交应如何写出新的元数据和删除载体。

因此，版本问题要同时从两个方向看：一个是 reader 还能不能解释历史文件，另一个是 writer 还能不能继续沿用旧写法。

