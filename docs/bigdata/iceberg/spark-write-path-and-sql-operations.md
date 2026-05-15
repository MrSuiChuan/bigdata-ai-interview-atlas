---
kb_id: bigdata/iceberg/spark-write-path-and-sql-operations
title: Iceberg Spark 写入与 SQL 操作
description: 解释 Iceberg Spark 写入与 SQL 操作如何接收写入、更新状态、完成提交和暴露结果，并说明失败恢复与幂等边界。
domain: bigdata
component: iceberg
topic: spark-integration
difficulty: advanced
status: reviewed
sidebar_position: 10
version_scope: Iceberg latest docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - iceberg-spark-writes
  - iceberg-branching-and-tagging
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
  - iceberg-reliability
claim_ids:
  - iceberg-claim-0030
  - iceberg-claim-0031
  - iceberg-claim-0032
  - iceberg-claim-0033
  - iceberg-claim-0034
  - iceberg-claim-0001
  - iceberg-claim-0002
  - iceberg-claim-0003
  - iceberg-claim-0004
  - iceberg-claim-0005
tags:
  - iceberg
  - spark
  - merge-into
  - ds-v2
  - knowledge-base
  - production
---
## Spark 写 Iceberg 时，入口不是老式数据源拼接，而是 DataSource V2
Iceberg 在 Spark 中的写入集成建立在 DataSource V2 之上。这个事实非常关键，因为它说明 Iceberg 不是在旧式文件输出接口上打补丁，而是通过 Spark 新一代数据源写入与 SQL 命令通道，把表格式语义正式接到 Spark 的执行体系里。

更直接地说，Spark 不是“顺手写几个文件到某个目录”，而是在执行 SQL 命令和 DataFrame 写入时，把结果交给 Iceberg 的表格式实现去生成 data files、delete files 和新的 metadata 状态。理解了这一点，后面的 DML 语义才会站得住。

## Spark 在 Iceberg 上支持哪些核心写操作
根据官方文档，Spark SQL 对 Iceberg 支持的核心操作包括 `INSERT INTO`、`INSERT OVERWRITE`、`DELETE FROM`、`UPDATE` 和 `MERGE INTO`。这些操作表面上看像传统数据库 DML，但真正落地时，核心仍是“生成哪些新文件、废弃哪些旧文件、最后把哪份 metadata 发布成当前 snapshot”。

这意味着：不要把 Iceberg 上的 Spark SQL 简单理解成“数据库行存操作语义原样搬过来”。更好的理解是，Spark 提供了熟悉的 SQL 外壳，Iceberg 则在表格式层保证这些动作最终如何变成版本化文件集合变更。

## 为什么 MERGE、DELETE、UPDATE 的成本差异可能很大
虽然这些操作都属于 DML，但它们在物理层的表现并不一样。比如 `DELETE FROM` 如果过滤条件刚好命中整个分区，就可能退化成 metadata-only delete；如果只命中分区中的部分行，则需要重写受影响的数据文件，或者借助 delete file 表达行级删除。

这说明 Spark SQL 是否“看起来只删了一点点”，与 Iceberg 最终要付出的文件改写成本，并不一定成正比。真正决定成本的，是这次操作在表格式层能否收敛成更粗粒度的 metadata 变更，还是必须深入到文件级重写。

## 为什么官方更推荐 MERGE INTO 而不是拿 OVERWRITE 代替增量更新
Iceberg 官方文档明确建议，在 Spark 中优先使用 `MERGE INTO`，而不是把很多更新类场景粗暴改造成 `INSERT OVERWRITE`。原因在于 `MERGE INTO` 会重写受影响的数据文件，而 overwrite 在 partition evolution 之后，覆盖边界更容易与业务直觉不一致。

也就是说，`MERGE INTO` 的价值不仅是语法更贴近 upsert，更重要的是它把改写范围收敛到“真正受影响的文件”，而不是把一个可能已经多代演进的表布局粗暴地当成静态分区表来覆盖。

## Spark 写 branch 时要怎样理解入口
Spark 向 Iceberg branch 写入有两种常见入口：一种是直接使用 branch-qualified table name，另一种是设置 `spark.wap.branch`。但这两种方式背后的前提一致：目标 branch 必须已经存在。

这说明 branch 不是 Spark 在写入时顺手虚构出来的名字，而是 Iceberg metadata 里正式存在的命名引用。你真正写入的是“同一张表的某条引用线”，而不是“某个临时目录副本”。

## 一个最小 SQL 观察样例
下面这组语句很适合帮助你把 Spark SQL 写法和 Iceberg 表格式后果对应起来：

```sql
INSERT INTO prod.db.orders
SELECT * FROM staging.db.orders_delta;

DELETE FROM prod.db.orders
WHERE dt = DATE '2026-01-01';

MERGE INTO prod.db.orders t
USING staging.db.orders_delta s
ON t.order_id = s.order_id
WHEN MATCHED THEN UPDATE SET amount = s.amount
WHEN NOT MATCHED THEN INSERT *;
```

读这些语句时，不要只停留在 SQL 语法层。更值得继续展开的是：这次动作最终会新增哪些 data files、产生哪些 delete files、重写哪些旧文件，以及新 metadata 何时成为当前 snapshot。

## Spark 集成页真正该建立的心智模型
如果用一句更系统的话收束这一页，可以这样理解：Spark 负责把 SQL 和 DataFrame 写入动作提交到 DataSource V2 通道，Iceberg 负责把这些动作翻译成有版本边界的表状态变化。

所以排查 Spark + Iceberg 问题时，既不能只看 Spark 计划，也不能只看表格式对象，而要把两边串起来：Spark 这次发起了什么写操作，Iceberg 又把它落成了怎样的 snapshot 变化。


### 为什么这一页要和文件布局页一起看
如果只看这页，很容易把 Spark 集成理解成“支持哪些 SQL”；如果只看文件布局页，又容易忽略入口其实是 DataSource V2。更完整的理解是：Spark 提供入口与执行通道，Iceberg 决定最终把这次写操作落成什么样的文件集合和 snapshot 变化。也正因为如此，诊断问题时既要看 Spark 发起了什么动作，也要看 Iceberg 最终发布了什么 metadata 状态。

