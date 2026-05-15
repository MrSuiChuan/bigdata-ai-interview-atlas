---
kb_id: bigdata/flink/custom-source-split-enumerator-reader-and-source-side-time-semantics
title: Flink 自定义 Source、SplitEnumerator 与 SourceReader
description: 解释 Flink FLIP-27 Source API 的核心对象、分片分配和 source 侧时间语义边界。
domain: bigdata
component: flink
topic: custom-source-split-enumerator-reader-source-time-semantics
difficulty: advanced
status: reviewed
sidebar_position: 23
version_scope: Flink 2.2 stable docs as verified on 2026-05-07
last_verified_at: '2026-05-07'
source_ids:
  - flink-data-sources
  - flink-docs-home
claim_ids:
  - flink-claim-0132
  - flink-claim-0133
tags:
  - flink
  - source
  - split
  - splitenumerator
  - sourcereader
  - watermark
  - knowledge-base
---

## 先把 Source 想成三段分工
FLIP-27 之后，Flink 的 Source 不再只是一个“能读数据的类”，而是把职责拆成：

| 组件 | 负责什么 |
| --- | --- |
| Split | 最小工作单元 |
| SplitEnumerator | 生成并分配 split |
| SourceReader | 真正读取 split 并产出记录 |

这套分工的价值，是把“怎么切工作”和“怎么读数据”明确分离开。

## Split 为什么关键
Split 不是简单的分片名词，它决定 source 的并行度粒度和恢复粒度。  
文件 source 里，一个 split 可以是一段文件；日志或消息系统里，一个 split 可以是 partition。

如果 split 设计太粗，会影响并行度和恢复灵活性；如果设计太细，又会增加枚举和调度成本。

## SplitEnumerator 真正解决什么
Enumerator 的职责不是“多发点任务”，而是把 source 的工作全局编排出来。

它要解决的问题包括：
- 当前有哪些 split。
- 哪些 split 还没人读。
- 动态发现新 split 时如何分配。
- 失败恢复后如何重新接管。

## SourceReader 是执行面
SourceReader 跑在 TaskManager 上，真正去消费 split，并把记录写入 Flink 的并行数据流。

因此 SourceReader 更像 source 的执行面，而 SplitEnumerator 更像 source 的控制面。

## source 侧时间语义为什么重要
官方文档明确把 event time 和 watermark 生成放到 source 侧。  
这意味着 source 不只是“吐记录”，它还承担了时间语义入口。

越靠近 source，越能利用 split / partition 信息生成更真实的 watermark；越晚补 watermarks，越可能丢失源头分片结构。

## 最容易写错的地方
- 把 split 设计得和恢复边界不匹配。
- 让 Reader 承担本该由 Enumerator 负责的全局分配逻辑。
- source 已经知道分区结构，却把 watermark 放到后面粗暴补。

### 来源

`flink-data-sources`、`flink-docs-home`

### 事实声明

`flink-claim-0132`、`flink-claim-0133`
