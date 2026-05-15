---
id: q-bigdata-trino-0006
title: Trino 的读取路径里，split、pushdown 和 exchange 各自决定什么
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: read-path
question_type: principle
difficulty: intermediate
source_ids:
  - trino-architecture-docs
  - trino-pushdown-docs
claim_ids:
  - bigdata-trino-claim-0004
  - bigdata-trino-claim-0005
  - bigdata-trino-claim-0006
  - bigdata-trino-claim-0007
related_docs:
  - bigdata/trino/read-path
estimated_minutes: 9
---

# 题目

Trino 的读取路径里，split、pushdown 和 exchange 各自决定什么？

# 一句话结论

split 决定并行读取单元，pushdown 决定多少工作留在源系统，exchange 决定跨 stage 中间数据要搬多少。

# 这题想考什么

这题考的是你能不能把读路径拆成“读多少、怎么并行、什么时候开始网络重分发”三件事。

# 回答主线

1. 先讲 Coordinator 如何拿 metadata 和 split。
2. 再讲 pushdown 怎么减少扫描和回传。
3. 再讲 stage 之间 exchange 的作用与代价。
4. 最后补计划验证方式。

# 参考作答

Trino 的读路径不是 Worker 直接去扫表那么简单。Coordinator 先通过 connector 获取 metadata、stats 和 split 线索，再把这些 split 分发给 Worker 并行处理。这里 split 决定的是并行读取的颗粒度。

接下来要看 pushdown。如果过滤、列裁剪、聚合甚至 join 能在底层完成，Trino 自己要做的工作就会明显减少。等查询进入多 stage 以后，exchange 又会决定中间数据在节点之间怎么搬。真正慢的读路径，常常是 pushdown 不足加上 exchange 过重共同造成的。

# 现场判断抓手

1. 能解释 split 是最小并行读取单元。
2. 能说出 pushdown 成功时 explain 里的关键变化。
3. 能指出 exchange 是网络和中间结果成本集中区。

# 常见误区

1. 把 split、task、partition 混成一个概念。
2. 把 pushdown 只理解成简单谓词下推。
3. 完全不提 exchange。

# 追问

1. 为什么 explain 里没有 ScanFilterProject 是好信号？
2. Join pushdown 为什么受 catalog 边界限制？
3. 为什么某些慢查询本质上是 exchange 太重？
