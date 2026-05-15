---
id: q-bigdata-iceberg-0005
title: Iceberg 的 metadata、snapshot、manifest 是如何协同工作的
domain: bigdata
component: iceberg
topic: metadata-snapshots
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-reliability
  - iceberg-spec
claim_ids:
  - iceberg-claim-0011
  - iceberg-claim-0012
  - iceberg-claim-0013
  - iceberg-claim-0020
  - iceberg-claim-0021
related_docs:
  - bigdata/iceberg/metadata-and-snapshots
  - bigdata/iceberg/manifests-and-planning
estimated_minutes: 8
---

# 题目

Iceberg 的 metadata、snapshot、manifest 是如何协同工作的？

# 一句话结论

table metadata 定义当前表状态入口，snapshot 定义可见版本，manifest list 和 manifest 最终把这个版本映射到具体 data file / delete file。

# 核心机制

1. 当前 metadata file 是表状态真相来源
2. snapshot 代表某个一致性版本
3. manifest list 与 manifest 把版本展开成实际文件集合

# 标准答案

Iceberg 的最上层是 table metadata file，它记录 schema、partition spec、sort order、snapshots 和 refs 等信息。当前可见版本由 snapshot 表示，每个 snapshot 指向一个 manifest list，manifest list 再指向一组 manifest，manifest 最终列出 data file 或 delete file。reader 并不是扫目录决定读哪些文件，而是从某个 snapshot 出发沿着这条元数据链找到具体文件集合，这就是一致性读、time travel 和 branch/tag 能成立的基础。

# 必答点

1. metadata -> snapshot -> manifest list -> manifest -> file 这条链
2. 读的是某个 snapshot，不是“当前目录”
3. manifest 既服务一致性，也服务 planning

# 加分点

1. 能把 `current-snapshot-id -> snapshot -> manifest list -> manifest -> file` 这条链完整串出来。
2. 能说明 metadata 比目录 listing 更适合作为真相来源。

# 常见误答

1. 把 metadata 理解成只存表结构
2. 只会说 snapshot 是历史版本，不知道 manifest 在其中的角色

# 追问

1. 为什么说这套结构让对象存储更友好？
2. manifest list 为什么不是多余的一层？