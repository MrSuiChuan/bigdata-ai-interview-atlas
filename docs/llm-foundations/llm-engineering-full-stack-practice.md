---
kb_id: llm-foundations/llm-engineering-full-stack-practice
title: 大模型工程实践：从基础原理到训练、后训练和部署
domain: llm-foundations
component: llm-overview
topic: llm-engineering-full-stack-practice
difficulty: advanced
status: reviewed
sidebar_position: 20
version_scope: 实践资料主线化整理，截至 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - practice-happy-llm
  - practice-base-llm
  - practice-self-llm
  - practice-diy-llm
  - practice-code-your-own-llm
  - practice-tiny-universe
  - practice-post-training-of-llms
  - practice-llm-cookbook
  - practice-llm-deploy
  - practice-llms-from-scratch-cn
claim_ids:
  - llm-foundation-claim-0001
  - llm-foundation-claim-0002
  - llm-foundation-claim-0003
  - llm-foundation-claim-0004
  - llm-foundation-claim-0005
  - llm-foundation-claim-0006
  - llm-foundation-claim-0007
  - llm-foundation-claim-0008
tags:
  - practice
  - knowledge
---
## 一句话结论

大模型工程实践：从基础原理到训练、后训练和部署需要从对象、链路、边界和证据四个角度理解。

## 全链路结构

| 层级 | 必须掌握什么 | 技术复盘常见进一步分析 |
| --- | --- | --- |
| 数据层 | 语料来源、清洗、去重、质量过滤、数据配比 | 为什么数据质量会比单纯扩大模型更重要 |
| Tokenizer | BPE、SentencePiece、词表、上下文预算 | 中文、代码、长文本为什么 token 成本不同 |
| 模型结构 | Decoder-only Transformer、Attention、FFN、Norm、位置编码 | 为什么现代 LLM 多使用自回归 Decoder-only |
| 预训练 | next token prediction、batch、优化器、checkpoint | 训练损失下降不代表任务能力完整 |
| 后训练 | SFT、偏好优化、RLHF、DPO、安全对齐 | 微调为什么不适合当事实数据库 |
| 推理 | prefill、decode、KV Cache、batching、量化 | 为什么吞吐和首 token 延迟经常冲突 |
| 应用 | Prompt、RAG、工具调用、Agent、评估 | 为什么 LLM 应用不是一次 API 调用 |
| 治理 | 安全、权限、监控、回归、成本 | 如何发现上线后能力退化 |

## Tokenizer 和上下文预算

Tokenizer 决定文本如何被拆成 token。它直接影响三件事：

1. 成本：API 和推理服务通常按 token 计费或计资源。
2. 上下文容量：同样长度的中文、英文、代码、表格消耗 token 不同。
3. 生成质量：稀有词、数字、代码符号、特殊格式会影响模型理解。

技术复盘中不能只说“上下文窗口越大越好”。上下文越长，prefill 成本越高，注意力计算和 KV Cache 占用也会上升。真正的工程方案通常是：检索压缩、结构化摘要、分阶段推理、缓存复用和窗口内证据排序。

## Transformer 的核心机制

Decoder-only LLM 的核心是自回归生成：每次根据已有 token 预测下一个 token。Attention 的作用是让当前位置根据上下文中不同 token 的相关性聚合信息，FFN 负责非线性变换，残差和归一化帮助深层网络稳定训练。

高质量知识表达要讲清楚：

1. Attention 解决的是上下文依赖建模问题。
2. 多头 Attention 让模型从不同子空间关注不同关系。
3. 位置编码让模型区分 token 顺序。
4. Decoder-only 适合 next token prediction 和生成式任务。
5. 模型结构只是能力的一部分，数据和训练目标同样关键。

## 后训练的边界

后训练常被误解为“给模型补知识”。更准确的说法是：后训练主要改变模型行为风格、指令遵循、安全边界和偏好排序；事实更新更适合通过检索、工具或数据更新解决。

| 方法 | 主要目标 | 风险 |
| --- | --- | --- |
| SFT | 让模型学习指令格式和示范答案 | 数据质量差会放大错误风格 |
| RLHF | 用人类偏好优化输出 | 成本高，奖励模型可能引入偏差 |
| DPO | 直接用偏好对优化 | 对偏好数据质量敏感 |
| 安全对齐 | 降低有害输出和越权行为 | 过度拒答会影响可用性 |

## 推理部署关键点

推理服务通常拆成 prefill 和 decode：

1. Prefill 处理输入上下文，计算初始 KV Cache。
2. Decode 每次生成一个或一批 token，并复用 KV Cache。
3. 长上下文会显著增加 prefill 成本和显存占用。
4. Batching 提高吞吐，但可能增加单请求延迟。
5. 量化降低显存和成本，但可能影响精度和部分任务能力。

~~~python
def estimate_kv_cache_layers(batch, seq_len, layers, hidden, bytes_per_value=2):
    # 粗略估算 KV Cache 量级：K 和 V 各一份。
    return batch * seq_len * layers * hidden * 2 * bytes_per_value
~~~

技术复盘中要把这些机制和实际指标连起来：吞吐、首 token 延迟、平均生成速度、显存、并发、成本和稳定性。

## 应用开发路径

LLM 应用通常经历四层演进：

1. Prompt 应用：适合低风险、短上下文、无外部动作的任务。
2. RAG 应用：适合需要私有知识、可引用证据、需要更新知识的任务。
3. Tool 应用：适合需要查询系统、计算、执行动作的任务。
4. Agent 应用：适合多步、带状态、需要计划和恢复的任务。

每上一层，能力增强，复杂度也增加。技术复盘中要主动讲清楚为什么要升级到更复杂形态，以及新增的评估和治理成本。

## 知识表达模板

回答大模型题时可以按这个顺序：

1. 先定位问题属于模型结构、训练、后训练、推理还是应用。
2. 再讲核心机制，避免只背术语。
3. 补充工程指标：延迟、吞吐、显存、成本、数据质量、评估。
4. 说明边界：哪些问题靠模型解决，哪些应靠 RAG、工具、权限和流程解决。
5. 给出验证方法：离线评估、线上监控、回归集、人工抽检和安全测试。
