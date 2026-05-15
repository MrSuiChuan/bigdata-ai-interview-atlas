---
kb_id: bigdata/hbase/troubleshooting
title: HBase 生产排障路径
description: 以热点、写链路、读链路、后台维护和恢复事件为主线，给出 HBase 更接近值班现场的排障方法。
domain: bigdata
component: hbase
topic: troubleshooting
difficulty: advanced
status: reviewed
sidebar_position: 17
version_scope: HBase official docs as verified on 2026-05-09
last_verified_at: '2026-05-09'
source_ids:
  - hbase-hbtop
  - hbase-ops-management
  - hbase-regionserver-docs
  - hbase-regionserver-sizing
claim_ids:
  - bigdata-hbase-claim-0010
  - bigdata-hbase-claim-0016
  - bigdata-hbase-claim-0019
  - bigdata-hbase-claim-0020
tags:
  - hbase
  - troubleshooting
  - hotspot
  - diagnosis
  - production
  - knowledge-base
---
## HBase 排障的关键，是先把问题分层
HBase 的问题表面都可能长得差不多：慢、抖、超时、重试增多。但真正根因可能在完全不同的层次：

- 热点布局层。
- 写链路层。
- 读链路层。
- 后台维护层。
- 恢复与迁移层。

所以排障第一步不是立刻看某个参数，而是先给问题分层。

## 第一类：热点型问题
典型症状：

- 只有少数 RegionServer 很忙。
- 局部表或业务前缀异常热。
- 集群整体资源还有余量，但延迟已经明显升高。

优先动作：

1. 用 `hbtop` 或热点视角确认是否集中在少数 Region。
2. 看这些 Region 对应的 `RowKey` 前缀是否单调或集中。
3. 判断是写热点还是读热点。

如果根因是热点，先别急着调 JVM，这通常不是第一关键点。

## 第二类：写链路型问题
典型症状：

- Put 延迟升高。
- 重试增加。
- `WAL sync latency` 上升。
- `MemStore` 压力与 flush 活动变高。

优先动作：

1. 看热点是否先存在。
2. 看 WAL 是否慢。
3. 看 flush 是否过频。
4. 看 compaction 是否开始拖累写入。

写链路问题如果只从客户端超时去看，通常不够深入。

## 第三类：读链路型问题
典型症状：

- Get 或 Scan 变慢。
- `BlockCache` 命中率下降。
- 某些表查询稳定偏慢。
- 读 IO 和 HFile 数量升高。

优先动作：

1. 先区分是点查慢还是 scan 慢。
2. 看是否存在 HFile 过多。
3. 看缓存是否顶不住工作集。
4. 看版本、删除标记或列族设计是否导致读放大。

## 第四类：后台维护型问题
典型症状：

- compaction 队列积压。
- flush 突然变多。
- split、balance 或迁移频繁。
- 业务高峰时系统整体抖动。

优先动作：

1. 判断是不是后台任务和业务流量叠加。
2. 看哪类维护动作最重。
3. 再决定是否错峰、减压或回到表设计层优化。

## 第五类：恢复与迁移型问题
典型症状：

- 节点故障后局部请求重试增多。
- 某些表短时不可达或波动。
- Region 在重分配中。

优先动作：

1. 看是否存在 RegionServer 故障或下线。
2. 看 WAL replay 与 Region 重分配是否完成。
3. 看客户端是否仍在使用旧路由缓存。

## 一个更像生产现场的排障顺序
1. 先判断影响面：全局还是局部，单表还是多表。
2. 再判断主问题属于热点、读、写、维护还是恢复。
3. 再拉对应证据链，而不是什么都看。
4. 最后再决定是改参数、改调度，还是改 `RowKey` / 表模型。

## 排障时最容易犯的错误
- 一上来就调参数。
- 不先区分热点和全局问题。
- 看到慢就只看机器资源。
- 忽略 compaction 与 HFile 债务。
- 不回到表结构与访问模式本身。

## 本页结论
HBase 排障的价值，不在于记住多少命令，而在于能快速判断问题属于哪条链。只要坚持“先分层、再收证据、最后下结论”，排障效率就会明显高于无差别盯日志和参数。
