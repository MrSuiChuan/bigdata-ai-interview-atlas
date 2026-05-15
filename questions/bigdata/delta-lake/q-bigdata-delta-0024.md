---
id: q-bigdata-delta-0024
title: Delta 的安全边界为什么不能只依赖应用层控制？
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
  - delta-lake-utility
claim_ids:
  - bigdata-delta-claim-0001
  - bigdata-delta-claim-0038
related_docs:
  - bigdata/delta-lake/security-governance
estimated_minutes: 8
---

# 题目

Delta 的安全边界为什么不能只依赖应用层控制？

# 标准答案

因为 Delta 表的状态不仅仅暴露在应用代码里，还暴露在对象存储、Catalog 和运行身份上。只靠应用层去约束“谁不要乱删、谁不要乱改”，无法阻止绕过应用直接接触 `_delta_log`、底层数据路径或高风险命令的行为。换句话说，应用层控制只能约束“正常路径”，却约束不了“旁路入口”。

成熟的安全边界必须三层一起做：存储层保护数据文件与事务日志；Catalog 层保护表发现、表管理和高风险控制面操作；运行层保护作业凭证和执行身份。只有三层一起管，Delta 的表级正确性才不会被旁路写坏。

# 必答点

1. 说明 Delta 的旁路入口不止应用层。
2. 说明对象存储、Catalog、运行身份都属于安全边界的一部分。
3. 说明 `_delta_log` 是必须重点保护的控制面。
4. 说明高风险命令不能只靠“大家自觉”。

# 加分点

1. 能说明 restore / vacuum / replace 这类操作为什么要更严格审计。
2. 能说明为什么表权限和底层路径权限必须一致收口。

# 常见误答

1. 认为只要服务端 API 控住就够了。
2. 只谈 SQL 权限，不谈底层路径。
3. 完全忽视 `_delta_log` 的保护价值。

# 追问

1. 为什么日志目录权限失控会比普通目录失控更危险？
2. 哪些控制面命令最应该被当成高风险操作？
3. 如果一个脚本能绕过 Catalog 直接写路径，会破坏哪些边界？