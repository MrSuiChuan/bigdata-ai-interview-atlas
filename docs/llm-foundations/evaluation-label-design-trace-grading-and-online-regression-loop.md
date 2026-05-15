---
kb_id: llm-foundations/evaluation-label-design-trace-grading-and-online-regression-loop
title: LLM 评估落地：标签设计、Trace 分级、Judge 规则与线上回归环为什么必须联动
domain: llm-foundations
component: evaluation
topic: label-design-trace-grading-online-regression-loop
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: OpenAI evaluation docs and RAG evaluator docs as verified on 2026-04-27
last_verified_at: '2026-04-27'
source_ids:
  - openai-evaluation-best-practices
  - openai-agent-evals-guide
  - azure-rag-evaluators
claim_ids:
  - llm-foundation-claim-0024
  - llm-foundation-claim-0013
tags:
  - evaluation
  - trace
  - judge
  - regression
  - rag
---
## 评估真正难的，不是“跑一次”，而是让结果在多人协作和长期迭代中依然可比
很多团队第一次做评估时，会先写一个脚本批量请求模型，然后看几条输出感觉不错就结束。第二次上线时却发现完全对不上第一次的结果，因为样本变了、标准变了、Judge prompt 变了、线上分布也变了。要让评估体系真正可用，必须把标签、trace、评分规则和回归环设计成统一系统。

## 解决什么问题
这一页主要聚焦评估体系的落地细节：

1. 为什么标签设计必须能承载“部分正确”“应拒答”“引用不足”等细粒度结果。
2. 为什么开放式问答必须同时保留最终答案和中间 trace。
3. 为什么 Judge 规则需要和任务 rubrics 一起版本化管理。
4. 为什么线上回流样本不能只收“差评”，还要保留故障上下文。
5. 为什么没有 trace 的评估，在 RAG 和 Agent 场景下几乎无法做根因定位。

## 核心对象
| 对象 | 作用 | 风险 |
| --- | --- | --- |
| Label Schema | 定义正确、部分正确、拒答、越权等标签 | 打分过粗，问题被掩盖 |
| Trace Record | 保存检索结果、工具调用、引用证据和中间状态 | 只能看到结论，定位不了过程 |
| Judge Prompt / Rules | 让自动评分有可遵循的标准 | 不同批次评分不可比 |
| Regression Snapshot | 固定某一版本系统的历史对照 | 改动前后无法精准比较 |
| Online Failure Intake | 接住真实用户场景中的失败证据 | 离线评估永远脱离真实分布 |

### 为什么标签不能只分“对”和“错”
因为真实业务里有很多中间态。比如答案主体正确但引用缺失，或者模型在高风险问题上本应拒答却给了模糊建议。如果标签过粗，团队会被平均分欺骗，无法看见真正危险的失败类型。

## 执行链路
更稳妥的评估落地链路通常是：

1. 先定义标签体系和任务 rubrics。
2. 执行请求并保存最终答案与 trace。
3. 用规则或 Judge 对最终结果和中间过程分别打分。
4. 生成回归快照，和历史版本比较。
5. 把线上失败样本按同一标签体系重新标注并回流。

```mermaid
flowchart LR
  A[标签体系] --> B[执行并记录 Trace]
  B --> C[Judge / 规则评分]
  C --> D[回归快照]
  D --> E[线上失败回流]
  E --> A
```

### 为什么 trace 分级很关键
因为并不是所有任务都需要同样细的过程记录。普通问答可能只需要输入输出和引用；RAG 需要额外记录召回片段、得分和重排结果；Agent 还要记录工具名、参数、审批状态和副作用。谁先把 trace 分级设计清楚，谁的评估和排障成本就更可控。

## 一致性与容错
评估落地阶段最容易被忽略的风险包括：

1. Judge prompt 改了，却没做版本记录。
2. 线上失败样本只收用户反馈文本，不收原始上下文和 trace。
3. RAG 只给最终答案打分，不记录是否正确召回证据。
4. Agent 只看任务完成率，不记录是否发生过危险工具调用。

### 为什么线上样本必须带上下文回流
因为很多失败不是单句输出的问题，而是特定历史、特定检索片段、特定工具返回共同造成的。只留一个“这次答错了”的标签，往往无法在离线环境里重现同样的失败。

## 性能模型
评估系统本身也要做成本权衡：

1. 标签越细，标注和审核成本越高。
2. trace 越全，存储和分析成本越高。
3. Judge 越复杂，自动评估成本越高。
4. 回归越频繁，发布节奏越慢，但稳定性越高。

### 为什么“评估太贵所以先不做”通常是错的
因为没有评估时，每次发布都在拿线上用户做真实实验。短期看省了标注和评估成本，长期看会把成本转移成事故、返工和团队不信任。

## 生产排障
当系统出现“平均分还行，但用户抱怨越来越多”的情况，优先检查以下几类评估缺口：

1. 标签是否把关键失败类型混进了“部分正确”。
2. 回归集是否长期只覆盖旧问题，没吸收新问题。
3. trace 是否足以区分检索失败、Judge 误判和工具越权。
4. 线上反馈是否只保留了星级，没有保留可复现实例。

### 常见根因
1. 标签太粗，风险问题被平均分掩盖。
2. Judge 标准漂移，前后批次分数不可比。
3. 线上样本回流不完整，导致离线修复总修不到点上。

## 样例
下面这个标签设计片段，能让评估从“只有分数”升级成“看得见失败类型”：

```yaml
label_schema:
  correct: 回答正确且证据充分
  partially_correct: 主体正确但遗漏关键约束
  unsupported: 结论缺少证据支撑
  should_refuse: 高风险问题应拒答
  unsafe_tool_intent: 工具调用意图越权
```

而这个 trace 诊断片段则说明，组件级评估要能把失败挂回具体环节：

```json
{
  "case_id": "agent_101",
  "answer_grade": "partially_correct",
  "trace_findings": {
    "retrieval_hit": true,
    "citation_supported": false,
    "tool_selected": "send_email",
    "approval_required": true,
    "approval_observed": false
  }
}
```

## 相邻技术边界
这页讨论的是评估系统落地，不等于模型训练策略，也不等于单纯的数据标注流程。它更像质量工程的一部分，把离线实验、线上反馈、RAG/Agent trace 和模型行为用统一标准连接起来。没有这一层，评估很容易沦为一次性展示材料。

## 本页结论
LLM 评估要真正服务研发，必须让标签、trace、Judge 规则和线上回流构成一条闭环。只有当失败能被分类、复现、定位和回归验证，评估才不只是“给模型打个分”，而是真正的工程控制系统。
