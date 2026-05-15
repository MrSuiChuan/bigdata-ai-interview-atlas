---
kb_id: bigdata/delta-lake/dml-merge-delete-vectors
title: Delta Lake DML、MERGE 与删除向量
description: 解释 Delta Lake 的 update、delete、merge 如何定位文件、如何借助删除向量降低重写成本，以及什么情况下会冲突或失败。
domain: bigdata
component: delta-lake
topic: dml-merge-delete-vectors
difficulty: advanced
status: reviewed
sidebar_position: 10
version_scope: Delta Lake docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-update
  - delta-lake-deletion-vectors
  - delta-lake-concurrency-control
  - delta-lake-optimizations
  - delta-lake-table-properties
claim_ids:
  - bigdata-delta-claim-0009
  - bigdata-delta-claim-0024
  - bigdata-delta-claim-0025
  - bigdata-delta-claim-0026
  - bigdata-delta-claim-0035
  - bigdata-delta-claim-0042
  - bigdata-delta-claim-0046
tags:
  - delta-lake
  - dml
  - merge
  - deletion-vectors
  - knowledge-base
  - production
---
## DML 题的关键，不是会写 SQL，而是知道它改了哪些文件
Delta Lake 的 `UPDATE`、`DELETE` 和 `MERGE` 看上去像数据库里的行级操作，但底层实现并不是直接原地修改 Parquet 行。真正需要回答的是：这些操作如何定位受影响数据、最终是重写文件还是只记录逻辑删除、何时会与别的写入冲突、哪些表属性会直接禁止 DML。

## 为什么 DML 在湖上比在数据库里更难
因为底层载体是对象存储文件，而不是可原地更新的页结构。Delta 的做法是：

1. 先根据条件定位哪些文件里可能包含目标行。
2. 再决定是重写这些文件，还是使用删除向量只记录哪些行失效。
3. 最后把这次变化提交成一个新的表版本。

所以 DML 本质上仍然是“快照 + 文件动作”的问题，不是数据库内核那种细粒度就地更新。

## `MERGE` 为什么是最典型的综合题
`MERGE` 同时涉及条件匹配、更新、插入、删除、并发冲突和源数据质量。真正答到原理层时，至少要说出下面三件事：

1. `MERGE` 先依据匹配条件定位目标文件和目标行。
2. 它可能生成新增文件、重写文件或删除向量，而不是直接改旧文件内容。
3. 如果多个 source row 匹配到同一个 target row，并且尝试更新该 target row，结果会变得歧义，Delta 会让 merge 失败。

这也是为什么 CDC upsert 里通常要先对源端去重，不能把脏 source 直接扔给 merge。

## 删除向量解决的核心问题是什么
删除向量的价值，不是“功能更高级”，而是把“逻辑删除”从“立刻重写整个 Parquet 文件”里拆出来。启用 deletion vectors 后，Delta 可以先记录某些行被删除，而不马上重写底层文件。这对频繁行级变更场景很重要，因为它能显著减少即时重写成本。

但它的代价同样明确：

- 需要兼容的协议和读写客户端。
- 只是逻辑删除，不等于空间立刻回收。
- 后续仍要通过 `OPTIMIZE`、`REORG TABLE ... APPLY PURGE` 或其他重写动作把逻辑删除真正物理化。

### 删除向量把什么从写时移动到了维护时
启用 deletion vectors 后，系统并不是“免费完成了删除”，而是把原本写入时就要承担的一部分文件重写成本，延后到了后续维护阶段。写入或 merge 在前台看起来会更轻，但布局整理、空间回收和历史文件净化的压力会在后续逐步显现。

这意味着 DV 不是单点功能，而是会联动维护策略、客户端兼容和存储预算的长期设计选择。只有把“写时更轻”和“后续维护更重”一起看，才能准确判断它是不是适合当前表。

## 什么时候还会回到文件重写
Deletion vectors 并没有让文件重写消失，它只是把重写延后了。以下场景仍会把逻辑删除落实成物理文件变化：

1. `OPTIMIZE` 这类布局维护把小文件或带 DV 的文件重新组织。
2. `REORG TABLE ... APPLY PURGE` 主动把逻辑删除落实为物理清理。
3. 某些 DML 操作在当前配置或客户端能力下仍需要重写文件。

所以回答“启用 DV 后是不是永远不重写文件”时，正确答案应当是否定的。

## append-only 表会直接改变 DML 边界
如果表设置了 `delta.appendOnly=true`，那它就不是“支持一部分 DML”的弱限制，而是直接禁止更新和删除现有行。这条边界很适合在设计题里使用，因为它说明：

- 有些表从建模上就不应该承担回写和修正职责。
- 如果后来业务需要 upsert，就要重新评估表属性和消费链路。
- append-only 不只是性能偏好，而是语义约束。

## `OPTIMIZE` 与 DML 的关系别答反了
很多人会把 `OPTIMIZE` 说成“也算一种数据变更”。更准确的说法是：compaction 类 `OPTIMIZE` 主要是布局重写，官方文档明确说明它是幂等的，使用 `dataChange=false`，并且由于 Delta 采用快照隔离，不会改变查询结果，也不会让流式读者把它当成新业务数据。

这也正是 `dataChange=false` 的正确使用场景：只改变文件布局，不改变业务语义。

## 一个最小可复核的 MERGE 示例
~~~sql
MERGE INTO delta.`/data/delta/orders` AS t
USING staged_updates AS s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
~~~

真正要关注的不是 SQL 语法，而是：`staged_updates` 是否已经按主键去重；这次 merge 会触碰多少历史文件；是否与其他更新或维护作业重叠；目标表是否启用了 deletion vectors 或 append-only 属性。

## 证据面应该怎么看
1. `DESCRIBE HISTORY`：看最近是否发生了 `MERGE`、`DELETE`、`UPDATE` 或 `OPTIMIZE`。
2. `_delta_log`：看这次提交到底是 `add/remove` 还是伴随了协议变更。
3. 表属性和 feature：看是否启用了 deletion vectors、append-only 或其他影响 DML 的能力。
4. 查询/作业日志：看 merge 失败到底是冲突、歧义匹配，还是下游不兼容。

### `MERGE` 冲突为什么要和快照隔离一起理解
`MERGE` 的难点不只是语法复杂，而是它天然站在“读旧快照、生成新版本、提交时再校验冲突”的事务模型上。也正因为如此，冲突判断不能只看 SQL 文本是否正确，还要看在本次作业运行期间，目标表涉及的文件或行范围有没有被别人改动。把 `MERGE` 放回快照隔离模型里看，很多失败现象才会变得可解释。

## 本页结论
Delta 的 DML 不是“像数据库一样改行”，而是“围绕快照做文件级或逻辑行级变更”。真正深入的回答，应该能讲清 merge 为什么会因 source 歧义失败、删除向量如何推迟物理重写、append-only 为什么直接改变 DML 边界，以及 `OPTIMIZE` 为什么不应被误当成业务数据变更。

## 来源与事实边界
本页以 Delta Update、Deletion Vectors、Concurrency Control、Optimizations 和表属性文档为边界。具体 SQL 扩展语法会受运行时环境影响，但 DML 的文件级实现和协议边界不应变化。
