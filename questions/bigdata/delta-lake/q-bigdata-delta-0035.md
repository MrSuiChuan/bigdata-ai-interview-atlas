---
id: q-bigdata-delta-0035
title: Delta 表突然“历史读不回去了”，你会怎么快速判断是文件保留问题还是日志保留问题？
domain: bigdata
component: delta-lake
topic: fault-recovery
question_type: failure
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-utility
  - delta-lake-table-properties
  - delta-lake-streaming
claim_ids:
  - bigdata-delta-claim-0012
  - bigdata-delta-claim-0017
  - bigdata-delta-claim-0036
related_docs:
  - bigdata/delta-lake/fault-recovery
estimated_minutes: 9
---

# 题目

Delta 表突然“历史读不回去了”，你会怎么快速判断是文件保留问题还是日志保留问题？

# 标准答案

这类题最关键的是先把恢复条件拆成两段，而不是笼统说“历史被清理了”。Delta 想成功读回旧版本，至少要同时满足两个条件：目标版本的日志仍可解析，且该版本引用的旧文件仍然存在。所以第一步要先区分，问题到底出在日志线还是文件线。

如果是日志保留问题，典型表现是相关版本历史已经无法继续解析，或者流式 source 因日志历史被清掉而只能从最新可用提交继续。如果是文件保留问题，则可能还能定位到历史版本，但读取该版本时发现其引用的数据文件已被 `VACUUM` 或其他清理动作移除。

实际排查时，先看 `DESCRIBE HISTORY` 和表属性，再看 `_delta_log` 是否仍保有目标版本所需历史，然后检查 deleted-file retention 和最近的 `VACUUM` 记录。成熟的回答不是一句“保留期不够”，而是能明确分出“版本解析链断了”还是“版本解析还在，但数据文件没了”。

# 必答点

1. 说明历史恢复同时依赖日志保留和旧文件保留。
2. 说明日志线和文件线是两类不同问题。
3. 说明排查要看 history、tblproperties、_delta_log 和最近清理动作。
4. 说明流式恢复还会受日志保留影响。

# 加分点

1. 能顺带提到 `deletedFileRetentionDuration` 和 `setTransactionRetentionDuration` 关注点不同。
2. 能说明日志还在但文件没了，与文件还在但版本链断了，恢复策略完全不同。

# 常见误答

1. 一上来就说“被 VACUUM 了”，不区分日志还是文件。
2. 认为只要版本号存在就一定能读回。
3. 不知道慢流恢复也受日志保留约束。

# 追问

1. 为什么 time travel 不是无限历史能力？
2. 如果要保护暂停流作业，保留策略应该优先看什么？
3. 日志保留和 `VACUUM` 为什么必须一起设计？