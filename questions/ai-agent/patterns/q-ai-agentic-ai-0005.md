---
id: q-ai-agentic-ai-0005
title: 如何验证一个 Agentic 系统真的更可靠，而不是只是更能演示
domain: ai-agent
component: agentic-ai
topic: agentic-evals-reliability-human-override
question_type: scenario
difficulty: advanced
status: reviewed
version_scope: "DeepLearning.AI Agentic AI course page and 实践资料 agentic-ai repository as verified on 2026-04-26"
last_verified_at: "2026-04-26"
source_ids:
  - deeplearning-ai-agentic-ai-course
  - practice-agentic-ai
claim_ids:
  - practice-p2-claim-0001
  - agent-runtime-claim-0006
  - agent-runtime-claim-0007
related_docs:
  - ai-agent/patterns/agentic-evals-reliability-and-human-override
estimated_minutes: 12
---

# 题目

如何验证一个 Agentic 系统真的更可靠，而不是只是更能演示？

# 一句话结论

必须同时评估结果质量和过程质量，用固定任务集、过程指标、人工接管率和降级证据去证明它在真实任务里稳定收敛。

# 核心机制

1. Eval Task Set 要覆盖成功、失败、拒答和边界场景
2. Outcome Metrics 看最终结果是否达标
3. Process Metrics 看步骤、错误工具率、重试率和无进展情况
4. HITL 和 Fallback 数据反映系统是否真正可运营

# 标准答案

验证 Agentic 系统是否真的更可靠，不能只看几次成功 Demo，也不能只看最终文本。首先要建立固定任务集，覆盖正常任务、失败任务、权限边界、证据冲突、高风险动作和应转人工的场景。其次要同时看 outcome metrics 和 process metrics：前者包括任务成功率、最终正确率、人工接管率，后者包括平均步骤数、错误工具请求率、重试率、预算耗尽率和无进展停止率。最后还要观察降级和人工审批是否被正确触发，因为一个“答得不错但总要人工收尾”的系统，不能算可靠自主执行系统。只有过程和结果都稳定，才能证明它不只是更会演示，而是更适合真实运行。

# 必答点

1. 说明必须有固定任务级评估集
2. 说明结果指标和过程指标要同时看
3. 说明要覆盖权限、高风险和拒答边界
4. 说明 HITL 和 Fallback 数据的重要性
5. 说明不能只看最终文本或几次成功 Demo

# 常见误答

1. 只看最终答案对不对
2. 不统计工具错误和预算耗尽
3. 不覆盖高风险和拒答场景
4. 不看人工接管和降级行为
