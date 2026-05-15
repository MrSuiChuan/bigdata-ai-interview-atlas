---
id: q-ai-pattern-0035
title: 为什么知识型 Agent 必须把 Ingestion Freshness、Source Trust Ranking 和 Conflict Resolution 链成一条治理链
domain: ai-agent
component: agent-patterns
topic: knowledge-freshness-ingestion-trust-conflict-resolution
question_type: principle
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
  - openai-file-search-docs
  - attribute-first-paper
  - rarr-paper
claim_ids:
  - pattern-claim-0034
  - pattern-claim-0056
  - pattern-claim-0057
  - pattern-claim-0058
  - pattern-claim-0059
  - pattern-claim-0060
  - pattern-claim-0061
  - pattern-claim-0157
  - pattern-claim-0158
  - pattern-claim-0159
  - pattern-claim-0160
  - pattern-claim-0161
related_docs:
  - ai-agent/patterns/knowledge-freshness-source-trust-ranking-and-conflict-resolution
estimated_minutes: 13
---

# 题目

为什么知识型 Agent 必须把 Ingestion Freshness、Source Trust Ranking 和 Conflict Resolution 链成一条治理链？

# 一句话结论

因为知识可靠性不是一个阶段就能解决的：有的错死在入库和更新发现，有的错死在候选证据排序，还有的错会一直拖到答案综合阶段才暴露。

# 核心机制

1. freshness 首先是 ingestion architecture 问题
2. source trust ranking 必须在生成前完成，而不是交给模型临场猜
3. schema correctness 与 content freshness 是两层不同可靠性
4. conflict resolution 需要跨 retrieval、ranking 和 synthesis 三阶段完成

# 标准答案

知识型 Agent 必须把 ingestion freshness、source trust ranking 和 conflict resolution 串成一条治理链，因为这三类错误根本发生在不同阶段。OpenAI retrieval guide 与 Azure 索引器文档说明，freshness 首先是 ingestion architecture 问题：文档如何进入索引、变化如何被发现、删除如何被同步、什么时候做增量、什么时候必须 reset 或 rebuild，决定了检索系统拿到的是不是最新材料。进一步看，Azure 关于索引更新与重建的说明还表明，schema change 会让“看起来已更新”的索引在结构上仍然不可靠，因此 content freshness 和 index correctness 必须分开考虑。进入 retrieval 之后，OpenAI file search 文档以及 attribute-first、RARR 一类工作又说明，候选文档能被找到，不代表它就该被优先信任，系统必须根据来源权威性、更新时间、相关性和可核验属性做 trust ranking，再把更可信的证据送进生成阶段。最后在 synthesis 阶段，多个来源冲突时不能只把第一名文档当成真相，而应该显式处理来源优先级、时间覆盖规则、证据冲突和不确定性表达。真正成熟的回答，应该把 freshness、trust 和 conflict 看成一条从入库到答案综合的知识治理链，而不是三个孤立技巧。

# 必答点

1. 说明 freshness 的第一现场在 ingestion，不在 query-time
2. 说明增量、删除检测、reset 和 rebuild 不是同一件事
3. 说明 schema correctness 与 content freshness 必须分层看
4. 说明 trust ranking 应发生在生成前
5. 说明冲突处理要跨 retrieval、ranking 和 synthesis 三阶段

# 常见误答

1. 把 freshness 只理解成“定期重建索引”
2. 不区分内容更新和索引结构失配
3. 认为 citation 已经自动等于证据可检验
4. 不做来源优先级和时间覆盖规则
5. 多来源冲突时强行融合，不保留不确定性