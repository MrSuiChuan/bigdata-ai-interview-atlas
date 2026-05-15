---
id: q-llm-foundation-0018
title: LLM 推理能力为什么不等于形式证明，CoT、ReAct、搜索和验证怎么讲
domain: llm-foundations
component: llm-reasoning
topic: cot-self-consistency-react-tree-of-thoughts-verification
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "实践资料 reasoning-kingdom and reasoning papers as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-reasoning-kingdom
  - chain-of-thought-paper
  - self-consistency-paper
  - react-paper
  - tree-of-thoughts-paper
claim_ids:
  - llm-foundation-claim-0033
  - llm-foundation-claim-0034
related_docs:
  - llm-foundations/llm-reasoning-cot-react-search-and-verification-boundaries
estimated_minutes: 10
---

# 题目

LLM 推理能力为什么不等于形式证明？CoT、ReAct、搜索和验证怎么讲？

# 一句话结论

LLM 推理是概率生成叠加分解、检索、工具、搜索和验证，不是自动保证正确的形式证明。

# 标准答案

LLM 本质上仍是概率生成模型。CoT 可以让模型按步骤组织复杂问题，self-consistency 通过多路径采样提高某些任务稳定性，ReAct 把推理和工具行动交替起来，Tree of Thoughts 把中间思路作为搜索节点探索多个方案。但这些方法都不保证形式正确，也会增加成本、延迟和安全风险。生产系统要用检索证据、工具计算、代码测试、规则校验、人工复核和回归评估验证结果。

# 必答点

1. 说明 LLM 不是形式证明器
2. 说明 CoT 和 self-consistency
3. 说明 ReAct
4. 说明 Tree of Thoughts 和搜索成本
5. 说明验证比解释更关键

# 常见误答

1. 输出 CoT 就一定正确
2. 把推理文本当真实内部过程
3. ReAct 工具无权限边界
4. Tree of Thoughts 用在所有任务
5. 只看解释不验证

# 追问

1. CoT 为什么可能只是合理化解释？
2. ReAct 和普通工具调用有什么区别？
3. 数学、代码、事实分别如何验证？
