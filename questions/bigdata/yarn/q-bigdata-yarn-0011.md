---
id: q-bigdata-yarn-0011
title: YARN 的生命周期为什么必须拆成 Application、Attempt、Container 三层
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: lifecycle
question_type: principle
difficulty: intermediate
source_ids:
  - hadoop-yarn-architecture
claim_ids:
  - bigdata-yarn-claim-0005
  - bigdata-yarn-claim-0010
related_docs:
  - bigdata/yarn/lifecycle
estimated_minutes: 8
---

# 题目

YARN 的生命周期为什么必须拆成 Application、Attempt、Container 三层？

# 一句话结论

因为外层应用状态稳定，并不代表内层 Attempt 和 Container 没有波动，很多恢复和排障判断都依赖这种分层。

# 这题想考什么

这题考的是你是否真的理解 YARN 管的是多层生命周期，而不是一个粗粒度“作业状态”。

# 回答主线

1. 先讲三层各自表示什么。
2. 再讲它们如何串起来。
3. 再讲排障和恢复为什么依赖这层次。

# 参考作答

Application 表示一次整体提交，Attempt 表示其中某一次实际运行尝试，Container 表示最细的资源与进程单元。这三层是嵌套的，不是同义词。

也正因为这样，Application 仍在运行，不代表当前 Attempt 没换过；Attempt 还活着，也不代表所有 Containers 都健康。把这三层讲清楚以后，Accepted、AM 重启、Container 丢失和应用最终失败这些现象才能准确落位。

# 现场判断抓手

1. 能给出三层嵌套关系。
2. 能用恢复或排障现象解释分层价值。
3. 能说明外层稳定不代表内层稳定。

# 常见误区

1. 把生命周期讲成“提交 -> 运行 -> 结束”一句话。
2. 不提 Attempt。
3. 把 Container 只当成实现细节。

# 追问

1. AM 失败时，Application 和 Attempt 各会怎样变化？
2. Container 丢了为什么不一定等于 Application 立刻失败？
3. 这三层和 RM / NM / AM 的角色如何对应？
