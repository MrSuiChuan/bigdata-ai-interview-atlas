---
id: q-llm-foundation-0037
title: 为什么 reasoning 系统一定要设计预算、停止条件和人工升级规则，而不是让模型一直“想下去”
domain: llm-foundations
component: llm-reasoning
topic: task-decomposition-search-verification-stop-conditions
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "Datawhale reasoning-kingdom and reasoning papers as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - practice-reasoning-kingdom
  - chain-of-thought-paper
  - self-consistency-paper
  - react-paper
  - tree-of-thoughts-paper
claim_ids:
  - llm-foundation-claim-0033
  - llm-foundation-claim-0034
related_docs:
  - llm-foundations/llm-reasoning-cot-react-search-and-verification-boundaries
  - llm-foundations/llm-reasoning-task-decomposition-search-verification-and-stop-conditions
estimated_minutes: 10
---

# 题目

为什么 reasoning 系统一定要设计预算、停止条件和人工升级规则，而不是让模型一直“想下去”？

# 一句话结论

因为 reasoning 一旦接入搜索和工具，更多步骤不仅意味着更多 token 和延迟，也意味着更大的错误传播和副作用风险。

# 标准答案

reasoning 系统不是越多步骤越好。每多一轮思考、搜索或工具调用，都会增加 token 成本、服务延迟和外部副作用风险。如果没有预算和停止条件，系统可能在错误路径上不断扩展，既浪费资源，又让错误更难收敛；如果没有人工升级规则，高风险任务甚至可能在没有审查的情况下持续自动执行。更稳妥的做法，是为 reasoning 系统显式设计最大步数、最大分支数、最大工具调用次数、最大 token 预算，以及验证失败后的停止或升级规则。

# 必答点

1. 说明 reasoning 需要成本边界
2. 说明步骤过多会放大错误和副作用
3. 说明停止条件和预算的作用
4. 说明高风险任务要有人工升级规则
5. 说明验证失败后的处理路径也要设计

# 常见误答

1. 认为多想几步总比少想更好
2. 不讲工具调用的副作用
3. 不讲预算和最大步数
4. 不讲人工升级规则

# 追问

1. 哪些任务尤其需要人工升级？
2. 预算应该按哪些对象来拆？
3. 验证失败后继续和停止分别适合什么场景？
