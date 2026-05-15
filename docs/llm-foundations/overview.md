---
kb_id: llm-foundations/overview
title: 大模型基础总览：技术复盘中不要把 LLM 讲成一个文本补全接口
domain: llm-foundations
component: llm-overview
topic: overview
difficulty: beginner
status: reviewed
sidebar_position: 1
version_scope: Primary LLM papers and official docs as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - gpt3-language-models-paper
  - transformer-attention-paper
  - huggingface-tokenizers-course
  - instructgpt-rlhf-paper
claim_ids:
  - llm-foundation-claim-0001
tags:
  - llm
  - transformer
  - tokenizer
  - pretraining
  - post-training
---
## 一句话结论

大模型基础总览：技术复盘中不要把 LLM 讲成一个文本补全接口需要从对象、链路、边界和证据四个角度理解。

## 为什么要单独建这个模块

AI Agent 文档讲的是 Agent Runtime、工具、状态、编排和治理。
但 Agent 的底层仍然依赖 LLM。

如果不单独理解 LLM 基础，很多 Agent 问题会答虚：

1. 不懂 token，就讲不清上下文窗口、成本和延迟
2. 不懂 Transformer，就讲不清为什么 attention 是核心机制
3. 不懂预训练，就讲不清模型为什么先学语言分布
4. 不懂后训练，就讲不清 instruction following 和 alignment
5. 不懂推理，就讲不清 temperature、top-p、KV Cache 和流式输出
6. 不懂评估，就讲不清模型能力和应用质量之间的差距

## LLM 的最小知识地图

技术复盘中建议按下面 8 层讲：

1. Tokenizer：文本如何变成 token ID
2. Transformer：模型如何用 attention 建模上下文
3. Pretraining：模型如何通过大规模数据学习 next-token prediction
4. Post-training：模型如何通过 SFT、RLHF、DPO 等方式更符合指令和偏好
5. Inference：模型如何逐 token 生成，如何受解码策略影响
6. Context：上下文窗口、token 预算、压缩和检索如何影响结果
7. Application：Prompt、RAG、Tool Use、Agent 如何围绕模型构建应用
8. Evaluation：如何证明模型或应用真的更好，而不是只看一次输出

## 它和 AI Agent 的关系

LLM 是能力底座，Agent 是运行时组织方式。

可以这样区分：

1. LLM 负责语言建模、推理倾向和生成能力
2. Agent Runtime 负责工具调用、状态管理、任务编排、人工介入和观测治理
3. RAG 负责把外部知识接入上下文
4. Eval 负责证明系统行为是否达到目标

所以不要把“模型更强”自动等同于“Agent 系统更可靠”。
生产系统里，模型能力、上下文质量、工具边界、状态恢复和评估体系都要一起看。

## 机制解读

LLM 不是一个简单文本补全接口，而是一套从 tokenization、Transformer 建模、预训练、后训练到推理和评估的系统。Tokenizer 决定文本如何被切成 token，Transformer 决定模型如何利用上下文，预训练让模型学习大规模语言分布，后训练让模型更符合指令和人类偏好，推理阶段的上下文预算和解码策略决定成本、延迟和输出稳定性。进入应用层后，还要用 RAG、工具、Agent Runtime 和 Eval 来弥补模型知识时效、外部动作和质量验证问题。

## 易混边界

1. 把 LLM 讲成搜索引擎
2. 把 token 当成字符或单词
3. 只讲 Transformer，不讲后训练和推理
4. 认为后训练后模型就一定事实正确
5. 把模型能力等同于应用可靠性

## 建议阅读顺序

1. `docs/llm-foundations/transformer-attention-and-decoder-only-llm.md`
2. `docs/llm-foundations/tokenizer-context-window-and-token-budget.md`
3. `docs/llm-foundations/post-training-sft-rlhf-dpo-and-alignment.md`
4. `docs/llm-foundations/llm-application-development-path-api-prompt-rag-eval.md`
5. `docs/llm-foundations/rag-embedding-knowledge-base-and-retrieval-foundations.md`
6. `docs/llm-foundations/from-nlp-to-llm-training-practice-and-small-model.md`
7. `docs/llm-foundations/llm-full-stack-theory-data-training-inference-eval.md`
8. `docs/llm-foundations/open-source-llm-deployment-finetuning-and-local-runtime.md`
9. `docs/llm-foundations/prompt-engineering-semantics-few-shot-cot-meta-prompt.md`
10. `docs/llm-foundations/inference-kv-cache-decoding-and-serving-latency.md`
11. `docs/llm-foundations/evaluation-benchmark-regression-and-production-feedback.md`
12. `docs/llm-foundations/llm-safety-prompt-injection-permission-and-red-team.md`
13. `docs/llm-foundations/multimodal-llm-vision-audio-document-and-video-pipeline.md`
14. `docs/llm-foundations/post-training-online-rl-dpo-sft-and-regression-risk.md`
15. `docs/llm-foundations/information-retrieval-bm25-dense-hybrid-and-rag-eval.md`
16. `docs/llm-foundations/huggingface-ecosystem-transformers-datasets-peft-evaluate.md`
17. `docs/llm-foundations/llm-reasoning-cot-react-search-and-verification-boundaries.md`
18. `docs/llm-foundations/llm-practice-bootcamp-api-local-vllm-lora-learning-path.md`
