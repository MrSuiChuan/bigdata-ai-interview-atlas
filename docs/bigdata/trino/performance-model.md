---
kb_id: bigdata/trino/performance-model
title: Trino 性能模型与主要瓶颈
description: 说明 Trino 性能为什么首先取决于扫描量、Pushdown、Join 策略、Exchange 与资源治理，而不是单个配置参数。
domain: bigdata
component: trino
topic: performance-model
difficulty: advanced
status: reviewed
sidebar_position: 10
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-pushdown-docs
  - trino-cost-based-optimizations-docs
  - trino-resource-groups-docs
  - trino-admin-properties
claim_ids:
  - bigdata-trino-claim-0006
  - bigdata-trino-claim-0009
  - bigdata-trino-claim-0010
  - bigdata-trino-claim-0011
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0021
  - bigdata-trino-claim-0023
tags:
  - trino
  - performance
  - optimizer
  - join
  - exchange
  - knowledge-base
---
## Trino 性能的第一原则不是“调参数”，而是“先减少不该做的工作”
Trino 性能讨论最容易一上来就掉进参数坑里，比如内存、并发、线程、spill。它们当然重要，但在 Trino 里，更上游的因素往往决定性更强：

1. 扫描量是否被剪掉。
2. pushdown 是否成功。
3. join 顺序和 join 分布是否合理。
4. exchange 是否把太多数据搬过网络。
5. resource group 是否让负载在排队或争抢资源。

所以 Trino 的性能模型首先是工作量模型，其次才是配置模型。

## 第一大成本：扫描多少数据
如果底层分区、文件布局和 pushdown 都没有发挥作用，Trino 会先输在最外层的扫描量上。很多查询不是算子难，而是：

- 读了太多本不该读的文件。
- 抬回了太多本可在底层过滤掉的数据。
- 读回了很多其实根本不需要的列。

这时候继续往下调 join 或内存，往往只是延后问题，不是解决问题。

## 第二大成本：优化器有没有足够信息做正确决策
Trino 的 cost-based optimization 需要统计信息来决定 join 顺序和 join 分布。如果统计信息缺失或质量很差，就容易出现：

- 小表没被识别成可 broadcast 的 build side。
- 大表被误当成小表广播到每个节点。
- join 顺序选择不合理，导致中间结果爆炸。

这也是为什么 explain 计划和 stats 质量，在 Trino 性能分析里价值极高。

## 第三大成本：Broadcast 还是 Partitioned Join
Join 分布策略是 Trino 性能里最有区分度的一个点：

- broadcast join 的优点是快，缺点是 build side 要在每个节点上都装得下。
- partitioned join 的优点是能处理更大 join，缺点是要重新分发两边数据，exchange 成本更高。

所以 join 问题从来都不是“哪种更高级”，而是“这次数据规模和内存边界更适合哪种”。

## 第四大成本：Exchange 和网络
只要查询进入多 stage 且需要跨节点重新分发数据，exchange 就会变成核心成本之一。它常见的放大器有：

- join 之前没有足够过滤，导致数据量过大。
- 聚合不能在底层提前做。
- task 分布不均，部分节点成为长尾。

因此很多慢查询其实不是单节点 CPU 跑不动，而是全局数据搬运过多。

## 第五大成本：治理和资源边界
Trino 不是独占式单租户引擎，很多性能问题并不是“这条 SQL 本身差”，而是它和其他查询一起运行时：

- 进入队列等待。
- 被资源组限制并发。
- 与其他长查询争内存。
- 被错误放进不合适的资源池。

这类问题如果不把 resource group 纳入性能模型，就会把治理问题误判成 SQL 问题。

## 一个更靠谱的性能判断顺序
1. 先看是否读了太多数据。
2. 再看 pushdown 是否发生。
3. 再看 join 顺序和 join 分布是否合理。
4. 再看 exchange 和 task skew 是否主导成本。
5. 最后才回到内存、spill、资源组和具体参数。

## 本页结论
Trino 的性能模型本质上是“扫描量、计划质量、join 分布、exchange 成本和资源治理”的组合。只要先把这五层看清，Trino 的性能问题就不会被误简化成“改几个参数”。


### 一个更实用的证据读取顺序
Trino 的性能分析最好不要只看最终耗时，而是按证据面逐层推进：先用 explain 看过滤、投影和 join 形状是否合理；再用 explain analyze 看 stage 与 operator 的真实耗时；最后再把 blocked reason、memory pressure 和 resource group 现象拼进来。这个顺序能避免把结构性工作量问题误判成单纯资源不足。

```sql
EXPLAIN ANALYZE
SELECT c.region, sum(o.totalprice)
FROM hive.sales.orders o
JOIN hive.sales.customers c
  ON o.customer_id = c.customer_id
GROUP BY c.region;
```

### 广播阈值为什么属于性能治理，而不是孤立参数
像 `join-max-broadcast-table-size` 这类参数之所以重要，不是因为它神奇地能让查询变快，而是因为它帮助平台在统计误判或业务混跑时守住并发与内存边界。换句话说，它属于性能治理手段，而不是替代 explain、stats 和 join 形状判断的捷径。

