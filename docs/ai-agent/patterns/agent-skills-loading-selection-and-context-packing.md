---
kb_id: ai-agent/patterns/agent-skills-loading-selection-and-context-packing
title: Agent Skills 运行时装载：Manifest、Resource Bundle、Context Packing 与 Skill Selection 如何协同
domain: ai-agent
component: agent-skills
topic: agent-skills-loading-selection-context-packing
difficulty: advanced
status: reviewed
sidebar_position: 53
version_scope: Anthropic docs, Claude blog, DeepLearning.AI course page, and 实践资料 agent-skills repository as verified on 2026-04-26
last_verified_at: '2026-04-26'
source_ids:
  - anthropic-agent-skills-docs
  - anthropic-skills-explained-blog
  - deeplearning-ai-agent-skills-course
  - practice-agent-skills-with-anthropic
claim_ids:
  - practice-p2-claim-0002
  - agent-runtime-claim-0005
tags:
  - ai-agent
  - agent-skills
  - context-engineering
  - runtime
  - loading
---
## Skill 做得好不好，关键不在“写了多少说明”，而在“运行时装了什么、为什么装、装完能否收敛”
很多团队第一次接触 Skill，会把它理解成一段可复用说明词。但一旦系统进入多任务、多领域、多租户场景，真正困难的部分不再是说明词本身，而是运行时的装载策略：哪些资源应该被打包成 skill，什么时候命中，装多少内容进上下文，哪些信息应该只保留索引而不是全文进入 prompt。

## 解决什么问题
Skill 装载层主要解决三类问题：

1. 任务进入时，如何让模型快速拿到与当前目标强相关的领域说明，而不是把所有项目知识都塞进上下文。
2. 同一类任务在不同环境、租户或风险等级下，如何装载不同资源包，而不是让模型自己猜适用边界。
3. 当 skill 数量增长后，如何保持选择成本和上下文长度可控，而不是让“更多技能”反而降低整体稳定性。

## 核心对象
| 对象 | 作用 | 关键检查点 |
| --- | --- | --- |
| Skill Manifest | 描述 skill 的名称、触发条件、资源、脚本和工具边界 | 是否能解释何时命中、何时不命中 |
| Resource Bundle | 被 skill 装载的运行手册、模板、脚本、示例 | 是否过大、是否过期、是否混入敏感信息 |
| Selector | 根据任务目标和上下文决定命中哪个 skill | 误召回率、漏召回率、选择延迟 |
| Context Pack | 真正进入模型输入的高密度信息片段 | token 占用、压缩比、相关性 |
| Fallback Policy | skill 不命中、命中冲突或版本失效时的降级策略 | 默认能力、人工兜底、空结果处理 |

## 执行链路
Skill 装载不是“搜到就全塞”，而是一条正式的准备链路：

1. 请求进入后，Selector 先基于目标、任务类型和环境元数据筛出候选 skill。
2. Skill Manifest 再检查触发条件、禁用条件和风险策略，决定哪个 skill 可以正式装载。
3. Resource Bundle 不会原样全部进入模型，而是先经过裁剪、摘要或索引选择，形成高密度 Context Pack。
4. Context Pack 与本轮任务状态、可用工具和停止条件一起交给模型。
5. 运行结束后，系统记录这次命中是否有效，反过来优化 selector 和 resource bundle。

```mermaid
flowchart LR
  A[任务元数据] --> B[Selector 候选筛选]
  B --> C[Manifest 规则检查]
  C --> D[Resource Bundle 裁剪]
  D --> E[Context Pack]
  E --> F[模型决策与执行]
  F --> G[命中效果回写]
```

## 一致性与容错
Skill 装载层虽然不直接产生副作用，但它会显著影响后续所有动作，因此也需要容错：

1. Selector 命中错误会把整个任务带向错误上下文，所以要记录候选集和最终命中原因。
2. Resource Bundle 如果包含过时 SOP，会稳定地产生错误动作，比偶发模型幻觉更难发现。
3. Manifest 改版后如果没有兼容旧选择逻辑，可能导致线上大量任务突然不再命中原本有效的 skill。
4. 多个 skill 同时满足条件时，必须有冲突解决规则，不能把选择权完全留给模型自由推断。

## 性能模型
Skill 装载层的性能不是看“仓库里有多少 skill”，而是看装载决策和上下文打包是否经济：

1. 候选 skill 数量越多，Selector 排序和比对成本越高。
2. Resource Bundle 越大，Context Pack 压缩成本和模型阅读成本越高。
3. 如果每次都做全文装载，哪怕最终只用到一个字段，也会把 token 成本放大。
4. 命中率不稳定会带来更多兜底推理，导致平均步骤数和平均延迟上升。

```json
{
  "skill_name": "release-diagnosis",
  "match_rules": {
    "contains_any": ["发布失败", "变更回滚", "事故复盘"],
    "environment": ["staging", "prod"]
  },
  "resource_budget": {
    "max_docs": 3,
    "max_chars": 5000
  },
  "fallback": "general-ops-skill"
}
```

## 生产排障
如果一个 Agent 看起来“懂这个领域，但每次都抓不到关键点”，往往优先查 Skill 装载层：

1. 查 selector 命中日志，确认到底有没有命中预期 skill。
2. 查 resource bundle 的版本和内容，确认是否把过时 runbook 装了进去。
3. 查 context pack，确认真正给模型看的内容是不是被过度压缩，或者反而引入大量噪声。
4. 查 fallback 是否频繁触发，若频繁触发，说明 skill 设计过窄或选择规则过硬。

## 样例
下面的 manifest 示例突出的是“何时命中”和“装多少”的合同：

```yaml
skill_manifest:
  name: db-migration-review
  trigger_when:
    - task_contains: "迁移"
    - task_contains: "DDL"
  deny_when:
    - tenant: "sandbox"
    - task_contains: "直接执行"
  resources:
    - runbook/db-migration-checklist.md
    - templates/risk-assessment.md
  resource_budget:
    max_docs: 2
    max_chars: 4000
```

下面的伪代码展示装载层如何把 skill 变成真正可消费的上下文包：

```python
def build_context_pack(task, candidate_skills, store):
    skill = select_best_skill(task, candidate_skills)
    docs = store.load_resources(skill.resources)
    clipped_docs = clip_by_budget(docs, max_chars=4000)
    return {
        "skill": skill.name,
        "instructions": skill.instructions,
        "resource_snippets": summarize_docs(clipped_docs),
        "tool_allowlist": skill.allowed_tools,
    }
```

## 相邻技术边界
Skill Selection 不等于检索增强问答。RAG 更关注从外部知识库找证据，Skill 装载更关注为某类任务装入稳定的能力包和执行约束。两者可以叠加，但不能互相替代。一个系统可以先选中某个 skill，再让该 skill 决定后续是否触发检索、是否允许某些工具、是否应走人工审批链。

## 本页结论
Skill 真正的工程价值，不在于“写了一段说明”，而在于它把任务能力做成了可命中、可裁剪、可装载、可回溯的运行时资产。Manifest 决定何时命中，Resource Bundle 决定装什么，Context Pack 决定模型实际看到什么，Selector 和 Fallback 决定系统是否能稳定收敛。
