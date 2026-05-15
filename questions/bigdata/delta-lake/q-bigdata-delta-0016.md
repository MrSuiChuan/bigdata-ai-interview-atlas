---
id: q-bigdata-delta-0016
title: Delta 出问题时，为什么 first response 应该是拉证据链，而不是先猜原因？
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
  - bigdata-delta-claim-0036
related_docs:
  - bigdata/delta-lake/observability
estimated_minutes: 8
---

# 题目

Delta 出问题时，为什么 first response 应该是拉证据链，而不是先猜原因？

# 标准答案

因为 Delta 很多症状在表面上高度相似，但根因完全不同。比如“查不到历史数据”，可能是 `VACUUM` 提前清理，也可能是日志保留不够，还可能是根本没有 restore 到预期版本；“流掉数据”可能是 retention 过短，也可能是 checkpoint 和应用幂等没对齐。如果没有证据链，只凭异常名或现象去猜，很容易头痛医头。

Delta 最关键的证据面通常有四类：`DESCRIBE HISTORY` 看最近发生过什么操作；`DESCRIBE DETAIL` 和表属性看当前协议、路径、保留和 feature 状态；`_delta_log` 看真实提交动作；执行计划和作业日志看问题到底落在表层还是引擎层。先把这几层串起来，通常就能把问题从“模糊症状”压缩成“具体边界异常”。

所以成熟的回答不只是“看日志”，而是知道该按什么顺序把证据拼起来，先证明状态变了什么，再解释为什么业务或查询会受影响。

# 必答点

1. 说明相似症状背后可能有完全不同根因。
2. 说明 history、detail、_delta_log、执行日志是四类核心证据面。
3. 说明应先判断表状态，再判断执行表现。
4. 说明排障必须是可复核的证据链，而不是凭经验拍脑袋。

# 加分点

1. 能举一例“同一现象但根因不同”的排障对比。
2. 能提到趋势指标，例如文件数、优化频率、流滞后时间。

# 常见误答

1. 只说“先看 Spark UI”或“先看对象存储目录”。
2. 把 `DESCRIBE HISTORY` 误当成全部真相。
3. 完全不看表属性和 retention 设置。

# 追问

1. 如果线上说“Delta 表突然读不到历史版本”，你第一批要收集哪些证据？
2. 为什么说 `_delta_log` 才是最终裁决者？
3. 表层和执行层的问题，在证据上通常有什么区别？