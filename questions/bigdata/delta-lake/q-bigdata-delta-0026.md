---
id: q-bigdata-delta-0026
title: 如果核心对象讲不清，设计 Delta 系统时最容易出现哪些误判？
domain: bigdata
component: delta-lake
topic: core-objects-state
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-protocol
  - delta-lake-utility
claim_ids:
  - bigdata-delta-claim-0003
  - bigdata-delta-claim-0006
  - bigdata-delta-claim-0024
related_docs:
  - bigdata/delta-lake/core-objects-state
estimated_minutes: 9
---

# 题目

如果核心对象讲不清，设计 Delta 系统时最容易出现哪些误判？

# 标准答案

最常见的误判有三类。第一类，把目录下的 Parquet 文件误当成表真相来源，于是会高估“文件已经落盘”的意义，低估 `_delta_log` 和 snapshot 的裁决权。第二类，把 remove、tombstone 和物理删除混成一件事，于是会误以为“表里删了就等于文件马上没了”，进而误设计恢复和 VACUUM。第三类，把 deletion vectors、row tracking、protocol 这些状态对象忽略掉，于是会误以为“快照就是文件列表”，导致兼容性、恢复和行级变更语义都答偏。

更本质地说，核心对象讲不清，会让你在设计时错误判断状态归属：不知道哪些状态是表协议层的、哪些是物理文件层的、哪些是兼容性层的。只要状态归属一混，后面的分区、恢复、流、DML、治理全都会跟着偏。

# 必答点

1. 至少指出三类常见误判。
2. 说明这些误判都源于状态归属混乱。
3. 说明 `_delta_log`、snapshot、remove / tombstone、protocol 这些对象不能混讲。
4. 说明误判会直接影响恢复、兼容性和运维设计。

# 加分点

1. 能说明为何 deletion vectors 会进一步放大对象模型的重要性。
2. 能把“逻辑删除不等于物理删除”讲到恢复和 retention 上。

# 常见误答

1. 只会罗列对象名，不会说错了会带来什么后果。
2. 认为 snapshot 就是当前文件清单。
3. 完全不提 protocol / feature 对设计的影响。

# 追问

1. 如果把 remove 当物理删除，会在哪些恢复题里答错？
2. 为什么说 protocol 也是核心对象之一，而不是附属配置？
3. DV 和 row tracking 为什么会让“文件即真相”的思路彻底站不住？