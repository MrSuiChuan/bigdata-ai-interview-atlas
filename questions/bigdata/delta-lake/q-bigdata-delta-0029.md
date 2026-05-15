---
id: q-bigdata-delta-0029
title: 为什么 Delta 的协议升级不能被当成功能开关，而应该被当成访问合同变更？
domain: bigdata
component: delta-lake
topic: feature-compatibility-and-protocol-upgrades
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Delta Lake docs as verified on 2026-05-09"
last_verified_at: "2026-05-09"
source_ids:
  - delta-lake-versioning
  - delta-lake-releases
  - delta-lake-column-mapping
  - delta-lake-default-columns
claim_ids:
  - bigdata-delta-claim-0020
  - bigdata-delta-claim-0021
  - bigdata-delta-claim-0032
  - bigdata-delta-claim-0039
  - bigdata-delta-claim-0047
related_docs:
  - bigdata/delta-lake/feature-compatibility-and-protocol-upgrades
estimated_minutes: 10
---

# 题目

为什么 Delta 的协议升级不能被当成功能开关，而应该被当成访问合同变更？

# 标准答案

因为 Delta 的很多高级能力并不只是“多一个功能”，而是会直接抬高访问这张表所需的 reader / writer 能力门槛。只要表启用了某个新 feature，例如 column mapping、default column values、deletion vectors、row tracking，问题就不再是“我自己想不想用”，而是“所有访问这张表的客户端现在还兼容吗”。

Delta 官方文档先用最小 reader / writer version 表达兼容边界，后续又引入 table features，让表可以更细粒度地声明自己启用了哪些能力。这套机制的核心目的不是为了炫技，而是防止旧客户端在不理解新规则的前提下继续读写，造成静默错误。所以协议升级本质上是在改表的访问合同。

更进一步说，很多升级还是不可逆的。比如 column mapping 启用后不能关闭，default columns 需要启用 writer feature，row tracking 关闭后也不会移除相关 table feature。这意味着“先开试试，不行再关”在很多场景里根本不是现实方案。

# 必答点

1. 说明协议升级改变的是访问门槛，而不是单个功能点。
2. 说明 reader / writer version 与 table feature 的意义。
3. 说明升级会影响所有客户端，而不只是主写入作业。
4. 说明很多 feature 启用后不可逆。

# 加分点

1. 能提到 Delta 与 Spark 的官方兼容矩阵也必须一起核验。
2. 能举出 column mapping 或 default columns 这类具体 feature 作为例子。

# 常见误答

1. 把 feature 升级理解成“表属性开关”。
2. 只看写入端兼容，不看所有读者。
3. 认为出问题可以随时关回去。

# 追问

1. 为什么说 table feature 比老的 bundled protocol version 更细？
2. 升级前为什么一定要盘点所有客户端？
3. 如果旧作业还在偷偷读表，协议升级会带来什么风险？