---
kb_id: blueprint/content-coverage-status
title: "内容覆盖统计"
domain: blueprint
component: project
topic: coverage
difficulty: intermediate
status: reviewed
sidebar_position: 5
version_scope: "Workspace content snapshot generated on 2026-05-07"
last_verified_at: "2026-05-07"
source_ids: []
claim_ids: []
---

# 说明

这页只跟踪覆盖规模和整理状态，不再把数量达标直接称为深度闭环。最终质量以人工精修、来源复核、Claim 质量和样例可用性为准。

# 状态口径

1. 数量达标：文档、题目、样例、Claim 数量达到阶段性门槛。
2. 基础达标：至少具备文档、题目和 Claim。
3. 待人工精修：存在批量生成或模板化痕迹，不能视为最终完成。
4. 需抽检复核：数量较完整，但仍需要按来源和内容深度抽检。
5. 专题整理中：AI Agent 和大模型专题仍在整理和融合。

# 当前总量

1. 文档：414
2. 题目：620
3. 样例：295
4. Claim：882

# 当前统计

| 方向 | 模块 | 文档 | 题目 | 样例 | Claim | 数量状态 | 质量状态 |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| 大数据 | clickhouse | 21 | 28 | 40 | 21 | 基础达标 | 待人工精修 |
| 大数据 | delta-lake | 21 | 28 | 40 | 21 | 基础达标 | 待人工精修 |
| 大数据 | flink | 25 | 28 | 13 | 124 | 数量达标 | 需抽检复核 |
| 大数据 | hbase | 21 | 28 | 20 | 21 | 基础达标 | 待人工精修 |
| 大数据 | hdfs | 21 | 28 | 20 | 21 | 基础达标 | 待人工精修 |
| 大数据 | hive | 23 | 31 | 16 | 150 | 数量达标 | 需抽检复核 |
| 大数据 | hudi | 21 | 28 | 40 | 21 | 基础达标 | 待人工精修 |
| 大数据 | iceberg | 21 | 29 | 12 | 120 | 数量达标 | 需抽检复核 |
| 大数据 | kafka | 40 | 40 | 14 | 120 | 数量达标 | 需抽检复核 |
| 大数据 | spark | 40 | 39 | 20 | 185 | 数量达标 | 需抽检复核 |
| 大数据 | trino | 21 | 28 | 40 | 21 | 基础达标 | 待人工精修 |
| 大数据 | yarn | 21 | 28 | 20 | 21 | 基础达标 | 待人工精修 |
| AI Agent | cases | 7 | 7 | 0 | 0 | 专题已入库 | 专题整理中 |
| AI Agent | foundations | 10 | 23 | 0 | 0 | 专题已入库 | 专题整理中 |
| AI Agent | frameworks | 20 | 28 | 0 | 0 | 专题已入库 | 专题整理中 |
| AI Agent | patterns | 43 | 78 | 0 | 0 | 专题已入库 | 专题整理中 |
| AI Agent | platforms | 7 | 42 | 0 | 0 | 专题已入库 | 专题整理中 |
| AI Agent | protocols | 10 | 10 | 0 | 0 | 专题已入库 | 专题整理中 |
| 大模型基础 | llm-foundations | 21 | 69 | 0 | 36 | 专题已入库 | 专题整理中 |

# 使用方式

```powershell
npm.cmd run report:coverage
```
