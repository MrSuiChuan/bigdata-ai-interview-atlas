---
kb_id: ai-agent/patterns/agent-evals-task-success-and-regression-prevention
title: Agent Evals / Trace Grading / Closed-Loop Improvement：不能只靠感觉判断 Agent 有没有变好
domain: ai-agent
component: agent-patterns
topic: agent-evals-trace-grading-regression-closed-loop
difficulty: advanced
status: reviewed
sidebar_position: 23
version_scope: Official docs as verified on 2026-04-25
last_verified_at: '2026-04-25'
source_ids:
  - openai-agent-evals-guide
  - openai-evaluation-best-practices
  - openai-graders-guide
  - openai-trace-grading-guide
  - openai-agents-sdk-tracing
claim_ids:
  - pattern-claim-0094
  - pattern-claim-0095
  - pattern-claim-0096
  - pattern-claim-0097
  - pattern-claim-0098
  - pattern-claim-0174
  - pattern-claim-0175
  - pattern-claim-0176
  - pattern-claim-0177
  - pattern-claim-0178
  - pattern-claim-0179
tags:
  - ai-agent
  - evals
  - tracing
  - regression
  - task-success
  - closed-loop
---
## 一句话结论

Agent Evals / Trace Grading / Closed-Loop Improvement：不能只靠感觉判断 Agent 有没有变好需要从对象、链路、边界和证据四个角度理解。

## 为什么 vibe-based eval 对 Agent 特别危险

很多团队在早期都会这样评估 agent：

1. 找几个问题试一试
2. 看回答顺不顺眼
3. 感觉这次比上次聪明一些

这就是典型的 vibe-based eval。

OpenAI evaluation best practices 明确建议避免这种方式，因为它的问题非常明显：

1. 不可重复
2. 很难横向比较
3. 对回归极其不敏感
4. 容易被语言流畅度误导

所以只靠“感觉不错”是无法支撑生产演进的。

## 为什么 Agent Evals 一定要分多阶段

OpenAI 的 evaluating agent workflows guide 给了一个很清晰的演进路径：

1. trace grading 是定位 workflow-level 问题最快的方式
2. 当需要可重复和更大规模比较时，就应该转向 datasets 和 eval runs
3. 线上 traces、日志和人工反馈要持续回灌，形成 closed loop

这条路径很重要，因为它说明 eval 不是只有一个形态：

1. 调试阶段，trace 观察最有效
2. 迭代阶段，dataset 对比更稳定
3. 生产阶段，continuous eval runs 和 regression gate 才能防止系统悄悄变差

也就是说，eval 体系本身也是分层建设的。

## 为什么 Trace Grading 对 Agent 特别重要

对于单轮模型回答，black-box evaluation 可能还勉强够用。但 agent 不一样，它有：

1. 多步推理
2. 多次工具调用
3. handoff
4. 状态变化
5. 中间决策点

如果只给最终答案打分，很容易出现：

1. 最终答案错了，但不知道是 retrieval、tool use 还是 routing 出错
2. 最终答案对了，但中间路径极不稳定，未来稍改一点就会回归

OpenAI trace grading guide 的价值就在这里：

1. 它直接对 end-to-end trace 打结构化标签和分数
2. 它比纯 black-box eval 提供更多 regression insight
3. 它首先解决的是“为什么失败”，而不是“最后几分”

## Task Success 为什么一定是多维 Scorecard

很多人只会说：

1. 看答得对不对

但 task success 往往至少要拆成多个维度，例如：

1. 是否完成目标动作
2. 是否调用了正确工具
3. 是否越权或违规
4. 是否在预算内完成
5. 是否引用了足够支撑证据
6. 是否需要人工兜底

也就是说，agent success metric 通常不是单分值，而是多维 scorecard。

## Graders 和 Multigrader 在这里解决什么问题

OpenAI graders guide 提供了一个很实用的基础：

1. grader 分数范围是 0 到 1
2. 可以有 string check
3. 可以做 text similarity
4. 可以用 score model grader
5. 可以用 Python code execution
6. 还可以用 multigrader 组合多个子项

这意味着你可以把 task success 拆成：

1. binary correctness
2. structural correctness
3. tool-use correctness
4. policy compliance
5. budget compliance

然后再聚合成总评。这比“这次回答感觉更像对的”成熟得多。

## 为什么 Closed Loop Improvement 不能只靠离线题库

OpenAI evaluation best practices 明确建议：

1. 尽量把日志都记下来
2. 用生产数据或历史数据构建评测样本
3. 每次变更都持续评测
4. 用人工反馈校准自动评分

这几条合起来指向一个核心思想：

1. online feedback 用来发现新问题
2. datasets 用来沉淀已知问题
3. eval runs 用来持续回归这些已知问题

如果没有线上日志和人工反馈，离线评测迟早会变成“只会考历史老题”的封闭系统。

## 为什么 Tracing 是评测闭环的数据基础设施

OpenAI Agents SDK tracing 文档说明 tracing 不只用于开发调试，也可用于生产监控；对长任务，必要时还可以显式调用 `flush_traces()` 及时把缓冲 traces 送出去。

这件事很关键，因为闭环改进的第一步不是“先有评分器”，而是“先有可回收的过程数据”。

没有 tracing，就会出现三种典型困境：

1. 线上出错时只看到最后一句报错，回放不出过程
2. 想做 trace grading，却拿不到结构化 trace
3. 想把事故沉淀成数据集，却缺乏足够上下文

所以 tracing 不是观察附属物，而是 eval data supply chain 的入口。

## 多阶段评测为什么要分 Discovery、Diagnosis、Regression 三层

把 OpenAI 这些指南串起来，可以把成熟评测体系概括成三层闭环：

1. discovery：通过生产 traces、日志和人工反馈发现新失败模式
2. diagnosis：用 trace grading 和细粒度 graders 识别失败发生在工作流哪一段
3. regression：把已确认的失败样本沉淀进 datasets，随后在 eval runs 中持续回归

这三层一个都不能少。只有 discovery，没有 regression，团队会重复踩同一个坑；只有 regression，没有 discovery，系统会被新型失败模式不断偷袭；只有 diagnosis，没有结构化数据沉淀，问题就永远停留在事故报告层面。

## 一个成熟的 Agent Eval System 至少包含六个部件

如果要把这个主题答到工程层，可以按下面六个部件展开：

1. tracing：保证线上过程数据可取回、可检索、可分段分析
2. log mining：从生产或历史日志中抽取高价值失败样本
3. grader design：把成功拆成多个可评分条件，必要时用 multigrader 聚合
4. human calibration：定期用人工校准自动评分，避免 grader 漂移
5. dataset curation：把已知问题做成可重复执行的数据集
6. continuous eval runs：每次 prompt、tool、模型、路由或策略变化都回归

这样一来，线上出现的一次事故，不会只留下一条 Slack 消息，而会变成长期约束未来改动的测试资产。

## 机制解读

Agent eval 不能只靠人工感觉，因为 agent 的行为受 prompt、模型、工具、路由、guardrails 和外部知识链路共同影响，任何一处变化都可能导致任务成功率回退。OpenAI 的 evaluating agent workflows guide 建议先用 trace grading 快速发现 workflow-level 问题，再在需要可重复和大规模比较时转向 datasets 与 eval runs；trace grading guide 又说明 trace eval 比 black-box final-answer eval 更能解释 regressions，因为它直接对 end-to-end execution path 打标签和分数。与此同时，evaluation best practices 强调 eval-driven development、continuous evaluation、task-specific metrics、日志完备和避免 vibe-based eval；graders guide 则提供了 0 到 1 的结构化评分框架，可以组合 string check、text similarity、score model grader、Python execution 和 multigrader，把 task success 做成多维 scorecard。更进一步，线上 traces、日志挖掘和人工反馈并不是离线评测的补充，而是 closed-loop improvement 的数据来源；Agents SDK tracing 则为这个闭环提供了过程数据基础设施。真正成熟的做法，是把 trace eval、task success graders、dataset eval、regression gate 和线上反馈回灌绑成一个持续系统，而不是只看一张离线分数表。

## 易混边界

1. 只看最终答案像不像样
2. 没有 task-specific metrics，只有一个模糊总分
3. 只做一次性 eval，不做持续 regression 检查
4. prompt、model、tool、routing 改了也不重新跑评测
5. 线上出了新问题却不回灌到回归集

## 相关样例

1. `examples/python/ai-agent/agent_evals_regression_prevention_outline.py`
2. `examples/python/ai-agent/closed_loop_eval_feedback_outline.py`
