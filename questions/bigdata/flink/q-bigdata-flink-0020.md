---
id: q-bigdata-flink-0020
title: 为什么 Flink Async I/O 的 exactly-once 题必须继续讲 in-flight requests 和 checkpoint
domain: bigdata
component: flink
topic: async-io-ordering-timeout-retry-fault-tolerance
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "Flink 2.2 stable docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - flink-async-io
claim_ids:
  - flink-claim-0096
  - flink-claim-0097
  - flink-claim-0099
related_docs:
  - bigdata/flink/async-io-ordering-timeout-retry-and-fault-tolerance
estimated_minutes: 9
---

# 题目

为什么 Flink Async I/O 的 exactly-once 题必须继续讲 in-flight requests 和 checkpoint？

# 一句话结论

因为异步外部调用一旦脱离 checkpoint 边界，失败恢复后就说不清哪些请求已经算过、哪些要重做。

# 核心机制

1. in-flight requests 对应的记录会进入 checkpoint
2. 失败恢复时这些请求会被重新触发
3. retry 也是运行时机制的一部分

# 标准答案

Async I/O 的 exactly-once 题如果只回答“Flink 本身有 checkpoint”，通常还不够。官方文档明确说明，async operator 会把 in-flight asynchronous requests 对应的记录存入 checkpoint，并在恢复时重新触发这些请求，因此它能提供 full exactly-once fault tolerance guarantees。这说明异步请求不是游离在运行时边界之外的黑盒副作用，而是被纳入快照与恢复流程之中。与此同时，官方还给出 `AsyncRetryStrategy` 这样的内建重试机制，进一步说明 Async I/O 的可靠性管理是正式运行时能力，而不是用户随便写几层重试循环。

# 必答点

1. in-flight requests 会进 checkpoint
2. 恢复后会重触发
3. retry 是运行时支持能力

# 常见误答

1. 认为异步外部请求没法 exactly-once
2. 不知道未完成请求也会进入 checkpoint
3. 把 retry 当成纯业务层小技巧
