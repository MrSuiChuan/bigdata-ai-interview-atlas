---
id: q-llm-foundation-0023
title: 为什么具备动作能力的 LLM 系统必须同时做最小权限、沙箱、审批和审计
domain: llm-foundations
component: llm-safety
topic: llm-safety-tool-permission-sandbox-approval-audit
question_type: system-design
difficulty: advanced
status: reviewed
version_scope: "OWASP LLM Top 10, OpenAI safety best practices, Azure document access docs, and Azure query-time ACL docs as verified on 2026-04-25 to 2026-04-27"
last_verified_at: "2026-04-27"
source_ids:
  - owasp-llm-top10-2025
  - openai-safety-best-practices
  - azure-document-level-access
  - azure-query-time-acl-rbac
claim_ids:
  - llm-foundation-claim-0026
  - pattern-claim-0074
  - pattern-claim-0075
related_docs:
  - llm-foundations/llm-safety-prompt-injection-permission-and-red-team
  - llm-foundations/llm-safety-tool-permission-sandbox-approval-and-audit-chain
estimated_minutes: 12
---

# 题目

为什么具备动作能力的 LLM 系统必须同时做最小权限、沙箱、审批和审计？

# 一句话结论

因为这四个控制面分别解决授权、破坏半径、人工兜底和事后复盘四类不同问题，任何一个缺位都可能把模型错误升级成真实业务事故。

# 标准答案

当 LLM 能调用工具、访问知识库、执行代码或对外发消息时，安全问题已经不是“说错一句话”，而是“做错一个动作”。最小权限负责限制模型代表的身份和可访问范围，防止越权读写；沙箱负责限制文件系统、网络和资源，让失控动作不能扩大破坏半径；审批负责在高风险动作执行前插入人工确认，避免删除、外发、转账等操作自动落地；审计负责把输入、决策、审批和执行结果留痕，便于复盘和回归。它们不能互相替代，所以动作型系统必须一起设计。

# 必答点

1. 说明动作能力会放大风险
2. 说明最小权限解决授权边界
3. 说明沙箱解决破坏半径
4. 说明审批解决高风险兜底
5. 说明审计解决复盘和回归

# 常见误答

1. 认为只做审批就够了
2. 认为沙箱能替代权限控制
3. 让模型自己判断是否越权
4. 不记录审计证据

# 追问

1. 为什么 RAG 权限过滤必须在检索阶段做？
2. 所有动作都走审批会有什么问题？
3. 审计日志里至少要记哪些字段？
