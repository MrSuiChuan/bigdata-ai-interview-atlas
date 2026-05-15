---
id: q-bigdata-delta-0032
title: 为什么说 Delta 流式读取真正消费的是提交序列，而不是“新文件目录”？
domain: bigdata
component: delta-lake
topic: streaming-and-cdf
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-streaming
  - delta-lake-cdf
  - delta-lake-batch
claim_ids:
  - bigdata-delta-claim-0014
  - bigdata-delta-claim-0016
  - bigdata-delta-claim-0017
  - bigdata-delta-claim-0018
related_docs:
  - bigdata/delta-lake/streaming-and-cdf
estimated_minutes: 10
---

# 题目

为什么说 Delta 流式读取真正消费的是提交序列，而不是“新文件目录”？

# 标准答案

因为 Delta 的流式 source 不是按对象存储目录去盲扫“最近新文件”，而是沿着事务日志里的提交序列推进。官方 streaming 文档说明，流式读取会先处理当前表的全量快照，然后再处理新的提交；即便指定 `startingVersion` 或 `startingTimestamp`，读取时使用的 Schema 仍然是当前最新表 Schema。这说明 Delta 流处理的核心不是文件时间戳，而是版本历史。

这条机制的价值有两个。第一，它让批流围绕同一份表状态工作，而不是各自理解目录；第二，它让慢消费者风险变得可以被明确描述。官方文档明确指出，如果流滞后过久，相关日志被 retention 清掉，读取可能从最新可用历史继续，从而跳过中间提交。也就是说，慢流风险不是“晚点追上就好”，而是真可能掉历史。

如果题目再追问增量消费，就要引出 CDF。CDF 不是自己做快照 diff，而是让表把行级 insert、update、delete 变化结构化暴露出来。但它同样受保留窗口影响，也不是无限历史。

# 必答点

1. 说明流式 source 沿提交序列推进，而不是扫新文件目录。
2. 说明会先吃当前快照，再继续增量提交。
3. 说明慢消费者可能因日志清理而丢历史。
4. 说明 CDF 解决的是结构化增量变化语义。

# 加分点

1. 能补一句“foreachBatch 默认不是幂等，要配合 `txnAppId` / `txnVersion`”。
2. 能补一句“Schema 变更会影响活跃流读者，需要重启”。

# 常见误答

1. 认为 Delta 流就是轮询目录看新文件。
2. 认为指定 `startingVersion` 后读取 Schema 也会回到那个旧版本。
3. 以为 CDF 和保留策略无关。

# 追问

1. 为什么说 retention 是流稳定性的组成部分？
2. CDF 和直接读最新快照的本质差异是什么？
3. 如果流暂停很久再恢复，你先查哪几类证据？