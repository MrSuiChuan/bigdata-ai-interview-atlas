---
id: q-ai-pattern-0014
title: 为什么 RAG 系统不能只看最终答案质量，还必须把 Retrieval Evaluation、Debugging 和 Offline Benchmark 一起设计
domain: ai-agent
component: agent-patterns
topic: retrieval-evaluation-debugging-offline-benchmarks
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
  - ai-agent/patterns/retrieval-evaluation-and-tuning
estimated_minutes: 11
---

# 题目

为什么 RAG 系统不能只看最终答案质量，还必须把 Retrieval Evaluation、Debugging 和 Offline Benchmark 一起设计？

# 一句话结论

因为 final answer 只告诉你系统结果不好，却不能告诉你问题到底出在 ingestion、candidate recall、ranking 还是 synthesis，必须把过程评估、在线排障和离线 benchmark 一起引入。

# 核心机制

1. process evaluation is distinct from system evaluation
2. online debugging needs execution history and ranking diagnostics
3. offline benchmarks reveal retrieval tradeoffs beyond anecdotal testing
4. tuning parameters must be tied to retrieval metrics

# 标准答案

RAG 系统不能只看最终答案质量，因为 retrieval 层本身就是独立瓶颈，而最终答案只会把所有故障压缩成一个结果。Microsoft Foundry 的 RAG evaluators 明确区分 process evaluation 和 system evaluation；在有 ground truth relevance labels 时，推荐使用 `document_retrieval` evaluator 查看 Fidelity、NDCG、XDCG、Max Relevance 和 Holes 等指标，以更精确地诊断召回与排序质量；没有标注时，也可以用 `retrieval` evaluator 通过 LLM judge 先做上下文相关性评估。在线排障层面，Azure Monitor Indexers 说明可以通过 execution history、errors、warnings 和 tracking state 先确认文档是否真的完成索引，Azure 的 troubleshooting guidance 又提醒 success 状态并不等于没有 skipped documents 或 warning；在 ranking 层，BM25 的 `featuresMode` 还能帮助定位字段级分数来源。与此同时，OpenAI Retrieval guide 提供了 `score_threshold`、hybrid 权重、chunking 和 query rewrite 等可调参数，但这些参数必须绑定 retrieval metrics 使用。离线层面，BEIR 说明 retrieval 方法需要在异构任务上比较，并揭示了 BM25 稳健性与 reranking 质量优势之间的成本权衡。真正成熟的做法，是把在线排障、过程评估和离线 benchmark 连成一条调优闭环，而不是只盯最终答案做黑盒调参。

# 必答点

1. retrieval 需要独立过程评估
2. execution history 和 warnings 是在线排障入口
3. ranking debug 与 retrieval metrics 要单独看
4. offline benchmark 用来量化方法 trade-off
5. tuning 必须绑定指标而不是盲调

# 常见误答

1. 认为答案流畅就说明 retrieval 没问题
2. 不查执行历史就直接调参数
3. 看到 success 就认定 ingestion 没问题
4. 没有企业内部 offline eval dataset，只靠人工抽样
