---
id: q-llm-foundation-0020
title: 为什么多模态文档问答不能只抽纯文本，还要保留版式、页码和区域证据
domain: llm-foundations
component: multimodal
topic: multimodal-ocr-asr-layout-timeline-grounding
question_type: principle
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
estimated_minutes: 10
---

# 题目

为什么多模态文档问答不能只抽纯文本，还要保留版式、页码和区域证据？

# 一句话结论

因为真实文档的语义不仅在文字本身，还在表格关系、标题层级、页码、图注和页面区域位置里，只抽纯文本会让关键结构在进入模型前就丢失。

# 标准答案

多模态文档问答不能只抽纯文本，因为很多任务依赖文档结构而不只是字面内容。表格里的行列关系、图注和正文的对应、页码、标题层级、脚注、扫描件中的阅读顺序，都会影响答案是否正确。只保留纯文本虽然实现快，但会丢掉页面区域和结构化证据，导致表格错列、引用回不去原页、截图位置无法解释、复杂 PDF 的上下文被抹平。更可靠的做法是同时保留 OCR 文本、页码、bbox 或版式块信息，再由 grounding 层决定哪些证据进入模型，这样系统才能既回答问题，又能回溯来源和排查错误。

# 必答点

1. 说明文档语义不只在纯文本里
2. 说明表格、标题层级和页码的重要性
3. 说明只抽纯文本会丢结构
4. 说明 grounding 需要结构化证据
5. 说明来源可追溯和排障价值

# 常见误答

1. 认为 OCR 文本拿到就够了
2. 不讲表格和版式关系
3. 不讲页码和来源定位
4. 认为多模态只是把图片转文字

# 追问

1. 表格列错位会如何影响 RAG？
2. 页码和 bbox 为什么有利于排障？
3. 扫描件阅读顺序错误会造成什么问题？
