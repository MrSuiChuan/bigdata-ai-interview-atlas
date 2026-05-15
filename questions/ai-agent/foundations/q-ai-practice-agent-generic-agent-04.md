---
id: q-ai-practice-agent-generic-agent-04
title: "如何评估 GenericAgent 是否真的在持续进化，而不是持续积累噪声？"
domain: ai-agent
component: generic-agent
topic: skill-crystallization-evals-governance
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "GenericAgent repository, OpenAI context engineering guides, and 实践资料 hello-generic-agent repository as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - generic-agent-github
  - practice-hello-generic-agent
  - openai-conversation-state-guide
claim_ids:
  - practice-p1-claim-0005
  - agent-runtime-claim-0006
  - agent-runtime-claim-0009
related_docs:
  - ai-agent/frameworks/generic-agent-skill-crystallization-evals-and-governance
estimated_minutes: 10
---

# 题目

如何评估 GenericAgent 是否真的在持续进化，而不是持续积累噪声？

# 一句话结论

不能靠一次成功案例判断，必须看候选技能是否经过评估、上线后是否稳定提升成功率，以及出现问题时是否能快速回滚。

# 核心机制

1. skill draft 和正式技能必须分开。
2. 评估要覆盖成功率、步骤数、成本和人工接管率。
3. 记忆写入要有过滤和版本。
4. trace 要能证明是技能提升还是偶然成功。
5. 必须支持下线和回滚。

# 标准答案

评估 GenericAgent 的“自我进化”时，先构建代表真实任务的验证集，比较某个 skill 上线前后的任务成功率、平均步骤数、P95 延迟、token 成本和人工接管率。只有候选 skill 通过验证，才能进入正式 registry。上线后还要持续监控 trace，确认它是在正确场景被召回，而不是把错误经验扩散到更多任务。一旦出现污染或回归，系统必须能关闭或回滚该 skill。

# 必答点

1. 候选技能与正式技能分层。
2. 评估最终结果和执行过程。
3. 关注技能命中率和适用范围。
4. 监控延迟、成本和人工接管。
5. 改动后支持回滚和灰度。

# 常见误答

1. 只看一次 demo。
2. 只评估最终文本，不看过程。
3. 不检查技能适用范围。
4. 没有回滚和灰度策略。
