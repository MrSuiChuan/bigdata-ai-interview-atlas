---
id: q-ai-pattern-0002
title: Planner-Executor 为什么不能和 ReAct 混着讲，以及为什么规划深度不能默认越深越好
domain: ai-agent
component: agent-patterns
topic: planner-executor-budget-aware-reasoning
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs and primary papers as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - react-paper
  - langgraph-thinking-docs
  - crewai-flows-docs
  - semantic-kernel-process-framework-docs
  - openai-latency-optimization-guide
  - openai-cost-optimization-guide
  - langgraph-graph-api-overview-docs
  - langgraph-use-graph-api-docs
claim_ids:
  - pattern-claim-0004
  - pattern-claim-0005
  - pattern-claim-0006
  - pattern-claim-0007
  - pattern-claim-0152
  - pattern-claim-0153
  - pattern-claim-0154
  - pattern-claim-0155
  - pattern-claim-0156
related_docs:
  - ai-agent/patterns/planner-executor
estimated_minutes: 10
---

# 题目

Planner-Executor 为什么不能和 ReAct 混着讲，以及为什么规划深度不能默认越深越好？

# 一句话结论

因为 ReAct 是交替 reasoning-acting，Planner-Executor 是显式分层的 planning 和 execution 控制结构；而一旦把 planning 变成结构化控制，接下来就必须继续回答“什么时候该停”，否则系统会在边际收益很低时继续烧预算。

# 核心机制

1. ReAct 是 interleaved control
2. Planner-Executor 是 layered control
3. reasoning depth 会直接消耗 latency 与 cost budget
4. hard bounds prevent runaway loops, but soft exits decide optimal stopping
5. deterministic logic should replace LLM reasoning when constraints are tight

# 标准答案

Planner-Executor 和 ReAct 都涉及“想”和“做”，但控制结构不同。ReAct 是 reasoning 与 acting 交替循环；Planner-Executor 则先由 planner 给出结构化计划，再由 executor 在计划下执行动作，所以后者更适合强调控制边界、恢复、审批和追踪，因此不能简单混成同一种模式。进一步，Planner-Executor 一旦进入生产，规划深度就不能默认越深越好。OpenAI 的 latency 和 cost optimization 指南说明，请求数、token 数、模型大小和是否默认使用 LLM，都会直接影响时延与成本，所以每增加一层规划、反思或检索，本质上都在追加预算。工作流层面，LangGraph 要求 loop 必须有 termination condition，也支持 recursion limit，并通过 `RemainingSteps` 这类预算信号帮助系统在接近上限时主动 early exit、切换 fallback 或降级为 best-effort 路径。因此，成熟系统通常会把 Planner-Executor 讲成“分层控制结构”，再把 planning depth control 讲成“预算内停止机制”，两层合起来才完整。

# 必答点

1. interleaved vs layered
2. control semantics and governance value
3. planning depth consumes cost and latency budgets
4. 区分 hard limit 和 soft exit
5. 提到某些节点应该退出到确定性逻辑

# 常见误答

1. 把任何先想后做都叫 Planner-Executor
2. 把 ReAct 当成 Planner-Executor 的一种写法
3. 认为思考更深总是更好
4. 只调大递归上限，不设计停止条件