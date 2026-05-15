---
id: q-ai-pattern-0016
title: 为什么说 RAG 的 Freshness 和 Reindex Strategy 本质上是 Ingestion Architecture 问题
domain: ai-agent
component: agent-patterns
topic: ingestion-freshness-reindex
question_type: system_design
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-retrieval-guide
  - azure-indexer-overview
  - azure-create-indexer
  - azure-run-reset-indexers
  - azure-change-delete-detection
  - azure-update-rebuild-index
claim_ids:
  - pattern-claim-0034
  - pattern-claim-0056
  - pattern-claim-0057
  - pattern-claim-0058
  - pattern-claim-0059
  - pattern-claim-0060
  - pattern-claim-0061
related_docs:
  - ai-agent/patterns/ingestion-freshness-and-reindex-strategy
estimated_minutes: 9
---

# 题目

为什么说 RAG 的 Freshness 和 Reindex Strategy 本质上是 Ingestion Architecture 问题？

# 一句话结论

因为 freshness 取决于文档如何进入索引、变化如何被发现、删除如何被同步、schema 如何迁移，而不是只靠 query-time 检索参数就能补救。

# 核心机制

1. ingestion pipeline creates retrievable assets
2. incremental freshness depends on change detection and high-water marks
3. full reindex and schema migration require explicit strategy

# 标准答案

RAG 的 freshness 主要由 ingestion pipeline 决定。OpenAI Retrieval guide 说明文件入库后会经历 chunk、embed、index 的处理流程；Azure AI Search 则说明 indexer 最快通常每 5 分钟运行一次，更高频更新需要 push model。增量索引依赖 change detection 和 internal high-water mark，reset 只是清除同步位置，后续仍要显式 run 才会触发 full reindex。与此同时，删除检测不是自动完成的，必须设计 soft delete strategy；schema 变化中很多场景也不能原地修改，而是要 side-by-side 新索引加 alias 切换。因此，成熟的 reindex strategy 管的是入库、增量同步、删除同步和 schema 迁移，而不是简单“重跑一次 embedding”。

# 必答点

1. freshness 先看 ingestion，不是先看 query-time
2. reset 不等于 full reindex 已完成
3. delete detection 和 schema migration 都需要显式策略

# 常见误答

1. 把 freshness 理解成多搜几次就行
2. 把 reset 当作重建已经完成
3. 忽略删除同步和字段级 schema 演化