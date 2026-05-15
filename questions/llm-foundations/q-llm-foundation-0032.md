---
id: q-llm-foundation-0032
title: 为什么一个大模型评估集不能只收“答对了的成功样本”，还必须包含负例、拒答样本和历史失败样本
domain: llm-foundations
component: evaluation
topic: label-design-trace-grading-online-regression-loop
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenAI evaluation docs and RAG evaluator docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - openai-evaluation-best-practices
  - openai-agent-evals-guide
  - azure-rag-evaluators
claim_ids:
  - llm-foundation-claim-0024
  - llm-foundation-claim-0013
related_docs:
  - llm-foundations/evaluation-benchmark-regression-and-production-feedback
  - llm-foundations/evaluation-label-design-trace-grading-and-online-regression-loop
estimated_minutes: 10
---

# 题目

为什么一个大模型评估集不能只收“答对了的成功样本”，还必须包含负例、拒答样本和历史失败样本？

# 一句话结论

因为只收成功样本会让评估集失去真实分布和风险覆盖，系统会越来越擅长做自己已经会做的题，却看不见最容易出事故的边界。

# 标准答案

大模型系统的风险往往不在“常规样本答得不错”，而在边界样本、误导样本、应拒答样本和已经在线上暴露过的失败样本。如果评估集只有正向成功样本，分数会被明显高估，团队也很难知道系统在风险场景、长尾场景和历史故障场景下是否稳定。真正有用的评估集至少要覆盖真实高频问题、边界问题、负例、拒答场景、安全样本和历史失败样本。这样回归测试才能告诉我们：这次改动到底只是把擅长的题做得更好，还是把原本最脆弱的环节也补上了。

# 必答点

1. 说明成功样本不能代表真实风险分布
2. 说明负例和拒答样本的重要性
3. 说明历史失败样本是最有价值的回归材料
4. 说明只收正样本会高估系统效果
5. 说明评估集要支撑长期回归

# 常见误答

1. 认为多放成功样本就足够
2. 不讲拒答和安全边界
3. 不讲历史失败样本的价值
4. 把评估集当展示材料而不是质量控制工具

# 追问

1. 历史失败样本为什么比新造样本更重要？
2. 什么场景必须单独设计拒答样本？
3. 评估集长期维护时最容易产生什么偏差？
