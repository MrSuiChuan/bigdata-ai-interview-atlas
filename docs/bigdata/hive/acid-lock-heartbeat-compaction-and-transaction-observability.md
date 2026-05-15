---
kb_id: bigdata/hive/acid-lock-heartbeat-compaction-and-transaction-observability
title: Hive ACID 锁、心跳、Compaction 与事务观测
description: 解释事务表在锁、心跳、提交和 compaction 上的可观测信号，以及怎么判断问题卡在哪一层。
domain: bigdata
component: hive
topic: acid-lock-heartbeat-compaction-transaction-observability
difficulty: advanced
status: reviewed
sidebar_position: 19
version_scope: Hive latest docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - hive-transactions-acid
  - hive-transactions
  - hive-docs-home
  - hive-introduction
  - hive-language-manual
  - hive-language-manual-ddl
  - hive-managed-external-tables
  - hive-metastore-admin
claim_ids:
  - hive-claim-0038
  - hive-claim-0129
  - hive-claim-0134
  - hive-claim-0135
  - hive-claim-0136
  - hive-claim-0137
  - hive-claim-0138
  - hive-claim-0001
  - hive-claim-0002
  - hive-claim-0003
tags:
  - hive
  - acid
  - lock
  - heartbeat
  - compaction
  - knowledge-base
  - production
---
## 事务表卡住时，不一定是 SQL 慢

Hive ACID 真正麻烦的地方，不只是读路径复杂，而是它把锁、心跳、提交和后台 compaction 都引入了可观测链路。很多“写入慢”“查询慢”“表卡住”的问题，表面看起来像 SQL 性能问题，实际上卡在事务控制面或者后台维护上。

所以这页要回答的不是“什么是事务”，而是：当 ACID 表表现异常时，问题究竟卡在谁那里、要看哪些命令、以及哪条信号能把你从业务慢和控制面卡顿里区分出来。

## 写入到可见的完整链路

```mermaid
flowchart LR
  A["写入开始"] --> B["锁 / 事务分配"]
  B --> C["心跳维持"]
  C --> D["提交成为可见版本"]
  D --> E["后台 compaction 整理物理布局"]
```

这条链路里，每一步都可能成为瓶颈：锁阶段可能等待冲突，心跳阶段可能因客户端失联而被回收，提交阶段可能受事务控制面影响，compaction 阶段则可能在后台慢慢拖大读成本。

## 锁和事务由谁托管

文档说明，`DbTxnManager` 会和 `DbLockManager` 一起在 metastore 中管理锁和事务，这使得事务与锁在 server 故障下仍然是持久化的；而 `DummyTxnManager` 则保留了事务前行为，不提供事务。

这个边界很重要，因为它说明 ACID 不是在查询引擎进程里临时记个状态，而是被放到了 metastore 这一侧去持久化管理。也正因为如此，事务问题很多时候要去看控制面，而不是只看执行节点。

## 为什么 `transactional=true` 只能算入口，不算运行机制

把表声明成事务表，只是告诉 Hive“这张表要进入 ACID 语义体系”；它并没有回答下面这些更关键的问题：

1. 事务状态存在哪里。
2. 锁由谁协调。
3. 客户端失联时谁来回收资源。
4. 后台何时整理增量布局。

这些问题不讲清楚，事务题就仍然停留在“有没有能力”的层次，而没有进入“能力如何持续成立”的层次。

## 并发写入为什么看起来像“共享锁”

文档给出一个容易答错但很关键的事实：对于 transactional tables，Hive 的 insert 操作总是获取共享锁，因为这些表在存储层实现了 MVCC，并能在并发修改存在时提供 Snapshot Isolation。

这意味着 ACID 表的并发语义并不是“谁先写谁独占一切”，而是围绕版本可见性和共享访问来设计的。对知识库来说，这条事实帮助我们把“锁”理解成事务协调的一部分，而不是简单的写入排队机制。

## 心跳为什么是事务生命线

文档说明，锁持有者和事务发起者会定期向 metastore 发送 heartbeats；如果在配置时间内没有收到心跳，对应的锁或事务会被 abort。进一步地，`AcidHouseKeeperService` 会扫描那些在 `hive.txn.timeout` 时间内没有心跳的事务，并主动 abort 它们，释放崩溃客户端持有的资源。

这条机制的意义是：

1. 客户端挂了，事务不会无限悬挂。
2. 锁和事务会被超时回收。
3. 长时间卡住的写入不一定是“没结束”，也可能是“被心跳机制回收”。

因此，遇到异常长事务时，不要只查 SQL，本质上要确认有没有心跳、有没有超时、有没有被 housekeeper 清理。

## 僵尸事务为什么本质上是控制面问题

只要心跳机制失效，最危险的后果并不是“这条 SQL 慢了一点”，而是事务和锁会停留在一种业务方已经不再控制、但系统又仍然要处理的状态里。也正因为如此，HouseKeeper 的存在不是锦上添花，而是事务系统避免长期资源泄露的必要补偿机制。

## Compaction 为什么不能当成普通后台任务

文档明确区分了不同 compaction 行为：minor 和 major compaction 都在后台运行，并且不会阻止并发读写；但 rebalance compaction 会使用独占写锁，因此会阻止并发写入。

这说明 compaction 不是单一动作，而是有不同语义的维护任务：

1. minor compaction 主要是在增量层做整理。
2. major compaction 会把 base 和 delta 一起重写。
3. rebalance compaction 则带有更强的互斥边界。

如果把三者混成“都是压缩文件”，就很容易在生产环境里误判维护窗口和写入影响。

## `ALTER TABLE ... COMPACT` 为什么不是“立刻开始重写”

文档明确指出，`ALTER TABLE ... COMPACT` 的行为是提交 compaction 请求并立即返回，真正进度要靠 `SHOW COMPACTIONS` 查看。这条边界很关键，因为它说明：

1. 提交维护请求和维护真正完成是两回事。
2. 事务表的读放大问题不会因为你发了 compaction 命令就立刻消失。
3. 排查时必须区分“请求没入队”“已入队未执行”“已执行但未达到预期效果”。

## 观测入口应该看什么

文档给出的观测手段很直接：

1. `SHOW TRANSACTIONS`
2. `SHOW COMPACTIONS`
3. `ALTER TABLE ... COMPACT`

其中，`ALTER TABLE ... COMPACT` 只是把 compaction 请求入队并立即返回，真正的进度要后续用 `SHOW COMPACTIONS` 再看。这个边界特别重要，因为很多人会把“提交 compaction 命令”误认为“已经完成 compaction”。

## 排查顺序不要乱

如果事务表出问题，比较稳的顺序是：

1. 先看锁和事务是否正常推进。
2. 再看心跳是否正常续期。
3. 再看提交是否已经可见。
4. 最后看 compaction 是否积压，是否只是后台还没整理完。

这个顺序的核心原因是：锁和心跳属于控制面，提交属于可见性边界，compaction 才是性能和物理布局维护。把这四层分清，很多问题就不会误归因。

## 哪些现象最像事务控制面异常

如果现场出现下面几类现象，优先要怀疑控制面而不是 SQL 本身：

1. 写入作业结束了，但事务迟迟不收敛。
2. 锁看起来一直存在，但业务方已经没有活跃会话。
3. compaction 请求发出后长期看不到推进。

这些现象的共性是：问题不在业务语句逻辑，而在事务控制面或后台维护链路。

## 示例

```sql
SHOW TRANSACTIONS;
SHOW COMPACTIONS;
ALTER TABLE ods_orders_acid COMPACT 'major';
```

这组三条命令的价值不在于“执行一下看看”，而在于它们分别对应事务列表、compaction 进度和维护请求入队，正好覆盖了 ACID 故障排查最常见的三个观察面。

## 本页结论

Hive ACID 的问题排查，不能只盯查询慢不慢，而要顺着锁、心跳、提交和 compaction 四层往下看。只要把 `SHOW TRANSACTIONS`、`SHOW COMPACTIONS` 和 `DbTxnManager` 这些信号串起来，事务卡住的根因通常就能定位到控制面还是维护面。

## 来源与事实边界

### 来源

`hive-transactions-acid`、`hive-transactions`、`hive-docs-home`、`hive-introduction`、`hive-language-manual`、`hive-language-manual-ddl`、`hive-managed-external-tables`、`hive-metastore-admin`

### 事实声明

`hive-claim-0038`、`hive-claim-0129`、`hive-claim-0134`、`hive-claim-0135`、`hive-claim-0136`、`hive-claim-0137`、`hive-claim-0138`、`hive-claim-0001`、`hive-claim-0002`、`hive-claim-0003`
