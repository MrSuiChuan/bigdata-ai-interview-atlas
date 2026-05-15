---
kb_id: bigdata/hdfs/core-objects-state
title: HDFS 核心对象与状态所有权
description: 解释 HDFS 核心对象与状态所有权中的权威状态、缓存状态、持久化状态和刷新路径，并说明一致性与诊断方法。
domain: bigdata
component: hdfs
topic: core-objects-state
difficulty: intermediate
status: reviewed
sidebar_position: 2
version_scope: Apache Hadoop 3.3.5 stable HDFS docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hadoop-hdfs-design
  - hadoop-hdfs-user-guide
  - hadoop-hdfs-default-config
  - hadoop-hdfs-permissions
  - hadoop-hdfs-ha-qjm
claim_ids:
  - bigdata-hdfs-claim-0002
  - bigdata-hdfs-claim-0003
  - bigdata-hdfs-claim-0008
  - bigdata-hdfs-claim-0001
  - bigdata-hdfs-claim-0004
  - bigdata-hdfs-claim-0005
  - bigdata-hdfs-claim-0006
  - bigdata-hdfs-claim-0007
  - bigdata-hdfs-claim-0009
  - bigdata-hdfs-claim-0010
tags:
  - bigdata
  - hdfs
  - core-objects-state
  - knowledge-base
  - production
---
## 真正能把 HDFS 讲深的人，不会只停留在 NameNode、DataNode、Block 三个词

HDFS 的难点不在名词数量，而在状态归属。很多故障之所以难排，是因为看起来都叫“文件问题”，但实际上可能分别属于：命名空间状态、block 管理状态、副本健康状态、客户端租约状态，或者只是 DataNode 还未来得及把本地事实汇报给 NameNode。

所以，这一页的重点不是再重复架构，而是回答一个更关键的问题：每个核心对象的权威状态到底由谁持有，什么时候刷新，出了问题该看哪里。

## 先把对象分成四层

| 层次 | 典型对象 | 权威来源 | 主要意义 |
| --- | --- | --- | --- |
| 命名空间对象 | 目录、文件、权限、配额、路径名 | NameNode | 定义“这个路径是什么” |
| 布局对象 | block、文件到 block 的顺序映射、副本目标数 | NameNode | 定义“这个文件由哪些块组成，应当有多少副本” |
| 物理对象 | DataNode 本地 block 文件、校验文件、磁盘位置 | DataNode 本地存储 | 定义“字节现在实际在哪台机器上” |
| 运行时对象 | lease、under construction 状态、block report、heartbeat | NameNode 与 DataNode 交互结果 | 定义“系统当前如何推进写入、恢复和副本维护” |

只要把这四层混在一起，后面就容易把“元数据已经改了”和“字节已经彻底安全落盘”误当成同一件事。

## 文件不是直接映射到 DataNode，而是先映射到 block

HDFS 文件真正的内部结构是“有序 block 列表”，而不是“文件直接保存在三台机器上”。

- 对客户端来说，看到的是一个路径下的文件。
- 对 NameNode 来说，看到的是这个文件由若干 block 顺序组成。
- 对 DataNode 来说，只知道自己本地持有某些 block replica，并不知道它们完整属于哪个业务表或任务。

这就是为什么很多排障命令都要下钻到 `-blocks -locations` 级别：只有看到 block 和副本层，才能判断问题到底是命名空间、缺副本、坏副本，还是局部节点不可达。

## 哪些状态由 NameNode 说了算

下面这些状态，本质上都属于 NameNode 的权威视角：

- 路径是否存在。
- 它是目录还是文件。
- 文件包含哪些 block，以及 block 顺序。
- 每个文件期望的 replication factor。
- 某个 block 当前被认为位于哪些 DataNode。
- 权限、owner、group、配额等命名空间属性。
- 某个文件是否处于 under construction。
- 某些 block 是否被识别为 under-replicated、缺失或需要恢复。

注意，这里说“权威”不是指 NameNode 直接保存全部字节，而是指客户端对 HDFS 语义的判断最终以 NameNode 为准。DataNode 本地可能还有某个 block 文件，但如果 NameNode 的命名空间或 block map 已经不再把它当作有效副本，那么它对客户端文件语义就不再构成可依赖对象。

## 哪些状态由 DataNode 先掌握，再汇报给 NameNode

DataNode 更像本地物理事实的掌握者。它先知道：

- 某个 block 文件是否真的写到了本地磁盘。
- 本地到底有哪些 replica。
- 某个副本是否还能读。
- 某块磁盘、某卷、某存储目录是否已经损坏。

但这些事实要变成全局可见状态，仍需要通过 Heartbeat 和 Blockreport 逐步汇报给 NameNode。官方架构文档明确说明，DataNode 启动后会扫描本地文件系统并向 NameNode 发送 Blockreport；NameNode 再据此形成全局视图。

这带来一个非常重要的排障结论：某些问题在时间上会有“本地事实已经发生，但全局元数据还没完全收敛”的窗口。比如写入刚完成、节点刚恢复、欠副本刚被补齐时，局部和全局观察面并不一定完全同步。

## lease 是写入期最容易被忽略的运行时对象

对读路径来说，路径、block、replica 往往就够了；但只要进入写路径，lease 就必须单独理解。lease 的作用，是让系统知道“当前谁是这个文件的合法写入者”。

这就是 HDFS 为什么能维持 single writer 约束的关键之一。文件在写入期间不是普通稳定文件，而是带着活动写入上下文的 under construction 文件。只要 lease 还在，这个文件的最后一个 block 就可能尚未完成最终收敛。

如果写入客户端异常退出、网络中断或长时间失联，系统需要走 lease recovery，把文件从“未稳定的写入现场”推进到“可关闭或可继续恢复的状态”。

## 最后一个 block 的状态，才是 HDFS 深度题的核心

已经关闭的普通 block 相对简单，复杂度主要集中在“正在写或刚写完还未完全收敛”的最后一个 block。HDFS 源码内部把 under construction block 至少区分成下面几类状态：

| 状态 | 含义 | 对应问题 |
| --- | --- | --- |
| `UNDER_CONSTRUCTION` | block 已分配，正在写入或追加 | 客户端还在推进 pipeline |
| `COMMITTED` | 客户端已报告字节长度和 generation stamp，但 DataNode 还没把最终 finalized 副本全部报齐 | 为什么客户端说写完了，系统还没完全稳定 |
| `UNDER_RECOVERY` | lease 过期或写入异常，系统正在协调最后一个 block 的恢复 | 为什么异常 writer 之后需要恢复过程 |
| `COMPLETE` | block 已满足完成条件，进入稳定状态 | 关闭后的普通读取与复制维护 |

这组状态的价值不是为了背源码枚举，而是为了理解一个事实：HDFS 的“写完”并不是单一瞬间，而是客户端写入、DataNode 落盘、NameNode 收敛视图共同推进的结果。

## generation stamp 不是边角料，它是恢复仲裁的一部分

在 block recovery 相关实现里，恢复过程会引入新的 recovery id，并把副本版本推进到新的 generation stamp。它的作用不是给 block 随便编号，而是帮助系统区分新旧写入上下文，防止过期 writer 或旧 pipeline 继续污染恢复后的结果。

如果只理解 block id，不理解 generation stamp，就很难讲清楚 pipeline 失败恢复、append 后续写入、租约恢复为什么能够裁掉旧状态。

## 欠副本、坏副本、节点死亡，这些是管理状态，不是新的文件类型

生产环境里经常看到这些词：

- under-replicated
- missing blocks
- corrupt replica
- dead DataNode
- stale node

它们的本质不是“又多了一种 HDFS 对象”，而是 NameNode 基于 Heartbeat、Blockreport 和复制策略，对现有 block / replica 做出的管理分类。也就是说：对象还是原来的 block 和 replica，只是系统对它们当前健康度、可用性和恢复优先级有了不同判断。

因此，回答“什么是欠副本”时，最好直接连上判断链：DataNode 汇报状态变化 -> NameNode 发现某个 block 的有效副本数低于目标值 -> 该 block 进入待补副本集合 -> 后续由复制机制推动修复。

## 小文件问题，本质上是对象数量爆炸，不是存储容量先不够

HDFS 官方设计强调的是大文件。当小文件数量巨大时，真正先被放大的通常是：

- 目录项数量。
- 文件条目数量。
- 文件到 block 的映射数量。
- NameNode 内存中的命名空间与 block map。
- 元数据 RPC 与 checkpoint 负担。

所以，小文件问题首先是“对象管理问题”，然后才是“磁盘利用问题”。这也是为什么很多集群明明 DataNode 还有空间，NameNode 却先成为瓶颈。

## 真正有用的观测入口，要能同时看到文件、block 和副本

最有代表性的入口是：

```bash
hdfs fsck /warehouse/orders -files -blocks -locations
```

这个命令之所以有价值，是因为它把三个层次串起来了：

- `files`：当前路径下有哪些文件。
- `blocks`：每个文件分成了哪些 block。
- `locations`：每个 block 当前位于哪些 DataNode。

当你需要判断“是路径级问题，还是 block 级问题，还是某台 DataNode 局部问题”时，这是比单看 `du` 或剩余容量更接近真相的入口。

## 来源与事实边界

### 来源

`hadoop-hdfs-design`、`hadoop-hdfs-user-guide`、`hadoop-hdfs-default-config`、`hadoop-hdfs-permissions`、`hadoop-hdfs-ha-qjm`

### 事实声明

`bigdata-hdfs-claim-0002`、`bigdata-hdfs-claim-0003`、`bigdata-hdfs-claim-0008`、`bigdata-hdfs-claim-0001`、`bigdata-hdfs-claim-0004`、`bigdata-hdfs-claim-0005`、`bigdata-hdfs-claim-0006`、`bigdata-hdfs-claim-0007`、`bigdata-hdfs-claim-0009`、`bigdata-hdfs-claim-0010`
