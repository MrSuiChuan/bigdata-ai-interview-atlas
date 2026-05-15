---
id: q-community-datawhale-agent-0002
title: 多 Agent 系统为什么不是角色越多越好？
domain: community
component: datawhale
topic: multi-agent
question_type: tradeoff
difficulty: advanced
status: reviewed
version_scope: "Datawhale multi-agent repositories as classified on 2026-04-28"
last_verified_at: "2026-04-28"
source_ids:
  - datawhale-handy-multi-agent
  - datawhale-hugging-multi-agent
claim_ids: []
related_docs:
  - community/datawhale/ai-agent/p0-agent-mainline
estimated_minutes: 10
---

# 题目

多 Agent 系统为什么不是角色越多越好？

# 一句话结论

多 Agent 的价值是分工和协作，不是堆角色。角色越多，通信成本、状态一致性、冲突解决、评估复杂度和 token 成本都会上升。

# 核心机制

多 Agent 系统要回答三个问题：每个 Agent 负责什么，彼此怎么传递信息，冲突时谁有最终决策权。如果没有清晰边界，多 Agent 会变成多个模型互相重复、互相污染上下文、消耗 token，却没有提升质量。

# 标准答案

多 Agent 不是角色越多越好。它适合任务天然可拆分、需要不同专业视角或需要审查制衡的场景。代价是系统复杂度明显上升：角色之间要通信，要共享或隔离状态，要处理冲突，要防止上下文膨胀，还要评估每个 Agent 的贡献。面试里不能只讲“产品经理、架构师、程序员一起协作”，还要说明这种分工是否真的降低复杂度，以及失败时怎么定位是哪一个 Agent 出问题。

# 必答点

1. 说明多 Agent 的价值是分工，不是堆角色。
2. 说明通信成本和上下文成本。
3. 说明共享状态和冲突解决。
4. 说明评估和排障复杂度。
5. 说明适用场景和不适用场景。

# 常见误答

1. 认为角色越多越智能。
2. 只描述角色设定，不讲协调机制。
3. 不讲成本和延迟。
4. 不讲失败定位。

# 延伸追问

1. 多 Agent 和 workflow 的边界是什么？
2. 如何设计一个代码生成多 Agent 系统？
3. 多 Agent 失败时怎么做 tracing？
