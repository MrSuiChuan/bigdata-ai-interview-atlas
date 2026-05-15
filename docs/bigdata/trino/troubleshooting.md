---
kb_id: bigdata/trino/troubleshooting
title: Trino 生产排障路径
description: 说明 Trino 排障时如何先分清 queue、planning、running、write 和 source side 问题，再用执行计划、运行态和 connector 证据逐层收敛根因。
domain: bigdata
component: trino
topic: troubleshooting
difficulty: advanced
status: reviewed
sidebar_position: 17
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - trino-docs
  - trino-pushdown-docs
  - trino-cost-based-optimizations-docs
  - trino-resource-groups-docs
  - trino-fault-tolerant-execution-docs
  - trino-connector-docs
  - trino-admin-properties
claim_ids:
  - bigdata-trino-claim-0006
  - bigdata-trino-claim-0007
  - bigdata-trino-claim-0009
  - bigdata-trino-claim-0012
  - bigdata-trino-claim-0014
  - bigdata-trino-claim-0015
  - bigdata-trino-claim-0016
  - bigdata-trino-claim-0021
  - bigdata-trino-claim-0022
  - bigdata-trino-claim-0023
tags:
  - trino
  - troubleshooting
  - diagnosis
  - knowledge-base
  - production
---
## Trino 排障最怕的不是问题复杂，而是还没分层就开始改配置
Trino 的线上问题非常容易“看起来都像慢查询”，但真正的根因可能完全不同。一次报错可能是权限和认证，一次慢是资源组排队，一次慢是没有 pushdown，一次失败是 connector 不支持写入语义，一次失败则是 worker 故障后默认整条查询中断。

所以 Trino 排障的第一原则不是先调参数，而是先分层。

## 第一步：先判断问题卡在哪一段生命周期
更靠谱的 Trino 排障，第一步通常先把问题放进下面五类中的一类：

1. 还没真正开始跑：卡在认证、权限、路由或 queue。
2. 刚开始就慢：卡在 planning、元数据或统计信息。
3. 跑起来才慢：卡在扫描、join、exchange、skew 或内存压力。
4. 读得出来但写不进去：卡在 connector 写能力或底层系统边界。
5. 执行中断：卡在 worker 故障、资源不足或 connector / source 异常。

这一步一旦做对，后面的证据链会简单很多。

## 第二步：对照计划层，先排掉“本来就做错了”
很多 Trino 问题其实在执行前就已经注定。最常见的例子包括：

- 过滤没有下推，导致大量无效扫描。
- 列裁剪没有生效，读回了太多列。
- 统计信息缺失，优化器选了很差的 join 顺序或 join 分布。
- 底层分区和文件布局让 split 生成天然不理想。

这时最应该先看的就是 `EXPLAIN`、`EXPLAIN ANALYZE` 和 `SHOW STATS`。如果计划层就已经暴露问题，继续盯运行日志通常只是晚一点才发现同一个根因。

## 第三步：如果计划没明显问题，再看运行态到底堵在哪
运行态排障最有价值的是分解，而不是总时长。应优先看：

- 查询在 queue / planning / running 各耗了多久。
- 哪个 stage 最慢，慢在 CPU、网络还是等待。
- 某些 task 是否形成明显长尾。
- blocked reason 指向内存、exchange 还是上游读取。
- 是否出现 spill、memory pressure 或 worker 丢失。

这一层的目标不是把所有指标都翻一遍，而是回答“这条查询到底是在做事，还是在等事”。

## 第四步：永远别把 connector 和底层系统排除在外
Trino 自身并不拥有数据，所以很多看似引擎问题的故障，最终都落回 connector 和底层源系统。尤其在下面这些现象里，要主动把边界系统拉进来：

- planning 很慢：先查元数据系统和 connector 获取 metadata / stats 的链路。
- 某 catalog 相关查询普遍异常：先查该 catalog 配置和源系统健康度。
- 写入失败：先确认 connector 是否支持对应的 `INSERT`、`CTAS`、`MERGE` 或 `DELETE` 语义。
- 执行中偶发失败：先分清是 Trino worker 自身故障，还是源系统连接、权限、超时问题。

## 五类高频问题的第一观察入口
### 1. 查询一直排队
先看 resource group 和 selector 是否把查询送到了错误队列，再看并发和内存边界是否已经打满。

### 2. planning 特别慢
先看 metadata 服务、catalog 配置、表统计信息和底层对象数量，再决定是否继续深挖优化器。

### 3. running 很慢
先看 pushdown、join 分布、exchange、task skew、split 分布和底层文件布局。

### 4. 写入或回填失败
先确认 connector 是否支持该语义，再看底层系统返回的限制和错误。

### 5. 执行中断
先确认是否是 worker / 资源故障；默认情况下这种故障会让查询失败，只有开启 fault-tolerant execution 且相关条件满足时，才会进入自动重试路径。

## 一条更实用的排障主线
真正落到生产时，可以按下面顺序收敛：

1. 先分生命周期：queue、planning、running、write、failure。
2. 再分证据层：plan、runtime、boundary system。
3. 再决定动作：改 SQL、补统计、改布局、调资源组、修 connector、启用或调整容错策略。

这条主线的价值在于，它能把“Trino 很复杂”收敛成一条可以复用的判断路径。

## 四种特别典型的误操作
1. 还没看计划就先加内存。
2. 只看 Trino 日志，不看源系统和 connector。
3. 把 queue 问题误当成 SQL 问题。
4. 把写入失败归因成“Trino 不稳定”，却不确认 connector 是否本来就不支持目标语义。

## 本页结论
Trino 排障的关键不是会不会背指标名，而是能不能先把问题放回正确阶段，再用计划、运行态和 connector 证据逐层收敛。回答这类问题时，如果你能先分 queue、planning、running、write、failure 五段，再展开证据链，基本就已经具备生产级判断框架了。
