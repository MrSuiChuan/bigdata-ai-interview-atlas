---
id: q-bigdata-hive-0015
title: 为什么 Hive 小文件治理在 ORC 场景里要讲 CONCATENATE，而且它不是简单重写全量数据
domain: bigdata
component: hive
topic: orc-stripes-indexes-bloom-filters-small-file-merge
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Hive latest docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - hive-language-manual-orc
claim_ids:
  - hive-claim-0088
related_docs:
  - bigdata/hive/orc-stripes-indexes-bloom-filters-and-small-file-merge
estimated_minutes: 9
---

# 题目

为什么 Hive 小文件治理在 ORC 场景里要讲 `CONCATENATE`，而且它不是简单重写全量数据？

# 一句话结论

因为 ORC 的 `CONCATENATE` 本质上是 stripe-level merge，它利用 ORC 内部结构做文件整理，而不是走一遍完整的解压、解码、重算、重写链路。

# 核心机制

1. `ALTER TABLE ... CONCATENATE` 是官方提供的 ORC 小文件治理动作。
2. 合并发生在 `stripe level`。
3. 官方明确说明合并时不需要解压和解码。

# 标准答案

如果只说“把小文件重新写成大文件”还不够精确。官方 ORC 文档明确说明，`ALTER TABLE ... CONCATENATE` 可以把多个小 ORC 文件合并成更大的文件，而且合并发生在 `stripe level`，不需要 `decompress` 和 `decode`。这条机制说明它不是笨重的全量重写，而是利用 ORC 自身的内部组织方式做更低代价的物理整理。成熟答案要继续补上两层含义：第一，ORC 小文件问题会把 task 固定成本、文件系统对象管理成本和 Metastore 目录成本一起放大；第二，`CONCATENATE` 的价值恰恰在于先从物理文件层收敛碎片，让后续 stripe、index、Bloom Filter 这些格式收益有机会真正发挥出来。所以它不是“顺手可讲可不讲的命令”，而是 ORC 场景下极高价值的小文件治理机制。

# 追问展开

1. 如果继续问“为什么不直接重导一遍”，应回答 `CONCATENATE` 的代价模型更轻，因为不需要完整的解压和解码重写。
2. 如果继续问“是不是所有慢查询都该先做它”，应回答不是，只有确定问题里有明显小文件碎片时，它才是高优先级动作。
3. 如果继续问“做完就一定快吗”，应补一句：它先解决的是文件碎片问题，后面还要看 stripe 粒度、索引和计划层是否也合理。

# 必答点

1. 说明 `CONCATENATE` 是 ORC 官方支持的小文件治理动作。
2. 说明它是 `stripe-level merge`。
3. 说明它不需要解压和解码，因此代价低于全量重写。
4. 说明它的价值是先从物理层收敛碎片，再让 ORC 读优化收益真正兑现。

# 常见误答

1. 把 `CONCATENATE` 说成普通的整表重写。
2. 只说“减少小文件”，不讲为什么它的代价更低。
3. 说不清它和 ORC 内部 `stripe` 结构之间的关系。
