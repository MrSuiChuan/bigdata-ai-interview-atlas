---
id: q-ai-case-0010
title: 做 DeepSeek 复现时，为什么要先固定目标、后端、评估器和输出证据
domain: ai-agent
component: deepseek
topic: deepseek-reproduction-evaluation-troubleshooting
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "DeepSeek 官方仓库、DeepSeek API 文档、评估方法资料与实践材料 as verified on 2026-04-26 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-unlock-deepseek
  - deepseek-r1-github
  - openai-evaluation-best-practices
  - openai-agent-evals-guide
claim_ids:
  - practice-p2-claim-0007
  - llm-foundation-claim-0024
related_docs:
  - ai-agent/cases/deepseek-reproduction-evaluation-and-troubleshooting-playbook
estimated_minutes: 12
---

# 题目

做 DeepSeek 复现时，为什么要先固定目标、后端、评估器和输出证据？

# 一句话结论

因为不把这四项固定下来，你根本无法判断自己复现的是方法、接口还是演示，也无法解释结果偏差来自哪里。

# 核心机制

1. 目标决定比较对象和成功标准
2. 后端决定运行语义，仓库脚本和托管 API 不是同一个对象
3. 评估器决定分数是否可比
4. 输出证据决定问题能否被复核和回归

# 标准答案

做 DeepSeek 复现时必须先固定目标、后端、评估器和输出证据，因为复现不是简单跑脚本。首先要明确目标，是理解方法、验证公开实现，还是核对当前接口行为；其次要固定后端，区分官方仓库、本地推理、托管 API 或社区封装，因为不同后端不是同一个比较对象；再次要固定评估器，包括数据集、评分规则和提示模板，否则分数没有可比性；最后要保存输出样本和失败样本，否则只能看到总分，无法解释偏差。只有这四层都固定，复现实验才具有可复核和可回归价值。

# 必答点

1. 说明复现目标必须先定义
2. 说明不同后端不能混比
3. 说明评估器决定分数可比性
4. 说明必须保留输出样本和失败样本
5. 说明复现成功不等于论文结论自动成立

# 常见误答

1. 把跑通脚本当成复现成功
2. 混用仓库结果和 API 结果
3. 只看总分不留样本
4. 不解释复现的成功标准
