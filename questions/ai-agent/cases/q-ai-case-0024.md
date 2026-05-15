---
id: q-ai-case-0024
title: 多 Agent 技术写作里，为什么“来源分层”和“证据绑定”要先于正文生成
domain: ai-agent
component: multi-agent-writing
topic: source-evidence-versioning-citation-governance
question_type: principle
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
  - ai-agent/cases/multi-agent-writing-source-evidence-versioning-and-citation-governance
estimated_minutes: 10
---

# 题目

多 Agent 技术写作里，为什么“来源分层”和“证据绑定”要先于正文生成？

# 一句话结论

因为没有来源分层和证据绑定，后面的正文、代码、图表和引用都只能看起来像正确，无法真正复核和维护。

# 标准答案

多 Agent 写作不是一次性聊天，而是一条内容生产链。正文只是最终产物，前面还涉及资料抓取、证据抽取、章节分工、图表生成和审稿回写。如果没有先把原始来源标准化为可追踪的来源对象，再把具体结论绑定到可复核证据上，系统后面即使写得流畅，也很难回答“这段话来自哪里”“这张图支撑了什么结论”“为什么本轮修改没有影响别的章节”。所以来源分层和证据绑定必须前置，它们决定的是整条链的可信度，而不是单段文字的可读性。

# 必答点

1. 说明写作系统是流水线而不是单步生成
2. 说明来源对象和证据对象不同
3. 说明正文、图表、代码都要绑定证据
4. 说明这样做是为了复核、维护和回滚

# 常见误答

1. 只要最后补参考链接就行
2. 认为正文写得通顺就够了
3. 把整篇来源等同于具体证据
4. 不讲版本和审稿回写
