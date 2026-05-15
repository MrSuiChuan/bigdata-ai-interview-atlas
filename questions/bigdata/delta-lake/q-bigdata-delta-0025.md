---
id: q-bigdata-delta-0025
title: Delta 的可观测性为什么要按“指标、日志、计划、表状态”四层组织，而不是只看一个地方？
domain: bigdata
component: delta-lake
topic: observability
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-utility
  - delta-lake-protocol
  - delta-lake-table-properties
claim_ids:
  - bigdata-delta-claim-0011
  - bigdata-delta-claim-0012
  - bigdata-delta-claim-0028
related_docs:
  - bigdata/delta-lake/observability
estimated_minutes: 8
---

# 题目

Delta 的可观测性为什么要按“指标、日志、计划、表状态”四层组织，而不是只看一个地方？

# 标准答案

因为单一证据面通常只能解释症状，解释不了因果。指标能告诉你“最近变慢了、滞后了、文件变多了”；日志能告诉你“最近发生了什么提交、清理、恢复或冲突”；执行计划能告诉你“这次查询到底有没有做裁剪、是不是读放大”；表状态能告诉你“协议、保留、feature、snapshot 本身当前是什么样”。这四层合起来，才能把“为什么发生”说清。

如果只看一层，很容易误判。只看指标，会知道慢了但不知道是不是 restore、vacuum、layout 变化导致；只看日志，会知道有人做过 optimize，但不知道计划是否真的因此改善；只看执行计划，又可能忽略 retention 和 feature 变化。成熟的可观测性应该是这四层互相补位。

# 必答点

1. 说明单一证据面无法解释完整因果链。
2. 说明指标、日志、计划、表状态分别回答不同问题。
3. 说明 Delta 排障要把这四层串起来。
4. 说明 history / detail / _delta_log / explain 各有不同角色。

# 加分点

1. 能举出一个“只看一层会误判”的例子。
2. 能说明为什么表状态层是 Delta 区别于普通文件系统排障的关键。

# 常见误答

1. 只说“先看日志”。
2. 只看 Spark UI，不看 Delta 状态。
3. 只看 history，不看 _delta_log 和表属性。

# 追问

1. 哪一层最适合回答“最近谁动过这张表”？
2. 哪一层最适合回答“这次查询为什么没裁剪到文件”？
3. 为什么表状态层通常决定了排障第一步？