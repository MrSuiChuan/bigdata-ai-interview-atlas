---
id: q-ai-openclaw-0002
title: OpenClaw 为什么必须把 Workspace、Plugins、Cron 和 Heartbeat 放进同一套治理模型里
domain: ai-agent
component: openclaw
topic: workspace-skills-plugins-active-task-governance
question_type: principle
difficulty: advanced
status: reviewed
version_scope: "OpenClaw official site, GitHub repository, security advisory, and 实践资料 OpenClaw tutorials as verified on 2026-05-12"
last_verified_at: "2026-05-12"
source_ids:
  - openclaw-site
  - openclaw-github
  - openclaw-security-advisory-ghsa-m3mh-3mpg-37hw
  - practice-openclaw-tutorial
  - practice-hand-on-openclaw
claim_ids:
  - practice-p1-claim-0007
  - practice-p1-claim-0008
related_docs:
  - ai-agent/platforms/openclaw-workspace-skills-plugins-and-active-task-governance
estimated_minutes: 10
---

# 题目

OpenClaw 为什么必须把 Workspace、Plugins、Cron 和 Heartbeat 放进同一套治理模型里？

# 一句话结论

因为这四层共同决定了个人 Agent 拿到什么上下文、具备什么动作能力、何时主动执行，以及失败后会不会重复或越权。

# 核心机制

1. Workspace 决定长期上下文边界。
2. Plugins 决定动作能力边界。
3. Cron 和 Heartbeat 决定主动执行边界。
4. Active Task State 决定任务是否可恢复与可审批。

# 标准答案

OpenClaw 不能把 Workspace、Plugins、Cron 和 Heartbeat 分开治理，因为它们会在同一个运行时里相互放大。Workspace 里的上下文会影响模型判断，Plugins 决定模型能做哪些动作，Cron 和 Heartbeat 又能在没有用户触发的情况下主动发起任务。如果没有统一治理，这些能力会导致上下文污染、权限越界和重复执行。成熟答案要说明：长期上下文要分层、插件要有来源和权限声明、主动任务要有去重和终止语义、任务状态要支持审批与回放。

# 必答点

1. 说明四层互相耦合。
2. 说明主动任务和被动消息的差异。
3. 说明插件来源与权限声明。
4. 说明长期上下文分层。
5. 说明去重、终止和审批状态。

# 常见误答

1. 把 Cron 当成普通定时器。
2. 只讲插件功能，不讲权限。
3. 不讲主动任务状态。
4. 不讲 Workspace 污染。
