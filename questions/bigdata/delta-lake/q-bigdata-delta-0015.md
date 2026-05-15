---
id: q-bigdata-delta-0015
title: 为什么 Delta 的安全治理不能只依赖应用层“别乱访问”？
domain: bigdata
component: delta-lake
topic: security-governance
question_type: security
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-docs
  - delta-lake-faq
  - delta-lake-catalog-managed-tables
  - delta-lake-utility
claim_ids:
  - bigdata-delta-claim-0001
  - bigdata-delta-claim-0038
  - bigdata-delta-claim-0040
related_docs:
  - bigdata/delta-lake/security-governance
estimated_minutes: 8
---

# 题目

为什么 Delta 的安全治理不能只依赖应用层“别乱访问”？

# 标准答案

因为 Delta 本身不是权限系统，它负责的是表状态，而不是访问控制闭环。如果只靠应用层约定“谁别乱删、谁别乱改”，那一旦有人绕开应用直接接触对象存储、Catalog 或运行身份，整个表状态边界都可能被破坏。真正的安全治理必须覆盖对象存储、Catalog 和计算运行时三个层次。

对象存储层要同时保护数据文件和 `_delta_log`，不能出现“数据目录受控、日志目录裸奔”或反过来的不对称情况；Catalog 层要控制谁能找得到这张表、谁能做 restore、replace、convert 这类高风险控制面操作；运行层要控制作业使用什么身份、在什么环境里读写。只有三层一起管，Delta 的表语义边界才是真的被保护起来。

更成熟一点的回答还会指出，`RESTORE`、`VACUUM`、`REPLACE TABLE`、`CONVERT TO DELTA` 这类命令都不只是普通 SQL，而是生命周期控制面动作，所以权限和审计应更严格。

# 必答点

1. 明确说 Delta 不是权限系统。
2. 说明安全治理至少覆盖对象存储、Catalog、运行身份三层。
3. 说明 `_delta_log` 和数据文件必须一起受保护。
4. 说明高风险控制面操作需要单独审计与授权。

# 加分点

1. 能提到 Catalog-managed 模式会进一步放大控制面治理的重要性。
2. 能提到审计要同时看 history、Catalog 审计和对象存储审计。

# 常见误答

1. 认为只要应用逻辑有限制就够了。
2. 只谈表权限，不谈底层日志目录保护。
3. 把高风险命令和普通查询放在同一权限等级看待。

# 追问

1. 为什么 `_delta_log` 的保护级别必须和数据文件一致？
2. 为什么 restore 和 vacuum 应该纳入更严格审批？
3. 如果一个旧脚本能直接操作底层路径，它会带来哪些真实风险？