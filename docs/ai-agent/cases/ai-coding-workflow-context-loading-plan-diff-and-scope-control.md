---
kb_id: ai-agent/cases/ai-coding-workflow-context-loading-plan-diff-and-scope-control
title: AI 编程 Agent 案例：上下文装载、计划生成、Diff 边界与修改范围控制为什么决定系统是否可靠
domain: ai-agent
component: ai-coding-workflow
topic: context-loading-plan-diff-scope-control
difficulty: advanced
status: reviewed
sidebar_position: 6
version_scope: 实践资料 smart-dev repository, Roo Code docs, and MCP docs as verified on 2026-05-14
last_verified_at: '2026-05-14'
source_ids:
  - practice-smart-dev
  - roo-code-docs
  - mcp-introduction
  - mcp-server-concepts
  - openai-agents-sdk-tracing
claim_ids:
  - practice-p1-claim-0012
tags:
  - ai-agent
  - coding-agent
  - context
  - diff
  - scope-control
---
## AI 编程 Agent 的首要问题不是“能不能改对”，而是“它到底看了什么、计划改哪里、为什么只改这些”
进入真实工程场景后，AI 编程 Agent 的失败往往不是单纯代码能力不够，而是上下文装载不完整、计划范围失控、补丁修改越界。很多系统看起来能自动修 bug，实际上一旦需求稍复杂，就会出现扫全仓、误改无关模块、重复修复同一问题、把用户未授权路径也改掉等高风险行为。

因此，AI 编程工作流必须把“上下文装载”“计划约束”“Diff 边界”和“修改范围控制”设计成显式机制，而不是靠模型自己理解任务边界。

## 解决什么问题
这一页主要解决：

1. 需求进入系统后，哪些上下文应被加载，哪些不应直接暴露给模型。
2. 为什么计划必须细化到文件、对象、验证动作，而不能只写一句“修一下 bug”。
3. 为什么最终交付对象应当是可审查的 diff，而不是大段自然语言说明。
4. 当 Agent 改错文件或改太多时，应该从哪个链路层面定位问题。

## 核心对象
| 对象 | 作用 | 风险 |
| --- | --- | --- |
| Task Request | 用户需求或 issue 描述 | 目标含糊会放大修改范围 |
| Context Loader | 负责选择文件、配置、测试和文档上下文 | 读多了贵，读少了会乱改 |
| Plan Unit | 明确每一步要读什么、改什么、验证什么 | 没有计划就无法约束行为 |
| Diff Boundary | 规定允许修改的文件集合和对象集合 | 越界修改难以及时发现 |
| Patch Artifact | 结构化变更产物 | 没有 patch 就难以审查 |

### 为什么上下文装载不能等于“把整个仓库都给模型”
因为代码仓库往往包含无关模块、生成文件、敏感配置和历史垃圾数据。把所有内容都暴露给模型不仅成本高，而且更容易让模型在错误线索里迷路。上下文装载的本质，是对输入信息做权限化和任务化裁剪。

## 执行链路
更可靠的 AI 编程执行链一般是：

1. 读取任务请求并抽取目标模块、限制条件和验收标准。
2. Context Loader 只装载相关源码、测试、配置和文档。
3. 生成 `Plan Unit`，明确先读什么、后改什么、最后怎么验。
4. 将允许修改的文件和对象写入 `Diff Boundary`。
5. Agent 按计划生成 patch，并在提交前做边界检查。
6. 输出 diff 和变更说明，交给验证或人工审查。

```mermaid
flowchart LR
  R[任务请求] --> C[上下文装载]
  C --> P[计划生成]
  P --> B[Diff 边界]
  B --> D[Patch 输出]
  D --> V[验证与审查]
```

### 计划快照样例
```yaml
plan_units:
  - step: read_auth_middleware
    files:
      - src/auth/middleware.ts
      - tests/auth/middleware.test.ts
  - step: patch_role_check
    writable_files:
      - src/auth/middleware.ts
  - step: run_targeted_test
    command: npm test -- middleware
```

这个样例说明，真正可控的计划必须落到文件和验证动作，而不是停留在抽象层。

## 一致性与容错
AI 编程系统里很容易出现两类一致性问题：

1. 计划说只改一个模块，实际 patch 却动了多个无关文件。
2. 上下文装载时读到的是旧测试或旧配置，导致后续 patch 在错误前提上生成。

### 为什么修改范围控制比“模型聪不聪明”更重要
因为即便模型具备足够的代码理解能力，如果系统没有边界机制，它仍可能为了“看起来更完整”去主动扩写配置、顺手修别的 warning 或修改格式文件。对工程系统而言，越界修改本身就是故障，而不是“积极表现”。

## 性能模型
这类系统的成本主要来自四个部分：

1. 上下文装载量决定 token 成本。
2. 计划过粗会导致返工和重复验证。
3. patch 越大，人工审查成本越高。
4. 边界检查越晚做，返工代价越大。

### 为什么“小 patch”通常比“大而全 patch”更适合生产
因为生产协作更看重可审查、可回滚和可归因。小 patch 更容易定位责任边界，也更容易判断问题到底出在理解错误、实现错误还是测试假设错误。

## 生产排障
如果 AI 编程 Agent 改错了文件或改动范围过大，建议按下面顺序排查：

1. 先看任务请求是否明确给出了模块和目标。
2. 再查上下文装载是否把无关模块一并读入。
3. 再看计划里是否缺少 writable scope 约束。
4. 最后检查 patch 生成后是否做过边界校验。

### Diff 审计样例
```json
{
  "request_id": "bugfix-2041",
  "planned_writable_files": ["src/auth/middleware.ts"],
  "actual_modified_files": [
    "src/auth/middleware.ts",
    "src/app.ts",
    "package-lock.json"
  ],
  "status": "scope_violation"
}
```

这个样例反映的是：很多“代码改错了”的根因，其实是系统没有把范围控制做成正式检查。

## 相邻技术边界
这一页讲的是代码变更控制，不是模型编程能力排行榜，也不是 IDE 体验比较。好的模型可以提高 patch 质量，但不能替代 scope control；MCP 可以提供工具和文档接入，但不能天然定义哪些文件允许被改；测试框架可以验收结果，但不能决定改动前输入上下文是否正确。

## 本页结论
AI 编程 Agent 要真正可靠，必须把上下文装载、计划生成、Diff 边界和修改范围控制串成一条正式链路。只有先把“为什么只改这些”讲清楚，系统才配得上自动改代码。
