---
id: q-ai-case-0018
title: 视频笔记 Agent 为什么要单独评估图文一致性和可回放性，而不是只看报告是否通顺
domain: ai-agent
component: video-note-agent
topic: video-agent-budget-observability-evaluation
question_type: evaluation
difficulty: advanced
status: reviewed
version_scope: "Datawhale video-devour repository, OpenAI evaluation best practices, and OpenAI Agents SDK docs as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-video-devour
  - openai-evaluation-best-practices
  - openai-agents-sdk-tracing
claim_ids:
  - practice-p1-claim-0010
related_docs:
  - ai-agent/cases/video-note-agent-budget-observability-evaluation-and-failure-localization
estimated_minutes: 10
---

# 题目

视频笔记 Agent 为什么要单独评估图文一致性和可回放性，而不是只看报告是否通顺？

# 一句话结论

因为视频笔记系统的价值不只是“写得顺”，还在于用户能否通过摘要回到正确的视频证据。

# 标准答案

报告通顺只能说明语言表面可读，不说明系统真的把视频内容理解并对齐了。视频笔记 Agent 还必须评估图文一致性，也就是关键帧和章节结论是否互相支撑；同时要评估可回放性，也就是每个章节是否能准确跳回原视频片段。没有这两项评估，系统很可能输出看似流畅的报告，但关键帧选错、章节时间错位、引用无法复查，最终在学习和复盘场景里并不可靠。

# 必答点

1. 说明通顺不等于对齐正确
2. 说明图文一致性的重要性
3. 说明可回放性的价值
4. 说明视频笔记是证据链产品，不是纯写作产品

# 常见误答

1. 只看语言流畅度
2. 不看关键帧是否支撑结论
3. 不看时间锚点是否准确
4. 不把可回放性当验收标准

# 追问

1. 什么叫“有图片但不 grounding”？
2. 哪些故障最容易让可回放性失效？
