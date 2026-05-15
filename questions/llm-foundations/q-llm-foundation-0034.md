---
id: q-llm-foundation-0034
title: 为什么开源大模型上线前必须先看模型卡、许可证、revision 和量化方案，而不是先看能不能跑起来
domain: llm-foundations
component: open-source-llm-deployment-finetuning
topic: model-card-license-quantization-adapter-rollback-governance
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "Datawhale self-llm, llm-deploy, LoRA, and QLoRA sources as verified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - practice-self-llm
  - practice-llm-deploy
  - lora-paper
  - qlora-paper
claim_ids:
  - llm-foundation-claim-0018
  - llm-foundation-claim-0019
  - llm-foundation-claim-0015
related_docs:
  - llm-foundations/open-source-llm-deployment-finetuning-and-local-runtime
  - llm-foundations/open-source-llm-model-card-license-quantization-adapter-and-rollback-governance
estimated_minutes: 10
---

# 题目

为什么开源大模型上线前必须先看模型卡、许可证、`revision` 和量化方案，而不是先看能不能跑起来？

# 一句话结论

因为“能跑”只证明最小推理成功，而上线需要同时满足可用性、合规性、版本可追踪性和质量可验证性。

# 标准答案

开源模型上线前先看模型卡、许可证、`revision` 和量化方案，是因为它们共同决定了模型能不能被合法、稳定、可复现地使用。模型卡说明用途、限制和推荐方式，许可证决定商用和分发边界，`revision` 决定团队到底上线的是哪一版资产，量化方案则影响显存、延迟和质量。只看“模型能跑起来”会忽略最关键的治理问题：可能用错版本、误用限制场景、量化后质量退化、上线后无法回滚。真正的上线验收必须把这些对象放到同一张清单里。

# 必答点

1. 说明能跑不等于可上线
2. 说明模型卡和许可证的作用
3. 说明 revision 的复现和回滚价值
4. 说明量化会改变质量和性能
5. 说明上线前必须有统一验收清单

# 常见误答

1. 认为跑通就是部署完成
2. 不看许可证和模型限制
3. 不讲 revision 固定
4. 量化只看显存，不看质量

# 追问

1. 为什么 revision 比模型名更重要？
2. 模型卡里哪些字段最影响技术选型？
3. 量化退化为什么不能靠少量样例判断？
