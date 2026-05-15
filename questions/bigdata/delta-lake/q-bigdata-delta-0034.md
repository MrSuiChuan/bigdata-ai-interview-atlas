---
id: q-bigdata-delta-0034
title: 如果一个 Delta 表同时服务批处理、流读取和 CDC，下游设计时最怕哪三类边界打架？
domain: bigdata
component: delta-lake
topic: system-design
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-streaming
  - delta-lake-cdf
  - delta-lake-update
  - delta-lake-versioning
claim_ids:
  - bigdata-delta-claim-0014
  - bigdata-delta-claim-0018
  - bigdata-delta-claim-0020
  - bigdata-delta-claim-0046
related_docs:
  - bigdata/delta-lake/system-design
estimated_minutes: 10
---

# 题目

如果一个 Delta 表同时服务批处理、流读取和 CDC，下游设计时最怕哪三类边界打架？

# 标准答案

这种题最容易拉开差距，因为它不再考单点功能，而是考你是否能把 Delta 的多条语义线放到同一张表上统一思考。最怕打架的通常有三类边界：

第一类是快照语义和增量语义打架。批处理往往关心“现在整张表长什么样”，而 CDC 或 CDF 消费者关心“这次到底哪些行变了”。如果设计上没有明确哪些下游读 snapshot、哪些下游读变化流，很容易出现有人自己做快照 diff、有人读 CDF、有人直接读最新表，最后三套口径互相不一致。

第二类是 Schema 演进和长跑流打架。表只要变更 Schema，流读取就可能中断并需要重启；如果还启用了 column mapping，非新增型 Schema 变化的兼容性要求更高。也就是说，一次看似简单的列变更，在批作业眼里只是改表，在流消费者眼里却可能是一次发布事故。

第三类是 DML / 恢复动作和下游幂等打架。`MERGE`、`DELETE`、`RESTORE` 这些操作都可能让下游重新看到变化；尤其 `RESTORE` 会以 `dataChange=true` 进入新提交，下游若没幂等，就会把恢复出的数据当成新业务数据再处理一次。

# 必答点

1. 说明 snapshot 读取和增量消费是两套不同语义。
2. 说明 Schema 演进会影响长跑流。
3. 说明 DML / restore 会和下游幂等直接耦合。
4. 说明系统设计时必须先划清下游消费模式。

# 加分点

1. 能顺带提到 retention 还会决定 CDC / 流的可回放窗口。
2. 能提到 merge 源端去重和下游幂等需要同时设计。

# 常见误答

1. 觉得一张表同时服务所有下游天然没问题。
2. 只谈批处理，不谈流和 CDC 的语义分裂。
3. 完全忽略 restore 这类控制面动作对下游的冲击。

# 追问

1. 哪些下游更适合直接读快照，哪些更适合读 CDF？
2. 为什么 Schema 变更在流场景里必须被当成发布事件？
3. 如果必须 restore，你会怎么保护下游不重复处理？