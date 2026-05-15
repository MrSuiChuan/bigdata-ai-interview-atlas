---
kb_id: blueprint/question-to-knowledge-audit
title: "题库到知识库映射审计"
domain: blueprint
component: project
topic: question-to-knowledge-audit
difficulty: advanced
status: reviewed
sidebar_position: 14
version_scope: "Workspace question mapping audit generated on 2026-05-15"
last_verified_at: "2026-05-15"
source_ids: []
claim_ids: []
---

# 汇总

1. 题目总数：779
2. 没有关联知识库的题目：0
3. 关联文档不存在的题目：0
4. 可能需要回补知识库的题目样本：80

# 关联文档不存在

无。

# 可能需要回补知识库的题目样本

这些不是硬失败，而是提醒：题目正文中有较多词没有在关联知识库里直接出现，后续人工精修时应检查题库是否超出知识库。

- q-ai-case-0001：如何设计一个 Agentic RAG 全链路知识问答系统，为什么不能只靠一次向量检索
- q-ai-case-0002：设计 AI 心理健康 Agent 时为什么不能只优化共情话术
- q-ai-case-0003：ASR + VLM 视频报告系统为什么不是把转写文本交给大模型总结
- q-ai-case-0004：多 Agent 长文写作系统为什么必须保留证据链和审稿链
- q-ai-case-0005：AI 编程 Agent 工作流为什么必须把权限、diff 和测试作为核心
- q-ai-case-0006：RAG 学习路径为什么不能停在上传文档问答 Demo
- q-ai-case-0007：DeepSeek 论文复现资料进入面试系统时为什么必须区分论文、代码、API 和社区解读
- q-ai-case-0008：DeepSeek 相关内容为什么必须把论文、仓库、API 和社区复现拆成四个证据层
- q-ai-case-0009：DeepSeek 的 benchmark 排名为什么不能直接当成生产选型结论
- q-ai-case-0010：做 DeepSeek 复现时，为什么要先固定目标、后端、评估器和输出证据
- q-ai-case-0011：DeepSeek 复现结果和线上 API 表现不一致时，第一轮应该按什么顺序排障
- q-ai-case-0012：为什么 RAG 的核心对象不能只写成“向量库 + 大模型”
- q-ai-case-0013：为什么从 RAG Demo 走向真实系统时，新鲜度、权限和冲突知识必须单列治理层
- q-ai-case-0014：RAG 出现“能召回但总答错”时，应该怎样按链路排障
- q-ai-case-0015：RAG 与 memory、fine-tuning、搜索引擎的边界应该怎么讲
- q-ai-case-0016：视频笔记 Agent 为什么一定要保留 transcript span、章节锚点和关键帧 grounding，而不是只输出总结
- q-ai-case-0017：视频笔记 Agent 的章节切分为什么不能只靠固定时间窗口或纯文本分段
- q-ai-case-0018：视频笔记 Agent 为什么要单独评估图文一致性和可回放性，而不是只看报告是否通顺
- q-ai-case-0019：视频笔记 Agent 出错时为什么必须把问题拆到 ASR、章节、关键帧和报告层，而不能笼统说“多模态模型不准”
- q-ai-case-0020：心理健康 Agent 为什么要把普通支持、风险分诊和人工升级拆成不同层，而不是交给一个模型自由发挥
- q-ai-case-0021：为什么心理健康 Agent 在高风险态下更需要“安全完成”而不是“继续多聊几轮看看”
- q-ai-case-0022：心理健康 Agent 为什么不能把量表、自评结果或模型输出自由解释成诊断结论
- q-ai-case-0023：心理健康 Agent 为什么必须做日志脱敏、访问审计和删除治理，而不能只关心回复内容
- q-ai-case-0024：多 Agent 技术写作里，为什么“来源分层”和“证据绑定”要先于正文生成
- q-ai-case-0025：多 Agent 写作系统为什么需要“风格合同”和“发布门禁”，而不能只靠最后总编统一
- q-ai-case-0026：多 Agent 写作里，为什么审稿意见必须“回写到链路里”，而不是停留在评论区
- q-ai-case-0027：技术长文发布后如果被质疑“引用不清、图文不一致”，多 Agent 系统应优先从哪条链路排查
- q-ai-case-0028：AI 编程 Agent 为什么必须把“上下文装载”和“可写范围”拆开设计
- q-ai-case-0029：AI 编程 Agent 的计划为什么必须细化到文件、步骤和验证动作，而不能只写“修一下 bug”
- q-ai-case-0030：AI 编程 Agent 为什么要把命令执行、审批和恢复策略放进同一条验证闭环
- q-ai-case-0031：当 AI 编程 Agent 改动范围失控时，排障为什么要先看计划和 writable scope，而不是先重写代码
- q-ai-case-0032：Agentic RAG 为什么必须引入 Query Planner，而不能所有问题都直接检索
- q-ai-case-0033：Agentic RAG 里，为什么“多阶段检索”真正的难点是证据收敛而不是召回更多片段
- q-ai-case-0034：Agentic RAG 的线上治理为什么必须有 Trace、Failure Replay 和回归集，而不能只看用户反馈
- q-ai-case-0035：当 Agentic RAG 回答不完整时，为什么要先拆 Planner、Router、Aggregator，再怀疑生成模型
- q-ai-agent-0001：为什么 AI Agent 不应该被讲成“带工具的聊天机器人”
- q-ai-agent-0002：tool use 为什么不是把函数名和参数塞进 Prompt 就够了
- q-ai-agent-0003：session、checkpoint、memory 在 Agent 系统里为什么不能混着讲
- q-ai-agent-0004：handoff、agent-as-tool、workflow 的边界应该怎么回答
- q-ai-agent-0005：为什么 tracing、guardrails、human-in-the-loop 要作为一套生产控制面来设计
