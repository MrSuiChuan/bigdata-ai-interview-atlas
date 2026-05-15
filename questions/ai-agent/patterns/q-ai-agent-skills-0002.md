---
id: q-ai-agent-skills-0002
title: Skill 装载为什么不能等模型自由发挥后再“顺手补一些背景”
domain: ai-agent
component: agent-skills
topic: agent-skills-loading-selection-context-packing
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Anthropic docs, Claude blog, DeepLearning.AI course page, and 实践资料 agent-skills repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - anthropic-agent-skills-docs
  - anthropic-skills-explained-blog
  - practice-agent-skills-with-anthropic
claim_ids:
  - practice-p2-claim-0002
  - agent-runtime-claim-0005
related_docs:
  - ai-agent/patterns/agent-skills-loading-selection-and-context-packing
estimated_minutes: 12
---

# 题目

Skill 装载为什么不能等模型自由发挥后再“顺手补一些背景”？

# 一句话结论

因为 Skill 的核心价值是运行前把任务能力包按规则装入上下文，而不是等模型先走错一步再临时补救。

# 核心机制

1. Skill Manifest 决定什么时候命中
2. Resource Bundle 决定装哪些说明、模板和脚本
3. Context Pack 决定模型真正看到的高密度信息
4. Selector 和 Fallback 决定系统是否稳定收敛

# 标准答案

Skill 装载不能等模型先自由发挥，再临时往上下文里补背景。因为 Skill 的工程价值就在于运行前准备：Selector 先根据目标和环境筛选候选 skill，Manifest 再判断是否满足触发条件，随后 Resource Bundle 被裁剪成高密度 Context Pack 进入本轮推理。这样模型一开始拿到的就是经过约束的任务能力包，而不是混杂的大段原始资料。如果先让模型裸跑，再在中途补背景，系统会更容易出现错误首步、重复试探、上下文膨胀和错误 skill 命中，整体步骤数、成本和失败率都会上升。

# 必答点

1. 说明 Skill 是运行前装载的能力包
2. 说明 Manifest、Resource Bundle、Selector、Context Pack 的关系
3. 说明为什么首轮上下文质量直接影响后续动作
4. 说明错误装载会带来步骤膨胀和错误收敛
5. 说明要有 fallback 或降级策略

# 常见误答

1. 认为 Skill 只是更长的 Prompt
2. 认为模型自己会找到正确背景
3. 不讲装载预算和上下文密度
4. 不讲误召回和漏召回
