---
kb_id: bigdata/clickhouse/updates-deletes-and-transactions
title: ClickHouse 更新、删除与事务边界
description: 专门展开 lightweight UPDATE、lightweight DELETE、mutation 重写与官方 ACID case matrix 的适用边界。
domain: bigdata
component: clickhouse
topic: updates-deletes-and-transactions
difficulty: advanced
status: reviewed
sidebar_position: 10
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-update-statement-doc
  - clickhouse-delete-statement-doc
  - clickhouse-avoid-mutations-doc
  - clickhouse-transactional-doc
  - clickhouse-partitioning-key-doc
claim_ids:
  - clickhouse-claim-0035
  - clickhouse-claim-0036
  - clickhouse-claim-0037
  - clickhouse-claim-0038
  - clickhouse-claim-0050
tags:
  - bigdata
  - clickhouse
  - update
  - delete
  - transaction
  - knowledge-base
---
## 回答 ClickHouse 更新删除，先摆正前提：它不是为高频行级改写而设计
ClickHouse 官方给出 lightweight update、lightweight delete、mutation、ReplacingMergeTree 等多种更新修正路径，但这不代表它的推荐模型变成了 OLTP。相反，官方 best practice 依然强调：mutation 会重写 part，代价高、持续时间长、不可随意滥用，应尽量优先考虑引擎级替代方案或批量化修正策略。

## DELETE FROM 和 ALTER TABLE ... DELETE 的区别必须说清楚
`DELETE FROM` 是 lightweight delete。官方文档说明，它本质上通过 mutation 写入删除 mask，让后续查询把这些行视为已删除，但物理删除通常要等后续 merge 才真正完成。

`ALTER TABLE ... DELETE` 则是更重的重写路径，会重建受影响 part。它的优势是物理删除更直接，缺点是资源消耗更高、影响面更大。

所以“删除后磁盘为什么没立刻下降”这个问题，最本质的回答不是缓存，而是 lightweight delete 的逻辑可见性与物理回收是两个时点。

## Lightweight UPDATE 的本质是 patch parts，不是原地改列文件
官方 UPDATE 文档把 lightweight update 描述成 patch part 机制：只记录被修改的列和值，并让查询在读取时应用这些 patch。这样做的好处是更新延迟更接近一次 `INSERT ... SELECT`，不必像传统 mutation 那样整块重写所有相关列；代价是查询要承担 patch 合并开销，而且某些优化能力会受影响。

尤其要记住这几个限制：
- 不能更新主键或分区键参与列。
- 有 patch part 时，projection 和 skipping index 可能不能像平时一样生效。
- 高频小更新同样可能制造过多 part 或 patch part。
- 适合更新少量行，不适合大比例全表改写。

## 为什么官方仍然建议“尽量避免 mutation”
best practice 文档给出的原因非常明确：mutation 会重写 part，任务有全局顺序，可能在长时间内持续消耗 CPU、磁盘和内存；它不会阻塞新 insert，但会与在线查询、merge、复制争抢资源。对大表做频繁 mutation，本质上是在反着使用 ClickHouse 的存储模型。

## 更好的思路通常有三类
第一类，业务修正建模。比如用 ReplacingMergeTree、CollapsingMergeTree、VersionedCollapsingMergeTree，把“改一行”转成“追加新状态并在查询或 merge 时归并”。

第二类，生命周期建模。高频整批删除的数据，优先靠合理分区和 `DROP PARTITION`、TTL 去管理，而不是对海量 part 做逐行 delete。

第三类，预计算建模。某些复杂修正结果更适合通过物化视图、重算表、回灌或 refreshable MV 生成，不一定非要在原表上执行 update/delete。

## 事务边界要按官方 case matrix 回答
当问题从“如何删除”转向“删除和更新的可见性、一致性怎么保证”，就要回到官方 ACID 文档：单表 MergeTree insert、Distributed 表 insert、Buffer 表、`async_insert` 的 return mode，都有不同边界。不要因为 ClickHouse 有实验性事务特性，就把日常语义说成“默认完整多表事务”。

## 最小样例：三种路径分别在干什么
~~~sql
DELETE FROM orders_local WHERE dt < toDate('2025-01-01');

UPDATE orders_local
SET status = 'closed'
WHERE order_id IN (101, 102, 103);

ALTER TABLE orders_local DROP PARTITION 202401;
~~~

第一条是逻辑删除并等待后续 merge 物理回收；第二条是 patch part 更新少量行；第三条是按分区快速删除，最符合 ClickHouse 的管理模型。真正生产里该选哪个，取决于删除范围、更新频率、查询压力和你是否能接受数据回收不是立刻发生。

真正成熟的更新删除设计，通常并不是把所有修正都堆到原表上完成，而是优先选择最符合 ClickHouse 追加写和生命周期治理方向的那条路径。只要这一前提摆正，很多关于 mutation、事务和回收时点的问题都会自然清楚。
