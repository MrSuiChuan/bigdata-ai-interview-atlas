---
kb_id: bigdata/iceberg/row-level-changes-and-delete-files
title: Iceberg 行级变更与 Delete File
description: 解释 Iceberg 行级变更与 Delete File如何发现故障、隔离影响、重建状态和恢复服务，并说明生产验证与风险边界。
domain: bigdata
component: iceberg
topic: row-level-operations
difficulty: advanced
status: reviewed
sidebar_position: 7
version_scope: Iceberg latest docs and spec as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - iceberg-spec
  - iceberg-spark-writes
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
  - iceberg-reliability
claim_ids:
  - iceberg-claim-0027
  - iceberg-claim-0028
  - iceberg-claim-0029
  - iceberg-claim-0031
  - iceberg-claim-0032
  - iceberg-claim-0033
  - iceberg-claim-0001
  - iceberg-claim-0002
  - iceberg-claim-0003
  - iceberg-claim-0004
tags:
  - iceberg
  - row-level-delete
  - merge
  - delete-file
  - knowledge-base
  - production
---
## Iceberg 的行级变更不是引擎小技巧，而是表格式能力
很多人第一次看到 Iceberg 支持 `DELETE`、`UPDATE`、`MERGE INTO`，会下意识把它理解成“Spark 做了点聪明改写”。这种理解太浅。更准确的说法是：delete file 是 Iceberg 表格式中的一等内容文件，和 data file 一样被 manifests 和 snapshots 跟踪。也就是说，行级删除语义不是执行引擎临时拼出来的，而是已经进入了表版本模型。

这点非常重要。因为只有当删除本身也是 metadata 可追踪对象时，时间旅行、并发提交、版本回滚和多引擎共享表才不会在删除语义面前失真。

## position delete 和 equality delete 分别删除什么
Iceberg 里最常见的两类 delete file 是 position delete 和 equality delete。它们的差别不在名字，而在定位被删行的方式。

| 删除类型 | 如何定位被删行 | 适合理解成什么 |
| --- | --- | --- |
| Position Delete | 通过数据文件路径 + 文件内行位置识别被删行 | “这个文件里的第 N 行不要了” |
| Equality Delete | 通过一个或多个 field ID 及其编码值识别被删行 | “满足这些键值条件的行不要了” |

Position delete 的关键在于它绑定到具体 data file 与具体 row position；equality delete 的关键在于它依据 field ID 和对应列值表达删除条件。两者都不是抽象 SQL 条件，而是已经落到表格式层、可被 snapshot 跟踪的删除载体。

## delete file 为什么必须被当成一等文件管理
Iceberg 明确把 delete file 当成一等 content file，对待方式与 data file 同级：它们会进入 manifest，会被 snapshot 引用，也会参与版本可见性管理。这样做的原因非常直接：如果删除语义只是某个引擎的额外旁路状态，那时间旅行和多引擎读取时就很容易出现“数据文件能看到，删除却看不到”的割裂。

把 delete file 正式放进元数据树之后，读者读取某个 snapshot 时，就能同时看到这个版本下的 data files 和 delete files，再按照表格式规则合并解释。这才是行级删除在共享表世界里可长期成立的前提。

## Spark 里的 DML 为什么本质上还是在改文件集合
Iceberg 在 Spark 中支持 `INSERT INTO`、`INSERT OVERWRITE`、`DELETE FROM`、`UPDATE` 和 `MERGE INTO`。这些 SQL 看起来像数据库 DML，但落到 Iceberg 表格式上，本质仍然是在改“当前 snapshot 应该引用哪些 data file 与 delete file”。

因此，理解 DML 的重点不是背 SQL 名字，而是判断这次操作最终会变成什么类型的文件变化：

- 是只追加新的 data file。
- 是生成 delete file。
- 是重写受影响的数据文件。
- 还是在极少数情况下只做 metadata 级别的分区删除。

## 为什么 MERGE INTO 通常比 INSERT OVERWRITE 更稳妥
Iceberg 官方写法明确更推荐在 Spark 中使用 `MERGE INTO`，而不是把很多增量更新场景粗暴改写成 `INSERT OVERWRITE`。原因在于 `MERGE INTO` 只需要重写受影响的数据文件，而 overwrite 在分区布局演进之后，语义更容易出现超出预期的影响范围。

这条建议背后的原理是：当表已经发生 partition evolution 时，你脑中的“这次 overwrite 会覆盖哪些数据”未必再与底层真实布局完全一致；而 `MERGE INTO` 的重写边界更靠近受影响文件本身，因此通常更可控。

## DELETE FROM 什么时候可以只改 metadata，什么时候必须重写文件
在 Spark 集成里，如果 `DELETE FROM` 的过滤条件恰好匹配整个分区，那么 Iceberg 可以把它做成 metadata-only delete；如果条件只是命中了分区里的部分行，Iceberg 就需要重写受影响的数据文件，或者借助 delete file 来表达行级删除语义。

这条规则很值得单独记住，因为它解释了为什么看起来都是 `DELETE`，执行成本却可能完全不同。区别不在 SQL 写法本身，而在过滤条件是否刚好落在完整分区边界上。

## 一个最小 SQL 观察样例
下面这组语句适合用来帮助理解不同 DML 最终可能对应的文件变化范围：

```sql
MERGE INTO prod.db.orders t
USING prod.db.orders_delta s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET amount = s.amount
WHEN NOT MATCHED THEN INSERT *;

DELETE FROM prod.db.orders
WHERE dt = DATE '2026-01-01';
```

第一条语句强调的是“只重写受影响文件”的思路；第二条语句则适合用来讨论“如果条件恰好命中整分区，能否退化为 metadata-only delete”。

## 排障时不要只盯着 SQL，要追到 snapshot 和 manifests
一旦出现“删了还查得到”“MERGE 代价异常大”“不同引擎对删除结果理解不一致”这类问题，建议不要停留在 SQL 层，而要继续追：

1. 当前 snapshot 是否已经包含新的 delete file 或重写后的 data file。
2. 相关 manifests 中记录的是 data content 还是 delete content。
3. 这次删除是否本应是整分区 metadata-only，却因为过滤条件不完整而退化成了文件重写。
4. 当前业务场景到底更适合 MERGE、DELETE 还是 overwrite。

只要把行级变更理解成“版本化文件集合变化”，而不是“数据库行锁语义照搬到数据湖”，这类问题就会清楚很多。


### 读这一页时最该先分清的边界
行级变更问题里，最容易混淆的是“SQL 语义层发生了什么”和“表格式层最终记录了什么”。更稳的顺序是：先看这次变更最终是 metadata-only delete、delete file，还是受影响文件重写；再看这些变化是否已经进入当前 snapshot；最后才回头解释为什么用户在 SQL 层看到的是 delete、update 或 merge。

只要顺序倒过来，很多问题就会被误答成“SQL 执行慢”而不是“文件级变更边界不一样”。

