---
id: q-llm-foundation-0030
title: 为什么大模型实训通常建议先学 API，再学本地模型，再学服务化和 LoRA，而不是一开始就部署开源模型
domain: llm-foundations
component: llm-practice-bootcamp
topic: api-local-model-vllm-prompt-lora-learning-path
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "Datawhale open-ai-general-course and llm-preview metadata as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-open-ai-general-course
  - practice-llm-preview
  - practice-hands-on-llm
claim_ids:
  - llm-foundation-claim-0035
  - llm-foundation-claim-0012
related_docs:
  - llm-foundations/llm-practice-bootcamp-api-local-vllm-lora-learning-path
  - llm-foundations/llm-practice-bootcamp-environment-api-local-model-serving-and-lora-troubleshooting
estimated_minutes: 8
---

# 题目

为什么大模型实训通常建议先学 API，再学本地模型，再学服务化和 LoRA，而不是一开始就部署开源模型？

# 一句话结论

因为实训要按系统复杂度分层建立能力，先用 API 学清调用和上下文，再用本地模型理解权重与设备，再进入服务化和微调，才能把故障面逐层拆开。

# 标准答案

一开始直接部署开源模型，会把环境、显存、依赖、模型资产、服务协议、prompt 设计和评估问题同时叠在一起，初学者很难知道自己到底卡在哪。更合理的路径是先用 API 理解请求、响应、token、成本和错误处理；再切到本地模型，理解权重、tokenizer、设备和量化；之后再做服务化，观察并发、延迟、吞吐和日志；最后再做 LoRA 微调，把数据、评估和版本治理纳入进来。这样每一阶段解决的对象都清晰，出错时也知道先查哪一层。

# 必答点

1. 说明学习路径要按复杂度递进
2. 说明 API 阶段建立调用和成本意识
3. 说明本地模型阶段建立权重和设备意识
4. 说明服务化阶段建立并发和接口意识
5. 说明 LoRA 必须建立在数据和评估基础上

# 常见误答

1. 认为本地部署更高级，所以应该先学
2. 不区分调用、本地运行和服务化
3. 认为 LoRA 只是多跑一个脚本
4. 忽略评估和回滚意识

# 追问

1. 为什么服务化是独立阶段？
2. 为什么 LoRA 不应早于评估能力？
3. 初学者最容易在本地阶段误判什么问题？
