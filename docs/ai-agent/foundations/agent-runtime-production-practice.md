---
kb_id: ai-agent/foundations/agent-runtime-production-practice
title: Agent 运行时工程实践：从最小闭环到生产治理
domain: ai-agent
component: agent-runtime
topic: agent-runtime-production-practice
difficulty: advanced
status: reviewed
sidebar_position: 9
version_scope: 实践资料主线化整理，截至 2026-04-28
last_verified_at: '2026-04-28'
source_ids:
  - practice-hello-agents
  - practice-agentic-ai
  - practice-agent-tutorial
  - practice-self-harness
  - practice-handy-multi-agent
  - practice-hugging-multi-agent
  - practice-easy-langent
  - practice-agent-skills-with-anthropic
  - practice-hello-generic-agent
claim_ids:
  - agent-runtime-claim-0001
  - agent-runtime-claim-0002
  - agent-runtime-claim-0003
  - agent-runtime-claim-0004
  - agent-runtime-claim-0005
  - agent-runtime-claim-0006
  - agent-runtime-claim-0007
  - agent-runtime-claim-0008
tags:
  - practice
  - knowledge
---
## 一句话结论



Agent 不是一次模型调用，也不是单纯的 Tool Calling。技术复盘中要把它讲成一个运行时系统：模型负责决策，工具负责外部动作，状态负责连续性，控制循环负责推进和停止，观测与评估负责判断系统是否可靠。

## 为什么这部分必须放进知识库

很多学习者会把 Agent 说成“LLM 加工具”。这个说法只能覆盖最浅的一层能力，无法解释生产系统里真正困难的问题：工具失败怎么办、状态如何恢复、长任务怎么续跑、多个角色如何协调、权限和审计怎么落地、效果如何回归评估。

高质量回答必须把实践项目抽象成可迁移的工程模型，而不是复述某个教程步骤。

## Agent 运行时的核心对象

| 对象 | 作用 | 技术复盘必须讲清楚的边界 |
| --- | --- | --- |
| Instruction | 约束模型行为、角色、输出格式和禁止事项 | Instruction 不是业务状态，不能替代权限系统 |
| Model | 理解任务、选择动作、生成中间推理或最终答案 | 模型不保证事实正确，也不天然理解工具副作用 |
| Tool | 把外部能力暴露给模型调用 | 工具必须有 schema、权限、超时、重试和审计 |
| State | 保存任务上下文、中间结果、工具调用记录和检查点 | State 不是无限上下文，必须控制大小、生命周期和隐私 |
| Planner | 把目标拆成步骤，决定下一步动作 | 复杂任务才需要规划，简单任务强行规划会增加错误和成本 |
| Executor | 执行模型选择的动作并收集结果 | Executor 要处理异常、幂等、回滚和人工接管 |
| Memory | 保存跨轮或跨任务可复用信息 | Memory 必须有写入规则、检索规则、过期规则和安全规则 |
| Trace | 记录每一步输入、输出、工具参数和结果 | Trace 是排障和评估基础，不只是日志 |
| Evaluation | 衡量任务成功率、工具正确率、幻觉率、延迟和成本 | 不能只靠“看起来能跑”的 demo 判断质量 |

## 最小运行闭环

一个最小 Agent 闭环可以拆成六步：

1. 接收用户目标和可用上下文。
2. 组装 instruction、短期状态、可用工具和约束。
3. 模型选择直接回答、调用工具、请求澄清或停止。
4. Executor 校验工具参数、执行工具、记录结果。
5. 将工具结果写回状态，再交给模型做下一步判断。
6. 满足停止条件后输出答案，并保存 trace 和评估信号。

~~~python
def run_agent(goal, tools, state_store, max_steps=8):
    state = state_store.load_or_create(goal)
    for step in range(max_steps):
        decision = model_decide(goal=goal, state=state, tools=tools)
        if decision.type == "final":
            state_store.save(state)
            return decision.answer
        if decision.type != "tool_call":
            return ask_human_or_fail(decision.reason)
        tool = tools[decision.tool_name]
        args = validate_args(tool.schema, decision.arguments)
        result = execute_with_timeout_and_audit(tool, args)
        state.append_trace(step=step, decision=decision, result=result)
        if result.needs_human_review:
            return handoff_to_human(state)
    return stop_safely("超过最大步数，避免无限循环", state)
~~~

这段伪代码的重点不是语法，而是技术表达：Agent 必须有循环边界、参数校验、工具审计、状态保存、人工接管和安全停止。

## Tool Calling 和 Agent 的区别

Tool Calling 解决的是“模型能不能请求外部能力”。Agent 解决的是“系统能不能在多步任务中可靠地选择、执行、恢复、观测和评估”。两者关系如下：

1. Tool Calling 是 Agent 的能力之一。
2. Agent 还需要状态、循环、停止条件、错误处理和评估。
3. 没有运行时治理的 Tool Calling 只能算增强型对话，不等于生产级 Agent。
4. 工具有副作用时，Agent 必须引入权限、审批、幂等和回滚策略。

## 长任务为什么需要 Harness

长任务 Agent 的核心风险不是某一步生成错了，而是任务链路长、失败点多、上下文持续变化。Harness 的价值是把模型和工具包在一个可靠性外壳里：

1. 任务生命周期：创建、运行、暂停、恢复、取消、完成。
2. Checkpoint：保存目标、计划、已完成步骤、中间产物和工具结果。
3. 错误分类：模型输出错误、工具参数错误、权限错误、外部服务错误、数据缺失。
4. 恢复策略：自动重试、降级、跳过、回滚、人工接管。
5. 可观测性：trace、span、输入输出快照、成本、延迟和异常率。
6. 评估回归：用固定任务集验证改 prompt、换模型、加工具之后是否退化。

## 多 Agent 的正确打开方式

多 Agent 不是角色越多越好。它只在任务天然可拆分、需要不同视角、需要审查制衡或需要并行探索时才有价值。

设计多 Agent 时至少回答四个问题：

1. 角色边界：每个 Agent 负责什么，不负责什么。
2. 通信方式：通过共享状态、消息队列、工作流节点，还是由主控 Agent 调度。
3. 冲突处理：多个 Agent 给出不同结论时谁裁决。
4. 评估方式：如何证明多 Agent 比单 Agent 更好，而不是更贵更慢。

## 生产环境风险清单

1. 无限循环：必须有最大步数、预算和停止条件。
2. 工具副作用：写数据库、发消息、下单、删除文件都需要审批或幂等设计。
3. 上下文污染：工具返回内容可能注入恶意指令，必须做输入约束和隔离。
4. 状态膨胀：长期记忆必须有摘要、淘汰、权限和过期策略。
5. 模型漂移：换模型或改 prompt 后必须跑回归集。
6. 成本失控：多 Agent、长上下文、重试和检索都会放大 token 成本。
7. 排障困难：没有 trace 就无法判断问题出在模型、工具、状态还是数据。

## 知识表达模板

回答 Agent 题时可以按这个顺序：

1. 先定义：Agent 是带状态、工具和控制循环的运行时系统。
2. 再拆对象：模型、工具、状态、记忆、规划、执行、观测、评估。
3. 讲链路：一次任务如何从输入到工具调用，再到最终答案。
4. 讲失败：工具错误、权限不足、循环不停止、上下文污染怎么处理。
5. 讲权衡：什么时候用 workflow，什么时候用自主 Agent，什么时候用多 Agent。
6. 讲验证：用 trace、任务成功率、人工接管率、延迟和成本证明系统可用。

## 生产化落地顺序

生产级 Agent Runtime 的落地顺序应从可控执行开始，而不是先追求复杂规划能力。第一步是把单次任务的输入、模型输出、工具调用、工具结果和最终回答全部结构化记录下来；第二步是给每个工具定义权限、超时、重试、幂等键和审计字段；第三步才是引入长期记忆、多 Agent 协作或自动反思等更高阶能力。

这个顺序的原因是：Agent 的主要风险通常不在“能不能调用模型”，而在“调用失败后能不能解释、能不能恢复、能不能限制副作用”。如果没有状态落盘、trace、预算和人工接管入口，复杂 Agent 只会把错误路径放大，导致线上问题难以复现。

## 工程示例：可恢复的 Tool Loop

### 运行时阅读主线

这一节把执行循环拆成状态读取、模型规划、工具调用、状态落盘和结果回放五个步骤。判断实现是否可靠时，要先看状态是否可恢复，再看工具副作用是否可审计，最后看失败后是否能从明确边界继续运行。

生产级 Agent Runtime 不能只调用一次模型。它至少要记录输入、工具调用、工具结果、模型输出和错误状态，才能在超时、工具失败或进程重启后恢复。下面是一个最小伪代码，用来说明状态边界。

~~~python
def run_agent(task, state_store, tools):
    state = state_store.load_or_create(task.id)
    while not state.finished:
        response = model.plan(messages=state.messages, tools=tools.schemas())
        state.record_model_response(response)
        state_store.save(state)
        if response.final_answer:
            state.finish(response.final_answer)
            state_store.save(state)
            return response.final_answer
        for call in response.tool_calls:
            try:
                result = tools.invoke(call.name, call.arguments)
                state.record_tool_result(call.id, result)
            except Exception as exc:
                state.record_tool_error(call.id, str(exc))
                state.mark_retryable(call.id)
            finally:
                state_store.save(state)
~~~

这个示例强调三点：第一，工具调用前后都要落状态；第二，错误要变成可恢复状态，而不是只写日志；第三，最终答案必须和执行轨迹绑定，方便审计与回放。
