---
kb_id: ai-agent/patterns/retry-fallback-cache-and-error-taxonomy
title: Retry / Fallback / Cache / Error Taxonomy：不是所有失败都该重试，重试也不是唯一恢复方式
domain: ai-agent
component: agent-patterns
topic: retry-fallback-cache-error-taxonomy
difficulty: advanced
status: reviewed
sidebar_position: 28
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - langgraph-thinking-docs
  - langgraph-use-graph-api-docs
  - langgraph-use-functional-api-docs
  - openai-latency-optimization-guide
claim_ids:
  - pattern-claim-0119
  - pattern-claim-0120
  - pattern-claim-0121
  - pattern-claim-0122
  - pattern-claim-0123
tags:
  - ai-agent
  - retry
  - fallback
  - cache
  - error-handling
---
## 一句话结论

Retry / Fallback / Cache / Error Taxonomy：不是所有失败都该重试，重试也不是唯一恢复方式需要从对象、链路、边界和证据四个角度理解。

## 为什么这个主题很容易理解停留在表层

很多人会把 agent 失败恢复讲成一句很粗的话：

1. 报错了就重试
2. 重试几次还不行就失败

这对真实系统通常不够，因为 agent 失败并不是一个单一桶。下面这些失败，本质完全不同：

1. HTTP 429 或短暂 5xx
2. 模型输出字段缺失
3. 用户信息不完整
4. 工具参数本身就是错的
5. 代码 Bug 或状态机 Bug

如果这些错误都统一用“再来一次”处理，系统会很容易：

1. 白白消耗额度和时延
2. 把同样的副作用执行多遍
3. 掩盖真正的程序错误
4. 让用户等待很久却没有实质恢复

所以这个主题真正考的是 failure classification，而不是 retry 次数。

## 失败不是一个桶，先做 taxonomy 才能谈恢复

LangGraph 的 thinking guide 给了一个非常适合知识表达的分类法：

1. transient errors
2. LLM-recoverable errors
3. user-fixable errors
4. unexpected errors

而且它直接把恢复方式也对应出来：

1. transient errors 适合 retry
2. LLM-recoverable errors 适合回环并带着错误上下文再尝试
3. user-fixable errors 适合 interrupt，等用户补信息
4. unexpected errors 应该 bubble up 进入调试流程

这条映射特别重要，因为它说明“恢复策略”不是统一模板，而是 failure class 的函数。

## 为什么不是所有失败都该重试

最关键的一句其实是：

retry 只对可重试的错误有意义。

LangGraph 的 Graph API 文档把这一点落得很工程化。它支持给节点配置 `RetryPolicy`，而默认 retry 行为也不是“所有异常都重来”，而是会排除一批典型的 developer error 和 programming error。

这说明成熟系统默认承认：

1. 有些错误是环境偶发
2. 有些错误是输入缺陷
3. 有些错误是系统代码问题

只有第一类才天然适合自动重试。

如果连这个前提都没有，retry 就很容易变成：

1. 重复触发错误分支
2. 重复调用外部系统
3. 用时延掩盖根因

## RetryPolicy 应该落在节点边界，而不是全局一把梭

很多系统会做一个全局 wrapper：

1. 任意失败
2. 全流程重跑

这通常不成熟。

更合理的方式，是把 retry 放在 node boundary 上，因为不同节点的失败语义不同：

1. 调外部搜索 API 的节点可以重试
2. 做纯解析的节点可能应该立即失败
3. 发送邮件、写库、提交工单的节点必须特别谨慎

LangGraph 的 Graph API 明确支持 node-level `RetryPolicy`。这条能力背后的原理是：

1. 重试资格属于节点，不属于整个图
2. 每个节点都要按自身副作用和失败模式设计策略

所以技术复盘中如果被问“你怎么设计 retry”，一个成熟答案会先问：

1. 这个失败发生在哪个节点
2. 这个节点有没有副作用
3. 它的错误是不是 transient

## `runtime.execution_info` 为什么很值钱

很多恢复逻辑讲不深，是因为没有进入 execution metadata 这一层。

LangGraph 文档说明，节点里可以拿到 `runtime.execution_info`，里面有：

1. thread
2. run
3. checkpoint
4. task
5. retry attempt 等信息

而且即使没有显式配置 retry policy，这些 execution info 也可用。

这件事的重要性在于，它让节点可以做 attempt-aware behavior：

1. 第一次失败时继续主路径
2. 第二次进入时切换 fallback
3. 第三次直接降级或上报

也就是说，恢复策略不再是图外部的黑盒 wrapper，而是图内部的显式控制逻辑。

## Fallback 不是“再试一次”，而是换一条路径

很多回答会把 retry 和 fallback 混着讲，但它们不是一回事。

1. retry 是沿同一路径再执行一次
2. fallback 是换另一条路径完成目标

LangGraph Graph API 文档里就给了一个很好的模式：节点根据 `node_attempt` 判断，在第一次失败后切换到 fallback 路径，而不是无限重复主路径。

这背后的原理非常重要：

1. 如果主路径本身条件已经不满足，重复执行没有意义
2. fallback 的价值，在于使用另一种更稳、更便宜或更保守的策略完成任务
3. 如果 fallback 还是和原路径做同样的事，那它就不是真 fallback

所以高质量回答必须把 retry 和 fallback 分开。

## Cache 解决的是重复计算，不是失败恢复本身

另一个易混边界是：

1. 有缓存了
2. 所以恢复问题也解决了

这也不对。

LangGraph Functional API 支持 `CachePolicy(ttl=...)`，并且重复调用时可以直接返回标记为 cached 的结果。这非常适合：

1. 纯函数式转换
2. 代价高但输入稳定的任务
3. 在短窗口内重复出现的查询或中间计算

但 cache 的边界一定要讲清：

1. cache 是 performance optimization
2. retry 是 failure recovery
3. checkpoint 是 execution recovery
4. interrupt 是 human-in-the-loop pause-resume

这四者不是同一个东西。

## 一个成熟的失败恢复设计通常分四层

如果要把这个主题答到原理层，比较完整的结构通常是：

1. classify：先判断失败属于哪一类
2. retry selectively：只对 transient 节点错误重试
3. fallback deliberately：在适当的 attempt 上切换替代路径
4. cache carefully：只缓存可安全复用的纯结果或低风险结果

如果还能补上一句“有副作用的节点要单独做幂等设计，不应依赖通用重试解决”，答案会更完整。

## 机制解读

Agent workflow 的失败处理不能从“重试几次”开始，而要从 error taxonomy 开始。LangGraph 的 thinking guide 明确把错误分成 transient、LLM-recoverable、user-fixable 和 unexpected 四类，并分别对应 retry、带错误上下文回环、interrupt 等人补信息，以及直接 bubble up 调试。这说明恢复策略本质上依赖失败类型，而不是统一模板。进一步看，LangGraph Graph API 支持节点级 `RetryPolicy`，默认 retry 也不是对所有异常一视同仁，而是会排除一批典型的 developer error；同时节点还能读取 `runtime.execution_info` 和 `node_attempt`，从而在第一次失败后切换 fallback，而不是无限重复主路径。另一方面，Functional API 的 `CachePolicy(ttl=...)` 解决的是重复计算复用问题，它是性能优化，不是失败恢复本身。真正成熟的系统，会把 classify、selective retry、deliberate fallback 和 safe caching 分开设计，而不是一遇到报错就整条链路重跑。

## 易混边界

1. 任何错误都自动重试
2. 把 retry 和 fallback 混成一回事
3. 用全局流程重跑代替节点级恢复设计
4. 以为有缓存就等于解决了恢复问题
5. 完全不区分有副作用节点和纯计算节点

## 相关样例

1. `examples/python/ai-agent/retry_fallback_cache_outline.py`
