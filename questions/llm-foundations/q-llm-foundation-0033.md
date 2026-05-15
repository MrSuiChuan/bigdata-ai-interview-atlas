---
id: q-llm-foundation-0033
title: RAG 或 Agent 系统做回归时，为什么不能只看最终答案分，还要看 Trace 和组件级指标
domain: llm-foundations
component: evaluation
topic: benchmark-regression-eval-driven-development-production-feedback
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "OpenAI evaluation docs and RAG evaluator docs as verified on 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - openai-evaluation-best-practices
  - openai-agent-evals-guide
  - azure-rag-evaluators
claim_ids:
  - llm-foundation-claim-0024
  - llm-foundation-claim-0013
related_docs:
  - llm-foundations/evaluation-benchmark-regression-and-production-feedback
  - llm-foundations/evaluation-label-design-trace-grading-and-online-regression-loop
estimated_minutes: 10
---

# 题目

RAG 或 Agent 系统做回归时，为什么不能只看最终答案分，还要看 Trace 和组件级指标？

# 一句话结论

因为这类系统的错误往往发生在中间链路，只看最终答案很难知道是检索、重排、工具选择、参数构造还是生成阶段出了问题。

# 标准答案

RAG 和 Agent 不再是单一模型直接输出答案，而是由多个对象串起来的系统。RAG 可能在文档切分、召回、重排、引用支撑和生成之间任意一层出错；Agent 可能在规划、工具选择、参数构造、审批和执行结果上任意一层出错。如果回归时只看最终答案分，就算发现分数下降，也很难定位根因，更无法知道修复动作应该落在哪一层。Trace 和组件级指标的价值，在于把失败挂回具体对象：有没有召回目标证据，工具参数是否越权，引用是否真实支撑结论，审批是否被绕过。只有这样，回归才不只是“发现变差了”，而是“知道为什么变差、该怎么修”。

# 必答点

1. 说明 RAG 和 Agent 是多组件链路
2. 说明最终答案分无法定位中间根因
3. 说明 Trace 能保留中间证据
4. 说明组件级指标能指导修复动作
5. 说明没有 Trace 的回归价值有限

# 常见误答

1. 认为最终答案对就够了
2. 不区分检索错误和生成错误
3. 不讲工具调用和审批链路
4. 不讲 Trace 对回归定位的价值

# 追问

1. RAG 的组件级指标通常包括哪些？
2. Agent Trace 里最值得长期保留哪些字段？
3. 为什么平均分上升仍可能隐藏高风险回归？
