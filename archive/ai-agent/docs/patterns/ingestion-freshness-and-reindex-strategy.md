---
kb_id: ai-agent/patterns/ingestion-freshness-and-reindex-strategy
title: "Ingestion / Freshness / Reindex Strategy：检索层的很多问题，其实早在入库时就决定了"
domain: ai-agent
component: agent-patterns
topic: ingestion-freshness-reindex
difficulty: advanced
status: reviewed
sidebar_position: 16
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
tags:
  - ai-agent
  - rag
  - ingestion
  - freshness
  - reindex
---

# 一句话结论

RAG 的 freshness 不是“检索时多搜一下”就能解决的，它首先取决于 ingestion pipeline 怎么跑、变化怎么被发现、删除怎么被同步、schema 变化怎么迁移，以及什么时候该做增量索引、什么时候必须做完整重建。

# 为什么很多团队只盯 query-time 层

因为检索系统在使用时最显眼的是：

1. 问题怎么写
2. top-k 怎么调
3. rerank 怎么做

但生产问题经常根本不出在 query-time，而出在 ingestion-time：

1. 新文档还没入索引
2. 老文档其实已经删了但索引里还在
3. schema 变了，字段却是空的
4. reset 了却没真正触发 full reindex

所以如果不把 ingestion 和 freshness 单独讲，很多排障结论都会跑偏。

# 入库并不是“把文件放进去”那么简单

OpenAI Retrieval guide 给出的基础描述是：

1. 文件进入 vector store 后会被自动 chunk
2. 然后被 embed
3. 再被 index

这说明 ingestion 本质上是一个处理流水线，而不是单步存储动作。

也就是说，一旦你讨论 freshness，就不能只问“文件在不在”，还要问：

1. 有没有被处理完成
2. 是不是已经形成新的可检索索引条目
3. 旧条目是否仍然残留

# Pull 模型和 Push 模型的边界

Azure AI Search indexer 文档给出一个很典型的生产边界：

1. indexer 最快可以每 5 分钟跑一次
2. 如果你需要更高频的更新，就不适合继续依赖 indexer
3. 这时更应该使用 push model，让外部系统主动同步搜索索引

这点很重要，因为它说明 freshness 不是只看“有没有定时任务”，而是看：

1. 业务允许的陈旧度是多少
2. 你的 ingestion 机制能否满足这个 SLA

如果用户要求秒级新鲜度，却还在用分钟级 pull indexer，那问题不在 retrieval quality，而在 ingestion architecture。

# 增量索引真正依赖什么

Create Indexer 和 Run/Reset Indexers 文档说明：

1. 增量索引依赖 change detection
2. indexer 会维护 internal high-water mark
3. 调度执行时，本质上是在“从上次处理位置继续向前同步”

所以增量索引不是“每次都把全量数据重新导入”，而是：

1. 识别变化
2. 从变更点继续处理
3. 尽量降低全量重扫成本

这一点一旦讲清楚，就能自然回答很多追问，比如：

1. 为什么某些文档修改后没同步进来
2. 为什么 reset 后行为和预期不同

# Reset 为什么不是“重建已经完成”

这是非常高频的工程误区。

官方文档明确说 reset 是被动动作：

1. 它会清除 high-water mark
2. 但不会自己开始重新跑
3. 必须后续再执行 run，full reindex 才真正发生

所以如果有人说：

1. 我们 reset 过了，为什么索引还没刷新

答案很可能不是系统坏了，而是对 reset 语义理解错了。

# 删除同步为什么格外容易出问题

Change and Delete Detection 文档非常值得引用，因为它指出：

1. 删除检测不是自动存在的
2. 需要设计 soft delete strategy
3. 某些场景里，甚至要求从第一次运行开始就把删除检测策略配置好

这告诉我们一个关键事实：

1. freshness 不只是“新东西进得快”
2. 还包括“旧东西退得干净”

很多系统回答过时，根因不是没索到新文档，而是把已经无效的旧文档继续留在索引里。

同一份文档还提醒了另一个常见边界：

1. 如果 blob 内容恢复但 LastModified 没变化
2. 可能不会被再次索引

这说明 freshness 依赖的是变化检测信号，而不是人类主观认为“内容变了应该重扫”。

# Schema 变化为什么常常必须重建

Update or Rebuild Index 文档对生产迁移很关键。它说明很多 schema 变化不能平滑原地完成，例如：

1. 字段名变化
2. 类型变化
3. analyzer 变化
4. 某些 index attribute 变化

这类情况下，官方建议是：

1. side-by-side 创建新索引
2. 重新灌入数据
3. 再通过 alias 做切换

这是一种很典型的生产安全策略，因为它避免了“在线直接改坏旧索引”。

同时，文档还强调：

1. 新增字段即使不重建也可以加上
2. 但旧文档这个字段初始会是 null
3. 要等下一次 indexing job 或文档更新后才会填上

这也说明 schema freshness 和 content freshness 不是同一个问题。

# 一个成熟的 freshness 答案应该包含什么

高质量回答一般至少覆盖：

1. ingestion pipeline 是如何把原始文档变成可检索资产的
2. 增量同步依赖什么 change detection 机制
3. 删除如何同步
4. full reindex 在什么条件下必须做
5. schema 变更如何做 side-by-side cutover

如果只说“重跑 embedding”或者“重建向量库”，通常还是太浅。

# 标准面试答案

RAG 的 freshness 和 reindex strategy 主要是 ingestion architecture 问题，而不只是 retrieval 参数问题。OpenAI Retrieval guide 说明文件入库后会经历 chunk、embed、index 的处理流程；Azure AI Search 则进一步说明 indexer 最快通常每 5 分钟运行一次，更高频更新需要 push model。增量索引依赖 change detection 和 internal high-water mark，reset 只是清除同步位置，后续仍要显式 run 才会触发 full reindex。与此同时，删除检测不是自动完成的，必须有 soft delete strategy；schema 变化中很多场景也不能原地修改，官方建议 side-by-side 新索引加 alias 切换。因此，真正成熟的 reindex strategy 必须同时管理内容变更、删除同步、schema 迁移和新鲜度 SLA，而不是简单“重跑一次向量化”。

# 常见误答

1. 认为 freshness 只靠 query-time 检索增强就能解决
2. 把 reset 误解成已经完成 full reindex
3. 忽略 delete detection
4. 认为 schema 变化都可以在线无损修改
5. 不区分 content freshness 和 schema freshness

# 相关样例

1. `examples/python/ai-agent/ingestion_freshness_reindex_outline.py`