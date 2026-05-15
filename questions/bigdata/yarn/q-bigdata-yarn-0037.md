---
id: q-bigdata-yarn-0037
title: 排障时 yarn application、applicationattempt、container、node、logs 这些命令应该按什么顺序用
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
  - bigdata-yarn-claim-0038
related_docs:
  - bigdata/yarn/troubleshooting
  - bigdata/yarn/read-path
estimated_minutes: 10
---

# 题目

排障时 `yarn application`、`applicationattempt`、`container`、`node`、`logs` 这些命令应该按什么顺序用？

# 一句话结论

更稳的顺序是先看 Application 全局阶段，再下钻 Attempt 和 Container，再回看 Node 状态，最后结合 logs 还原失败上下文，因为这些命令对应的是不同层级的状态对象。

# 这题想考什么

这题考的是你会不会把 YARN CLI 当成一套分层诊断工具，而不是只会机械执行一条 `yarn logs`。

# 回答主线

1. 先讲每个命令对应哪个状态对象。
2. 再讲为什么顺序要从全局状态到局部上下文。
3. 最后讲不同阶段的问题该停在哪一层。

# 参考作答

更实用的顺序通常是：先用 `yarn application -status` 确认应用整体卡在提交、Accepted、Running 还是已结束；如果需要继续下钻，再用 `yarn applicationattempt -list` 看 Attempt 是否切换过、是否存在 AM 重试；然后用 `yarn container -status` 看关键容器到底有没有被拉起、退出码是什么；如果怀疑节点执行面问题，再用 `yarn node -list -showDetails` 回头确认节点健康和可分配状态；最后再用 `yarn logs` 去还原具体失败上下文。

这个顺序的核心，不是命令谁先谁后，而是它们对应的状态层次不同。`application` 回答全局阶段，`attempt` 回答应用级恢复和 AM 切换，`container` 回答具体执行单元，`node` 回答节点侧资源与健康，`logs` 回答细故障上下文。如果一上来就只看日志，很容易在阶段判断都没做对时就陷入细枝末节。

# 现场判断抓手

1. 能把五类命令和对应对象一一对上。
2. 能解释为什么先看全局状态，再看局部细节。
3. 能讲出 Attempt 和 Container 的排障价值差异。

# 常见误区

1. 任何问题都只会执行 `yarn logs`。
2. 不区分 Application 和 ApplicationAttempt。
3. 明明是节点健康问题，却只盯应用状态。

# 追问

1. 为什么 `applicationattempt` 对 AM 重试问题特别关键？
2. 什么情况下 `container -status` 的价值高于直接翻日志？
3. 节点异常时为什么还要回头看 `node -list -showDetails`？
