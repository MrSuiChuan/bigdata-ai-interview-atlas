---
id: q-bigdata-trino-0009
title: Worker 宕机后 Trino 为什么经常直接让整条查询失败
domain: bigdata
component: trino
status: reviewed
version_scope: Official Trino current docs as verified on 2026-05-11
last_verified_at: '2026-05-11'
topic: fault-recovery
question_type: failure
difficulty: advanced
source_ids:
  - trino-fault-tolerant-execution-docs
claim_ids:
  - bigdata-trino-claim-0014
  - bigdata-trino-claim-0015
  - bigdata-trino-claim-0016
related_docs:
  - bigdata/trino/fault-recovery
estimated_minutes: 10
---

# 题目

Worker 宕机后 Trino 为什么经常直接让整条查询失败？

# 一句话结论

因为默认执行模型下，Worker 上的局部执行状态和中间结果并不天然可迁移，节点故障会直接打断整条查询。

# 这题想考什么

这题考的是你是否理解 Trino 的默认失败模型，以及为什么 fault-tolerant execution 不是默认免费的能力。

# 回答主线

1. 先讲默认模型：节点故障时查询失败。
2. 再讲原因：局部状态和中间结果没有天然恢复边界。
3. 再讲 FTE 如何改变这件事。
4. 最后补它解决不到什么。

# 参考作答

Trino 默认并不是“某个 Worker 掉了，系统自动切过去继续跑”。官方文档明确说，节点在执行过程中故障或资源不足时，查询默认会失败，需要重新运行。

根因在于默认模式下，Worker 上的 task 执行状态和 exchange 中间结果是易失的，不具备天然迁移性。只有启用 fault-tolerant execution，并在需要时引入 exchange manager，把中间状态放到可复用边界上，才可能进入 query retry 或 task retry。也正因为这样，用户错误、坏 SQL 和不支持的 connector 依然不在自动恢复范围里。

# 现场判断抓手

1. 能主动说出“默认会失败”。
2. 能解释为什么局部状态不可迁移。
3. 能把 exchange manager 和 task retry 关联起来。

# 常见误区

1. 把 Trino 默认讲成高可用无感恢复。
2. 把用户错误也算到 FTE 可恢复范围里。
3. 不区分 QUERY retry 和 TASK retry。

# 追问

1. 为什么 TASK retry 对大型批量查询更有价值？
2. 为什么 FTE 常常伴随更多外部 I/O 成本？
3. Connector 不支持 query retries 时应怎样回答？
