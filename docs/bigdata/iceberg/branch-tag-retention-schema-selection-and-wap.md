---
kb_id: bigdata/iceberg/branch-tag-retention-schema-selection-and-wap
title: Iceberg Branch、Tag 与 Time Travel
description: 解释 Iceberg Branch、Tag 与 Time Travel中的权限、资源、隔离、审计和多租户边界，并给出生产治理判断路径。
domain: bigdata
component: iceberg
topic: branch-governance
difficulty: advanced
status: reviewed
sidebar_position: 12
version_scope: Iceberg latest docs and spec as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - iceberg-branching-and-tagging
  - iceberg-spec
  - iceberg-spark-writes
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
claim_ids:
  - iceberg-claim-0056
  - iceberg-claim-0057
  - iceberg-claim-0058
  - iceberg-claim-0059
  - iceberg-claim-0060
  - iceberg-claim-0061
  - iceberg-claim-0062
  - iceberg-claim-0063
  - iceberg-claim-0064
  - iceberg-claim-0065
tags:
  - iceberg
  - branch
  - tag
  - wap
  - retention
  - knowledge-base
  - production
---
## 这一页讨论的是 Branch/Tag 的细粒度运行边界
上一页讲的是 branch、tag 与 time travel 的基本定位；这一页要进一步回答几个在系统设计中经常继续展开的问题：分支和标签默认保留多久、主分支会不会过期、查询某个 branch 或 tag 时到底使用哪份 schema、WAP 分支写入与显式 branch 标识能不能混用。

## Branch 会前进，Tag 会停在原地
Iceberg 明确规定，branch 是可变的命名引用，随着新 snapshot 提交会继续向前移动；tag 则是给特定 snapshot 打上的命名标签。这个差别会直接影响 retention 与查询语义。

因为 branch 代表的是一条还在演化的线，所以它会关心“至少保留多少祖先 snapshots”“允许多老的 snapshot 继续留在线上”；而 tag 更多是在表达“请把这个点记住”。

## 默认保留策略是什么，main 又为什么特殊
Iceberg 的默认 retention 策略是：branches 和 tags 默认永久保留。同时，main 分支永不过期。

这里要特别理解 main 的特殊性。main 不是普通引用之一，它承载的是表的默认当前主线，因此规范明确规定 `max-ref-age-ms` 这类引用过期策略不适用于 main。换句话说，你可以管理其他引用的生存期，但不能把主分支当成一个会自然蒸发掉的普通临时引用。

## 引用保留策略具体可以控制什么
对于分支引用，Iceberg 支持 `min-snapshots-to-keep` 与 `max-snapshot-age-ms`；对于 snapshot references，还支持 `max-ref-age-ms`。这些策略共同决定：某条 branch 至少要带着多少祖先 snapshot 继续活着、一个引用本身允许保留多久。

更重要的是理解它们在 snapshot expiration 中如何生效。规范指出，过期流程会先移除已经过期的 refs（main 除外），然后保留仍被有效 refs 指向的 snapshots，并且为每个 branch 至少保留满足其策略要求的祖先链，其他不再需要的 snapshots 才进入过期范围。

这说明 snapshot expiration 不是“只看年龄直接删”，而是要把 branch/tag 的引用关系一起计算进去。

## 查询 branch 和查询 tag 时，Schema 为什么不完全一样
Iceberg 这里有一条非常值得单独记住的边界：查询 branch 头时，使用的是当前 table schema；查询 tag 时，使用的是该 tag 指向 snapshot 创建时的 schema。

这背后反映的是两种引用的不同角色：

- branch 代表一条持续演进的版本线，因此它和当前表级 schema 共同演进。
- tag 代表对某个历史版本点的命名引用，因此它更强调保留该时间点的视角。

这也是为什么当你分析“为什么同一张表查 branch 与查 tag 的列解释不完全一样”时，不能只盯着 SQL，而要回到引用类型本身。

## 为什么写 branch 时仍然验证当前 table schema
虽然 branch 可以承载独立的版本线，但向 branch 写入时，数据仍然要针对当前 table schema 做验证，而不是使用某种完全隔离的 branch-only schema。这个规则很关键，因为它说明 branch 不是“平行宇宙里的另一张表”，而是同一张表在 metadata 中分出的另一条引用线。

因此，branch 为你提供的是版本流隔离，不是 schema 语义彻底分叉。

## Branch 必须先存在，WAP 也有自己的使用边界
Iceberg 明确要求：branch 必须先创建好，写入时不会自动创建缺失分支。除此之外，`spark.wap.branch` 指定的 WAP 分支，不能再和目标表名中的显式 branch identifier 同时使用。

这条限制的意义在于避免“到底往哪个 branch 写”出现双重声明。既然 WAP branch 已经通过配置给出，目标表名里就不应再叠加另一个显式 branch，否则引用目标会变得含混。

## 这一页最适合用来澄清哪些深层边界
如果系统设计或表治理讨论继续追到下面这些问题，这一页的内容就很关键：

- 为什么 main 永不过期，而别的 refs 可以有年龄策略。
- Snapshot expiration 为什么不能脱离 branch/tag retention 单独理解。
- 查询 branch 和查询 tag 时，schema 选择为什么不一样。
- 为什么 branch 写入不是在使用完全独立的 schema 世界。
- 为什么 `spark.wap.branch` 不能和显式 branch 目标同时出现。

把这些边界吃透之后，你对 Iceberg 分支治理的理解就不只是“知道有 branch 和 tag”，而是能真正说明它们如何影响清理、读取和写入语义。


### 一个最小核对样例
如果你要核对某个发布流程是不是还停留在审计分支，最稳的做法不是先看目录，而是先看自己读的是哪条引用线，再看该引用线是否已经推进。下面这个最小样例强调的就是“默认读 main，不等于读到 audit branch”。

```yaml
ref_check:
  default_read_ref: main
  write_target_ref: audit_branch
  branch_exists: true
  audit_branch_advanced: true
  main_advanced: false
  expected_default_visibility: unchanged
```

只要这个判断成立，就说明“文件写到了审计分支，但默认读者还没看到”是一个正常版本治理结果，而不是读取异常。

