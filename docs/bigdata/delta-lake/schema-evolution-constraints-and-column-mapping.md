---
kb_id: bigdata/delta-lake/schema-evolution-constraints-and-column-mapping
title: Delta Lake Schema 演进、约束与列映射
description: 解释 Delta Lake 默认的 schema 校验规则、演进路径、约束、默认值、生成列、身份列和列映射边界。
domain: bigdata
component: delta-lake
topic: schema-evolution-constraints-and-column-mapping
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: Delta Lake docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-batch
  - delta-lake-constraints
  - delta-lake-column-mapping
  - delta-lake-default-columns
  - delta-lake-versioning
claim_ids:
  - bigdata-delta-claim-0019
  - bigdata-delta-claim-0022
  - bigdata-delta-claim-0023
  - bigdata-delta-claim-0032
  - bigdata-delta-claim-0033
  - bigdata-delta-claim-0034
  - bigdata-delta-claim-0044
  - bigdata-delta-claim-0045
  - bigdata-delta-claim-0047
tags:
  - delta-lake
  - schema
  - constraints
  - column-mapping
  - knowledge-base
  - production
---
## Schema 能力如果只概括成“支持演进”，几乎一定不够
Delta Lake 的 Schema 相关讨论之所以容易停留在表面，是因为很多说明只会说“支持 schema evolution”。但真正重要的是四条边界：默认如何校验、什么时候允许演进、哪些约束会在写入时拦截数据、列身份变更是否会改变协议和下游兼容性。

## 默认先做 schema enforcement，再谈 evolution
Delta 的默认行为不是“来什么字段都接着”，而是先检查写入数据是否与目标表兼容。官方 batch 文档给出的高价值规则包括：

- 写入数据里多出来、目标表没有的列，会抛出异常。
- 写入数据里缺少目标表的列，会写成 `null`。
- 数据类型必须匹配。
- 列名不能只靠大小写区分。

这条规则很关键，因为它说明 Delta 的第一原则是保护表语义，不是无条件接纳所有上游变化。

## 演进要区分“显式 DDL”和“写时自动演进”
在工程实践里，Schema 演进通常有两条路：

1. 显式变更：先通过 DDL 把表定义改好，再让上游按新 Schema 写入。
2. 写时演进：在受控场景下允许写入侧带着新列推进表 Schema。

这两条路的取舍关键不在“哪种更方便”，而在“谁对 Schema 变化负责、谁来承担下游影响”。生产环境里，如果团队没有稳定的兼容评审和流作业回放机制，显式 DDL 往往更稳。

下面是最常见的写时演进写法：

~~~python
(
    df.write.format("delta")
    .mode("append")
    .option("mergeSchema", "true")
    .save("/data/delta/orders")
)
~~~

## Schema 改变会直接影响长跑中的流作业
这一点非常容易被忽略。官方文档明确给出边界：当 Delta 表的 Schema 被更新时，读取这张表的流会终止，需要重启后才能继续。这意味着 Schema 演进绝不是“只改表，不影响流式消费者”的轻量动作。

所以，只要表背后挂着 streaming reader，就必须把 Schema 变更当成一次发布事件来治理，而不是随手加列。

## 约束是写入期的数据质量闸门
Delta 支持 `CHECK` 和 `NOT NULL` 约束，违反时会抛出 `InvariantViolationException`。这说明数据质量不一定非要完全靠下游校验或离线巡检，Delta 自身就可以在写入边界拦下一类明显错误的数据。

例如：

~~~sql
ALTER TABLE delta.`/data/delta/orders`
ADD CONSTRAINT positive_amount CHECK (amount >= 0);
~~~

这类约束的价值不在“SQL 会不会写”，而在它把错误尽可能前移到了表提交之前。

## Column Mapping 解决的不是“列名改一下”这么简单
Column mapping 的高价值点，是支持 rename / drop 列而不重写底层 Parquet 文件，同时允许列名里出现更多特殊字符。但它带来的代价同样明显：

1. 会升级表协议，并要求至少 reader version 2、writer version 5。
2. 启用后不能关闭。
3. 会影响依赖列身份稳定性的下游系统。
4. 在 column-mapped 表上做非新增型 Schema 变化时，Structured Streaming 读取需要额外的 schema tracking 支持。
5. 某些 CDF 场景也会受影响，不能把它当成完全透明升级。

所以 column mapping 不是“优化一下元数据”，而是一次兼容性工程变更。

## 默认值、生成列和身份列的边界完全不同
### 默认列值
默认值需要启用 `allowColumnDefaults` writer feature。它的价值是让写入侧可以省略某些列，由表端补默认值；它的风险是协议升级不可逆。

### 生成列
生成列本质上仍然作为普通列存储，但显式写入时必须满足生成表达式。对于分区裁剪来说，生成列还有一个很实用的价值：如果分区列是从业务列推导出来的，优化器有机会从业务谓词导出分区过滤条件。

### 身份列
身份列的限制比很多人预期更强：它会禁用并发事务，不能做分区列，也不能原地更新。这意味着身份列不是随手拿来替代数据库自增主键的简单选择，而是会反过来影响整张表的并发设计。

## 最小观察与排障入口
1. 先看 `DESCRIBE DETAIL` 和 `SHOW TBLPROPERTIES`，确认表当前协议和 feature。
2. 再看最近的 Schema 变更是不是和流作业终止时间点对齐。
3. 如果写入报错，先判断是 Schema enforcement、约束失败，还是 column mapping / protocol 不兼容。

## 本页结论
Delta Lake 的 Schema 相关能力，不应被概括成一句“支持演进”。真正深入的回答，应该同时说清默认校验规则、Schema 演进路径、约束的前移价值、column mapping 的兼容性代价，以及默认值、生成列、身份列分别会怎样改变写入与并发边界。

## 来源与事实边界
本页以 Delta Batch、Constraints、Column Mapping、Default Columns 和 Versioning 文档为边界。具体 DDL 语法会随运行时环境不同略有差异，但兼容性和流作业重启边界不应改变。
