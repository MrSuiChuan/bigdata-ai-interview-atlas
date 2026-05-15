---
id: q-ai-case-0011
title: DeepSeek 复现结果和线上 API 表现不一致时，第一轮应该按什么顺序排障
domain: ai-agent
component: deepseek
topic: deepseek-reproduction-evaluation-troubleshooting
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "DeepSeek 官方仓库、DeepSeek API 文档、评估方法资料与实践材料 as verified on 2026-04-26 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - deepseek-r1-github
  - deepseek-api-docs
  - openai-evaluation-best-practices
claim_ids:
  - practice-p2-claim-0007
  - llm-foundation-claim-0008
  - llm-foundation-claim-0024
related_docs:
  - ai-agent/cases/deepseek-reproduction-evaluation-and-troubleshooting-playbook
  - ai-agent/cases/deepseek-source-layering-benchmark-and-version-boundaries
estimated_minutes: 10
---

# 题目

DeepSeek 复现结果和线上 API 表现不一致时，第一轮应该按什么顺序排障？

# 一句话结论

先切对象，再查版本，再核对输入和评估，最后才讨论模型能力差异。

# 核心机制

1. 先确认比较的是不是同一个对象
2. 再确认仓库、接口、样例和评估器是否被固定
3. 再确认 prompt、采样和输出格式是否一致
4. 最后才判断是否真的是能力差异

# 标准答案

当 DeepSeek 复现结果和线上 API 表现不一致时，第一轮排障应该先做对象切分，而不是先改 prompt。先确认你比较的是仓库实现、本地推理、托管 API 还是社区封装项目，因为这些对象的运行语义可能完全不同；再确认版本是否固定，包括模型入口、脚本版本、接口文档范围和评估器；然后核对输入层是否一致，比如提示模板、采样策略、是否允许外部辅助；最后再看输出层和评估层，判断差异是拒答、跑偏、格式变化还是分数波动。如果对象和版本都没切清，就不该直接把差异归结为模型能力变化。

# 必答点

1. 先做对象切分
2. 说明版本和后端必须固定
3. 说明 prompt 和采样也会导致差异
4. 说明分数差异要结合失败样本解释
5. 说明不要直接下“模型变差了”的结论

# 常见误答

1. 一上来就调 prompt
2. 不区分仓库和 API
3. 不核对评估器和样本
4. 看到差异就直接归因于模型能力
