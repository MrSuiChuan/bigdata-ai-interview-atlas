---
id: q-bigdata-hudi-0010
title: compaction、clustering、cleaning 到底分别在解决什么问题
domain: bigdata
component: hudi
topic: maintenance-services
question_type: operations
difficulty: advanced
status: reviewed
version_scope: Apache Hudi docs as verified on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - hudi-table-types-docs
  - hudi-file-layout-docs
  - hudi-timeline-docs
claim_ids:
  - bigdata-hudi-claim-0011
  - bigdata-hudi-claim-0009
  - bigdata-hudi-claim-0014
related_docs:
  - bigdata/hudi/maintenance-services
  - bigdata/hudi/lifecycle
estimated_minutes: 9
---

# 题目

compaction、clustering、cleaning 到底分别在解决什么问题？

# 一句话结论

compaction 主要解 MOR 日志堆积，clustering 主要解布局质量，cleaning 主要解历史版本膨胀，它们共同负责把 Hudi 表维持在可长期运行的健康状态。

# 这题想考什么

这题考表服务分工。答得差的人会把三个词说成“后台优化”；答得好的人会讲清楚三者各自作用对象、状态边界和对读写的反作用。

# 回答主线

1. 先分别定义三类表服务的核心职责。
2. 再讲它们和 timeline、file slice 的关系。
3. 然后说明它们如何反过来影响读写和恢复。
4. 最后补调度节奏和风险。

# 参考作答

compaction 主要面向 MOR，它要解决的是 log file 越积越多、snapshot 读取越来越重的问题。它通过把日志变化折叠回新的 base file，让 file slice 回到更容易读取的状态。

clustering 主要面向布局质量。它关心文件大小是否均衡、排序或组织是否还适配当前读写模式，本质上是在重组 file group 和文件布局，而不只是“做一次整理”。cleaning 则负责删除不再保留的旧版本文件，避免存储和元数据膨胀。

三者都不只是后台小任务，它们都会在 timeline 上留下动作，并反过来影响读写与恢复。例如 compaction 跟不上会拖慢 MOR 读，clustering 缺位会放大小文件问题，cleaning 太激进又会伤到恢复窗口和增量消费边界。

# 现场判断抓手

1. 看 compaction backlog 是否持续增长。
2. 看 clustering 后文件布局是否实质改善。
3. 看 cleaning 是否与增量和恢复窗口冲突。

# 常见误区

1. 把三者都说成后台优化。
2. 只讲作用，不讲它们影响的边界。
3. 忽略 cleaning 对恢复和增量链路的影响。

# 追问

1. 为什么 MOR 更依赖 compaction？
2. clustering 和 compaction 为什么不能互相替代？
3. 什么时候 cleaning 会从治理动作变成风险来源？
