---
kb_id: ai-agent/patterns/rag-engineering-production-practice
title: RAG 工程实践：从检索 Demo 到可评估系统
domain: ai-agent
component: agent-patterns
topic: rag-engineering-production-practice
difficulty: advanced
status: reviewed
sidebar_position: 42
version_scope: 实践资料主线化整理，截至 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - practice-all-in-rag
  - practice-wow-rag
  - practice-llm-universe
  - practice-what-is-vs
  - practice-easy-vecdb
claim_ids:
  - pattern-claim-0001
  - pattern-claim-0002
  - pattern-claim-0003
  - pattern-claim-0004
  - pattern-claim-0005
  - pattern-claim-0006
  - pattern-claim-0007
  - pattern-claim-0008
tags:
  - practice
  - knowledge
---
## 一句话结论



RAG 不是“向量库加大模型”。可落地的 RAG 系统必须覆盖文档治理、切分、索引、召回、重排、上下文组装、引用、权限、评估和持续更新。

## RAG 的完整链路

| 阶段 | 核心问题 | 典型故障 |
| --- | --- | --- |
| 文档接入 | 文件格式、解析质量、去重、元数据 | PDF 表格丢失、标题层级错乱、重复文档污染 |
| 切分 | chunk 大小、overlap、语义完整性 | 答案被切碎、噪声混入、上下文过长 |
| 表征 | BM25、Embedding、Hybrid Search | 语义相近但事实不匹配，关键词强约束丢失 |
| 索引 | collection、metadata、版本、增量更新 | 旧文档未下线，新文档未生效，权限字段缺失 |
| 召回 | top-k、query rewrite、多路召回 | 正确片段没召回，召回结果全是近义噪声 |
| 重排 | reranker、规则过滤、去重 | 正确片段被排后，模型拿不到证据 |
| 生成 | 引用证据、拒答、格式约束 | 编造答案、引用不对应、把无证据内容说成事实 |
| 评估 | 召回率、答案正确率、幻觉率、延迟成本 | 只靠人工试问，无法判断版本迭代是否变差 |

## 为什么向量检索不等于答案正确

向量检索优化的是表示空间中的相似度，不是事实正确性。一个片段可能语义相似，但实体、时间、版本、权限或条件完全不匹配。因此知识表达不能停在“用 Embedding 找相似文本”，必须继续说明：

1. Query 是否表达了真实意图。
2. 文档切分是否保留了完整证据。
3. metadata filter 是否限制了租户、时间、权限和版本。
4. reranker 是否把真正有证据的片段排到前面。
5. Prompt 是否要求模型只基于证据回答。
6. 评估集是否能发现召回正确但生成错误的情况。

## Chunk 设计原则

Chunk 设计的目标不是越小越好，也不是越大越好，而是在召回粒度、语义完整性和上下文成本之间取平衡。

1. 小 chunk 召回更精细，但容易丢上下文。
2. 大 chunk 保留上下文，但会带来噪声和 token 成本。
3. overlap 能缓解边界切断，但过大时会造成重复召回。
4. 标题、章节、表格、代码块应该尽量作为结构化元数据保留。
5. 对 FAQ、合同、日志、代码、论文，切分策略不应该完全相同。

~~~python
def build_chunks(document):
    blocks = parse_by_structure(document)
    chunks = []
    for block in blocks:
        metadata = {
            "title_path": block.title_path,
            "source_version": document.version,
            "tenant_id": document.tenant_id,
            "permission": document.permission,
        }
        for text in split_with_semantic_boundary(block.text, max_tokens=500, overlap=80):
            chunks.append({"text": text, "metadata": metadata})
    return chunks
~~~

## 排障路径

RAG 答错时不要直接换模型。应该按链路定位：

1. 知识库里是否真的存在答案。
2. 文档解析是否把答案字段解析出来。
3. 切分是否把答案和限定条件切开。
4. 索引是否包含正确版本。
5. 过滤条件是否误删正确文档。
6. 召回是否拿到正确片段。
7. 重排是否把正确片段放在前面。
8. 上下文组装是否超长截断。
9. Prompt 是否允许模型无证据发挥。
10. 评估样本是否覆盖这个问题类型。

## 评估指标

RAG 至少要分层评估：

1. 检索层：Recall@k、MRR、命中正确文档比例。
2. 重排层：正确证据进入 top-n 的比例。
3. 生成层：答案正确性、引用一致性、拒答正确性。
4. 安全层：越权召回率、敏感信息泄露率。
5. 工程层：P95 延迟、token 成本、索引更新时间、失败率。

## 知识表达模板

回答 RAG 系统设计题时，建议按“数据、检索、生成、评估、治理”五段展开：

1. 数据：如何解析、清洗、切分、加元数据和做版本管理。
2. 检索：为什么需要关键词、向量、混合召回和 rerank。
3. 生成：如何让模型基于证据回答、引用来源、不会就拒答。
4. 评估：如何构建问题集、标注证据、监控幻觉和回归。
5. 治理：如何处理权限、增量更新、成本、延迟和排障。
