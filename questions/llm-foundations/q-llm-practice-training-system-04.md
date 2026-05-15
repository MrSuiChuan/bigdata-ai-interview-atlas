---
id: q-llm-practice-training-system-04
title: "训练系统与模型构建：推理部署为什么要关注 prefill、decode 和 KV Cache？"
domain: llm-foundations
component: transformer
topic: training-system
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料主线化整理，截至 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-diy-llm
claim_ids: []
related_docs:
  - llm-foundations/llm-engineering-full-stack-practice
estimated_minutes: 12
---

# 题目

训练系统与模型构建：推理部署为什么要关注 prefill、decode 和 KV Cache？

# 一句话结论

prefill 决定处理上下文的成本，decode 决定生成阶段速度，KV Cache 决定长上下文和并发下的显存压力。

# 核心机制

LLM 推理不是普通函数调用。输入越长，prefill 越重；并发越高，KV Cache 越占显存；batching 提高吞吐但可能影响延迟。

# 标准答案

讲训练系统与模型构建时，要把推理拆成 prefill 和 decode。prefill 处理输入上下文并生成 KV Cache，长 prompt 和 RAG 证据会增加这部分成本。decode 逐步生成 token，通常受 KV Cache、batching 和采样策略影响。生产部署要同时看首 token 延迟、tokens/s、P95 延迟、显存、并发和成本。

# 必答点

1. 解释 prefill 和 decode
2. 解释 KV Cache 作用和显存压力
3. 说明 batching 权衡
4. 联系长上下文和 RAG
5. 给出关键线上指标

# 常见误答

1. 只说模型慢
2. 不区分首 token 延迟和生成速度
3. 忽略显存
4. 忽略上下文长度

# 延伸追问

1. 为什么长上下文首 token 慢？
2. continuous batching 解决什么问题？
3. 量化对 KV Cache 有什么影响？

