---
kb_id: bigdata/kafka/log-cleaner-compaction-tombstone-deep-dive
title: Kafka Log Cleaner、Compaction Lag 与 Tombstone 深入解析
description: 深入解释 compacted topic 中 cleaner 如何重写 segment、保留最新 key、处理 tombstone 和 compaction lag。
domain: bigdata
component: kafka
topic: log-cleaner-deep-dive
difficulty: expert
status: reviewed
sidebar_position: 34
version_scope: Kafka 4.2 docs as verified on 2026-04-26
last_verified_at: "2026-04-26"
source_ids:
  - kafka-design-doc
  - kafka-topic-configs
claim_ids:
  - kafka-claim-0009
  - kafka-claim-0064
  - kafka-claim-0065
  - kafka-claim-0066
  - kafka-claim-0067
  - kafka-claim-0068
tags:
  - kafka
  - log-cleaner
  - compaction
  - tombstone
  - state-recovery
  - knowledge-base
---
## Log Cleaner、Compaction Lag 与 Tombstone 深入解析

Log cleaner 是 compacted topic 背后的后台机制。它不是实时逐条删除，而是在后台选择 dirty segment，复制仍需保留的记录，丢弃同 key 的旧版本，并在 tombstone 保留窗口后清理删除标记。

compaction 只能保证恢复时至少看到每个 key 的最终状态，不能保证看到每一次中间状态。offset 不会被重新编号，所以 compacted log 里出现 offset gap 是正常结果。

## 关键对象和状态归属

| 对象 | 作用 | 关键边界 |
| --- | --- | --- |
| Dirty Segment | 有待清理的日志段 | cleaner 选择工作对象 |
| Cleaner Thread | 后台复制和清理 segment 的线程 | 可被限流以降低对读写影响 |
| Key Map | 用于判断每个 key 最新位置的内存结构 | key 数量和 segment 大小影响 cleaner 压力 |
| Tombstone Window | delete.retention.ms 控制的删除标记可见窗口 | 影响新消费者是否能观察删除 |
| Compaction Lag | min/max compaction lag 控制进入清理的时间边界 | 平衡恢复及时性和 IO 成本 |

## Cleaner 重写一个 compacted segment 的过程

1. 后台线程扫描 compacted topic 的 dirty ratio。
2. 选择候选 segment 并构建 key 最新位置。
3. 复制仍需保留的记录到新 segment。
4. 丢弃被更新覆盖的旧 key 版本。
5. 保留或清理 tombstone 取决于 delete retention 窗口。
6. 替换 segment 列表，读取继续通过一致视图进行。

## 核心机制拆解

- log compaction 保留顺序和 offset，不改变剩余记录的位置语义。
- tombstone 是 key 删除的唯一可靠信号，窗口过后新消费者可能再也看不到删除事件。
- cleaner 不阻塞正常读取，但大量清理会争用磁盘 IO。

## 性能和容量观察

- dirty ratio 长期升高说明 cleaner 追不上写入。
- key 基数大、value 大、segment 大都会增加 cleaner 工作量。
- cleaner 过度限流会导致磁盘增长，限流不足会影响前台读写。

## 生产排障入口

- 状态恢复结果不对时检查 key 是否为空、tombstone 是否过期、topic 是否真的 compact。
- 磁盘增长时看 cleaner backlog、dirty ratio 和 compaction lag。
- 消费者错过删除时确认是否超过 delete.retention.ms。

## 生产观察指标

- compacted topic 的 dirty ratio、cleaner 线程工作量和磁盘 IO。
- key 是否为空、key 基数是否过高、value 是否过大。
- delete.retention.ms、min.compaction.lag.ms、max.compaction.lag.ms 和 segment roll 情况。
- 新消费者从头恢复时是否能看到预期 tombstone。

## 常见误区

- 认为 compaction 会立即删除旧值。
- 认为 compacted topic 适合保存完整事件历史。
- 把 value 为空字符串当成 tombstone，忽略 tombstone 要求 key 非空且 payload 为 null。
- delete.retention.ms 设置太短，导致新消费者错过删除标记。

## 可执行观察示例

```properties
cleanup.policy=compact
min.compaction.lag.ms=60000
max.compaction.lag.ms=86400000
delete.retention.ms=86400000
```

## 设计取舍和边界

- 保留 tombstone 更久有利删除传播，但占用磁盘更久。
- 更快 compaction 有利状态恢复，但增加后台 IO。
- 把事件流错误配置为 compact 会丢失历史审计语义。

## 依据与版本边界

本页依据 Kafka 4.2 官方文档、Javadoc、Implementation、Operations、Configuration 或对应组件文档整理。涉及默认值、协议行为和版本差异时，应以当前集群 Kafka 版本、客户端版本和实际配置为准；本页不把具体业务集群经验写成跨版本绝对结论。

### 来源

`kafka-design-doc`、`kafka-topic-configs`

### 事实声明

`kafka-claim-0009`、`kafka-claim-0064`、`kafka-claim-0065`、`kafka-claim-0066`、`kafka-claim-0067`、`kafka-claim-0068`
