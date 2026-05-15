---
id: q-ai-case-0025
title: 多 Agent 写作系统为什么需要“风格合同”和“发布门禁”，而不能只靠最后总编统一
domain: ai-agent
component: multi-agent-writing
topic: style-consistency-review-loop-publish-control
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Datawhale vibe-blog repository and OpenAI eval guidance as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-vibe-blog
  - openai-agent-evals-guide
  - openai-evaluation-best-practices
  - openai-agents-sdk-tracing
claim_ids:
  - practice-p1-claim-0011
related_docs:
  - ai-agent/cases/multi-agent-writing-style-consistency-review-loop-and-publish-control
estimated_minutes: 12
---

# 题目

多 Agent 写作系统为什么需要“风格合同”和“发布门禁”，而不能只靠最后总编统一？

# 一句话结论

因为统一性如果不前置建模，返工会在最后集中爆炸，最终很难稳定收口成可发布内容。

# 标准答案

多 Agent 写作把研究、写作、图表、代码和审稿拆成多个并行角色后，最大风险之一就是局部最优导致全局不一致。风格合同的作用，是在早期统一术语、句式、结构和图文规则，避免每个 Agent 各写各的；发布门禁的作用，是在上线前明确要求引用完整、审稿 finding 关闭、图文同步、术语冲突消失。只靠最后总编统一，意味着所有偏差都会在最晚阶段暴露，返工成本最高，也最容易漏改。

# 必答点

1. 说明多 Agent 并行会放大不一致
2. 说明风格合同是前置约束
3. 说明发布门禁是正式质量检查
4. 说明最后总编兜底成本最高

# 常见误答

1. 总编最后润色一下就可以
2. 只关注文风，不关注图文和代码同步
3. 不把审稿问题结构化管理
4. 发布前不设阻断条件
