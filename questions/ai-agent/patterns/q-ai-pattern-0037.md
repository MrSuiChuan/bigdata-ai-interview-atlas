---
id: q-ai-pattern-0037
title: 为什么 Stateful Agent 的 State Schema Evolution 首先是兼容性问题
domain: ai-agent
component: agent-patterns
topic: state-schema-evolution-backward-compatibility-migration-safety
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - langgraph-persistence-docs
claim_ids:
  - pattern-claim-0168
  - pattern-claim-0169
  - pattern-claim-0170
  - pattern-claim-0171
  - pattern-claim-0172
  - pattern-claim-0173
related_docs:
  - ai-agent/patterns/state-schema-evolution-backward-compatibility-and-migration-safety
estimated_minutes: 10
---

# 题目

为什么 Stateful Agent 的 State Schema Evolution 首先是兼容性问题，而不是普通重构问题？

# 一句话结论

因为一旦工作流状态被 checkpoint 持久化，历史状态就会参与未来恢复执行，旧 checkpoint 和新代码之间天然存在协议兼容问题。

# 核心机制

1. persisted checkpoints are live execution inputs, not cold history
2. topology changes are constrained by whether old threads may resume
3. rename and incompatible type changes are riskier than add/remove keys

# 标准答案

Stateful agent 的状态模式演化首先是兼容性问题，因为 LangGraph persistence 会在每一步执行后把状态保存成 checkpoint，并按 thread 组织，恢复执行依赖这些已序列化状态。也就是说，系统行为由“当前代码 + 旧 checkpoint”共同决定，而不是只有当前代码。进一步，LangGraph 的 graph migrations 指南明确区分了线程生命周期：如果 thread 已经走到图末尾，可以自由修改整个 topology，包括增删改节点和边；但如果 thread 处于 interrupted 状态、未来还要恢复，就不能随意 rename 或 remove 它接下来可能进入的节点。状态字段层面，添加或删除 state key 通常是前后兼容的，因为新旧代码都还能忽略或补默认值；但重命名 key 会让旧状态失去映射，不兼容的类型变化也可能导致旧 checkpoint 无法被新逻辑解释。因此，真正安全的迁移方案要么保持对旧 checkpoint 的兼容解释能力，要么在引入 breaking change 前先 drain 掉所有仍会继续执行的 interrupted threads。只把它当作普通重构，会忽略运行中线程仍依赖旧协议这一事实。

# 必答点

1. 先讲清 checkpoint 会参与未来恢复执行
2. 说明 ended threads 和 interrupted threads 的变更自由度不同
3. 说明 add/remove keys 通常比 rename/type change 更安全
4. 说明迁移策略通常是兼容旧状态或先 drain 旧线程

# 常见误答

1. 把 checkpoint 当成审计日志，不当成运行合同
2. 认为发版重启后旧状态自然失效
3. 忽略 interrupted threads 的拓扑约束
4. 认为字段重命名只是代码整洁问题
