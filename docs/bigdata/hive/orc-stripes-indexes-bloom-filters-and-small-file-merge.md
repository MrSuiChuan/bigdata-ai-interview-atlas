---
kb_id: bigdata/hive/orc-stripes-indexes-bloom-filters-and-small-file-merge
title: Hive ORC Stripe、索引与小文件合并
description: 解释 ORC 的 stripe、索引、bloom filter 和小文件问题如何影响扫描成本，以及如何从文件层面判断性能瓶颈。
domain: bigdata
component: hive
topic: orc-stripes-indexes-bloom-filters-small-file-merge
difficulty: advanced
status: reviewed
sidebar_position: 13
version_scope: Hive latest docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - hive-language-manual-orc
  - hive-docs-home
  - hive-language-manual
  - hive-metastore-admin
  - hive-transactions
  - hive-on-tez
  - hive-introduction
  - hive-language-manual-ddl
claim_ids:
  - hive-claim-0084
  - hive-claim-0085
  - hive-claim-0086
  - hive-claim-0087
  - hive-claim-0088
  - hive-claim-0001
  - hive-claim-0002
  - hive-claim-0003
  - hive-claim-0004
  - hive-claim-0005
tags:
  - hive
  - orc
  - stripe
  - bloom-filter
  - small-files
  - knowledge-base
  - production
---
## ORC 的性能首先来自“知道不用读什么”

把 ORC 概括成“列式压缩格式，所以更快”，这句话不算错，但远远不够。ORC 真正有价值的地方，是它在文件内部提前组织了 stripe、footer、postscript、row index 和可选的 Bloom Filter，让读取方可以先看元数据，再决定哪些 stripe、哪些 row group 根本不用碰。

所以 ORC 的优势首先不是“读得快”，而是“能更早知道哪些数据没必要读”。这也是为什么 ORC 问题要放在扫描裁剪和文件布局的语境里理解，而不是只停留在压缩率层面。

## ORC 文件为什么是自描述结构

官方文档说明，ORC 把行数据组织成多个 stripe，在文件尾部保存辅助元数据，并在最末尾写入 postscript，用于记录压缩参数和压缩后 footer 大小。这意味着 ORC 文件不是从头到尾线性扫过去的普通字节流，而是一种带自描述元信息的结构化文件。

从读路径看，这条结构有两个重要后果：

1. 扫描器可以先通过尾部元数据理解文件内部组织方式。
2. 读取动作可以先做选择，再决定真正打开哪些 stripe 和 row group。

这也是 ORC 能持续服务分析场景的关键基础。

## Stripe 为什么是第一层扫描边界

Stripe 是 ORC 的主组织单元。只要 stripe 粒度合适，查询器就有机会在比较高的层次先做一次“整块跳过”，而不必一开始就落到最细的行级过滤。

换句话说，stripe 带来的不是某种神秘缓存能力，而是更粗粒度的可裁剪边界。一个文件就算格式是 ORC，如果 stripe 组织过碎或过乱，这条优势也会被明显削弱。

## ORC index 真正解决的不是“直接命中结果”

官方文档明确写了，ORC stripe 里的 index data 包含每列的最小值、最大值和行位置；这些 indexes 的用途是帮助选择 stripes 和 row groups，而不是像传统数据库索引那样直接回答查询。

这条边界必须说清楚，因为它能挡住一个很常见的误答：把 ORC index 说成“列式世界里的 B+ 树”。更准确的表述是：ORC index 负责裁剪扫描范围，帮助跳过不相关的数据块，但最终结果仍然要通过实际扫描和算子处理得出。

## row-skipping 为什么是第二层细化裁剪

官方文档还说明，ORC row index entries 可以在 stripe 内部支持 row-skipping，默认每 10,000 行可以跳过一次。这意味着裁剪不是只有“先选不选这个 stripe”这一层，还有更细一层的 row group / row index 边界。

这会形成一条更完整的扫描链：

1. 先根据文件尾部元数据理解文件结构。
2. 再根据 index data 判断哪些 stripe 可跳过。
3. 对保留下来的 stripe，再按 row index entry 做更细粒度的跳过。

所以 ORC 的裁剪能力是分层发生的，而不是一个单点优化。

## `orc.row.index.stride` 为什么不是可有可无的参数

既然 row-skipping 依赖 row index entries，那么 `orc.row.index.stride` 这种属性就直接影响可跳过边界的粗细。粒度更粗，索引条目更少，但裁剪精度可能下降；粒度更细，裁剪更灵活，但元数据和组织成本也会上升。

这说明 ORC 的读取收益并不是完全由默认行为自动保证的，写入时的表属性设置会决定后续扫描器能拿到怎样的跳读能力。

## Bloom Filter 的价值在于提前排除“不可能命中”

官方文档把 Bloom Filter 相关设置纳入 ORC 的 `TBLPROPERTIES` 控制面，这意味着 Bloom Filter 不是游离在格式之外的附属品，而是 ORC 文件读优化体系的一部分。

在原理上，它的价值并不是直接返回匹配行，而是更早地帮助判断某些数据块“根本不可能命中当前条件”。因此它和 min/max、row index 一样，都属于“减少无效读取”的工具，只是作用依据不同。

## 表级和分区级属性漂移为什么会制造不稳定表现

官方文档还给出一个很实用的事实：ORC 的文件格式和属性既可以定义在表级，也可以定义在分区级。这个事实常被忽略，但它对生产排障很关键。

因为一旦同一张逻辑表的不同分区采用了不同的 ORC 参数，查询层面看到的就不再是统一物理行为，而是“同一张表，不同分区的 stripe 大小、index 粒度、Bloom Filter 策略都可能不同”。这会带来一种特别烦的现象：同一条 SQL 今天扫这个分区快，明天扫另一个分区慢，根因却在物理属性漂移，而不是 SQL 本身。

## 小文件为什么会把 ORC 的优势吃掉

ORC 的很多优势依赖“单个文件内部有足够多、足够连续、足够可裁剪的数据块”。当数据被切成大量小文件时，即使每个文件内部仍然有 stripe 和索引，整体上仍会出现两个问题：

1. 文件系统和 Metastore 要管理大量小对象。
2. 调度器要处理更多文件和更多 task，固定成本被显著放大。

结果就是：明明用了 ORC，查询还是慢。根因往往不是 ORC 失效，而是小文件把 ORC 的裁剪收益稀释了。

## `CONCATENATE` 为什么是 ORC 场景里的文件层治理动作

官方文档明确说明，`ALTER TABLE ... CONCATENATE` 可以在 stripe level 合并多个小 ORC 文件，而且合并过程中不需要解压和解码。这条能力非常重要，因为它说明 ORC 小文件治理不一定要走“整表重写”这种昂贵路径。

它更像一种利用 ORC 内部结构做的物理整理：

1. 目标是减少小文件数量。
2. 手段是按 stripe 级别合并。
3. 代价比全量重读、重解码、重写低得多。

所以谈 ORC 小文件时，如果只会说“重写成大文件”，这个答案就没有触到官方文档真正提供的治理机制。

## 排查 ORC 读慢时，先问哪几件事

1. 慢是因为条件没有裁掉 stripe，还是因为根本没有足够大的 stripe 可裁。
2. 当前分区是否真的用了预期的 ORC 参数。
3. row index 和 Bloom Filter 是否可能为当前条件提供帮助。
4. 文件是不是已经碎到 task 固定成本压过格式收益。
5. 是否应该先用 `CONCATENATE` 收敛物理碎片，再继续看计划层问题。

这几问的价值在于，它把问题先落回文件层，而不是上来就怪 SQL 或执行引擎。

## 常见误判

1. 把 ORC 的价值全部简化成“列式压缩”。
2. 把 ORC index 说成直接返回查询结果的传统索引。
3. 忽略表级 / 分区级属性漂移对物理行为的一致性影响。
4. 明明是小文件问题，却误判成格式本身不够快。

## 示例

```sql
ALTER TABLE dwd_sales_orc CONCATENATE;
```

这条命令的重点，不是“做一次万能加速”，而是先把碎片化文件收敛成更适合 ORC 发挥 stripe 和索引优势的物理形态。

## 本页结论

ORC 的核心价值，是通过 stripe、footer、row index 和可选 Bloom Filter，把“哪些数据不必读”这件事提前到扫描入口层。只有当文件布局、索引粒度和小文件治理同时合理时，ORC 的列式优势才会真正稳定兑现。

## 来源与事实边界

### 来源

`hive-language-manual-orc`、`hive-docs-home`、`hive-language-manual`、`hive-metastore-admin`、`hive-transactions`、`hive-on-tez`、`hive-introduction`、`hive-language-manual-ddl`

### 事实声明

`hive-claim-0084`、`hive-claim-0085`、`hive-claim-0086`、`hive-claim-0087`、`hive-claim-0088`、`hive-claim-0001`、`hive-claim-0002`、`hive-claim-0003`、`hive-claim-0004`、`hive-claim-0005`
