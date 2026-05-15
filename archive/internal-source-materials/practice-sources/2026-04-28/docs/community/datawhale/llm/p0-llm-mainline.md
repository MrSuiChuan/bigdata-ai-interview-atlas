---
kb_id: community/datawhale/llm/p0-llm-mainline
title: "Datawhale P0 大模型主线整理"
domain: community
component: datawhale
topic: p0-llm-mainline
difficulty: advanced
status: reviewed
sidebar_position: 1
version_scope: "Datawhale LLM repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-happy-llm
  - datawhale-base-llm
  - datawhale-self-llm
  - datawhale-diy-llm
  - datawhale-code-your-own-llm
  - datawhale-tiny-universe
  - datawhale-post-training-of-llms
  - datawhale-llm-cookbook
claim_ids: []
---

# 一句话定位

Datawhale 大模型主线适合整理成“从 Tokenizer、Transformer、训练目标到后训练、推理部署和应用开发”的完整 LLM 面试路径。它既能补理论，也能补项目实践。

# 核心知识点

1. Tokenizer 决定文本如何变成 token，也影响上下文长度、成本和多语言效果。
2. Transformer 的 attention、FFN、残差、归一化共同决定序列建模能力。
3. 预训练让模型学习大规模语言分布，但不保证事实实时性和任务遵循。
4. SFT、RLHF、DPO 等后训练方法主要改善指令遵循和偏好对齐。
5. 推理部署要关注显存、KV Cache、batching、量化、并发、延迟和吞吐。
6. LLM 应用开发要把模型能力、上下文工程、工具、RAG、评估和安全合起来看。

# 项目到面试知识点映射

| Datawhale 项目 | 适合转化的知识点 | 面试题方向 |
| --- | --- | --- |
| happy-llm | 大模型基础学习路径 | “如何系统解释 LLM？” |
| base-llm | NLP 到 LLM 算法主线 | “传统 NLP 和 LLM 的关系是什么？” |
| self-llm | 开源模型部署和微调 | “本地部署大模型要看哪些约束？” |
| diy-llm | 训练系统和模型构建 | “从零训练 LLM 的关键链路是什么？” |
| code-your-own-llm | 白盒实现 | “自己实现 LLM 能说明你懂哪些机制？” |
| tiny-universe | 小模型训练实践 | “小模型训练能验证什么，不能说明什么？” |
| post-training-of-llms | 后训练 | “SFT、DPO、RLHF 的边界是什么？” |
| llm-cookbook | 应用开发 | “LLM 应用为什么不是一次 API 调用？” |

# 面试必须讲清的层次

1. 模型层：Tokenizer、架构、参数、上下文窗口。
2. 训练层：数据、预训练目标、后训练、评估。
3. 推理层：prefill、decode、KV Cache、batching、量化。
4. 应用层：Prompt、RAG、工具、Agent、权限和评估。
5. 工程层：部署、监控、成本、灰度、安全和回滚。

# 常见误区

1. 把 LLM 等同于聊天机器人。
2. 只讲 Transformer，不讲数据和训练目标。
3. 只讲微调，不讲 RAG 和评估。
4. 只讲模型精度，不讲延迟、成本和稳定性。
5. 把后训练说成能解决事实正确性问题。

# 需要官方交叉复核的点

1. 具体模型许可证和商用限制。
2. 推理框架版本和参数行为。
3. API 模型能力、上下文窗口和价格。
4. Hugging Face、vLLM、Ollama 等工具的当前命令和配置。

# 后续拆分任务

1. 把 Tokenizer、Transformer、预训练、后训练、推理部署分别整理成主知识库专题。
2. 把 self-llm、llm-deploy、handy-ollama 融合成“开源模型部署”实践线。
3. 把 post-training-of-llms 融入 LLM 后训练题库。
