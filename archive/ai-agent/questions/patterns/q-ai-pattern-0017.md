---
id: q-ai-pattern-0017
title: 为什么 Retrieval Debugging 不能只看最终答案，还要结合 Execution History 和 Offline Benchmark
domain: ai-agent
component: agent-patterns
topic: retrieval-debugging-offline-benchmarks
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - azure-rag-evaluators
  - openai-retrieval-guide
  - azure-monitor-indexers
  - azure-indexer-troubleshooting
  - azure-bm25-scoring
  - beir-paper
claim_ids:
  - pattern-claim-0045
  - pattern-claim-0046
  - pattern-claim-0047
  - pattern-claim-0048
  - pattern-claim-0062
  - pattern-claim-0063
  - pattern-claim-0064
  - pattern-claim-0065
related_docs:
  - ai-agent/patterns/retrieval-debugging-playbook-and-offline-benchmarks
estimated_minutes: 10
---

# 题目

为什么 Retrieval Debugging 不能只看最终答案，还要结合 Execution History 和 Offline Benchmark？

# 一句话结论

因为最终答案只告诉你系统结果不好，却不能告诉你问题到底出在 ingestion、召回、排序还是 synthesis，必须把过程观察和离线评估一起引入。

# 核心机制

1. process evaluation is separate from final answer evaluation
2. online debugging needs execution traces and ranking diagnostics
3. offline benchmarks reveal method tradeoffs beyond anecdotal testing

# 标准答案

RAG 排障不能只看最终答案，因为错误可能发生在 ingestion、召回、排序、过滤、packing 或 synthesis 的任意一层。Microsoft Foundry 的 RAG evaluators 明确区分 process evaluation 和 system evaluation；Azure Monitor Indexers 说明可以通过 execution history、errors、warnings 和 tracking state 先确认文档是否真的完成索引；Azure 的 troubleshooting guidance 进一步提醒成功状态并不等于没有 skipped documents 或 warning；在 ranking 层，BM25 的 `featuresMode` 又能帮助定位字段级分数来源。与此同时，OpenAI Retrieval guide 提供了 `score_threshold`、hybrid 权重、chunking 和 query rewrite 等可调参数，但这些参数必须绑定 retrieval metrics 使用。离线层面，BEIR 说明 retrieval 方法需要在异构任务上比较，并揭示了 BM25 稳健性与 reranking 质量优势之间的成本权衡。因此，成熟的 retrieval debugging 需要把在线排障、过程评估和离线 benchmark 结合起来。

# 必答点

1. final answer 不足以定位故障层
2. execution history 和 warnings 是在线排障入口
3. ranking debug 与 retrieval metrics 要单独看
4. offline benchmark 用来量化方法 trade-off

# 常见误答

1. 只看答案顺不顺眼
2. 不查执行历史就直接调参数
3. 不做 baseline 和离线数据集