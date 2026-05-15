---
id: q-bigdata-yarn-0006
title: 在 YARN 里，RM 状态、Container 日志和 ATS 历史分别该从哪里读
domain: bigdata
component: yarn
status: reviewed
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: read-path
question_type: principle
difficulty: intermediate
source_ids:
  - hadoop-yarn-commands-reference
  - hadoop-yarn-node-manager
  - hadoop-yarn-timeline-service-v2
claim_ids:
  - bigdata-yarn-claim-0007
  - bigdata-yarn-claim-0016
  - bigdata-yarn-claim-0039
  - bigdata-yarn-claim-0041
related_docs:
  - bigdata/yarn/read-path
estimated_minutes: 8
---

# 题目

在 YARN 里，RM 状态、Container 日志和 ATS 历史分别该从哪里读？

# 一句话结论

RM 负责当前全局状态，NM / 聚合日志负责执行细节与退出原因，ATS 更偏历史与指标，这三类读入口各自回答不同问题。

# 这题想考什么

这题考的是你是否理解 YARN 的读取不是读业务数据，而是读多个状态中心。

# 回答主线

1. 先讲 RM 读什么。
2. 再讲日志读什么。
3. 再讲 ATS 读什么。
4. 最后讲实际诊断顺序。

# 参考作答

看当前应用在哪个阶段、队列资源怎样、节点是否健康，优先读 RM UI 或 `yarn application / queue / node`。但如果你要知道“容器为什么没起来”“退出码是什么”“本地化哪里失败”，真正的答案往往不在 RM，而在 NM 和容器日志里。也就是说，RM 更像当前控制面与调度面的权威入口，而不是最细执行上下文中心。

再往后，如果问题需要历史回溯和指标趋势，就读 ATS v2，尤其是 flow / flow run 这类长期视角。这里真正该讲透的一点是：YARN 的“读取路径”不是一条链，而是多状态中心并行存在。RM 负责当前全局状态，日志负责最细执行真相，ATS 负责历史和趋势。容器本地日志和远端聚合日志之间还要再分一层，因为“日志已生成”和“日志已可读”不是同一个边界。

所以答到原理层时，最好不要只说“三个入口分别看什么”，而是继续补一句“当前状态先 RM，细故障先容器与 NM，历史回放才 ATS；如果 `yarn logs` 拿不到，先不要跳结论，要继续区分是应用没跑、日志没生成、聚合没完成还是权限没放开”。这就从读入口清单进入证据链思维了。

# 现场判断抓手

1. 能把 RM、日志、ATS 分工讲清楚。
2. 能指出日志聚合的可见性边界。
3. 能给出先 RM 再日志再历史的顺序。

# 常见误区

1. 把读取理解成查 HDFS 数据。
2. 只看 RM，不追日志。
3. 把 ATS 说成 RM 的简单镜像。

# 追问

1. 为什么应用完成了，日志还可能暂时不可见？
2. Container 退出原因为什么不适合只看 RM？
3. ATS 更适合用在哪类长期问题上？
