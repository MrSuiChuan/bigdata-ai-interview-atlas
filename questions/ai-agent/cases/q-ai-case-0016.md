---
id: q-ai-case-0016
title: 视频笔记 Agent 为什么一定要保留 transcript span、章节锚点和关键帧 grounding，而不是只输出总结
domain: ai-agent
component: video-note-agent
topic: timestamp-alignment-keyframe-grounding
question_type: system-design
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
estimated_minutes: 12
---

# 题目

视频笔记 Agent 为什么一定要保留 `transcript span`、章节锚点和关键帧 grounding，而不是只输出总结？

# 一句话结论

因为这类系统的核心价值是可追溯和可回放，只有把文字、时间和画面绑在一起，用户才能验证结论来自哪里。

# 标准答案

视频笔记 Agent 不是普通摘要器。它面对的是跨语音、文本、时间轴和视觉的多模态证据链，所以必须保留 transcript span、章节锚点和关键帧 grounding。transcript span 负责把文字绑定到时间戳和说话人，章节锚点负责把摘要映射回原始视频区间，关键帧 grounding 负责让视觉证据和文字结论互相支撑。只输出总结虽然看起来更简洁，但一旦用户需要复查某个概念、公式或操作步骤，就无法回到原视频定位，也无法判断图片和文字是否真的对应。

# 必答点

1. 说明视频笔记是多模态证据系统
2. 说明 transcript span 的作用
3. 说明章节锚点的作用
4. 说明关键帧 grounding 的作用
5. 说明没有这些对象就无法回放和复核

# 常见误答

1. 只说“转写后让模型总结”
2. 不讲时间戳和章节锚点
3. 不讲关键帧与文字一致性
4. 只看摘要可读性，不看可追溯性

# 追问

1. 为什么关键帧不能随机抽？
2. 章节边界错位会如何影响最终报告？
3. transcript span 缺说话人信息会带来什么问题？
