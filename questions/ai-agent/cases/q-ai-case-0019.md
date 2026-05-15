---
id: q-ai-case-0019
title: 视频笔记 Agent 出错时为什么必须把问题拆到 ASR、章节、关键帧和报告层，而不能笼统说“多模态模型不准”
domain: ai-agent
component: video-note-agent
topic: video-agent-budget-observability-evaluation
question_type: troubleshooting
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

视频笔记 Agent 出错时为什么必须把问题拆到 ASR、章节、关键帧和报告层，而不能笼统说“多模态模型不准”？

# 一句话结论

因为这类系统是多阶段流水线，最终错答可能来自前面任何一层，不拆层就无法找到真正的修复点。

# 标准答案

视频笔记 Agent 的错误不一定发生在最终生成阶段。ASR 失真会让后续文字证据全错；章节切分错误会导致时间锚点和主题边界偏移；关键帧选择错误会让视觉证据和文字结论错配；报告层再把这些中间错误包装成流畅文本，用户就更难看出问题。所以排障时必须保留中间对象 trace，把问题拆回 ASR、章节、关键帧和报告四层，才能知道到底该改转写、切分、抽帧还是总结逻辑。

# 必答点

1. 说明视频笔记是多阶段流水线
2. 说明错误可能发生在生成前
3. 说明必须保留中间 trace
4. 说明拆层排障能指导修复

# 常见误答

1. 一律怪模型不准
2. 不看中间对象
3. 不区分 ASR 错和关键帧错
4. 不保留 trace

# 追问

1. 哪一层最容易造成“看起来对、其实锚点错”？
2. 如何设计最小可用的 trace 字段？
