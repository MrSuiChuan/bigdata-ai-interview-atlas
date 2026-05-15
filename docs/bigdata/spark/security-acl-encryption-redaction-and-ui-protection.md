---
kb_id: bigdata/spark/security-acl-encryption-redaction-ui-protection
title: Spark 安全、ACL、加密与敏感信息保护
description: 解释 Spark UI ACL、事件日志保护、配置脱敏、网络加密和运行时权限边界。
domain: bigdata
component: spark
topic: security-acl-encryption-redaction-ui-protection
difficulty: advanced
status: reviewed
sidebar_position: 32
version_scope: Spark 4.1.1 docs as verified on 2026-05-05
last_verified_at: "2026-05-05"
source_ids:
  - spark-security-doc
  - spark-configuration-doc
  - spark-monitoring-doc
  - spark-submitting-applications
claim_ids:
  - spark-claim-0154
  - spark-claim-0155
  - spark-claim-0156
  - spark-claim-0157
tags:
  - spark
  - security
  - acl
  - encryption
  - redaction
  - knowledge-base
  - production
---
## 定位与边界
Spark 安全不是单个开关，而是 UI 访问、event log、网络通信、认证、授权、加密、配置脱敏、依赖分发和底层存储权限共同形成的边界。Spark 可以提供应用级控制，但数据访问最终还依赖 HDFS、对象存储、Hive Metastore、Kubernetes、YARN 或外部权限系统。

本页关注 Spark 自身能保护哪些面，以及哪些面必须交给平台权限、网络和存储系统治理。

## 核心对象
| 对象 | 作用 | 风险 |
| --- | --- | --- |
| Spark UI | 展示 job、SQL、environment、executor、storage 等信息 | 可能暴露 SQL、路径、配置和错误栈 |
| History Server | 回放已完成应用 | event log 权限不当会暴露历史执行元数据 |
| ACL | 控制应用 UI 和操作权限 | 需要和企业身份体系结合 |
| Redaction | 对敏感配置做脱敏 | 默认规则不一定覆盖自定义 secret |
| Network/RPC Encryption | 保护 Spark 内部通信 | 需要与部署模式一致配置 |
| Local/IO Encryption | 保护本地数据和 shuffle 等路径 | 不替代外部存储加密 |

## UI 与 Event Log
Spark UI 和 History Server 会暴露 job、SQL、环境变量、配置、accumulator、错误栈和部分执行计划信息。生产环境应开启访问控制，限制 History Server 访问，并对 event log 存储做权限控制。否则即使原始数据受保护，执行元数据也可能泄露敏感信息。

Event log 是事后排障证据，也是安全资产。它需要可靠存储、保留策略、访问审计和脱敏策略。

## 配置脱敏
Spark 支持对敏感配置做 redaction，避免 token、password、secret 在 UI、日志或 event log 中直接出现。生产中应检查自定义配置键、连接串、环境变量和第三方库日志是否被默认规则覆盖。

不要把脱敏当成权限控制。脱敏减少展示泄露，不能阻止有权限用户读取底层数据或访问外部服务。

## 网络与存储边界
Spark 网络加密、RPC 认证、shuffle 加密和 I/O 加密需要结合部署模式配置。即使 Spark 内部链路加密，外部数据源、checkpoint 目录、event log 目录、临时目录和依赖包仓库也需要独立权限和加密策略。

如果运行在 Kubernetes 或 YARN 上，还要同时检查 service account、Pod 权限、Kerberos、Ranger、云 IAM 或对象存储策略。

## 生产排查
安全问题排查应从访问路径开始：谁提交应用、Driver 运行在哪、executor 使用什么身份访问数据、UI/History Server 谁可见、event log 放在哪、配置是否脱敏、依赖包是否可信。不要只看 Spark 作业是否成功。

权限错误常常表现为读取失败、写出失败、checkpoint 失败、event log 写入失败或 executor 无法访问 secret。

## 示例：安全检查清单
~~~text
1. UI 和 History Server 是否启用 ACL，并接入企业身份体系。
2. event log、checkpoint、临时目录和输出目录是否有最小权限。
3. redaction 规则是否覆盖 password、token、secret、自定义连接串。
4. Spark 内部网络、shuffle 和本地 I/O 加密是否按部署模式配置。
5. executor 访问外部存储和 catalog 使用的身份是否可审计。
~~~

## 来源与事实边界
本页依据 Spark Security、Configuration、Monitoring 和 Submitting Applications 文档。企业平台通常还会叠加 Kerberos、Ranger、Lake Formation、Kubernetes RBAC 或云 IAM，应以实际平台权限链路为准。
