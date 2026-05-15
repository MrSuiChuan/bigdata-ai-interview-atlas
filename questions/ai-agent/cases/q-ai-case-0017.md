---
id: q-ai-case-0017
title: 视频笔记 Agent 的章节切分为什么不能只靠固定时间窗口或纯文本分段
domain: ai-agent
component: video-note-agent
topic: timestamp-alignment-keyframe-grounding
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Datawhale video-devour repository, OpenAI vision docs, and evaluation guidance as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - practice-video-devour
  - openai-images-vision-docs
  - openai-evaluation-best-practices
claim_ids:
  - practice-p1-claim-0010
related_docs:
  - ai-agent/cases/video-note-agent-asr-vlm-pipeline-case
  - ai-agent/cases/video-note-agent-timestamp-alignment-keyframe-selection-and-grounding
estimated_minutes: 10
---

# 题目

视频笔记 Agent 的章节切分为什么不能只靠固定时间窗口或纯文本分段？

# 一句话结论

因为视频主题切换往往同时发生在语义、说话人和画面层，单靠固定窗口或纯文本都容易把证据切坏。

# 标准答案

视频章节切分如果只靠固定时间窗口，很容易把一个主题硬切成两段，或者把两个不同主题误并到一起；如果只靠纯文本分段，又可能忽略画面变化、说话人切换和演示步骤转换。更可靠的做法是综合 transcript 内容、停顿、说话人、标题信号和视觉变化来确定章节边界。章节边界一旦切错，后续 segment 对齐、关键帧选择和报告摘要都会跟着错位。

# 必答点

1. 说明固定时间窗口的局限
2. 说明纯文本切分的局限
3. 说明需要综合语义、说话人和视觉变化
4. 说明章节边界会影响后续全部链路

# 常见误答

1. 按每 5 分钟切一段就行
2. 只看 transcript 不看画面变化
3. 不讲说话人切换
4. 不讲切分错误的连锁影响

# 追问

1. 章节边界过粗和过细分别有什么问题？
2. 录屏和访谈视频的章节信号有什么区别？
