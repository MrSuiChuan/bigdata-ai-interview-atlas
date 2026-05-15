---
kb_id: bigdata/flink/release-quality-guide
title: Flink 发布质量与校验清单
description: 解释 Flink 发布质量与校验清单的核心对象、执行链路、状态边界、性能模型和生产排障方法。
domain: bigdata
component: flink
topic: release-quality-guide
difficulty: advanced
status: reviewed
sidebar_position: 90
version_scope: 发布级知识指南，基于已登记来源在 2026-04-29 的整理
last_verified_at: '2026-04-29'
source_ids:
  - flink-docs-home
  - flink-working-with-state
  - flink-checkpointing
  - flink-generating-watermarks
  - flink-task-failure-recovery
  - flink-stateful-stream-processing
  - flink-timely-stream-processing
  - flink-checkpointing-under-backpressure
claim_ids:
  - flink-claim-0001
  - flink-claim-0002
  - flink-claim-0003
  - flink-claim-0004
  - flink-claim-0005
  - flink-claim-0006
  - flink-claim-0007
  - flink-claim-0008
  - flink-claim-0009
  - flink-claim-0010
tags:
  - flink
  - quality
  - knowledge
  - knowledge-base
  - production
---

## 这页不是入门介绍
它用于上线前检查 Flink 作业是否具备发布级质量。前面的页面讲机制，这一页把机制收束成可执行核验清单。

## 发布前必须确认的链路
```mermaid
flowchart LR
  Source["Source 可回放"] --> State["State 可恢复"]
  State --> Checkpoint["Checkpoint 稳定"]
  Checkpoint --> Sink["Sink 可提交 / 幂等"]
  Sink --> Observe["指标与日志可观测"]
```

## 状态与恢复
- keyed state 的 key 分布是否均匀。
- 最大并行度是否满足后续扩缩容。
- state backend 是否匹配状态规模。
- checkpoint 是否能稳定完成。
- savepoint 恢复是否依赖手工 uid。

## 时间语义
- event time 字段是否来自业务事件。
- watermark 策略是否适配乱序程度。
- idle partition 是否会阻塞 watermark。
- allowed lateness 是否符合业务补算要求。

## 端到端一致性
- source 是否能回放。
- sink 是否参与 checkpoint 或具备幂等。
- 外部系统是否会在重试后产生重复副作用。
- exactly-once 只在 Flink 内部成立，还是已经覆盖 source 到 sink。

## 性能与排障
- backPressured、busy、idle 三类指标是否接入。
- checkpoint duration、alignment time、state size 是否有告警。
- watermark lag 是否有趋势图。
- source 和 sink 的吞吐、延迟、错误率是否可观测。

## 升级与变更
- stateful operator 是否显式设置 uid。
- savepoint 格式是否适合跨 backend 或快速恢复。
- schema evolution 是否在支持范围内。
- TTL 变更是否会影响历史状态保留。

## 发布结论模板
```text
结论：允许发布 / 暂缓发布
主要风险：
回滚方式：
需要观察的指标：
恢复入口：
```

## 暂缓发布的典型信号
- checkpoint 偶发成功但没有稳定完成窗口。
- watermark 长期不推进，窗口结果依赖人工补偿。
- sink 没有幂等或事务能力，但业务要求端到端去重。
- stateful operator 没有显式 uid，升级恢复风险高。
- 大状态作业没有做过 savepoint 恢复演练。

## 上线后观察窗口
上线后第一阶段重点看 checkpoint、backpressure、watermark lag、state size 和 sink error。第二阶段再看业务结果是否延迟、重复或缺失。不要只看作业状态是 RUNNING 就认为发布成功。

## 变更记录建议
每次发布至少记录：作业版本、Flink 版本、并行度、最大并行度、state backend、checkpoint 配置、source/sink 版本、savepoint 路径和回滚命令。

## 来源与事实边界
本页只依赖当前知识库登记的官方 source 和 claim。发布检查是基于官方机制形成的工程清单，具体阈值必须结合实际集群基线制定。

### 来源

`flink-docs-home`、`flink-working-with-state`、`flink-checkpointing`、`flink-generating-watermarks`、`flink-task-failure-recovery`、`flink-stateful-stream-processing`、`flink-timely-stream-processing`、`flink-checkpointing-under-backpressure`

### 事实声明

`flink-claim-0001`、`flink-claim-0002`、`flink-claim-0003`、`flink-claim-0004`、`flink-claim-0005`、`flink-claim-0006`、`flink-claim-0007`、`flink-claim-0008`、`flink-claim-0009`、`flink-claim-0010`
