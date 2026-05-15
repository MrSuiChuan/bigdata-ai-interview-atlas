---
id: q-bigdata-yarn-0017
title: 排障 YARN 时，为什么一定要先分提交、Accepted、AM、Container、上层框架五段
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: troubleshooting
question_type: troubleshooting
difficulty: advanced
source_ids:
  - hadoop-yarn-commands-reference
  - hadoop-yarn-node-manager
claim_ids:
  - bigdata-yarn-claim-0016
  - bigdata-yarn-claim-0017
  - bigdata-yarn-claim-0020
related_docs:
  - bigdata/yarn/troubleshooting
estimated_minutes: 10
---

# 题目

排障 YARN 时，为什么一定要先分提交、Accepted、AM、Container、上层框架五段？

# 一句话结论

因为这五段对应的入口和根因完全不同，不先分型就会把 ACL、调度、节点执行和框架逻辑混成一团。

# 这题想考什么

这题考的是排障方法论，而不是会不会翻某个日志文件。

# 回答主线

1. 先定义五段。
2. 再讲每段优先看什么。
3. 再讲为什么上层框架经常被误归到 YARN。

# 参考作答

更实用的 YARN 排障一定先分阶段：提交层问题先看身份和 ACL；Accepted 层问题先看队列、AM 边界和标签；AM 层问题先看首个 Container 与注册链；Container 层问题先看 NM、本地化和退出码；上层框架问题则要继续看 Spark / MapReduce 自己的 UI 和日志。

这种分法的价值在于收敛。否则你可能拿着一个 ACL 问题去翻容器日志，或者拿着一个 Spark 算子错误去怪 ResourceManager。只要五段分清，YARN 排障会比很多人想象得简单得多。

# 现场判断抓手

1. 能把五段讲完整。
2. 能明确各段的优先观察入口。
3. 能主动指出 YARN 和上层框架边界。

# 常见误区

1. 所有问题都先看 RM。
2. 所有失败都先怪 YARN。
3. 不分提交和运行阶段。

# 追问

1. Accepted 卡住时为什么不该先追 Spark DAG？
2. AM 起不来时最该先看哪类日志？
3. 什么情况下问题其实根本不在 YARN？
