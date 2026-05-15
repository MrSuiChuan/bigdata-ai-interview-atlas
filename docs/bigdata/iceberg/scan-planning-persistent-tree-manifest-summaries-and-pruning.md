---
kb_id: bigdata/iceberg/scan-planning-persistent-tree-manifest-summaries-and-pruning
title: Iceberg 扫描规划与 Manifest 裁剪
description: 解释 Iceberg 扫描规划与 Manifest 裁剪如何定位数据、裁剪扫描、并行执行和返回结果，并说明可见性、性能证据与排障入口。
domain: bigdata
component: iceberg
topic: scan-planning
difficulty: expert
status: reviewed
sidebar_position: 17
version_scope: Iceberg reliability docs and spec as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - iceberg-reliability
  - iceberg-spec
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
  - iceberg-maintenance
claim_ids:
  - iceberg-claim-0105
  - iceberg-claim-0106
  - iceberg-claim-0107
  - iceberg-claim-0108
  - iceberg-claim-0109
  - iceberg-claim-0110
  - iceberg-claim-0111
  - iceberg-claim-0112
  - iceberg-claim-0113
  - iceberg-claim-0114
tags:
  - iceberg
  - scan-planning
  - manifests
  - pruning
  - knowledge-base
  - production
---
## Iceberg 的扫描规划为什么不需要先扫目录
Iceberg 在每个 snapshot 中维护完整的数据文件列表，并把这套元数据组织成可复用的持久化树结构。新 snapshot 会尽量复用旧 snapshot 已有的元数据树，而不是每次重新从目录世界出发枚举全表。这让“读取一张大表之前先列目录”的传统前置动作，变成了“先读稳定元数据树再做规划”。

这条设计直接改变了规划复杂度。Iceberg 文档明确指出，从 snapshot 规划读取只需要 O(1) 级别的 RPC 入口，而不是先去列出 O(n) 个分区或目录。这里的重点不是形式化地背 O(1)，而是理解：规划入口成本不再随着分区目录数量线性膨胀。

## 持久化元数据树到底带来了什么
所谓 persistent tree，可以把它理解成“新版本尽可能共享旧版本已经构造好的元数据枝干，只替换真正发生变化的部分”。这样做有两个直接收益：

- 第一，提交新 snapshot 时不必重建整棵文件发现结果。
- 第二，读者规划时可以沿着稳定的 metadata 路径进入，而不是重新做一次全局发现。

这也是为什么 Iceberg 能同时兼顾大规模读规划和频繁版本演进。变化发生在局部，但表状态仍然表现为一个完整、可追踪的版本视图。

## 为什么说它还能缓解 metastore 规划瓶颈
Iceberg 文档进一步强调，分布式 planning 结合 O(1) RPC 入口，可以移除 metastore 作为规划瓶颈的角色，并支持更细粒度的分区组织。这句话的潜台词是：规划器不再需要把“先查元数据服务、再列大量分区、再决定任务切分”作为唯一模式。

当表状态已经在 snapshot 和 manifest 树里可稳定访问时，规划就可以更直接地下沉到真正与查询相关的 metadata 上，而不是被目录枚举和中心化元数据服务拖住。

## Manifest 为何被设计成不可变 Avro 文件
Iceberg 里的 manifest 是不可变 Avro 文件，用来列出 data files 或 delete files，并记录 partition tuples、metrics 与跟踪信息。它的不可变性保证了版本可复用与提交可追踪；它的结构化内容则保证了规划器能在文件级之前先做判断。

还有两条细节一定要记住：

- 一个 manifest 只能存 data files 或 delete files，不能混存。
- 包含 delete files 的 manifests 会在 job planning 时先被扫描。

前者是为了保持内容类型清晰，后者则是为了让删除语义在规划期尽早进入可见范围。

## 单个 manifest 只对应一个 partition spec，有什么规划价值
每个 manifest 都只保存同一个 partition spec 下的文件。这条规则一方面支撑分区演进，另一方面也让规划器知道该用哪一套 partition 解释去理解这一批文件。

如果没有这个边界，规划器在面对多代分区布局时就会更难做正确裁剪。现在的模型则更清楚：文件属于哪个 spec，manifest 已经替你记好；旧 spec 文件和新 spec 文件可以共存，但不会混淆。

## 行过滤条件如何在规划期先变成分区谓词
Iceberg 的 planning 不会等到读出所有数据文件后再考虑过滤。相反，行级过滤条件会先被转换成针对 partition tuples 的谓词，并在 manifest 层尝试裁剪。这个过程很关键，因为它让很多“不可能命中的工作”在文件打开之前就被排掉了。

这也解释了为什么分区设计、manifest 摘要和查询模式之间会有强互动：如果 metadata 足够准确、布局足够贴近查询过滤，很多工作可以在 planning 阶段直接消失。

## Manifest List 里的摘要具体有什么用
Manifest list 会保存每个 manifest 的 partition field summaries，例如 `contains_null`、`contains_nan`、`lower_bound`、`upper_bound` 等信息。这些摘要的价值，不在于字段名字难不难背，而在于它们让 planning 在展开 manifest 之前，就已经有依据判断某些 manifest 是否值得深入。

规范还说明，partition field 的上下界会按对应数据类型的 single-object serialization 序列化成字节；如果该字段全是 null 或 NaN，则上下界为 null。这个细节意味着：规划器依赖的是规范化后的元数据摘要，而不是临时对文件内容做一次轻量扫描。

## 为什么说真正的性能收益发生在“读文件之前”
Iceberg 的一个高价值能力，是在真正触碰数据文件之前，就利用 manifest 与 manifest list 的摘要信息裁掉不必要的工作。因此，当你分析 Iceberg 的读取性能时，不能只看底层文件格式，也不能只看执行引擎算子的实现细节，还要看：

- manifest 数量是否过多。
- 摘要信息是否足够支持有效剪枝。
- 分区设计是否让行过滤能够转成高价值 partition predicates。
- delete manifests 是否过多，从而增加规划前置成本。

理解了这几点，就能把“为什么某些查询在真正读文件之前就已经快了很多”讲到根上。


### 一个更适合现场排障的判断顺序
如果某张表 planning 变慢，建议先问 manifest list 是否还能提前排掉大部分 manifests，再问 manifests 内的 partition summaries 是否仍然贴近查询过滤模式，最后才去看 data file 数量本身。这个顺序的意义在于：Iceberg 的核心优势本来就发生在“读文件之前”，因此 planning 退化时，第一责任层通常也是 metadata 组织，而不是执行引擎算子本身。

