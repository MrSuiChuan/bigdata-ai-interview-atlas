---
id: q-bigdata-iceberg-0012
title: 为什么说 Iceberg 的时间点查询应该依赖 snapshot-log，而不是只看 snapshot 谱系
domain: bigdata
component: iceberg
topic: time-travel
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Iceberg table spec as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - iceberg-spec
claim_ids:
  - iceberg-claim-0052
  - iceberg-claim-0054
related_docs:
  - bigdata/iceberg/metadata-json-snapshot-log-and-point-in-time-resolution
estimated_minutes: 6
---
# 题目

为什么说 Iceberg 的时间点查询应该依赖 `snapshot-log`，而不是只看 snapshot 谱系？

# 一句话结论

因为 `snapshot-log` 记录的是 `current-snapshot-id` 真正按时间切换的轨迹，而 snapshot 的父子关系描述的是版本依赖，不是可靠的时间顺序。

# 核心机制

1. `snapshot-log` 记录表头何时切到哪个 snapshot。
2. snapshot parent-child 更像版本演化链，不等于时间轴。
3. 按时间点做解析时，规范要求优先依据 `snapshot-log`。

# 标准答案

Iceberg 的时间点查询本质上是在回答“某个时刻主分支表头指向哪个 snapshot”。这个问题最直接的证据不是 snapshot 的父子关系，而是 `snapshot-log`。因为 `snapshot-log` 专门记录 `current-snapshot-id` 在什么时间切换到了哪个 snapshot，它反映的是主分支可见状态的时间轨迹。相反，snapshot 谱系更多说明版本依赖和父子关系，不能简单拿来当作严格时钟顺序使用。所以当题目问“按 timestamp 找版本为什么要看 snapshot-log”，更准确的回答是：时间点查询要找的是表头切换历史，而这正是 `snapshot-log` 的职责。

# 必答点

1. `snapshot-log` 记录的是 current snapshot 的时间变化。
2. snapshot 谱系不等于可靠时间线。
3. 时间点查询要找的是“当时主分支看到了谁”。

# 加分点

1. 能顺带说明 `metadata-log` 关注的是 metadata file 的换代史。
2. 能区分“按 snapshot id 读历史”和“按时间点解析历史”是两件不同事情。

# 常见误答

1. 认为 snapshot parent-child 顺序天然等于时间顺序。
2. 把 `snapshot-log` 和 `metadata-log` 混成同一类日志。

# 追问

1. `current-snapshot-id` 和 main 分支头之间是什么关系？
2. 如果某个 snapshot 还在 `snapshots` 列表中，它对时间旅行和文件删除各意味着什么？
