---
id: q-bigdata-hudi-0008
title: 分区、file group 和小文件为什么会一起失衡
domain: bigdata
component: hudi
topic: partition-layout
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: Apache Hudi docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hudi-file-layout-docs
  - hudi-writing-data-docs
claim_ids:
  - bigdata-hudi-claim-0009
  - bigdata-hudi-claim-0012
  - bigdata-hudi-claim-0013
related_docs:
  - bigdata/hudi/partition-layout
  - bigdata/hudi/performance-model
estimated_minutes: 9
---

# 题目

分区、file group 和小文件为什么会一起失衡？

# 一句话结论

因为 Hudi 的布局不是单个目录问题，而是 partition path、file group 生长方式、提交频率和表服务节奏共同作用的结果，一旦其中一环失衡，小文件和热点通常会一起出现。

# 这题想考什么

这题考布局模型，不是考“按天分区”的经验口号。答得稳的人会把 partition、file group、file slice 和小文件治理串起来。

# 回答主线

1. 先讲 partition 只负责粗粒度切分。
2. 再讲 file group 才是真正的长期归属单元。
3. 然后说明小文件是布局失衡的结果。
4. 最后补 clustering 与表服务的作用。

# 参考作答

Hudi 的分区只是在大方向上决定数据落到哪里，它并不能自动保证布局健康。分区过粗，热点会堆积在少量分区；分区过细，又会产生大量小分区和海量文件。

真正决定长期组织的是 file group。因为 upsert 会不断把同一 key 路由回某个 file group。如果 file group 数量增长失控，或者热点 key 过于集中，就会同时出现路由成本上升、热点更重和小文件增多。

小文件问题本质上不是“文件太小”这一个表象，而是布局模型已经不再适配当前写入节奏。此时就不能只靠加并行度，而要回到 partition、file group、生长节奏和 clustering 是否缺位去重看。

# 现场判断抓手

1. 看单分区 file group 数量趋势。
2. 看平均 base file 大小和小文件占比。
3. 看 clustering 后布局是否真的改善。

# 常见误区

1. 以为按天分区就天然合理。
2. 把小文件只归因于 Spark 并行度。
3. 不看 file group 增长方式。

# 追问

1. 为什么分区过细和分区过粗都会出问题？
2. 为什么 MOR 布局失衡时读放大会更明显？
3. clustering 和 compaction 在布局治理里分别解决什么？
