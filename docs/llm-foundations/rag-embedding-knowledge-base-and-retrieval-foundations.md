---
kb_id: llm-foundations/rag-embedding-knowledge-base-and-retrieval-foundations
title: RAG、Embedding 与知识库：为什么检索增强不是“向量库加模型”，而是一条证据供应链
domain: llm-foundations
component: rag-foundations
topic: embedding-knowledge-base-retrieval-rerank-eval
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: RAG paper, retrieval docs, Datawhale RAG courses, and evaluator docs as verified on 2026-04-27
last_verified_at: '2026-04-27'
source_ids:
  - rag-paper
  - openai-retrieval-guide
  - azure-rag-evaluators
  - practice-all-in-rag
  - practice-llm-universe
claim_ids:
  - llm-foundation-claim-0010
  - llm-foundation-claim-0013
tags:
  - rag
  - embedding
  - vector-search
  - retrieval
  - rerank
  - eval
---
## RAG 真正要解决的，不是“让模型记住更多”，而是“为答案提供一条可检查的外部证据链”
很多人第一次接触 RAG 时，只记住了两个关键词：向量库和大模型。可一旦进入真实项目，很快就会发现，系统成败往往不在“有没有向量检索”，而在文档接入是否干净、chunk 是否合理、权限是否正确、重排是否有效、答案是否真正被证据支撑。RAG 的本质，其实更像一条证据供应链，而不是一个单点算法。

## 解决什么问题
这一页主要回答五个问题：

1. 为什么参数知识不足以覆盖企业知识和时效知识。
2. 为什么 RAG 不是“向量库加模型”，而是文档到答案的完整链路。
3. chunk、embedding、召回、rerank 和 prompt 组装为什么都可能成为根因。
4. 为什么 RAG 必须同时治理权限、新鲜度和引用支撑。
5. 为什么 RAG 评估要拆成检索层和生成层。

## 核心对象
| 对象 | 作用 | 如果出问题会怎样 |
| --- | --- | --- |
| Corpus / Ingestion | 接入并清洗原始文档 | 脏数据直接污染下游 |
| Chunk | 定义最小检索单元 | 太碎丢上下文，太大加噪声 |
| Embedding Model | 把 query 和文本映射到向量空间 | 召回像相关，其实不支持答案 |
| Retriever | 找回候选证据 | 目标证据根本进不了上下文 |
| Reranker | 精排候选片段 | 高价值证据排不到前面 |
| Prompt Assembler | 按 token budget 组织证据 | 好证据被截断或顺序错乱 |
| Citation Validator | 检查答案是否真的有证据支撑 | 生成阶段把“像引用”当“真支撑” |

### 为什么 RAG 必须显式划分对象
因为 RAG 的错误并不都发生在生成阶段。模型答错，可能是文档脏、chunk 切坏、embedding 不适配、检索没召回、重排没排上来，或者 prompt 组装时把关键证据截掉了。谁如果不能把这些对象拆开，排障就只能停留在“模型又幻觉了”。

## 执行链路
一个完整的 RAG 证据链路通常包含：

1. 文档接入与清洗。
2. 按结构和语义进行 chunk 切分。
3. 构建元数据和权限标记。
4. 生成 embedding 并写入索引。
5. query 到来后做召回、过滤和 rerank。
6. 按 token budget 组装证据进入 Prompt。
7. 生成答案后做引用和支撑校验。

```mermaid
flowchart LR
  A[文档接入] --> B[清洗与 Chunk]
  B --> C[Embedding 与索引]
  C --> D[召回与过滤]
  D --> E[Rerank]
  E --> F[Prompt 组装]
  F --> G[答案生成]
  G --> H[引用校验与评估]
```

### 为什么向量检索只是链路中一环
因为向量检索负责的是“先把可能相关的东西找回来”，并不保证这些候选就足够完整、足够新、权限正确或真正支撑最后答案。真正的 RAG 质量，取决于整个链路能否稳定供给高价值证据。

## 一致性与容错
RAG 里最常见的故障往往是多层叠加：

1. 文档更新了，但索引没刷新，结果证据过期。
2. chunk 含义不完整，模型拿到的是断裂条件。
3. 检索结果命中，但权限过滤缺失，导致越权回答。
4. 模型给了引用，但引用片段实际上不支持结论。

### 为什么“检索到了”不等于“答案可信”
因为召回命中只说明目标片段进入了候选集合，不说明它被排序到前面、不说明它被放进最终 Prompt、更不说明模型真的按它回答。RAG 的可信度来自召回、组装和支撑校验三层同时成立。

## 性能模型
RAG 的成本和延迟主要来自：

1. 文档预处理和索引维护成本。
2. query 侧检索、过滤和 rerank 开销。
3. 证据进入上下文后的 token 成本。
4. 引用校验和评估的额外成本。

### 为什么 top_k 不是越大越好
因为候选越多，rerank 和 Prompt 组装成本越高，高噪声证据进入上下文的概率也越大。高质量 RAG 更像精细供给，而不是无限堆料。

## 生产排障
当 RAG 答错时，建议先沿链路拆层：

1. 原文是否存在、是否最新。
2. chunk 是否保留了完整上下文。
3. 目标证据是否被召回。
4. 目标证据是否被排到足够靠前。
5. 进入 Prompt 的证据是否被裁剪或顺序破坏。
6. 模型最终答案是否真正受证据支撑。

### 高价值排障证据
1. query 对应的候选列表。
2. rerank 前后排序变化。
3. 最终进入 Prompt 的证据片段。
4. 引用支撑检查结果。

## 样例
下面这个 RAG 请求审计片段，能帮助快速判断问题落在哪一层：

```json
{
  "query": "2025 年退款规则是什么",
  "retrieved_top_k": 20,
  "reranked_top_n": 5,
  "used_chunks": ["policy_2025_refund#3", "policy_2025_refund#4"],
  "citation_supported": true
}
```

而这个 chunk 元数据示例则说明，RAG 不应该只保存文本正文：

```yaml
chunk_metadata:
  doc_id: policy_2025_refund
  version: 2025-03-01
  page: 4
  permission: internal
  section_path: [退款政策, 电子产品, 特殊条款]
```

## 相邻技术边界
RAG 不等于微调，也不等于纯搜索系统。它位于检索和生成之间，目标是把外部知识变成可用、可控、可验证的上下文证据。理解这层边界后，才能知道什么时候该补文档、什么时候该调检索、什么时候该回到模型或 Prompt 层。

## 本页结论
RAG 的关键不在“有没有向量库”，而在能否持续稳定地把正确、最新、可授权、可支撑的证据送进模型上下文。只有把它看成一条证据供应链，系统问题才真正可定位、可修复。
