---
kb_id: ai-agent/patterns/permission-aware-retrieval-and-tenant-isolation
title: Permission-Aware Retrieval / Tenant Isolation：企业 RAG 的第一原则不是答得快，而是不能越权
domain: ai-agent
component: agent-patterns
topic: permission-aware-retrieval-tenant-isolation
difficulty: advanced
status: reviewed
sidebar_position: 19
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - azure-document-level-access
  - azure-query-time-acl-rbac
  - azure-security-filter-pattern
  - azure-multitenant-saas-search
claim_ids:
  - pattern-claim-0073
  - pattern-claim-0074
  - pattern-claim-0075
  - pattern-claim-0076
  - pattern-claim-0077
tags:
  - ai-agent
  - rag
  - security
  - permission
  - multitenancy
---
## 一句话结论

Permission-Aware Retrieval / Tenant Isolation：企业 RAG 的第一原则不是答得快，而是不能越权需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题比一般 RAG 更高优先级

因为普通 retrieval 出错，通常是：

1. 答案不准
2. 检索不稳
3. 成本偏高

而权限和租户隔离出错，后果往往是：

1. 数据泄漏
2. 合规违规
3. 用户看到本不该看到的文档或引用

所以这类问题不是“效果优化”，而是系统安全边界。

## Permission-Aware Retrieval 的本质是什么

它不是“检索完再删一删结果”，而是：

1. 让 authorization 成为 retrieval path 的一部分
2. 保证未经授权的文档根本不能进入候选集
3. 让后续 ranking、synthesis、citation 都建立在已授权的搜索空间之上

这一点非常重要，因为如果越权文档先进入了候选或 prompt，再在后面“补删”，系统已经处于高风险状态了。

## Azure Document-Level Access 给出的关键启发

Azure 的文档把 permission-aware retrieval 讲得很清楚：

1. document-level access control 从 ingestion 到 query execution 全链路生效
2. query time 会检查用户 token 与文档权限元数据
3. 结果集会被 trim 成用户可访问的文档子集

这意味着权限控制不是额外外挂，而是 retrieval pipeline 的正式组成部分。

## 为什么授权问题其实从 indexing 就开始了

Query-time ACL and RBAC Enforcement 文档把另一个高频误区说破了：

1. query-time authorization 依赖 permission metadata 已经在 indexing 时进入索引
2. 这些 permission metadata 必须放到 filterable string fields
3. 如果数据源没有内建权限抽取，你必须自己把 content 和 permission metadata 一起 push 进去

这说明什么？

1. 权限控制不是只看 query header
2. 它的前提是索引里已经有正确、完整、可过滤的权限元数据
3. 所以 permission-aware retrieval 的第一步不是写 filter，而是把 ACL / RBAC / label metadata 正确建模进索引

这句话在技术复盘中很值钱：

权限不是查询时才开始加上的，而是索引时就必须被编码进检索空间。

## Security Filter Pattern 为什么值得单独讲

并不是所有场景都能直接用内建 ACL / RBAC 支持。

Azure 给出的 security filter pattern 本质上是：

1. 把 user 或 group identity 放进可过滤字符串字段
2. 查询时通过 filter 做 trimming
3. 让系统只返回 identity 匹配的文档

这里最实用的一点是 `search.in`：

1. 用 `search.in` 处理一大串 principal id
2. 比长串 `or` equality 更稳
3. 官方明确说长列表 equality 可能慢很多秒，而 `search.in` 可维持亚秒级

所以 permission-aware retrieval 不只是 correctness boundary，也会直接影响可扩展性。

## Tenant Isolation 不只是“加一个 tenant_id 过滤”

这是另一个非常容易理解停留在表层的点。

如果用户只回答：

1. 每次查询带 tenant_id filter

那还远远不够。

Azure 的 multitenant 设计文档说明，常见模式至少有：

1. one index per tenant
2. one service per tenant
3. hybrid

这三种不是实现细节，而是不同隔离级别：

1. index-per-tenant 更省成本，但共享服务层资源
2. service-per-tenant 隔离最强，但成本更高
3. hybrid 用来平衡大租户和长尾租户

这就是 tenant isolation 真正的架构层问题。

## 为什么共享索引还有 relevance 副作用

Azure 的 multitenant 文档还给了一个特别容易忽视的点：

1. 如果多个 tenant 共用一个 index
2. 即使查询时加 filter 隔离结果
3. relevance statistics 仍然在 index-level scope 计算

这意味着：

1. 租户 A 的 term distribution 可能影响租户 B 的排名统计
2. 共享索引不仅是安全隔离问题，还是 relevance isolation 问题

这句话非常适合技术复盘，因为它直接把“tenant filter”从安全问题升级成“安全 + 排名 + 架构”的综合问题。

## 一个成熟的企业 RAG 回答通常怎么分层

最好的答法通常会分三层：

1. document-level authorization：用户到底能看哪些文档
2. tenant isolation architecture：租户之间的数据和负载如何隔离
3. relevance isolation tradeoff：共享索引会不会引入统计串扰

如果这三层都讲到了，答案通常会很完整。

## 机制解读

Permission-Aware Retrieval 的核心，是让权限约束直接进入 retrieval pipeline，而不是在结果出来后再做补删。Azure 的 document-level access control 和 query-time ACL/RBAC enforcement 都强调，查询时的授权依赖于索引里已经存在的 permission metadata，因此权限边界其实从 indexing 阶段就开始了。对于没有内建权限抽取的数据源，应用必须自己把内容和权限元数据一起写入索引。另一方面，在多租户场景中，tenant isolation 也不能简化成“加个 tenant_id 过滤”。Azure AI Search 明确区分 index-per-tenant、service-per-tenant 和 hybrid 三种模式，它们在成本、隔离强度和运维复杂度上差异明显。更进一步，即使多个租户共享一个 index 并通过 filter 隔离结果，relevance 统计仍在 index-level scope 计算，可能带来跨租户排名串扰。因此，企业 RAG 的关键不是只把结果 trim 对，而是从索引建模、权限元数据、查询过滤和租户架构四层一起设计。

## 易混边界

1. 认为权限过滤只要 query-time 加个 tenant_id 就够了
2. 忽略 permission metadata 在 indexing 时的作用
3. 把 security filter 和 native ACL / RBAC 混成一类能力
4. 不意识到共享索引还会影响 relevance statistics

## 相关样例

1. `examples/python/ai-agent/permission_aware_retrieval_outline.py`
