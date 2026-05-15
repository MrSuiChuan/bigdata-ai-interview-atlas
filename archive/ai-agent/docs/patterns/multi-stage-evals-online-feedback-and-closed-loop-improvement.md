---
kb_id: ai-agent/patterns/multi-stage-evals-online-feedback-and-closed-loop-improvement
title: "Multi-Stage Evals / Online Feedback / Closed-Loop Improvement：评测不是一张分数表，而是把线上事故不断回灌成离线回归能力"
domain: ai-agent
component: agent-patterns
topic: multi-stage-evals-online-feedback-closed-loop-improvement
difficulty: advanced
status: reviewed
sidebar_position: 38
version_scope: "Official docs as verified on 2026-04-25"
last_verified_at: "2026-04-25"
source_ids:
  - openai-agent-evals-guide
  - openai-evaluation-best-practices
  - openai-graders-guide
  - openai-trace-grading-guide
  - openai-agents-sdk-tracing
claim_ids:
  - pattern-claim-0174
  - pattern-claim-0175
  - pattern-claim-0176
  - pattern-claim-0177
  - pattern-claim-0178
  - pattern-claim-0179
tags:
  - ai-agent
  - evals
  - online-feedback
  - tracing
  - closed-loop
---

# 一句话结论

成熟的 agent 评测体系不是“做一批离线题跑个准确率”，而是先用 trace 找到系统到底哪里坏了，再把线上日志和人工反馈沉淀成可重复的数据集与回归评测，让每一次真实事故都变成下一轮不会再犯的测试样本。

# 为什么这题很容易答浅

很多人一讲 eval，就会说：

1. 先整理一份题库
2. 跑模型看准确率
3. 分数高了就上线

这套思路对单轮问答还勉强能用，但对 agent 往往不够，因为 agent 的失败位置不只在最终答案。它可能失败在：

1. 计划路径选错
2. 工具调用参数错
3. 检索证据对了但合成错
4. 最终结果看似对，过程其实不可控

所以如果只看 final answer，你通常只能知道“这次错了”，却不知道“错在流程的哪一段”。这就是为什么 OpenAI 的评测指南会把 traces、graders、datasets 和 eval runs 看成不同 evaluation surfaces，而不是一张统一大分数表。

# 为什么 trace grading 往往是第一步

OpenAI 的 evaluate-agent-workflows 与 trace grading 指南都强调，开发和调试 agent 时，trace eval 往往比 black-box eval 更先派上用场。原因是 trace 提供的是完整过程，而不是只给你一个末端结果。

这能回答三个非常关键的问题：

1. agent 有没有走对流程
2. 某一步工具调用是不是偏离了预期
3. 最终失败是规划问题、执行问题，还是证据合成问题

因此 trace grading 的价值不只是“打分”，而是“定位”。它让团队在还没完全定义好最终成功标准前，就能先把过程中的明显坏模式找出来。

# 为什么 datasets 和 eval runs 不能替代线上发现

很多团队会把离线数据集当成评测的全部，但 OpenAI evaluation best practices 明确建议：

1. 尽量把日志都记下来
2. 用生产数据或历史数据构建评测样本
3. 每次变更都持续评测
4. 用人工反馈校准自动评分

这几条放在一起，指向的是一个核心思想：线上是真正的新故障发现器，离线只是把这些故障固定下来、重复回放。也就是说：

1. online feedback 用来发现新问题
2. datasets 用来沉淀已知问题
3. eval runs 用来持续回归这些已知问题

如果没有线上日志和人工反馈，离线评测迟早会变成“只会考历史老题”的封闭系统。

# 为什么 multigrader 对 agent 特别重要

OpenAI graders 指南提到 multigrader 可以把多个 grader 的输出合成单个分数。这个能力对 agent 特别关键，因为 agent 的成功往往不是单条件成立，而是多条件同时成立，例如：

1. 最终答案正确
2. 使用了允许的工具
3. 没有泄露敏感信息
4. 成本与步数在预算内
5. 引用或证据满足规范

如果只用一个粗粒度 yes/no grader，常见问题是：

1. 真正失败的子原因被埋掉
2. 不同风险维度无法分别观测
3. 系统为了优化单分数而牺牲关键约束

multigrader 的价值就在于把“成功”拆成多维约束，再聚合成可比较结果。

# 为什么 tracing 是闭环改进的基础设施

OpenAI Agents SDK tracing 文档说明 tracing 不只用于开发调试，也可用于生产监控；对长任务，必要时还可以显式调用 `flush_traces()` 及时把缓冲 traces 送出去。这件事非常重要，因为闭环改进的第一步不是“设计评分器”，而是“先有可回收的过程数据”。

没有 tracing，就会出现三种常见困境：

1. 线上出错时只看到最后一句报错，回放不出过程
2. 想做 trace grading，却拿不到结构化 trace
3. 想把事故沉淀成数据集，却缺乏足够上下文

所以 tracing 不是一个可有可无的观察附属物，而是 eval data supply chain 的入口。

# 多阶段评测为什么要分 discovery、diagnosis、regression 三层

把 OpenAI 这些指南串起来，可以把成熟评测体系概括成三层闭环：

1. discovery：通过生产 traces、日志和人工反馈发现新失败模式
2. diagnosis：用 trace grading 和细粒度 graders 识别失败发生在工作流哪一段
3. regression：把已确认的失败样本沉淀进 datasets，随后在 eval runs 中持续回归

这三层一个都不能少。只有 discovery，没有 regression，团队会重复踩同一个坑；只有 regression，没有 discovery，系统会被新型失败模式不断偷袭；只有 diagnosis，没有结构化数据沉淀，问题就永远停留在事故报告层面。

# 一个成熟的 closed loop 至少包含六个部件

如果要把这题答到工程层，可以按下面六个部件展开：

1. tracing：保证线上过程数据可取回、可检索、可分段分析
2. log mining：从生产或历史日志中抽取高价值失败样本
3. grader design：把成功拆成多个可评分条件，必要时用 multigrader 聚合
4. human calibration：定期让人工校准自动评分，避免 grader 漂移
5. dataset curation：把已知问题做成可重复执行的数据集
6. continuous eval runs：每次 prompt、tool、模型、路由或策略变化都回归

这样一来，线上出现的一次事故，不会只留下一条 Slack 消息，而会变成长期约束未来改动的测试资产。

# 标准面试答案

Agent 的评测不能只看最终答案分数，因为 agent 的失败可能发生在规划、工具调用、检索、合成或安全约束等不同阶段。OpenAI 的 evaluate-agent-workflows 指南把 traces、graders、datasets 和 eval runs 明确视为不同 evaluation surfaces，含义是开发阶段应先借助 trace 看清系统行为，再把对“好结果”的理解固化进可重复数据集和评测运行。进一步，trace grading 指南强调 trace eval 比 black-box eval 更能解释 agent 为什么成功或失败，因为它评价的是端到端过程而不是只看终局输出。OpenAI 的 evaluation best practices 又要求记录尽可能完整的日志、优先使用生产或历史数据构建数据集、每次变更都持续评测，并用人工反馈校准自动评分，这说明线上反馈不是离线评测的补充，而是新测试样本的来源。与此同时，graders 指南中的 multigrader 能把多个条件组合成一个总分，适合 agent 这种必须同时满足正确性、合规性、预算和流程约束的任务。最后，Agents SDK tracing 说明 tracing 同时服务于开发与生产，对长任务还可以 `flush_traces()` 及时送出数据，因此 tracing 是整个闭环改进的数据基础设施。真正成熟的 closed-loop improvement 系统，会把生产 traces、日志挖掘、人工校准 graders、结构化数据集和持续 eval runs 连成一条链，让线上发现的新失败模式及时回灌为回归样本，而不是永远停留在一次性的事故复盘里。

# 常见误答

1. 把 agent eval 简化成一份离线题库和一个总准确率
2. 只看 final answer，不看 trace 过程
3. 认为 datasets 可以脱离生产日志独立长期维护
4. 只做自动评分，不做人工校准
5. 有 tracing 但不把线上新问题沉淀成回归数据集

# 相关样例

1. `examples/python/ai-agent/closed_loop_eval_feedback_outline.py`
