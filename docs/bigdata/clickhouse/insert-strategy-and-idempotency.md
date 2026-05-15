---
kb_id: bigdata/clickhouse/insert-strategy-and-idempotency
title: ClickHouse 写入批量、异步插入与重试幂等
description: 专门展开 ClickHouse 写入策略选择、批量大小、async_insert、重试去重与依赖物化视图时的幂等边界。
domain: bigdata
component: clickhouse
topic: insert-strategy-and-idempotency
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: ClickHouse docs as verified on 2026-05-09
last_verified_at: "2026-05-09"
source_ids:
  - clickhouse-bulk-inserts-doc
  - clickhouse-asynchronous-inserts-doc
  - clickhouse-deduplicating-inserts-doc
  - clickhouse-transactional-doc
claim_ids:
  - clickhouse-claim-0039
  - clickhouse-claim-0040
  - clickhouse-claim-0041
  - clickhouse-claim-0042
tags:
  - bigdata
  - clickhouse
  - insert-strategy
  - async-insert
  - knowledge-base
---
## 写入策略的第一原则：能在客户端批量，就先客户端批量
官方对同步写入的建议非常直接：至少批到约 1000 行，更理想的是 10000 到 100000 行。原因不是“经验值好记”，而是因为 insert 的固定开销和 part 创建开销几乎不随批次线性缩小。批量越大，固定开销占比越低，后台 merge 压力也越小。

如果面试里被问“为什么 ClickHouse 不建议极碎写入”，最本质的回答不是网络往返，而是 part 模型本身。每个小 insert 都会制造更多 part、更多文件、更多 merge 任务、更多复制单元和更多 mutation 目标。

## 同步写入的节奏控制比单次吞吐更重要
官方 bulk insert 指南还给出一个经常被忽略的建议：同步 insert 场景下，最好把 insert 频率控制在大约每秒一次左右。这个建议背后不是接口限制，而是让后台 merge 能跟上前台 part 的生成速度。只要系统长期处在“生成 part 的速度高于合并 part 的速度”，迟早会把读性能和维护成本一起拖垮。

## 客户端无法批量时，才考虑 async_insert
可观测性、IoT、埋点、agent 上报这类场景，客户端通常很难自然地聚合到足够大的批次。此时 `async_insert` 的价值才真正体现出来：server 侧按 insert shape 和 settings 分桶，在大小、时间、累计请求数触发时统一 flush。

这里要区分两个常见误解：
- 它不是“每条小消息都立刻更快”的魔法，而是把多个小请求合并后整体更健康。
- 它不是天然更安全。只有在 `wait_for_async_insert = 1` 时，确认点才更接近真正落盘；`wait_for_async_insert = 0` 是典型的吞吐优先模式。

## 重试幂等的核心不是事务 ID，而是 block 去重
ClickHouse 官方的 retry dedup 文档说明，MergeTree 表会给插入 block 生成 `block_id` 并记录在去重日志中。再次插入相同 block 时，如果仍在 deduplication window 内，就会被识别成重复并跳过。

这个机制的优点是无需业务方自己维护一套复杂的幂等表；缺点是边界很明确：
- 只有 MergeTree 家族支持这套语义。
- 去重窗口是有限的，不是无限历史。
- `INSERT ... SELECT` 只有在结果数据和顺序都稳定时才容易命中去重。
- 同一份数据如果本来就需要重复插入，必须显式处理 token 语义。

## insert_deduplication_token 的作用不是“更安全”，而是“覆盖默认去重键”
官方文档明确说明，当提供 `insert_deduplication_token` 时，ClickHouse 不再以数据哈希作为唯一判断。它更适合业务已经有稳定写入批次标识，希望完全按这个标识来定义“重试”和“重复”的场景。

这也意味着 token 不能乱用。复用了同一个 token，即使插入的是不同数据，也可能被视为重复而被丢弃；token 设计不当，本身就会变成数据正确性的风险源。

## 依赖物化视图时，幂等边界要再往下看一层
ClickHouse 不只会去重基表 block，还支持在启用对应设置后，对依赖的物化视图目标表也做去重。但这里仍然要记住两个边界：
- 去重是逐表进行的，不是“整个链路只有一个全局去重状态”。
- 如果重试最终全部失败，客户端仍然无法仅凭超时判断哪些表已经落了哪些数据。

## 决策建议
- 业务可以自然聚合批次：优先同步批量 insert。
- 业务无法聚合且容忍数百毫秒缓冲：优先 `async_insert = 1, wait_for_async_insert = 1`。
- 业务只追求极低提交延迟且能容忍丢数：才考虑 `wait_for_async_insert = 0`。
- 业务必须处理重试不确定性：同时设计 retry dedup 策略和下游核对机制，不要把幂等完全寄托在客户端是否“少重试几次”。

## 最小样例：异步插入与去重设置
~~~sql
INSERT INTO events_local
SETTINGS async_insert = 1, wait_for_async_insert = 1
VALUES ('2026-05-09 10:10:00', 10, 'click', 0.0);

INSERT INTO events_local
SETTINGS insert_deduplicate = 1, insert_deduplication_token = 'batch-20260509-001'
SELECT *
FROM staging_events
ORDER BY ALL;
~~~

上面的 `ORDER BY ALL` 不是装饰项，它对应官方对 `INSERT ... SELECT` 去重稳定性的要求。只有当重试时返回同样的数据、同样的顺序，block 级去重才更容易按预期生效。
