---
id: q-llm-foundation-0021
title: 视频或会议理解为什么必须拆成 ASR、关键帧、时间线和 grounding，而不是一次性丢给模型
domain: llm-foundations
component: multimodal
topic: multimodal-ocr-asr-layout-timeline-grounding
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "OpenAI vision docs, CLIP paper, OpenAI evaluation best practices, and OpenAI safety best practices as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - openai-images-vision-docs
  - clip-paper
  - openai-evaluation-best-practices
claim_ids:
  - llm-foundation-claim-0027
  - llm-foundation-claim-0024
related_docs:
  - llm-foundations/multimodal-llm-vision-audio-document-and-video-pipeline
  - llm-foundations/multimodal-ocr-asr-layout-timeline-grounding-and-evaluation
estimated_minutes: 12
---

# 题目

视频或会议理解为什么必须拆成 ASR、关键帧、时间线和 grounding，而不是一次性丢给模型？

# 一句话结论

因为视频和会议的语义跨越时间展开，只有把语音、画面、说话人轮次和关键证据分层处理，系统才能保住事件顺序、来源定位和上下文完整性。

# 标准答案

视频和会议理解不能只做一次性整体输入，因为它的核心难点是时间结构。音频里要保留 ASR 文本、说话人和时间戳，画面里要保留关键帧和屏幕内容，会议或视频事件之间还存在先后关系和因果关系。若不拆成 ASR、关键帧、时间线和 grounding 四层，系统很容易漏掉重要片段、错配说话人、把局部画面当成全局结论，或者根本无法解释答案来自哪个时间段。更稳的设计是先做感知，再按时间窗口重建证据，最后只把高价值片段进入 prompt，并保留时间线来源用于引用和排障。

# 必答点

1. 说明视频和会议语义依赖时间结构
2. 说明 ASR、关键帧和说话人轮次要分层
3. 说明 grounding 决定模型真正看到什么
4. 说明事件顺序和来源定位的重要性
5. 说明一次性整体输入难以排障和复核

# 常见误答

1. 认为视频就是多张图加一段文本
2. 不讲时间戳和说话人
3. 不讲关键帧筛选
4. 不讲 grounding 和引用

# 追问

1. 为什么视频理解不能只抽一张关键帧？
2. ASR 否定词丢失会导致什么后果？
3. 时间线窗口过大或过小各有什么问题？
