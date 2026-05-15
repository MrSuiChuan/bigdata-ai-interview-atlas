---
id: q-bigdata-iceberg-0032
title: 对象存储里已经有新文件但查询看不到数据时，为什么先查 snapshot 和 metadata，而不是先扫目录
domain: bigdata
component: iceberg
topic: metadata-snapshots
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Iceberg latest docs and spec as verified on 2026-04-24"
last_verified_at: "2026-04-24"
source_ids:
  - iceberg-reliability
  - iceberg-spec
claim_ids:
  - iceberg-claim-0012
  - iceberg-claim-0013
  - iceberg-claim-0021
  - iceberg-claim-0025
related_docs:
  - bigdata/iceberg/metadata-and-snapshots
  - bigdata/iceberg/metadata-json-snapshot-log-and-point-in-time-resolution
estimated_minutes: 7
---

# 题目

对象存储里已经有新文件但查询看不到数据时，为什么先查 snapshot 和 metadata，而不是先扫目录？

# 一句话结论

因为 Iceberg 的读路径看的是当前 metadata 指向的有效 snapshot，而不是对象存储里此刻恰好能扫到哪些文件；文件存在不等于它已经进入当前表状态。

# 核心机制

1. 读者是从有效 snapshot 规划读取，而不是从可变目录视图规划读取。
2. 每次 commit 都要通过新的 metadata file 和 atomic metadata swap 才能发布新状态。
3. snapshot 下面还要经过 manifest list 和 manifests，文件必须进入这条链才算当前版本的一部分。

# 标准答案

这类问题最容易掉进“文件都在对象存储上了，为什么还查不到”的直觉陷阱。Iceberg 的关键边界在于：读者不是按目录 listing 读取表，而是按当前 metadata 指向的有效 snapshot 去规划读取。writer 即使已经把 data file 写出来，只要新的 metadata file 还没有通过 atomic metadata swap 成为当前状态，这批文件就还没有正式进入当前可见表版本。进一步看，snapshot 下面还要通过 manifest list 和 manifests 才能把文件纳入当前版本链路。因此排障顺序应该先看 current snapshot、snapshot-log、metadata-log 和对应 manifests，而不是先去扫对象存储目录。更准确地说，这题的根因判断应该围绕“新文件是否已经进入当前 snapshot 引用链”，而不是围绕“物理文件是否已经落盘”。

# 必答点

1. Iceberg 读取的是当前有效 snapshot，不是 live directory listing。
2. 文件落盘不等于版本已发布。
3. 要确认文件是否已经进入 snapshot -> manifest list -> manifest 这条链。

# 加分点

1. 能顺带提到 snapshot-log 和 metadata-log 分别帮助判断表头切换与 metadata 换代。
2. 能说明这种模型正是 Iceberg 在对象存储上保持一致读的基础。

# 常见误答

1. 认为只要对象存储里有文件，Iceberg 查询就应该马上能看到。
2. 只去查目录和文件时间，不看当前 metadata 指针与 snapshot 状态。

# 追问

1. 为什么说 current-snapshot-id 比目录列表更接近真相来源？
2. 如果 snapshot 已经存在，但文件仍然读不到，还该继续看哪一层 metadata？
