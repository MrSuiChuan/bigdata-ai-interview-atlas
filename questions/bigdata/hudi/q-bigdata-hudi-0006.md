---
id: q-bigdata-hudi-0006
title: snapshot、read optimized、incremental 三种读法到底分别读到了什么
domain: bigdata
component: hudi
topic: read-path
question_type: principle
difficulty: advanced
status: reviewed
version_scope: Apache Hudi docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hudi-table-types-docs
  - hudi-timeline-docs
  - hudi-file-layout-docs
claim_ids:
  - bigdata-hudi-claim-0007
  - bigdata-hudi-claim-0008
  - bigdata-hudi-claim-0009
related_docs:
  - bigdata/hudi/read-path
  - bigdata/hudi/consistency-boundaries
estimated_minutes: 10
---

# 题目

snapshot、read optimized、incremental 三种读法到底分别读到了什么？

# 一句话结论

它们读的是同一张表，但不是同一个边界：snapshot 读当前完整可见视图，read optimized 主要读整理后的 base file，incremental 读提交边界之后的变化。

# 这题想考什么

这题考的是读路径语义边界。答得深的人不会把三种读法只讲成“一个快、一个全、一个增量”，而会讲它们依赖的 instant 和 file slice 差别。

# 回答主线

1. 先强调读路径先解释版本，再解释文件。
2. 再分别讲 snapshot、read optimized、incremental 的边界。
3. 然后补 MOR 场景下的 log merge 成本。
4. 最后说明它们为什么不能互相替代。

# 参考作答

Hudi 读路径的第一步不是扫目录，而是先根据 timeline 找到哪些 instant 已经 completed，再枚举这些提交边界下可见的 file slice。也就是说，读路径先解释版本，再解释文件。

snapshot 读的是当前完整可见状态。对 COW 来说，通常直接读最新 base file；对 MOR 来说，往往需要把 base file 和 log file 合并。read optimized 则主要面向 MOR，倾向于只读整理好的 base file，因此读成本更稳，但可能看不到尚未 compaction 的最新日志变化。incremental 则不是快照，而是从某个 begin instant 之后提取变化，适合下游增量链路。

所以三者的差别不只是性能，而是语义。把 read optimized 当成 snapshot 的“便宜版”，或者把 incremental 当成目录差分，都会把 Hudi 读边界讲错。

# 现场判断抓手

1. 看 query type 配置。
2. 看最近 completed instant 边界。
3. 看 MOR 场景下相关 file slice 的 log 数量。

# 常见误区

1. 把 incremental 讲成文件 diff。
2. 把 read optimized 当成“更快的 snapshot”。
3. 不区分 COW 和 MOR 在读路径上的差异。

# 追问

1. 为什么 MOR 的 snapshot 更容易出现读放大？
2. incremental 链路为什么依赖保留窗口？
3. 目录里文件都在，为什么不同 query type 结果还能不一样？
