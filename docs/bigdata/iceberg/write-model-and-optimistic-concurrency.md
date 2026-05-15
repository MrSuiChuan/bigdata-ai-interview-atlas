---
kb_id: bigdata/iceberg/write-model-and-optimistic-concurrency
title: Iceberg 写入模型与乐观并发
description: 解释 Iceberg 写入模型与乐观并发如何接收写入、更新状态、完成提交和暴露结果，并说明失败恢复与幂等边界。
domain: bigdata
component: iceberg
topic: concurrency
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: Iceberg latest docs and spec as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - iceberg-reliability
  - iceberg-spec
  - iceberg-docs-home
  - iceberg-docs-latest
  - iceberg-schemas
  - iceberg-evolution
  - iceberg-partitioning
  - iceberg-maintenance
claim_ids:
  - iceberg-claim-0013
  - iceberg-claim-0015
  - iceberg-claim-0016
  - iceberg-claim-0017
  - iceberg-claim-0018
  - iceberg-claim-0019
  - iceberg-claim-0045
  - iceberg-claim-0046
  - iceberg-claim-0001
  - iceberg-claim-0002
tags:
  - iceberg
  - concurrency
  - commit
  - optimistic-concurrency
  - knowledge-base
  - production
---
## Iceberg 写入不是“改文件”，而是“发布新表状态”
从外部看，一次 Iceberg 写入好像只是多了几批 Parquet 或 ORC 文件；但从表格式角度看，真正发生的事情是：写者准备了一份新的表状态，并尝试把它发布成当前版本。理解这一点之后，很多常见问题都会清晰很多，比如为什么写失败后对象存储里可能仍然有文件、为什么并发 compaction 和增量写入可以共存、为什么同一张表能在对象存储上做出接近数据库式的提交边界。

## 写入过程至少分成“准备、校验、发布”三段
最稳妥的理解方式，是把 Iceberg 写入拆成三个阶段：

| 阶段 | 产物 | 这一阶段失败意味着什么 |
| --- | --- | --- |
| 准备阶段 | data file、delete file、manifest、manifest list、新 metadata file | 失败通常说明执行层或文件生成层出错，表头还没有变化 |
| 校验阶段 | 读取最新表状态，验证本次写入假设是否仍成立 | 失败通常说明并发提交抢先发生，当前写入不能直接发布 |
| 发布阶段 | 通过原子 metadata swap 切换当前表头 | 只有这一步成功，新的 snapshot 才真正对外可见 |

这张表其实已经解释了很多现场现象。比如“文件已经存在但查询不到”，通常说明准备阶段完成了，但发布阶段没有成功；再比如“同一批任务重试后没有重复重写全部元数据”，往往和 manifest、manifest list 的不可变复用有关。

## optimistic concurrency 到底乐观在哪里
Iceberg 的乐观并发控制，并不是“盲目提交，出问题再说”，而是“先假设表状态不会在我提交前发生破坏性变化，到了真正发布时再做一次严肃验证”。

具体说来，writer 在开始工作时会基于某个已知 snapshot 或 metadata 状态构造自己的写入动作。等到提交时，它必须证明两件事：

1. 我准备发布的动作，仍然是建立在最新表状态上可成立的。
2. 在我准备期间，没有别的提交把这些前提改坏。

只有当这两件事都成立时，Catalog 才会接受这次提交。否则就必须重新读取最新状态，再验证、再决定是否重试。

## assumptions + actions 是这套并发模型的骨架
Iceberg 文档把写操作拆成 assumptions 和 actions，这个表述非常值得记。

- assumptions 是这次写入成立所依赖的前提，例如“我基于的 snapshot 仍然有效”“我要覆盖或删除的范围没有被别的提交先一步改写”。
- actions 是这次写入准备发布的结果，例如新增哪些 data file、增加哪些 delete file、替换哪些 metadata 引用。

提交成功的本质，不是 actions 写出来了，而是 assumptions 在最新状态下仍成立，因而 actions 才被允许进入当前表头。这个模型特别适合解释为什么 Iceberg 能在并发 compaction、晚到数据写入、DML 更新同时存在时仍维持正确性。

## 并发冲突时为什么不是全盘重来
当别的 writer 先一步提交成功后，当前 writer 不会直接把整张表“洗掉重来”，而是先重新读取最新 metadata，基于最新状态重新验证自己的写入前提。如果逻辑上仍可成立，就继续尝试提交；如果前提已经不成立，才会真正失败。

这里 manifest 和 manifest list 的不可变属性非常重要。因为它们是不可变 metadata 文件，Iceberg 可以在重试时复用已经构造好的大部分元数据工作，而不必每次从头重建整张表状态。也正因如此，重试的成本通常集中在重新校验和重新生成少量需要变化的元数据引用上，而不是重新扫描整表。

## 为什么 compaction 和晚到数据可以安全共存
很多人第一次接触 Iceberg 时，会担心 compaction 之类的维护任务与业务写入互相踩踏。实际上，Iceberg 可靠性文档明确强调，像 compaction、late-arriving data 这类场景之所以能安全处理，靠的正是“提交前基于最新 snapshot 校验写入要求”。

也就是说，compaction 不是偷偷在目录里挪文件，而是像普通 writer 一样，准备新的文件布局，再在提交点验证自己的假设。如果这期间业务写入已经推进了表状态，compaction 也要遵守同样的重读与重试规则。这样维护任务就不会因为自己是后台任务而拥有“越权提交”能力。

## 可串行化隔离并不等于没有并发
Iceberg 的目标是在写入校验成功的前提下，为表操作提供可串行化隔离。更准确地说，是把并发写入的最终结果线性化到一条 snapshot 演化链上。读者看到的是已经提交成功的某个确定版本，而不是多个写者中间状态的混合物。

因此在解释“为什么这里可以称为 serializable”时，更准确的说法不是“因为加锁”，而是“因为每次提交都会基于最新 metadata 做前提验证，只有验证通过的新状态才能以原子方式成为当前表头，最终形成可线性化解释的版本序列”。

## 需要主动补上的业务边界
Iceberg 负责的是表级提交正确性，但它不会替业务系统自动处理所有外部副作用。

下面这些事情仍然需要调用方自己设计：

- 如果同一流程还更新了外部数据库或消息系统，跨系统幂等和补偿要自己做。
- 如果上层要实现“同一事件只生效一次”，需要把事件 ID、去重语义或业务主键策略设计在 Iceberg 之上。
- 如果多个作业共同修改同一业务范围，还需要在作业编排和重试策略上保证不会无限冲突。

也就是说，Iceberg 能保证“这次表提交是否原子可见”，但不能直接替你回答“这次业务事务是否端到端只执行了一次”。

## 现场分析写入问题时可以怎么切入
当你遇到并发提交失败、重试过多、维护任务与业务写入冲突之类的问题时，建议按下面顺序判断：

1. 先确认失败是在文件生成阶段，还是在 metadata 发布阶段。
2. 再确认最近是否有别的 writer、MERGE、compaction、snapshot 管理作业推进了表头。
3. 检查当前写入依赖的 assumptions 是什么，以及它们是否已被最新 snapshot 破坏。
4. 如果需要评估重试成本，重点看是否能复用已生成的 manifest 和 manifest list，而不是只盯着数据文件本身。

只要把写入问题还原成“我准备发布什么状态、我依赖什么前提、前提何时被别人改掉”，Iceberg 的并发模型就会变得非常可解释。
