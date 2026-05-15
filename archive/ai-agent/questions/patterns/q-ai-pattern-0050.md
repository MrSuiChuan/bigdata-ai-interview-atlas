---
id: q-ai-pattern-0050
title: 为什么 Workflow Checkpoint 设计首先是超步一致性和信任边界设计
domain: ai-agent
component: agent-patterns
topic: superstep-checkpoints-storage-trust-boundaries-workflow-rehydration
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - microsoft-agent-framework-checkpoints
claim_ids:
  - pattern-claim-0248
  - pattern-claim-0249
  - pattern-claim-0250
  - pattern-claim-0251
  - pattern-claim-0252
  - pattern-claim-0253
  - pattern-claim-0254
related_docs:
  - ai-agent/patterns/superstep-checkpoints-storage-trust-boundaries-and-workflow-rehydration
estimated_minutes: 12
---

# 题目

为什么 Workflow Checkpoint 设计首先是超步一致性和信任边界设计？

# 一句话结论

因为 checkpoint 不是“到处存一下状态”，而是要在语义完整的 superstep 边界上捕获可恢复真相，并确保这个真相的存储、反序列化和重建过程可信。

# 核心机制

1. superstep 才是正确的一致性快照边界
2. executor-local state 必须显式保存与恢复
3. storage、rehydration 和反序列化本身就是信任边界

# 标准答案

Workflow checkpoint 设计首先是超步一致性和信任边界设计，因为 Microsoft Agent Framework 明确规定 checkpoint 在每个 superstep 结束后创建，也就是该 superstep 中所有 executors 完成之后；同时它会捕获 executor state、下一 superstep 的 pending messages、pending requests/responses 和 shared states，所以只有 superstep 才是一致性保存边界。启用 checkpointing 也不是默认魔法，而是运行 workflow 时必须显式提供 `CheckpointManager` 或 `CheckpointStorage`，之后才能通过 `SuperStepCompletedEvent` 或 run 的 `Checkpoints` 集合观察这些快照。存储层面，框架提供 in-memory、file、Cosmos 三种实现，但共用统一协议，因此 durability 后端可以替换而不改 workflow 代码。恢复层面，又要区分在同一个 run 上 resume，还是根据 `checkpoint_id` 和 storage 在新实例中 rehydrate，这两者在生命周期上并不相同。与此同时，executor-local state 并不会自动被魔法保存，必须通过 `OnCheckpointingAsync` / `OnCheckpointRestoredAsync` 或 `on_checkpoint_save` / `on_checkpoint_restore` 显式处理。最后，checkpoint storage 本身就是信任边界：官方明确要求不要从不可信或被篡改的来源加载 checkpoint，file/Cosmos 虽使用 restricted unpickler，也只是缩小反序列化攻击面；如果 threat model 不接受 pickle 路径，就应改用 in-memory 或自定义存储策略。因此，checkpoint 设计的核心是超步一致性、executor 状态责任、resume/rehydrate 区分和存储信任边界，而不是“把状态存下来”这么简单。

# 必答点

1. 说明 superstep 是 checkpoint 正确边界
2. 说明 executor-local state 需要显式 save/restore
3. 说明 resume 和 rehydrate 是两种不同恢复语义
4. 说明 checkpoint storage 与反序列化都是 trust boundary

# 常见误答

1. 把 checkpoint 理解成定时存盘
2. 误以为所有局部状态都会自动恢复
3. 不区分原 run 继续和新实例重建
4. 不把 checkpoint storage 当成安全问题处理
