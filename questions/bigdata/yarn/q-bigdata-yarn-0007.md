---
id: q-bigdata-yarn-0007
title: YARN 的一致性边界为什么不能被讲成业务一致性边界
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: consistency-boundaries
question_type: system-design
difficulty: advanced
source_ids:
  - hadoop-yarn-architecture
  - hadoop-yarn-resource-manager-ha
claim_ids:
  - bigdata-yarn-claim-0008
  - bigdata-yarn-claim-0010
related_docs:
  - bigdata/yarn/consistency-boundaries
estimated_minutes: 10
---

# 题目

YARN 的一致性边界为什么不能被讲成业务一致性边界？

# 一句话结论

因为 YARN 保证的是资源接纳、调度与容器生命周期规则，不会替上层框架和业务系统保证 exactly-once、幂等或结果正确性。

# 这题想考什么

这题考的是你会不会主动给 YARN 划边界，而不是把恢复和重试讲得过大。

# 回答主线

1. 先讲 YARN 真正保证什么。
2. 再讲它不保证什么。
3. 再讲 RM HA / Restart 为什么也不越界。
4. 最后讲调用方责任。

# 参考作答

更稳的答法是先把边界说死：YARN 负责的是资源和运行时规则的一致性边界，例如应用如何被接纳、容器如何被分配、队列与 ACL 如何生效、RM 在 HA / Restart 条件下如何继续提供控制面服务。

它不负责上层框架的任务语义、业务幂等和结果正确性。Container 能重启、AM 能重来，不代表业务写入不会重复。所以任何把 YARN 讲成业务一致性保障层的回答，都会把边界越讲越大。

# 现场判断抓手

1. 能区分运行时边界与业务语义边界。
2. 能说明 RM HA 不是业务无损恢复。
3. 能主动补一句上层框架和业务方责任。

# 常见误区

1. 把 YARN 重试说成业务幂等保障。
2. 把 RM HA 讲成完全无感恢复。
3. 不区分资源一致性和数据一致性。

# 追问

1. 为什么 ApplicationAttempt 能重来不代表结果一定正确？
2. Spark on YARN 的语义边界应该怎么补充？
3. RM Restart 和业务恢复有什么本质区别？
