---
id: q-community-datawhale-post-training-of-llms-0001
title: post-training-of-llms 为什么不能只当成教程项目，应该提炼成哪些面试原理？
domain: community
component: datawhale
topic: post-training-of-llms
question_type: principle
difficulty: advanced
status: reviewed
version_scope: Datawhale post-training-of-llms as organized on 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - datawhale-post-training-of-llms
claim_ids: []
related_docs:
  - community/datawhale/llm/post-training-of-llms
estimated_minutes: 10
---

# 题目

post-training-of-llms 为什么不能只当成教程项目，应该提炼成哪些面试原理？

# 一句话结论

post-training-of-llms 不能只当成教程项目，因为面试考察的是它背后的可迁移原理。应该先说明它属于LLM 后训练项目，再讲 SFT 数据、Preference Pair、Reward Model、DPO 这些对象如何协作，最后补上工程边界和需要官方复核的部分。

# 核心机制

1. 后训练主要改善指令遵循、偏好对齐和安全行为，不等于事实知识实时更新。
2. 偏好数据质量决定偏好优化上限。
3. 后训练必须配合回归评估防止能力退化。

# 标准答案

post-training-of-llms 不能只当成教程项目，因为面试考察的是它背后的可迁移原理。应该先说明它属于LLM 后训练项目，再讲 SFT 数据、Preference Pair、Reward Model、DPO 这些对象如何协作，最后补上工程边界和需要官方复核的部分。 具体回答时要把 SFT 数据、Preference Pair、Reward Model、DPO、RLHF 放到同一条链路里解释，说明它们分别承担什么职责、维护什么状态、异常时如何定位。最后要补充：Datawhale 在这里作为 trusted-community 来源，适合提供项目经验和学习路径；涉及 API、协议、框架版本或模型能力边界时，必须继续用官方来源交叉复核。

# 必答点

1. 说明项目定位：LLM 后训练项目。
2. 说明核心对象：SFT 数据、Preference Pair、Reward Model、DPO、RLHF。
3. 说明执行链路和状态变化。
4. 说明失败排查或工程权衡。
5. 说明 trusted-community 和官方复核边界。

# 常见误答

1. 只背项目名或仓库目录。
2. 只讲安装步骤，不讲机制。
3. 不讲异常和边界。
4. 把社区经验直接当成官方事实。

# 延伸追问

1. 比较 SFT 和 DPO 时，你会如何设计评估指标？
2. 设计偏好数据 时，你会如何设计评估指标？
3. 评估后训练效果 时，你会如何设计评估指标？
