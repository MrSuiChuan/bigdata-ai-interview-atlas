---
id: q-community-datawhale-llm-0002
title: 开源大模型本地部署时，为什么不能只看模型参数量？
domain: community
component: datawhale
topic: llm-deployment
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Datawhale open-source LLM deployment repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-self-llm
  - datawhale-handy-ollama
claim_ids: []
related_docs:
  - community/datawhale/llm/p0-llm-mainline
estimated_minutes: 10
---

# 题目

开源大模型本地部署时，为什么不能只看模型参数量？

# 一句话结论

参数量只影响资源需求的一部分，本地部署还要看权重精度、上下文长度、KV Cache、并发、量化、推理框架、显存、CPU/GPU、许可证和业务延迟目标。

# 核心机制

同样参数量的模型，在不同精度、上下文长度、batch size 和推理框架下资源消耗会完全不同。部署不是“模型能不能加载”，而是能否稳定满足吞吐、延迟、成本和安全要求。

# 标准答案

本地部署开源大模型不能只看参数量。参数量决定权重大小，但推理时还要考虑 KV Cache，它会随着上下文长度、batch size 和层数增长；量化会降低显存占用但可能影响质量；推理框架会影响吞吐和并发；许可证决定能否商用；硬件决定能否稳定跑起来；业务延迟目标决定是否需要 batching、流式输出或更小模型。面试中要把部署讲成资源模型和工程权衡，而不是“下载模型后启动服务”。

# 必答点

1. 说明参数量不是唯一指标。
2. 说明 KV Cache 和上下文长度。
3. 说明量化和质量权衡。
4. 说明推理框架、并发和延迟。
5. 说明许可证和安全边界。

# 常见误答

1. 只说显存够不够。
2. 不讲上下文长度。
3. 不讲量化代价。
4. 不讲许可证。

# 延伸追问

1. 为什么长上下文会增加显存？
2. 量化后如何评估质量损失？
3. Ollama、vLLM、Transformers 适用场景有什么不同？
