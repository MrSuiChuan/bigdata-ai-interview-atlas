---
id: q-ai-case-0031
title: 当 AI 编程 Agent 改动范围失控时，排障为什么要先看计划和 writable scope，而不是先重写代码
domain: ai-agent
component: ai-coding-workflow
topic: context-loading-plan-diff-scope-control
question_type: troubleshooting
difficulty: advanced
status: reviewed
version_scope: "Datawhale smart-dev repository, Roo Code docs, and MCP docs as verified on 2026-05-14"
last_verified_at: "2026-05-14"
source_ids:
  - practice-smart-dev
  - roo-code-docs
  - openai-agents-sdk-tracing
claim_ids:
  - practice-p1-claim-0012
related_docs:
  - ai-agent/cases/ai-coding-workflow-context-loading-plan-diff-and-scope-control
  - ai-agent/cases/ai-coding-workflow-test-loop-permission-approval-and-recovery
estimated_minutes: 10
---

# 题目

当 AI 编程 Agent 改动范围失控时，排障为什么要先看计划和 writable scope，而不是先重写代码？

# 一句话结论

因为范围失控首先是控制面故障，不是实现层故障。

# 标准答案

如果一个 Agent 本应只改一个文件，却动了多个无关模块，最先要检查的是它为什么获得了这样的执行边界。也就是说，要先查任务请求是否明确、计划中是否定义了 writable scope、patch 生成后是否做过范围校验，而不是直接重写代码。因为即使你把当前 patch 重新生成一次，只要控制面缺陷还在，下一次仍然可能越界。范围失控本质上是系统约束失效，而不是单次实现失误。

# 必答点

1. 说明这是控制面问题
2. 先查 request、plan、writable scope
3. 再查 patch 后的范围校验
4. 重写代码不能根治边界缺陷

# 常见误答

1. 直接让模型再改一版
2. 只看最终 diff，不看生成前约束
3. 不区分控制面和实现层
4. 认为越界是偶发问题
