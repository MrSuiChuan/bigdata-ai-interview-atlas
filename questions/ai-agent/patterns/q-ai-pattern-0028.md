---
id: q-ai-pattern-0028
title: 为什么 Agent Workflow 的失败处理必须先做 Error Taxonomy，再谈 Retry 和 Fallback
domain: ai-agent
component: agent-patterns
topic: retry-fallback-cache-error-taxonomy
question_type: operations
difficulty: advanced
status: reviewed
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
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
related_docs:
  - ai-agent/patterns/retry-fallback-cache-and-error-taxonomy
estimated_minutes: 10
---

# 题目

为什么 Agent Workflow 的失败处理必须先做 Error Taxonomy，再谈 Retry 和 Fallback？

# 一句话结论

因为重试只是某一类失败的恢复手段，不是所有失败的统一答案；先分清失败类型，系统才能知道该重试、该降级、该等待用户，还是该直接暴露错误。

# 核心机制

1. failure class determines recovery strategy
2. retry should be node-specific and selective
3. cache and fallback solve different problems from retry

# 标准答案

Agent workflow 的失败恢复不能从“重试几次”开始，而要先把失败分类。LangGraph 的 thinking guide 明确区分 transient、LLM-recoverable、user-fixable 和 unexpected 四类错误，并分别对应 retry、带错误上下文回环、interrupt 等用户补信息，以及直接 bubble up 调试。这说明恢复策略是 failure class 的函数，而不是固定模板。进一步看，LangGraph Graph API 支持节点级 `RetryPolicy`，默认 retry 也会排除一批典型 developer error，这意味着自动重试只适用于一部分节点、一部分错误，而不是整图统一重跑；同时节点还能读取 `runtime.execution_info` 和 `node_attempt`，从而在第一次失败后切换 fallback，而不是无限重复主路径。另一方面，Functional API 的 `CachePolicy(ttl=...)` 解决的是重复计算复用问题，它提升性能，但不能替代错误恢复。成熟系统因此会把 error taxonomy、selective retry、deliberate fallback 和 safe caching 分层设计，而不是一见报错就再来一遍。

# 必答点

1. 先讲 error taxonomy，而不是先讲 retry 次数
2. 说明 retry 只适合部分失败和部分节点
3. 区分 retry 和 fallback
4. 区分 cache 和 failure recovery

# 常见误答

1. 任何异常都自动重试
2. 把 retry 和 fallback 混成一回事
3. 用全流程重跑代替节点级策略
4. 把缓存当成恢复机制