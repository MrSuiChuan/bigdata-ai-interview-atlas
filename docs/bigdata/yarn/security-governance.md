---
kb_id: bigdata/yarn/security-governance
title: YARN 安全治理与权限边界
description: 围绕 Kerberos、delegation token、queue ACL、日志访问、代理用户和容器执行身份，说明 YARN 的安全边界为什么必须按链路分层设计。
domain: bigdata
component: yarn
topic: security-governance
difficulty: advanced
status: reviewed
sidebar_position: 15
version_scope: Official Apache Hadoop current YARN docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
source_ids:
  - hadoop-yarn-application-security
  - hadoop-yarn-capacity-scheduler
  - hadoop-yarn-node-manager
claim_ids:
  - bigdata-yarn-claim-0006
  - bigdata-yarn-claim-0015
  - bigdata-yarn-claim-0034
  - bigdata-yarn-claim-0036
  - bigdata-yarn-claim-0037
tags:
  - yarn
  - security
  - acl
  - kerberos
  - knowledge-base
---
## YARN 的安全不是“作业能提交就行”，而是整条提交和执行链都要有边界
YARN 的安全题很容易被答成“开 Kerberos”。Kerberos 当然重要，但这只是入口。真正放到生产里，YARN 的安全至少要覆盖：

- 谁可以提交应用。
- 谁可以代表别人提交应用。
- 队列是否允许这个用户进入。
- 容器最终以什么身份运行。
- 日志谁可以看。
- 应用拿到的 token 与 HDFS、Hive、Spark 等外围系统如何协同。

这说明 YARN 的安全不是一个点，而是一条链。

## 第一层：提交身份与代理身份
最外层边界是“谁提交、是不是代理提交”。一旦存在调度平台、网关服务或共享入口，就一定会引出 proxy-user 边界。如果这里管不清，后面的 ACL 和审计都会失真。

## 第二层：队列 ACL
就算用户已经通过认证，也不等于他能随便进所有队列。Queue ACL 是共享集群里最基本的一层安全治理：它决定谁能把应用送进哪条资源路径。很多团队把这层忽略掉，结果最后变成“安全只管登录，不管资源入口”。

## 第三层：token 和 credentials
YARN 应用通常不仅要访问 RM，自身还要带着 credentials 去访问 HDFS、Hive Metastore 或其他系统。Delegation Token 的价值就在于把这些访问能力安全地下发给应用，而不是把长期凭据直接摊给运行进程。

所以安全题如果只讲 Kerberos，不讲 token，往往还不够深入。

更具体一点，真正被下发到执行链里的不是一句抽象的“你有权限了”，而是会跟着 `ContainerLaunchContext` 一起进入容器启动上下文的 credentials。这样应用在节点上启动后，可以在不暴露长期密钥的前提下访问外围 Hadoop 服务。这个机制讲出来，YARN 安全题就从“会背 Kerberos”进入“理解提交链和执行链如何闭环”了。

## 第四层：容器执行身份
真正拉起进程的是 NM，因此“容器最终以谁的身份运行”是很关键的边界。这里的设计既关系到节点安全，也关系到多租户隔离。YARN 安全不是只有 RM 侧策略，节点执行面同样是安全边界的一部分。

## 第五层：日志访问边界
生产里最容易忽视的一层，是日志权限。作业日志往往包含启动命令、参数、路径、异常上下文，如果日志访问边界失控，安全问题会直接外泄到排障入口。

这也是为什么真正成熟的安全设计，一定会把“谁能看日志”单独当成一层，而不是默认有账号就都能看。

## 一个更成熟的 YARN 安全主线
1. 先认证：确定提交身份。
2. 再授权：确定能进哪些队列、能触发哪些操作。
3. 再下发最小所需凭据：由 token 支撑应用访问外部系统。
4. 再保护节点执行和日志读取边界。

这样回答，才不会把安全收缩成单点配置问题。

## 本页结论
YARN 的安全边界至少要覆盖提交身份、代理用户、队列 ACL、token、容器执行身份和日志访问。只要能把这条链讲清楚，就不会再把 YARN 安全误答成“开 Kerberos”这么单薄。
