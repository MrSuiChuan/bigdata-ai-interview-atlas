---
id: q-llm-foundation-0014
title: 多模态 LLM 为什么不是简单的看图聊天
domain: llm-foundations
component: multimodal
topic: vision-audio-document-video-pipeline-evaluation
question_type: principle
difficulty: intermediate
status: reviewed
version_scope: "OpenAI vision docs and CLIP paper as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - openai-images-vision-docs
  - clip-paper
claim_ids:
  - llm-foundation-claim-0027
related_docs:
  - llm-foundations/multimodal-llm-vision-audio-document-and-video-pipeline
estimated_minutes: 8
---

# 题目

多模态 LLM 为什么不是简单的看图聊天？工程链路应该怎么讲？

# 一句话结论

多模态系统要把图像、音频、文档或视频输入经过 OCR、ASR、视觉编码、关键帧、版式解析和上下文组装，再做生成和评估。

# 标准答案

多模态 LLM 把图像、音频、文档或视频接入模型，但它不是简单看图聊天。图像场景要处理清晰度、OCR、视觉编码和问题对齐；音频通常先做 ASR；视频要做关键帧、字幕、音轨和时间线对齐；文档要处理版式、表格、页码和引用。多模态输入仍然会有识别错误、上下文缺失、成本和延迟问题，模型也可能对看不清的内容过度自信。因此生产系统要做不确定性处理、来源定位、结构化校验、任务评估和必要的人工复核。

# 必答点

1. 说明多模态输入类型
2. 说明 OCR、ASR、关键帧、版式解析
3. 说明多模态不等于天然正确
4. 说明成本、延迟和上下文问题
5. 说明评估和人工复核

# 常见误答

1. 把多模态等同于看图聊天
2. 不讲 OCR 和 ASR
3. 认为图片输入一定更准确
4. 不处理看不清和歧义输入
5. 高风险场景没有人工复核

# 追问

1. 视频理解为什么不能只抽一张图？
2. 文档问答为什么不能只抽纯文本？
3. OCR 错误会如何影响 RAG？
4. 多模态如何评估质量？
