---
kb_id: bigdata/iceberg/manifests-and-planning
title: Iceberg Manifest 与查询规划
description: 解释 Iceberg Manifest 与查询规划如何定位数据、裁剪扫描、并行执行和返回结果，并说明可见性、性能证据与排障入口。
domain: bigdata
component: iceberg
topic: planning
difficulty: intermediate
status: reviewed
sidebar_position: 3
version_scope: Iceberg latest docs and spec as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - iceberg-spec
  - iceberg-reliability
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
  - iceberg-maintenance
claim_ids:
  - iceberg-claim-0021
  - iceberg-claim-0022
  - iceberg-claim-0023
  - iceberg-claim-0024
  - iceberg-claim-0045
  - iceberg-claim-0047
  - iceberg-claim-0001
  - iceberg-claim-0002
  - iceberg-claim-0003
  - iceberg-claim-0004
tags:
  - iceberg
  - manifest
  - planning
  - pruning
  - knowledge-base
  - production
---
## Manifest 不是附属文件，而是扫描规划的核心中间层
如果只记一句话来理解 manifest，那就是：Iceberg 不会让 snapshot 直接枚举整张表的所有数据文件，而是通过 manifest list 和 manifest 把“版本管理”和“扫描规划”连接起来。这样做的目的既是正确性，也是可扩展性。

直接让 snapshot 持有海量数据文件列表看似简单，实际上会把元数据读写和规划成本推到极高。Iceberg 用多层不可变元数据把问题拆开：snapshot 先指向 manifest list，manifest list 再指向多个 manifest，manifest 再列出 data file 或 delete file。这让表版本可以稳定演进，也让规划器在真正触碰数据文件之前就做大量剪枝。

## snapshot、manifest list 和 manifest 各自负责什么
可以把这三层关系理解成“版本入口、目录索引、文件清单”：

| 层次 | 主要职责 | 为什么不能省掉 |
| --- | --- | --- |
| Snapshot | 定义某一版本引用哪份 manifest list | 把版本边界固定下来 |
| Manifest List | 汇总当前 snapshot 需要看的 manifests，并携带每个 manifest 的摘要信息 | 让规划器先按摘要做筛选，而不是马上展开到文件级别 |
| Manifest | 记录具体 data file 或 delete file 的元数据 | 把真正可读文件组织成可裁剪、可追踪的集合 |

这个多层设计解释了为什么 Iceberg 能同时兼顾大表规划和版本演进：读者先定位版本，再定位 manifest，再决定最终要不要去碰文件。

## 为什么 manifest 不能同时放 data file 和 delete file
Iceberg 规范明确区分 data manifest 与 delete manifest，一个 manifest 不能同时包含 data file 和 delete file。这个限制不是形式主义，而是为了让规划和解释路径保持清晰。

如果 data file 和 delete file 混在同一个 manifest 里，扫描器在文件级计划和删除语义处理上就会更难分层。分开之后，读取方可以明确知道：哪些 manifest 是数据载体，哪些 manifest 是删除语义载体；这对行级删除的规划顺序、过滤和成本控制都很重要。

## 每个 manifest 只对应一个 partition spec，有什么意义
Iceberg 规定每个 manifest 中的文件都来自同一个 partition spec。这个约束最直接的作用，是让分区演进成为可解释、可共存的历史过程。

当表的 partition spec 发生变化时，旧文件继续保留在旧 spec 的 manifest 中，新文件写入新 spec 的 manifest。Reader 不需要假装整张表始终只有一个分区布局，而是通过 metadata 精确知道每批文件应该按哪个 spec 去理解。

所以，manifest 不只是“文件列表”，它还是“这批文件应该按照什么分区规则解释”的承载体。

## Manifest List 里的摘要为什么能显著降低规划成本
Manifest list 不只是存路径，它还携带每个 manifest 的摘要信息，例如 partition summaries 和 sequence numbers。正因为有这层摘要，规划器在进入文件级细节之前，就可以先判断某些 manifest 是否根本不可能命中本次查询。

这意味着 Iceberg 的规划不是“一上来就打开所有 manifest，再打开所有 data file 看一遍”，而是“先用更便宜的摘要做粗粒度排除，再逐步下钻”。这正是大表扫描还能保持可控 planning 成本的重要原因。

## 为什么说 planning 可以在碰数据文件之前先做大量剪枝
Iceberg 文档明确指出，查询规划可以依靠 manifests 与 manifest lists 中的分区和文件级摘要信息，在真正触碰数据文件之前就裁掉不必要的工作。这句话的含义非常大：

- 第一，metadata 本身已经足够支持一轮高价值剪枝。
- 第二，data file 不再是“先打开再决定要不要读”，而是“先看 metadata 再决定值不值得读”。
- 第三，扫描效率不只来自执行引擎算子优化，也来自表格式层为规划器准备的元数据结构。

这也是为什么讨论 Iceberg 性能时，不能只盯着文件格式和执行引擎，还要看 manifest 布局、manifest 数量以及摘要信息是否有效。

## 不可变 manifest 为什么让重试更便宜
Manifest 与 manifest list 是不可变 metadata 文件。这个特性带来的一个重要收益，是 commit retry 时可以复用已经构造好的大部分元数据工作，而不是重新扫描整表、重建整棵元数据树。

因此，当并发提交导致当前 writer 需要重试时，代价不必等于“重新做一遍所有计划”。只要原来的 manifest 仍然成立，很多工作都可以沿用。这也是 Iceberg 提交模型能在大规模场景下保持工程可行性的原因之一。

## 看 Manifest 页面时最应该形成什么判断框架
读这一页时，建议形成下面这条固定链路：

1. 先看当前 snapshot 指向哪份 manifest list。
2. 再看 manifest list 的摘要能否提前排除大量 manifest。
3. 再看命中的 manifest 是 data 还是 delete，分别承载什么语义。
4. 最后才进入具体 data file 级别的扫描。

只要把 manifest 放回“版本入口之后、文件读取之前”的位置，你对 Iceberg 规划模型的理解就会明显比只背术语更扎实。


### 观察 planning 成本时真正该盯什么
当某张 Iceberg 表 planning 明显变慢时，建议先看 manifest 数量、manifest list 的裁剪效果以及常见过滤条件是否真的命中 partition summaries。因为 Iceberg 规划性能的关键优势，本来就来自“先通过 metadata 粗剪，再决定读哪些文件”。如果 metadata 这一层已经失去筛选能力，后面的执行引擎再强，也只能接收一个先天膨胀的扫描输入。

