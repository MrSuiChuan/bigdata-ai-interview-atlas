---
id: q-ai-case-0004
title: 多 Agent 长文写作系统为什么必须保留证据链和审稿链
domain: ai-agent
component: multi-agent-writing
topic: multi-agent-technical-writing-pipeline
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料 vibe-blog repository and official eval docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - practice-vibe-blog
  - openai-agent-evals-guide
  - openai-evaluation-best-practices
claim_ids:
  - practice-p1-claim-0011
related_docs:
  - ai-agent/cases/multi-agent-technical-writing-pipeline-case
estimated_minutes: 12
---

# 题目

多 Agent 长文写作系统为什么必须保留证据链和审稿链？

# 一句话结论

因为长文写作的主要风险不是字数不够，而是事实失真、结构失衡、代码错误、图文不一致和错误在多个 Agent 之间扩散。

# 标准答案

多 Agent 长文写作系统必须保留证据链和审稿链。Research Agent 收集资料和证据，Outline Agent 生成结构，Writing Agent 分章节写作，Code Agent 检查代码，Diagram Agent 生成图表，Review Agent 检查事实、逻辑、风格和风险，Editor Agent 统一最终输出。每个关键结论都应该能追溯到原始来源、摘要、大纲、正文和审稿意见。评价不能靠“看起来不错”，要检查事实正确性、章节完整性、代码可运行、图文一致、引用完整、重复率和版权风险。

# 必答点

1. 说明多 Agent 分工必须有输入输出合同
2. 说明证据链避免错误扩散
3. 说明审稿链覆盖事实、逻辑、风格和风险
4. 说明代码和图表要独立检查
5. 说明 eval 不能靠主观感觉

# 常见误答

1. 认为长文写作就是扩写
2. 只讲 Agent 角色，不讲验收标准
3. 不保留引用和来源
4. 不检查代码可运行性
5. 不做事实审稿

