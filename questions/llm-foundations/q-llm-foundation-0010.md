---
id: q-llm-foundation-0010
title: Prompt Engineering 为什么不是模板玄学，应该怎么系统化回答
domain: llm-foundations
component: prompt-engineering
topic: semantic-compression-few-shot-cot-self-consistency-meta-prompt
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "实践资料 smart-prompt, llm-cookbook, GPT-3, CoT, and self-consistency papers as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-smart-prompt
  - practice-llm-cookbook
  - gpt3-language-models-paper
  - chain-of-thought-paper
  - self-consistency-paper
claim_ids:
  - llm-foundation-claim-0020
  - llm-foundation-claim-0021
related_docs:
  - llm-foundations/prompt-engineering-semantics-few-shot-cot-meta-prompt
estimated_minutes: 8
---

# 题目

Prompt Engineering 为什么不是模板玄学？应该怎么系统化回答？

# 一句话结论

Prompt Engineering 是任务规约和上下文工程，要明确目标、输入、上下文、示例、推理脚手架、输出约束、失败策略和评估方法。

# 标准答案

Prompt 不是魔法话术，而是把任务契约写清楚。一个可维护 Prompt 要说明任务目标、输入字段、可用上下文、禁止信息、输出格式、不确定时的策略和失败处理。语义压缩用于在 token budget 下保留关键信息，但可能丢失限定条件；Few-shot 用示例降低任务歧义，但要覆盖边界并控制 token；CoT 可以帮助复杂推理，但不保证正确且会增加成本；self-consistency 通过多路径采样提升稳定性但增加延迟；元提示词可以辅助生成和检查 Prompt，但不能替代人工评审和评估。生产中 Prompt 必须版本化并进入回归测试。

# 必答点

1. 说明 Prompt 是任务规约
2. 说明语义压缩的价值和风险
3. 说明 Few-shot 的作用和示例选择
4. 说明 CoT 和 self-consistency 的边界
5. 说明 Prompt 要版本化和评估

# 常见误答

1. 把 Prompt 当固定模板
2. 认为 CoT 一定提升所有任务
3. 示例越多越好
4. 不处理不确定和拒答
5. Prompt 改动不跑评估

# 追问

1. Few-shot 示例怎么选？
2. CoT 为什么不等于正确推理？
3. 语义压缩为什么可能伤害 RAG？
4. Prompt 怎么做回归测试？
