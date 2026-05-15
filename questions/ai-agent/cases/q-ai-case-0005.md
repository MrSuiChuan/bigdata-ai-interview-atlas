---
id: q-ai-case-0005
title: AI 编程 Agent 工作流为什么必须把权限、diff 和测试作为核心
domain: ai-agent
component: ai-coding-workflow
topic: roo-code-deepseek-ai-coding-workflow
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "实践资料 smart-dev repository and Roo Code docs as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - practice-smart-dev
  - roo-code-docs
  - mcp-introduction
  - mcp-server-concepts
claim_ids:
  - practice-p1-claim-0012
related_docs:
  - ai-agent/cases/ai-coding-workflow-roo-code-deepseek-case
estimated_minutes: 12
---

# 题目

AI 编程 Agent 工作流为什么必须把权限、diff 和测试作为核心？

# 一句话结论

因为 IDE Agent 能读写代码、运行命令、接触环境变量和调用工具，真正的质量来自可控权限、可审查 diff 和可复现测试，而不是代码生成速度。

# 标准答案

AI 编程 Agent 工作流必须把权限、diff 和测试作为核心。Agent 需要读取需求和代码上下文，生成计划，修改文件，运行测试或构建，根据错误迭代修复，并输出变更说明。但它也可能读取工作区、运行终端命令、接触环境变量、调用 MCP 工具和修改大量文件。因此系统要限制可读写目录、命令权限、自动审批范围、敏感变量暴露和外部工具访问。MCP 只负责标准化工具暴露，不自动保证安全。最终评价应看测试是否通过、diff 是否可读、是否改了无关文件、是否泄露密钥、是否能解释变更原因，以及人工审查修改量。

# 必答点

1. 说明 IDE Agent 是高权限工作区 Agent
2. 说明计划、diff、测试、构建构成闭环
3. 说明自动审批必须有边界
4. 说明 MCP 工具仍要权限和审计
5. 说明工具生命周期要纳入选型

# 常见误答

1. 只看生成速度
2. 不运行测试
3. 自动允许所有命令
4. 不检查无关文件修改
5. 忽略 API Key 和环境变量泄露

