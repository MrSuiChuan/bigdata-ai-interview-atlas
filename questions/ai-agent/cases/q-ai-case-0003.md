---
id: q-ai-case-0003
title: ASR + VLM 视频报告系统为什么不是把转写文本交给大模型总结
domain: ai-agent
component: video-note-agent
topic: asr-vlm-video-report-pipeline
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料 video-devour repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - practice-video-devour
claim_ids:
  - practice-p1-claim-0010
related_docs:
  - ai-agent/cases/video-note-agent-asr-vlm-pipeline-case
estimated_minutes: 12
---

# 题目

ASR + VLM 视频报告系统为什么不是把转写文本交给大模型总结？

# 一句话结论

因为视频报告要保持文本、时间戳、章节、视频片段、关键帧和最终报告之间的对齐和可追溯。

# 标准答案

ASR + VLM 视频报告系统不是简单文本总结。正确链路是先用 ASR 生成带时间戳和说话人的 transcript，再由 LLM 生成层级大纲，用语义匹配把 transcript 块对齐到章节，根据章节切分视频，对每个片段抽帧和去重，再由 VLM 选择代表性关键帧，最后生成图文报告。核心难点是对齐：每个章节摘要都应该能追溯到原始 transcript、时间片段和关键帧。评价指标也不能只看报告可读性，还要看 ASR 质量、章节覆盖、边界准确、关键帧相关、图文一致和事实可追溯。

# 必答点

1. 说明 transcript 要保留时间戳和说话人
2. 说明大纲和原始片段需要对齐
3. 说明关键帧选择不是随机截图
4. 说明文本证据和视觉证据要互相支撑
5. 说明报告要能回溯到原视频

# 常见误答

1. 只说先转文字再总结
2. 不讲时间戳
3. 不讲章节和片段对齐
4. 不讲关键帧去重和筛选
5. 不评估图文一致性

