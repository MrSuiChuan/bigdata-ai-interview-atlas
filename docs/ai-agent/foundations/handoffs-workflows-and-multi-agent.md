---
kb_id: ai-agent/foundations/handoffs-workflows-and-multi-agent
title: 多 Agent 编排：handoff、agent-as-tool、workflow 到底怎么区分
domain: ai-agent
component: agent-runtime
topic: orchestration
difficulty: advanced
status: reviewed
sidebar_position: 4
version_scope: Official AI agent docs as verified on 2026-04-24
last_verified_at: '2026-04-24'
source_ids:
  - openai-agents-sdk-handoffs
  - openai-agents-sdk-tools
  - langgraph-overview-docs
  - microsoft-agent-framework-workflows
claim_ids:
  - agent-runtime-claim-0004
  - openai-agents-claim-0005
  - openai-agents-claim-0006
  - openai-agents-claim-0007
  - langgraph-claim-0001
  - microsoft-agent-framework-claim-0003
  - microsoft-agent-framework-claim-0004
  - microsoft-agent-framework-claim-0005
tags:
  - ai-agent
  - multi-agent
  - handoff
  - workflow
---
## 一句话结论



多 Agent 系统最容易答混的地方，不是“有几个 Agent”，而是“控制权在谁手里、结果回不回来、路径是不是预定义”。

## 为什么很多答案会失真

因为大家经常把下面三件事都叫“多 Agent 协作”：

1. 一个 Agent 调另一个 Agent 拿结果
2. 一个 Agent 把任务交给另一个 Agent 接着做
3. 整个系统按预定义图或工作流推进

这三种模式在运行时语义上完全不同。

## 先分清三种基本模式

### 1. Agent-as-tool

这是“主 Agent 仍然掌握控制权”的模式。

1. 子 Agent 更像一个可调用能力
2. 调用结束后，结果回到主 Agent
3. 主 Agent 决定后续路径

在 OpenAI Agents SDK 里，这类模式被明确区分于 handoff。

### 2. Handoff

这是“控制权交接”的模式。

1. 当前 Agent 把接下来的处理权交给别的 Agent
2. 对模型来说，handoff 也作为某种工具暴露
3. 但运行时语义不是拿结果回来继续，而是让新 Agent 接管后续流程

所以 handoff 不是“更高级的 tool”，而是执行所有权变化。

### 3. Workflow / Graph orchestration

这是“路径控制被系统显式定义”的模式。

1. LangGraph 强调 graph 和 orchestration runtime
2. Microsoft Agent Framework 明确区分 workflows 与 agents
3. workflow 更偏确定性控制、类型边界和系统可治理性

因此，workflow 不应该被简单描述成“很多 Agent 连起来”。

## 为什么这个区分非常关键

因为它决定了：

1. 失败后谁负责恢复
2. 上下文由谁持有
3. tracing 怎么看
4. 权限和审计该挂在哪个主体上

如果这些边界不清，系统一复杂就会很难 debug。

## 共享上下文和恢复责任也会随模式改变
### Agent-as-tool 更适合局部能力复用
因为控制权仍留在主 Agent，状态归属和恢复责任也更集中，比较适合把专家能力当作受控子步骤复用。

### Handoff 更强调所有权切换
一旦发生 handoff，后续 trace、上下文和人工接管都要围绕新的执行主体组织，否则系统会出现“任务已经转交，但责任还挂在旧 Agent 上”的混乱状态。

### Workflow 更强调系统级可治理性
当路径本身已经高度确定时，用 workflow 或 graph 显式表达控制面，通常比把每一步都交给模型动态决定更稳定。

## 一个稳妥的判断方法

当被问多 Agent 设计时，你可以先问自己三个问题：

1. 调用后控制权是否回到原 Agent
2. 后续路径是模型动态决定还是系统预定义
3. 状态和 tracing 是围绕谁来组织

这三个问题一答清楚，架构基本就不会讲偏。

再往前一步，还可以继续问：人工审批会落在哪个主体上、失败后的恢复由谁负责、共享状态到底是主 Agent 持有还是系统统一持有。把这些问题补上，多 Agent 设计就更不容易失真。

这组判断题真正要建立的，不是术语区分，而是系统责任区分。责任一旦分清，后续的审计、恢复和治理就会顺很多。

对生产系统来说，控制权路径越清楚，出问题时越容易知道该看谁的状态、谁的 trace、谁的审批记录。

多 Agent 不是越多越强，边界清楚才更强。

架构清楚，比角色数量更重要。

这点很关键。

## 机制解读

多 Agent 编排至少要区分 agent-as-tool、handoff 和 workflow 三类语义。agent-as-tool 是主 Agent 调子 Agent 能力，控制权会回到主 Agent；handoff 是当前 Agent 把后续处理权正式交给另一个 Agent；workflow 则是系统预定义执行路径，用图、边或工作流组件来控制任务如何推进。真正高质量的答案要落到控制权、状态归属、恢复路径和观测边界，而不是只说“我会做多个 Agent 分工”。

## 易混边界

1. 把 handoff 讲成“调用别的 Agent 再回来”
2. 把 workflow 讲成“固定顺序的多 Agent”却不讲控制语义
3. 多 Agent 一上来只谈分工，不谈状态与恢复

## 相关样例

1. `examples/python/ai-agent/openai_agents_handoffs_sessions_tracing.py`
