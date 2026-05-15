---
id: q-ai-pattern-0019
title: 为什么企业 RAG 必须把 Permission-Aware Retrieval 和 Tenant Isolation 当成架构问题来设计
domain: ai-agent
component: agent-patterns
topic: permission-aware-retrieval-tenant-isolation
question_type: system_design
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/permission-aware-retrieval-and-tenant-isolation
estimated_minutes: 10
---

# 题目

为什么企业 RAG 必须把 Permission-Aware Retrieval 和 Tenant Isolation 当成架构问题来设计？

# 一句话结论

因为授权边界和租户隔离一旦出错，后果不是答案不准，而是越权访问和数据泄漏，而这些边界从 indexing 阶段就已经开始决定了。

# 核心机制

1. permission metadata must exist in the index
2. query-time trimming depends on indexed authorization data
3. tenant isolation affects both security and relevance statistics

# 标准答案

Permission-Aware Retrieval 的核心，是让权限约束直接进入 retrieval pipeline，而不是结果出来后再补删。Azure 的 document-level access control 和 query-time ACL/RBAC enforcement 都强调，查询时的授权依赖于索引里已经存在的 permission metadata，因此权限边界其实从 indexing 阶段就开始了。对于没有内建权限抽取的数据源，应用必须自己把内容和权限元数据一起写入索引。另一方面，在多租户场景中，tenant isolation 也不能简化成“加个 tenant_id 过滤”。Azure AI Search 明确区分 index-per-tenant、service-per-tenant 和 hybrid 三种模式，它们在成本、隔离强度和运维复杂度上差异明显。更进一步，即使多个租户共享一个 index 并通过 filter 隔离结果，relevance 统计仍在 index-level scope 计算，可能带来跨租户排名串扰。因此，这首先是架构问题，而不是查询技巧问题。

# 必答点

1. 权限控制从 indexing 时的 metadata 建模就开始了
2. security filter 与 native ACL / RBAC 要区分
3. tenant isolation 至少要讲 index、service、hybrid 三种模式
4. 共享索引还会影响 relevance statistics

# 常见误答

1. 认为 query-time 加 tenant_id 就足够
2. 忽略 permission metadata 的 ingestion 依赖
3. 不考虑共享索引的 relevance 副作用