---
id: q-bigdata-hive-0026
title: 为什么 Hive ACID 题不能只答“支持 UPDATE/DELETE”，而必须继续讲 base、delta 和 read-time merge
domain: bigdata
component: hive
topic: acid-base-delta-row-id-snapshot-read-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - hive-transactions-acid
claim_ids:
  - hive-claim-0126
  - hive-claim-0127
  - hive-claim-0128
related_docs:
  - bigdata/hive/acid-base-delta-row-id-and-snapshot-read-path
estimated_minutes: 11
---

# 题目

为什么 Hive ACID 题不能只答“支持 `UPDATE/DELETE`”，而必须继续讲 `base`、`delta` 和 `read-time merge`？

# 一句话结论

因为 Hive 事务的核心不在语法，而在它怎样在不做 HDFS 原地改写的前提下，组织变更并拼出一致快照。

# 核心机制

1. Hive 把基线数据放在 `base files`
2. 新增、更新、删除落到 `delta files`
3. 读取时再把 base 和 delta 合并，并应用更新和删除

# 标准答案

Hive ACID 如果只答成“支持 `UPDATE/DELETE`”，基本还停留在功能层。官方文档明确说明，Hive 事务表把基线数据保存在 `base files`，把新增、更新和删除保存在 `delta files` 中，而 reader 会在 read time 合并 base 和 delta，同时应用更新和删除逻辑。这说明 Hive 的事务实现不是在 HDFS 上原地改写文件，而是通过 `base + delta` 的目录布局和快照合并读路径，来构造某个时刻的一致视图。进一步，`minor compaction` 和 `major compaction` 又分别负责压薄 delta 层和折叠回新的 base，所以这道题真正要讲的是“变更怎样被组织、读取时怎样被解释”，而不是只背几条 DML 语法。

# 必答点

1. 说明不是原地修改 HDFS 文件
2. 说明 `base + delta` 的存储布局
3. 说明一致性来自 read-time merge

# 常见误答

1. 只说 Hive 支持事务
2. 不知道 `delta` 文件在做什么
3. 不知道 compaction 和读放大之间的关系
