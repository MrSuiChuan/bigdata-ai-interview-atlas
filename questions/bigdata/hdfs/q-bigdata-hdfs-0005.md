---
id: q-bigdata-hdfs-0005
title: "create、addBlock、pipeline 和 ack 怎么把 HDFS 写路径串起来"
domain: bigdata
component: hdfs
topic: write-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Apache Hadoop 3.3.5 stable HDFS docs as verified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - hadoop-hdfs-design
  - hadoop-hdfs-user-guide
  - hadoop-filesystem-outputstream
claim_ids:
  - bigdata-hdfs-claim-0005
  - bigdata-hdfs-claim-0022
  - bigdata-hdfs-claim-0023
  - bigdata-hdfs-claim-0024
  - bigdata-hdfs-claim-0025
  - bigdata-hdfs-claim-0026
related_docs:
  - bigdata/hdfs/write-path
estimated_minutes: 10
---

# 题目

create、addBlock、pipeline 和 ack 怎么把 HDFS 写路径串起来？

# 一句话结论

写 HDFS 不是把文件发给 NameNode，而是先由 NameNode 创建路径并分配 block，再由客户端把 packet 推进 DataNode pipeline，最后通过 hflush、hsync、close 分阶段推进可见性、持久化和最终提交。

# 面试官真正想考什么

这道题考的是你能不能把“元数据创建”“数据流传输”和“提交边界”放在同一条链路里讲。只会背 pipeline 或只会背三副本，都还不算真正理解写路径。

# 核心原理

1. create 先在 NameNode 上创建命名空间条目并授予单写者 lease。
2. addBlock 时，NameNode 根据复制因子和放置策略返回目标 DataNode。
3. 客户端把数据切成 packet 推入 pipeline，ack 从末端反向返回。
4. hflush、hsync、close 分别回答“别人能不能看到”“数据是否推进到持久化边界”“文件是否最终完成收敛”。

# 关键对象与状态

1. Lease：当前 writer 的受控写入权。
2. Pipeline：多副本链式写入与确认通道。
3. Last block：最容易在异常时进入恢复的对象。
4. hflush / hsync / close：不同层次的提交边界。

# 标准回答

更深一点的答法要分成两个面。控制面上，客户端先发起 create，请 NameNode 校验路径、权限和覆盖语义，并为文件建立 lease；后续每当需要新 block，再由 NameNode 选出写入目标。数据面上，客户端拿到目标列表后，自行建立 DataNode pipeline，把 packet 逐跳推下去，再等 ack 逐跳返回。
真正体现深度的地方在于写入边界。`hflush()` 解决的是新 reader 的可见性，`hsync()` 在可见性之外再推进持久化语义，`close()` 则让元数据长度和文件状态最终收敛。所以回答写路径时，不要只停在“写三份”，而要把 lease、pipeline、last block 和 close 前后的状态区别讲出来。

# 一个最小观察或判断入口

```java
try (FSDataOutputStream out = fs.create(new Path("/tmp/events.log"), true)) {
    out.writeBytes("batch-1\n");
    out.hflush();
    out.writeBytes("batch-2\n");
    out.hsync();
}
```

# 如果追问到生产场景

1. 如果 create 失败，优先看路径、权限、配额和覆盖语义。
2. 如果 pipeline 超时，优先看 DataNode、网络和副本放置。
3. 如果 close 卡住或 writer 异常，要联想到 lease recovery 和最后一个 block 的恢复。

# 常见误答

1. 说写入数据会经过 NameNode。
2. 把 flush、hflush、hsync、close 当成一个意思。
3. 把写失败一律理解成“文件已经坏了”。

# 追问

1. 为什么 hflush 后新 reader 可以看到数据，但元数据长度未必已经完全同步？
2. 为什么写故障恢复的重点通常落在最后一个 block，而不是整个文件？
