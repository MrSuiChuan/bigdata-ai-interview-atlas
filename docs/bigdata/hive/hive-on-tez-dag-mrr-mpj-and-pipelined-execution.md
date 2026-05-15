---
kb_id: bigdata/hive/hive-on-tez-dag-mrr-mpj-and-pipelined-execution
title: Hive on Tez 与 DAG 执行
description: 解释 Hive 在 Tez 上如何把 SQL 转成 DAG、Vertex 和 Task，以及这些执行单元为什么会影响性能和失败恢复。
domain: bigdata
component: hive
topic: hive-on-tez-dag-mrr-mpj-pipelined-execution
difficulty: advanced
status: reviewed
sidebar_position: 12
version_scope: Hive design docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - hive-on-tez
  - hive-introduction
  - hive-docs-home
  - hive-language-manual
  - hive-language-manual-ddl
  - hive-managed-external-tables
  - hive-metastore-admin
  - hive-metastore-3-admin
claim_ids:
  - hive-claim-0003
  - hive-claim-0078
  - hive-claim-0079
  - hive-claim-0080
  - hive-claim-0081
  - hive-claim-0082
  - hive-claim-0083
  - hive-claim-0001
  - hive-claim-0002
  - hive-claim-0004
tags:
  - hive
  - tez
  - dag
  - mrr
  - mpj
  - knowledge-base
  - production
---
## Hive on Tez 的本质，是把链式作业改造成可连续推进的执行图

Hive 跑在 Tez 上以后，最大的变化不是“还是那几个阶段，只是名字换了”，而是查询不再必须被拆成一串彼此隔离的 MapReduce 作业。官方设计文档给出的锚点非常明确：Tez 是一个运行在 YARN 上的通用 DAG 执行框架，task 是顶点，edge 是一等公民的数据连接，而且可以直接执行任意 DAG。

这个定义直接决定了 Hive on Tez 的理解方式。核心不是记住一个“更快”，而是知道为什么图结构一变，物化边界、调度边界和失败恢复边界都会跟着变。

## Tez 和经典 MapReduce 的结构差异落在什么地方

经典 MR 更接近固定形状的单段或链式作业模型：上一段必须先落盘，下一段再读取并继续。Tez 则允许整条查询计划一次性交给执行框架，让多个顶点沿着依赖边直接传递数据。

因此，Hive on Tez 真正减少的是三类固定成本：

1. 阶段之间必须落到 HDFS 的中间物化。
2. 每一段单独拉起和调度作业的固定开销。
3. 上下游阶段之间必须等待前一段彻底结束的同步屏障。

只要把这三类成本看清楚，就不会再把 Tez 理解成“只是更高效的 MR 容器”。

## 整个查询计划一次下发，改变了什么

官方文档明确说，Tez 允许整个 query plan 一次送达，因此数据可以跨阶段做 pipeline 传递，从而减少 I/O、同步 barrier 和阶段级调度开销。这句话非常关键，因为它回答的是“为什么多阶段 SQL 会整体受益”。

它带来的不是某个算子级别的小优化，而是整张执行图的推进方式被改造了：

1. 下游不必总是等待上游全量完成后再启动。
2. 中间结果不必总是先变成稳定文件再被下游读取。
3. 调度器看到的是一张完整依赖图，而不是一串分裂的作业。

## DAG、Vertex、Task 是三层不同对象

在 Hive on Tez 里，这三个词绝不能混着用：

1. DAG 是整条查询的依赖图。
2. Vertex 是 DAG 内的阶段级执行节点。
3. Task 是 Vertex 内部面向分片的并行执行单元。

为什么要分这么细？因为性能和恢复问题往往不会停在同一层。Task 太细，DAG 太粗，真正最有解释力的层通常是 Vertex。一个 Vertex 慢，可能是它承担了大规模 shuffle、聚合或数据倾斜；一个 Task 重试，不等于整张 DAG 都必须重跑。

## MRR 解决的不是语法问题，而是 reduce 链之间的硬边界

官方文档说明，多个彼此链接的 reduce sink 可以在 Tez 中直接连接，让数据不经过临时 HDFS 文件继续往下流，这就是 `MRR`，即 Map-Reduce-Reduce*。它针对的不是某条函数，而是经典 MR 模型下“多段 reduce 必须被切成多个独立作业”的结构性成本。

换句话说，`MRR` 优化掉的是这样一条旧链路：

1. 上游 reduce 输出先写 HDFS。
2. 下游作业重新读取这份中间文件。
3. 再做新一轮 shuffle 和调度。

Tez 把这条链路改成 DAG 内的直接连接后，中间物化和阶段等待都明显减少。

## MPJ 解决的是多父 Join 在图结构上的表达能力

官方文档还说明，Hive on Tez 能识别具有多个 parent tasks 的 join，并把它们合并成单个树形 DAG。这就是 `MPJ` 的价值。它说明 Hive 的 Join 结构不必再被强迫压扁成多段串行作业，而可以更自然地保留为树状依赖关系。

这条能力的意义在于：Join 多的时候，真正影响效率的通常不是“Join 语法复杂”，而是执行图是否被人为拆碎。`MPJ` 让图更贴近真实依赖结构，因此也更容易减少不必要的中间阶段。

## 为什么 Tez 的收益经常体现在 Vertex 层，而不是 SQL 文本层

很多 SQL 从文本上看并不复杂，但一进 Tez DAG 就会暴露出代价集中点。真正要回答“这条 Hive on Tez 查询为什么慢”，最可靠的思路通常是看：

1. DAG 被切成了多少个 Vertex。
2. 哪些 Vertex 之间存在重 shuffle 或物化边界。
3. 哪个 Vertex 的 task 分布明显倾斜。
4. 哪些阶段本来可以 pipeline，却仍然被硬切开。

所以 Hive on Tez 的分析对象应该是执行图，而不是只盯 SQL 关键字数量。

## 为什么 `EXPLAIN` 是第一证据，而不是经验猜测

官方文档明确给出一个非常实用的信号：`MRR` 优化会展示在 `EXPLAIN` 计划里。这意味着回答 Tez 问题时，不能只靠经验说“我觉得这里应该已经做了优化”。真正可复核的做法是先看计划，确认：

1. 是否真的命中了 `MRR`。
2. 是否出现了多父 Join 合并的结构痕迹。
3. DAG 是否比预期切得更多。
4. 是否仍然保留了过多中间物化点。

对知识库来说，这条证据链特别重要，因为它把“架构理解”落到了“如何验证”上。

## 小数据 entirely in memory 为何值得单独记住

官方文档还指出，Tez 可以让小数据集在 shuffle 期间 entirely in memory，而经典 MapReduce 没有这种优化。这个点看似细节，实际上它解释了为什么有些多阶段查询在数据量不大时，Tez 能把延迟拉得明显更低。

原因很简单：只要中间数据足够小，就没有必要为它支付完整的落盘、再读和阶段切换成本。很多团队会把 Tez 的收益全部归因于“DAG 调度更高级”，但小数据 in-memory 也是其中一条明确的官方机制。

## 失败恢复为什么也要沿着图边界来理解

Hive on Tez 的恢复边界不应被简单理解成“某个 task 挂了就全图重来”。更准确的理解方式是：

1. 哪个 Vertex 出了问题。
2. 上游结果是否已经稳定且可复用。
3. 当前失败点前后是否存在必须重新物化的边界。

图结构越合理，局部失败越容易被局部处理；图结构越碎、物化点越多，恢复成本往往也越大。这就是为什么 Tez 的执行图既影响性能，也影响失败后的代价。

## 常见误判

1. 把 Hive on Tez 简化成“Tez 比 MR 快”。
2. 只会背 `MRR`、`MPJ` 缩写，但说不清它们分别在消除什么边界。
3. 只看总耗时，不看 Vertex 和 shuffle 边界。
4. 以为阶段少就一定更快，忽略了数据倾斜和物化必要性。

## 示例

```sql
EXPLAIN FORMATTED
SELECT a.shop_id, sum(a.amount)
FROM dwd_orders a
JOIN dim_shop b
  ON a.shop_id = b.shop_id
GROUP BY a.shop_id;
```

这个示例的价值不在 Join 语法，而在于借助 `EXPLAIN` 去确认 DAG 结构、`MRR` 是否命中、以及中间阶段有没有被过度切碎。

## 本页结论

Hive on Tez 真正改变的，是查询从“一串分离作业”到“一张连续执行图”的结构转换。`MRR`、`MPJ`、pipeline 和 in-memory 小数据处理，都是这张图能够减少中间物化、降低阶段调度成本的具体体现。只说“更快”，远远不够解释它为什么更快。

## 来源与事实边界

### 来源

`hive-on-tez`、`hive-introduction`、`hive-docs-home`、`hive-language-manual`、`hive-language-manual-ddl`、`hive-managed-external-tables`、`hive-metastore-admin`、`hive-metastore-3-admin`

### 事实声明

`hive-claim-0003`、`hive-claim-0078`、`hive-claim-0079`、`hive-claim-0080`、`hive-claim-0081`、`hive-claim-0082`、`hive-claim-0083`、`hive-claim-0001`、`hive-claim-0002`、`hive-claim-0004`
