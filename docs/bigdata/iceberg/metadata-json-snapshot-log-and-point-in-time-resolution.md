---
kb_id: bigdata/iceberg/metadata-json-snapshot-log-and-point-in-time-resolution
title: Iceberg Metadata History
description: 解释 Iceberg Metadata History中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: iceberg
topic: metadata-history
difficulty: advanced
status: reviewed
sidebar_position: 11
version_scope: Iceberg latest docs and spec as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - iceberg-spec
  - iceberg-docs-home
  - iceberg-reliability
  - iceberg-maintenance
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
claim_ids:
  - iceberg-claim-0049
  - iceberg-claim-0050
  - iceberg-claim-0051
  - iceberg-claim-0052
  - iceberg-claim-0053
  - iceberg-claim-0054
  - iceberg-claim-0055
  - iceberg-claim-0001
  - iceberg-claim-0002
  - iceberg-claim-0003
tags:
  - iceberg
  - metadata
  - snapshot-log
  - refs
  - knowledge-base
  - production
---
## Metadata JSON 是 Iceberg 表状态的总账本
很多团队会把 metadata file 理解成“附带的一点表描述信息”，这会直接低估它的重要性。对 Iceberg 来说，metadata JSON 才是整张表的总账本。Schema、partition specs、sort orders、snapshots、snapshot-log、metadata-log、refs、default-sort-order-id 等关键对象都在这里登记，读者和写者都是围绕这份账本理解当前表状态。

因此，只要问题涉及“现在这张表到底处于哪个版本”“某次提交之后为什么当前表头变化了”“为什么旧文件还不能删”，最先该查的就不是对象存储目录，而是 metadata JSON 的内容。

## current-snapshot-id 回答的是“主分支现在指向谁”
Iceberg 规范明确要求，`current-snapshot-id` 必须和主分支 `main` 指向的 snapshot 一致。换句话说，默认读表时看到的版本，就是主分支当前头指针所对应的 snapshot。

这条规则非常基础，却能帮你避免很多概念混淆：

- 它说明“当前表版本”不是抽象概念，而是 metadata 中一个明确可追踪的字段。
- 它说明 branch/tag 存在时，默认读路径依然围绕 main 展开。
- 它也说明只要 current-snapshot-id 变化了，主分支可见状态就已经变化。

## snapshots 列表为什么是“有效历史”的边界
Metadata JSON 里的 `snapshots` 列表保存的是当前仍然有效的 snapshots。这个“有效”非常关键，因为它不仅影响查询能不能回到过去某个版本，还直接影响底层文件能不能被删除。

Iceberg 规定：只要还有某个有效 snapshot 引用了某个 data file，就不能把这个文件删除。也就是说，文件回收不是看“现在主分支还用不用”，而是看“最后一个仍然有效的 snapshot 是否已经被垃圾回收”。这正是时间旅行与文件生命周期能并存的基础。

## snapshot-log 记录的是“表头何时切换”
每当 `current-snapshot-id` 发生变化，Iceberg 应该在 `snapshot-log` 中追加一条记录，写明变化发生的时间和新的 snapshot ID。这个日志回答的问题不是“有哪些 snapshot 存在过”，而是“当前表头是按什么时间顺序切换过来的”。

因此，如果你要分析：某次提交是在什么时候把表头推进到某个版本的，应该优先看 snapshot-log，而不是只盯着 snapshot 的 parent-child 关系。

## metadata-log 记录的是“元数据文件如何换代”
与 snapshot-log 不同，`metadata-log` 关注的是 metadata file 本身的迭代。每当生成新的 metadata file，都应该追加一条 metadata-log 记录，包含变更时间以及上一版 metadata file 的位置。

这个日志在两类场景里特别有价值：

- 需要追踪 metadata 文件版本链，确认某次表头切换到底换成了哪份具体 metadata。
- 需要排查 metadata 保留、清理与孤儿 metadata 文件问题时，确认哪些旧版本仍然被追踪。

换句话说，snapshot-log 更偏向“表版本切换史”，metadata-log 更偏向“账本文件换代史”。两者相关，但不等价。

## 为什么按时间点回溯不能偷懒看 lineage 顺序
Iceberg 规范明确指出：按时间戳做 time travel 时，应当使用 snapshot-log，而不是假设 parent-child lineage 天然等于可靠时钟顺序。这个提醒非常重要，因为很多人会把快照父子关系误当成“提交时间线”。

更准确的理解是：lineage 说明的是版本演化依赖关系，snapshot-log 说明的是 current-snapshot-id 实际按什么时间发生切换。二者在很多简单场景下看起来接近，但在做按时间点解析时，规范让你信任的是 snapshot-log。

## refs 为什么让时间旅行和命名引用更清晰
Metadata JSON 中的 `refs` 保存的是有效 snapshot references，例如 branches 和 tags。即使 `refs` 为空，主分支 `main` 也并不会消失，因为它可以由 current-snapshot-id 隐式推出。

这条规则有助于建立一个稳定心智模型：

- main 是默认存在的当前主线。
- refs 是对额外命名引用的显式记录。
- branch/tag 的存在不会替代 current-snapshot-id 对当前主线的描述。

因此，分析某张表的时间旅行入口时，要先区分：你是在沿着 main 的当前时间线看，还是在显式引用某个 tag / branch 的命名版本。

## 读这一页时要形成的排障顺序
当你面对“当前版本不对”“某个历史版本回不去”“旧文件为什么还没删”“为什么 timestamp travel 落到意外版本”这类问题时，建议固定按下面顺序看：

1. 看 current-snapshot-id，确认当前主分支表头。
2. 看 snapshots，确认目标 snapshot 是否仍属于有效历史。
3. 看 snapshot-log，确认表头是在什么时间切过去的。
4. 看 metadata-log，确认 metadata file 是怎样换代的。
5. 看 refs，确认是否存在 branch 或 tag 改变了你理解版本的入口。

只要把 metadata JSON 当成真正的表状态账本，而不是“配置附件”，你对 Iceberg 版本管理的理解就会稳很多。


### 一个最小版本核对样例
实际排障时，建议把 current-snapshot-id、snapshot-log 和 refs 放在一起看，而不是分开猜。下面这个简化样例展示的是“主分支当前头、最近一次表头切换以及命名引用”如何共同描述一张表的版本入口。

```json
{
  "current-snapshot-id": 91042,
  "snapshot-log": [
    { "snapshot-id": 91011, "timestamp-ms": 1770000000000 },
    { "snapshot-id": 91042, "timestamp-ms": 1770003600000 }
  ],
  "refs": {
    "audit_branch": { "snapshot-id": 91040 },
    "release_tag_2026q2": { "snapshot-id": 91011 }
  }
}
```

这个例子要表达的重点不是字段格式，而是核对顺序：先看默认主线 current-snapshot-id，再看按时间推进的 snapshot-log，最后看 branch 或 tag 是否提供了另一条命名入口。

