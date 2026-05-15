---
kb_id: ai-agent/patterns/knowledge-freshness-source-trust-ranking-and-conflict-resolution
title: Ingestion / Freshness / Source Trust / Conflict Resolution：检索可靠性真正难的不是搜到内容，而是搜到可信且最新的内容
domain: ai-agent
component: agent-patterns
topic: knowledge-freshness-ingestion-trust-conflict-resolution
difficulty: advanced
status: reviewed
sidebar_position: 16
version_scope: Official docs and primary papers as verified on 2026-04-25
last_verified_at: '2026-04-25'
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
tags:
  - ai-agent
  - rag
  - freshness
  - ingestion
  - trust-ranking
  - conflict-resolution
---
## 一句话结论

Ingestion / Freshness / Source Trust / Conflict Resolution：检索可靠性真正难的不是搜到内容，而是搜到可信且最新的内容需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人一讲 knowledge freshness，就会直接落到这些说法：

1. 做 RAG
2. 定期重建索引
3. 让模型多引用来源

这些回答都抓到了一部分，但它们把三类本质不同的问题混在了一起：

1. freshness：索引里的内容是不是已经过时
2. trust ranking：候选证据里应该优先信谁
3. conflict resolution：多个来源互相打架时最终答案怎么决策

这三类问题失败的位置完全不同。第一类常常死在 ingestion pipeline，第二类死在 retrieval 之后、生成之前，第三类则会一直延伸到 answer synthesis 阶段。

## Freshness 为什么首先是 Ingestion Architecture 问题

RAG 系统最容易被忽略的一点是：检索阶段只能在“当前索引里已有的可检索资产”里工作。OpenAI retrieval guide 和 Azure 的 indexer 文档共同说明，真正决定 freshness 的第一现场是 ingestion：

1. 文档怎样进入索引
2. 更新怎样被发现
3. 删除怎样被同步
4. schema 变化怎样迁移
5. 何时做增量，何时必须重建

所以 freshness 的根问题不在 query-time，而在 write-time。

如果入库链路本身不可靠，后面的 rerank、citation 和 answer synthesis 都只能在过时或不完整的材料上尽力而为。

## 增量、删除检测、Reset 和 Rebuild 分别解决什么

Azure 索引器相关文档很适合把这块答到工程层，因为它清楚展示了几个经常被混淆的动作：

1. change detection：发现哪些对象发生了变化
2. delete detection：让索引知道哪些对象已经不存在
3. reset / rerun indexer：重新跑索引流程
4. rebuild index：在 schema 或结构变化较大时重建索引

这里最容易答错的是把这些动作当成同义词。

它们的职责其实不同：

1. change detection 解决“哪些文档应该增量更新”
2. delete detection 解决“哪些旧文档应该从索引里删掉”
3. reset 解决“让索引流程重新扫描并再执行一次”
4. rebuild 解决“当前索引结构本身已经不再可信”

所以一个成熟的 freshness 设计一定会把这几个动作拆开，而不会笼统说一句“定时重建索引”。

## 为什么 Schema Change 会让“看起来已更新”的索引仍然不可靠

这块是很多知识表达的薄弱点。

很多团队以为只要内容增量更新了，freshness 就解决了。但 Azure update/rebuild 指南说明，当索引 schema 本身发生变化时，问题就不再只是“有没有新内容”，而是：

1. 当前字段结构还能不能表达新语义
2. 旧 embedding 或旧字段映射是不是已经不兼容
3. 旧文档即便被重新拉取，是否仍会落在错误结构上

这意味着 schema change 会制造一种很危险的假象：

索引看起来是新的，但结构上已经不再可信。

所以成熟系统必须把 freshness 分成至少两层：

1. content freshness：文档内容是否最新
2. index correctness：索引结构是否仍然正确表达这些内容

只有两层都成立，检索结果才值得谈“可靠”。

## Trust Ranking 为什么必须发生在生成之前

OpenAI file search 文档与 attribute-first、RARR 这类工作共同支持一个关键事实：

能被检索到，不等于应该优先被信任。

生成前至少要考虑这些排序维度：

1. 来源权威性
2. 发布时间或更新时间
3. 与当前问题的直接相关性
4. 是否带有可核验属性或可回溯依据
5. 是否与其他更高权重来源冲突

如果不先做 trust ranking，生成阶段就会面临一个常见问题：

模型看到的是一堆候选片段，但没有明确知道“哪几条是基础事实，哪几条只是辅助背景，哪几条应该被降权”。

这会直接放大 hallucination 和不稳定综合。

## Citation Visibility 为什么不等于 Evidence Inspectability

很多系统以为“答案里给了引用”就等于可靠，但这只是最低层可见性。

真正成熟的证据设计至少要继续进一步分析：

1. 这条引用指向的是原始材料还是二次摘要
2. 审核者或用户能不能检查更完整上下文
3. 模型在综合时是否明确区分了支持证据和背景材料

RARR 以及检索型系统的经验都在提示同一件事：

citation 只解决“你说你参考了什么”，不自动解决“你是否正确理解、正确比较、正确归纳了这些证据”。

所以 reliability 不应该停在 citation visibility，还要继续推进到 evidence inspectability。

## Conflict Resolution 为什么不只发生在 Retrieval 阶段

多个来源冲突时，很多人会 instinctively 觉得这是 rerank 问题。但实际上冲突处理至少跨三个阶段：

1. retrieval 阶段：尽量把高权威和高新鲜度来源拉上来
2. ranking 阶段：把低信任候选降权，避免噪声主导上下文
3. synthesis 阶段：明确指出冲突、说明采用哪条来源、必要时保留不确定性

也就是说，conflict resolution 不是“把分数最高的文档塞给模型”就结束了。

成熟系统在冲突场景里往往会主动做这几件事：

1. 按来源级别定义优先级
2. 按时间定义新旧覆盖规则
3. 对冲突结论显式输出“存在冲突”而不是强行融合
4. 在证据不足时保留不确定性，而不是编造统一答案

## 一个成熟的知识可靠性治理链至少分四层

如果要把这个主题答到原理层，至少要拆出四层：

1. ingestion layer：入库、更新发现、删除同步、schema 迁移
2. retrieval layer：召回可用候选，而不是凭空生成知识
3. trust layer：按权威性、新鲜度、属性可核验性排序
4. synthesis layer：在冲突场景下明确采用规则、引用边界和不确定性表达

这样回答时，你讲的就不是“怎么让模型更聪明”，而是“怎么让知识供应链更可信”。

## 机制解读

知识型 Agent 的可靠性不能只靠 query-time 检索参数或答案里附几条引用，因为 freshness、trust ranking 和 conflict resolution 发生在不同阶段。OpenAI retrieval guide 与 Azure 索引器文档说明，freshness 首先是 ingestion architecture 问题：文档如何入库、更新如何被发现、删除如何被同步、何时做增量、何时必须 reset 或 rebuild，都决定了索引里的可检索资产是不是最新、是不是完整。进一步看，Azure 关于 schema 更新与重建的说明又表明，内容更新并不等于索引结构仍然可信，schema change 可能让“看起来已更新”的索引在结构上已经过时。进入 retrieval 之后，OpenAI file search 文档以及 attribute-first、RARR 一类工作又说明，候选文档能被找出来，不代表它就该被优先信任，因此必须在生成前做 source trust ranking，综合来源权威性、更新时间、相关性和可核验属性。最后到了 synthesis 阶段，多个来源冲突时不能只靠 rerank 的第一名拍板，而要显式处理时间覆盖、来源优先级、证据冲突和不确定性表达。真正成熟的系统，是把 ingestion freshness、索引结构正确性、source trust ranking 和 conflict resolution 串成一条治理链，而不是把全部责任压给最后一步生成模型。

## 易混边界

1. 把 freshness 理解成 query-time 参数问题
2. 把增量更新、reset 和 rebuild 当成同一个动作
3. 只看内容有没有更新，不看 schema 是否已经失配
4. 认为有 citation 就等于证据可检验
5. 冲突时强行融合答案，不显式暴露不确定性或采用规则

## 相关样例

1. `examples/python/ai-agent/ingestion_freshness_reindex_outline.py`
2. `examples/python/ai-agent/knowledge_freshness_conflict_resolution_outline.py`
