# Datawhale 导入矩阵

## 字段说明

1. `优先级`：`P0` 立即导入，`P1` 第二批导入，`P2` 补充导入，`P3` 基础模块导入，`BD` 大数据线导入。
2. `目标落点`：导入后的主要目录，不代表只能进入一个页面。
3. `导入方式`：`增补现有`、`新建主文`、`新建案例`、`新建模块`、`仅提炼题目`、`暂缓`。
4. `官方复核`：涉及平台行为、协议语义、API 行为、模型能力时必须复核官方文档。

## P0 主干导入

| 仓库 | 定位 | 目标落点 | 导入方式 | 官方复核 |
| --- | --- | --- | --- | --- |
| `hello-agents` | 从零构建智能体教程 | `ai-agent/foundations`、`ai-agent/patterns` | 增补现有 | 是 |
| `all-in-rag` | RAG 技术全栈指南 | `ai-agent/patterns`、`ai-agent/cases` | 增补现有 + 新建案例 | 是 |
| `self-dify` | Dify 本地部署、知识库、工作流、MCP、复杂任务编排 | `ai-agent/platforms/dify` | 新建主文 | 是 |
| `handy-ollama` | Ollama 本地大模型部署 | `ai-agent/platforms/ollama` | 新建主文 | 是 |
| `coze-ai-assistant` | Coze 私人提效助理与工作流案例 | `ai-agent/platforms/coze`、`ai-agent/cases` | 新建主文 + 新建案例 | 是 |
| `llm-protocols-guide` | LLM 协议工程 | `ai-agent/protocols` | 增补现有 | 是 |
| `mcp-lite-dev` | MCP 极简开发代码 | `ai-agent/protocols`、`examples/python/ai-agent` | 增补现有 + 样例代码 | 是 |
| `easy-vecdb` | 向量数据库原理与实践 | `ai-agent/patterns`、`llm-foundations` | 增补现有 | 是 |
| `what-is-vs` | 向量检索与 RAG 实践 | `ai-agent/patterns` | 增补现有 | 是 |
| `self-harness` | 复杂长时间运行 Agent 的底层运行架构 | `ai-agent/patterns`、`ai-agent/platforms/runtime` | 增补现有 + 新建主文 | 是 |
| `handy-multi-agent` | 基于 CAMEL 的多智能体教程 | `ai-agent/frameworks`、`ai-agent/cases` | 新建主文 + 新建案例 | 是 |
| `wow-agent` | 跨平台 Agent 框架与教程 | `ai-agent/frameworks`、`ai-agent/patterns` | 新建主文 | 是 |

## P1 平台与案例导入

| 仓库 | 定位 | 目标落点 | 导入方式 | 官方复核 |
| --- | --- | --- | --- | --- |
| `handy-n8n` | n8n 自动化工作流教程 | `ai-agent/platforms/n8n` | 新建主文 | 是 |
| `anycli` | 面向 Agent 的 CLI 注册与索引平台 | `ai-agent/platforms/cli-agent`、`ai-agent/protocols` | 新建主文 | 是 |
| `hello-generic-agent` | Generic Agent 使用指南 | `ai-agent/frameworks`、`ai-agent/platforms` | 新建主文 | 是 |
| `easy-pocket` | PocketFlow 交互式 Agent 教程 | `ai-agent/frameworks`、`ai-agent/patterns` | 新建主文 | 是 |
| `resonant-soul` | AI 心理健康 Agent 案例 | `ai-agent/cases` | 新建案例 | 是 |
| `video-devour` | ASR + VLM 视频笔记 Agent | `ai-agent/cases` | 新建案例 | 是 |
| `vibe-blog` | 多智能体长文技术博客生成助手 | `ai-agent/cases` | 新建案例 | 是 |
| `smart-dev` | 基于 Roo Cline + DeepSeek 的 AI 开发教程 | `ai-agent/cases`、`ai-agent/platforms` | 新建案例 | 是 |
| `openclaw-tutorial` | 跨设备 AI 助手教程 | `ai-agent/platforms/openclaw` | 新建主文 | 是 |
| `hand-on-openclaw` | OpenClaw 实践教程 | `ai-agent/platforms/openclaw`、`ai-agent/cases` | 增补主文 + 新建案例 | 是 |

## P2 补充导入

| 仓库 | 定位 | 目标落点 | 导入方式 | 官方复核 |
| --- | --- | --- | --- | --- |
| `agentic-ai` | Agentic AI 课程中文整理 | `ai-agent/foundations`、`ai-agent/patterns` | 增补现有 | 是 |
| `agent-skills-with-anthropic` | Agent skills 课程中文整理 | `ai-agent/patterns` | 增补现有 | 是 |
| `agent-tutorial` | Agent 教程 | `ai-agent/foundations` | 增补现有 | 视内容而定 |
| `hugging-multi-agent` | MetaGPT 多智能体入门与开发 | `ai-agent/frameworks`、`ai-agent/cases` | 新建主文 + 新建案例 | 是 |
| `easy-langent` | Agent 学习教程 | `ai-agent/frameworks` | 新建主文 | 是 |
| `wow-rag` | 跨平台 RAG 框架和教程 | `ai-agent/patterns`、`ai-agent/cases` | 增补现有 + 新建案例 | 是 |
| `llm-universe` | 大模型应用开发教程 | `ai-agent/foundations`、`ai-agent/cases` | 增补现有 | 是 |
| `unlock-deepseek` | DeepSeek 工作解读、扩展和复现 | `ai-agent/cases`、`llm-foundations` | 新建案例 | 是 |

## P3 LLM Foundations 导入

| 仓库 | 定位 | 目标落点 | 导入方式 | 官方复核 |
| --- | --- | --- | --- | --- |
| `llm-cookbook` | 面向开发者的 LLM 入门教程 | `llm-foundations` | 新建模块 | 是 |
| `hands-on-llm` | 动手学 LLM | `llm-foundations` | 新建模块 | 视内容而定 |
| `base-llm` | 从 NLP 到 LLM 的算法全栈教程 | `llm-foundations` | 新建模块 | 视内容而定 |
| `so-large-lm` | 大模型基础知识 | `llm-foundations` | 新建模块 | 视内容而定 |
| `happy-llm` | 从零开始构建大模型 | `llm-foundations` | 新建模块 | 视内容而定 |
| `self-llm` | 开源大模型微调与部署 | `llm-foundations`、`ai-agent/platforms/local-llm` | 新建模块 | 是 |
| `code-your-own-llm` | 端到端定义 LLM 的参考指南 | `llm-foundations` | 新建模块 | 视内容而定 |
| `diy-llm` | LLM 全栈构建课程 | `llm-foundations` | 新建模块 | 视内容而定 |
| `tiny-universe` | 大模型白盒子构建指南 | `llm-foundations` | 新建模块 | 视内容而定 |
| `reasoning-kingdom` | AI 推理机制思想实验 | `llm-foundations/reasoning` | 新建模块 | 是 |
| `unlock-hf` | HuggingFace 生态用法 | `llm-foundations`、`ai-agent/platforms/huggingface` | 新建模块 | 是 |
| `open-ai-general-course` | AI 通识课 | `llm-foundations/overview` | 增补现有 | 视内容而定 |
| `llm-preview` | 理工科大模型入门实训 | `llm-foundations/overview` | 增补现有 | 视内容而定 |
| `post-training-of-llms` | LLM 后训练课程整理 | `llm-foundations/post-training` | 新建模块 | 是 |
| `fun-ir` | 信息检索导论 | `llm-foundations/rag-and-ir-foundations` | 新建模块 | 视内容而定 |
| `smart-prompt` | 提示词构建教程 | `llm-foundations/prompting`、`ai-agent/patterns` | 增补现有 | 是 |

## 大数据线导入

| 仓库 | 定位 | 目标落点 | 导入方式 | 官方复核 |
| --- | --- | --- | --- | --- |
| `juicy-bigdata` | 大数据处理导论教程 | `bigdata` | 增补现有 + 新建导论 | 是 |
| `wonderful-sql` | SQL 教程 | `bigdata/warehouse`、`questions/bigdata` | 增补现有 | 是 |
| `docker-notes` | Docker 基础教程 | `bigdata/system-design`、`ai-agent/platforms` | 仅作为部署补充 | 是 |
| `scientific-computing` | Python 科学计算教程 | `llm-foundations`、`bigdata` | 暂缓 | 否 |

## 暂不导入的典型类型

| 类型 | 示例 | 暂不导入原因 |
| --- | --- | --- |
| 传统机器学习教材 | `pumpkin-book`、`ML-FTTI` | 与当前 Agent 和大数据主线距离较远 |
| CV 教程 | `dive-into-cv-pytorch`、`magic-cv`、`yolo-master` | 当前系统没有 CV 面试主线 |
| RL 教程 | `easy-rl`、`joyrl`、`fun-marl` | 当前系统没有 RL 面试主线 |
| 办公自动化 | `office-automation`、`free-excel` | 与目标系统不匹配 |
| 组织治理或模板 | `DOPMC`、`repo-template`、`whale-governance` | 不是知识库内容 |

## 批次验收记录

| 批次 | 范围 | 状态 | 校验 |
| --- | --- | --- | --- |
| 阶段 0 | 建立导入计划和矩阵 | 已完成 | `validate` 通过，`build` 通过 |
| 阶段 1 | P0 主干导入 | 已完成首版 | 12 个 P0 仓库均已落到主文、案例或题库，待后续逐篇深挖 |
| 阶段 2 | P1 平台与案例导入 | 已完成首版 | 平台/框架 6 个落点、案例 4 个落点已完成，待后续逐篇深挖 |
| 阶段 3 | P2 补充导入 | 已完成首版 | 8 个 P2 仓库合并为 5 个高密度知识单元 |
| 阶段 4 | LLM Foundations 导入 | 已完成首版 | 已完成基础框架、Datawhale LLM 导入和推理/评估/安全/多模态扩展：19 篇主文、19 道题、来源与 claim 校验均已接入 |
| 阶段 5 | 大数据补充导入 | 未开始 | 待验证 |

## 阶段 1 执行记录

| 仓库 | 输出 | 状态 |
| --- | --- | --- |
| `self-dify` | `docs/ai-agent/platforms/dify-workflow-knowledge-and-agent-apps.md`、`questions/ai-agent/platforms/q-ai-platform-0001.md` | 已完成首版 |
| `handy-ollama` | `docs/ai-agent/platforms/ollama-local-model-runtime-and-openai-compatible-api.md`、`questions/ai-agent/platforms/q-ai-platform-0002.md` | 已完成首版 |
| `coze-ai-assistant` | `docs/ai-agent/platforms/coze-visual-agent-workflow-and-productivity-assistant.md`、`questions/ai-agent/platforms/q-ai-platform-0003.md` | 已完成首版 |
| `all-in-rag` | `docs/ai-agent/cases/agentic-rag-full-stack-case.md`、`questions/ai-agent/cases/q-ai-case-0001.md` | 已完成首版 |
| `what-is-vs` | `docs/ai-agent/cases/agentic-rag-full-stack-case.md`、`questions/ai-agent/cases/q-ai-case-0001.md` | 已完成首版 |
| `easy-vecdb` | `docs/ai-agent/cases/agentic-rag-full-stack-case.md`、`questions/ai-agent/cases/q-ai-case-0001.md` | 已完成首版 |
| `llm-protocols-guide` | `docs/ai-agent/protocols/mcp-lite-development-and-integration-boundaries.md`、`questions/ai-agent/protocols/q-ai-mcp-0006.md` | 已完成首版 |
| `mcp-lite-dev` | `docs/ai-agent/protocols/mcp-lite-development-and-integration-boundaries.md`、`questions/ai-agent/protocols/q-ai-mcp-0006.md` | 已完成首版 |
| `hello-agents` | `docs/ai-agent/foundations/from-scratch-agent-runtime-loop-and-learning-path.md`、`questions/ai-agent/foundations/q-ai-agent-0007.md` | 已完成首版 |
| `self-harness` | `docs/ai-agent/patterns/agent-harness-runtime-recovery-and-production-governance.md`、`questions/ai-agent/patterns/q-ai-pattern-0057.md` | 已完成首版 |
| `handy-multi-agent` | `docs/ai-agent/frameworks/camel-ai-and-agent-society.md`、`questions/ai-agent/frameworks/q-ai-camel-0001.md` | 已完成首版 |
| `wow-agent` | `docs/ai-agent/frameworks/wow-agent-cross-platform-agent-framework.md`、`questions/ai-agent/frameworks/q-ai-wow-agent-0001.md` | 已完成首版 |

## 阶段 2 执行记录

| 仓库 | 输出 | 状态 |
| --- | --- | --- |
| `handy-n8n` | `docs/ai-agent/platforms/n8n-ai-workflow-agent-orchestration.md`、`questions/ai-agent/platforms/q-ai-platform-0004.md` | 已完成首版 |
| `anycli` | `docs/ai-agent/platforms/anycli-cli-registry-for-agent-tool-use.md`、`questions/ai-agent/platforms/q-ai-platform-0005.md` | 已完成首版 |
| `hello-generic-agent` | `docs/ai-agent/frameworks/generic-agent-context-density-memory-and-self-evolution.md`、`questions/ai-agent/frameworks/q-ai-generic-agent-0001.md` | 已完成首版 |
| `easy-pocket` | `docs/ai-agent/frameworks/pocketflow-node-flow-and-minimal-orchestration.md`、`questions/ai-agent/frameworks/q-ai-pocketflow-0001.md` | 已完成首版 |
| `openclaw-tutorial` | `docs/ai-agent/platforms/openclaw-personal-agent-gateway-and-security-boundaries.md`、`questions/ai-agent/platforms/q-ai-platform-0006.md` | 已完成首版 |
| `hand-on-openclaw` | `docs/ai-agent/platforms/openclaw-personal-agent-gateway-and-security-boundaries.md`、`questions/ai-agent/platforms/q-ai-platform-0006.md` | 已完成首版 |
| `resonant-soul` | `docs/ai-agent/cases/mental-health-agent-safety-escalation-case.md`、`questions/ai-agent/cases/q-ai-case-0002.md` | 已完成首版 |
| `video-devour` | `docs/ai-agent/cases/video-note-agent-asr-vlm-pipeline-case.md`、`questions/ai-agent/cases/q-ai-case-0003.md` | 已完成首版 |
| `vibe-blog` | `docs/ai-agent/cases/multi-agent-technical-writing-pipeline-case.md`、`questions/ai-agent/cases/q-ai-case-0004.md` | 已完成首版 |
| `smart-dev` | `docs/ai-agent/cases/ai-coding-workflow-roo-code-deepseek-case.md`、`questions/ai-agent/cases/q-ai-case-0005.md` | 已完成首版 |

## 阶段 3 执行记录

| 仓库 | 输出 | 状态 |
| --- | --- | --- |
| `agentic-ai` | `docs/ai-agent/patterns/agentic-workflows-reflection-tool-use-and-autonomy.md`、`questions/ai-agent/patterns/q-ai-pattern-0058.md` | 已完成首版 |
| `agent-tutorial` | `docs/ai-agent/patterns/agentic-workflows-reflection-tool-use-and-autonomy.md`、`questions/ai-agent/patterns/q-ai-pattern-0058.md` | 已完成首版 |
| `agent-skills-with-anthropic` | `docs/ai-agent/patterns/agent-skills-tools-mcp-and-subagents.md`、`questions/ai-agent/patterns/q-ai-pattern-0059.md` | 已完成首版 |
| `hugging-multi-agent` | `docs/ai-agent/frameworks/metagpt-lagent-code-level-multi-agent-development.md`、`questions/ai-agent/frameworks/q-ai-metagpt-lagent-0001.md` | 已完成首版 |
| `easy-langent` | `docs/ai-agent/frameworks/metagpt-lagent-code-level-multi-agent-development.md`、`questions/ai-agent/frameworks/q-ai-metagpt-lagent-0001.md` | 已完成首版 |
| `wow-rag` | `docs/ai-agent/cases/rag-application-learning-path-wow-rag-and-llm-universe.md`、`questions/ai-agent/cases/q-ai-case-0006.md` | 已完成首版 |
| `llm-universe` | `docs/ai-agent/cases/rag-application-learning-path-wow-rag-and-llm-universe.md`、`questions/ai-agent/cases/q-ai-case-0006.md` | 已完成首版 |
| `unlock-deepseek` | `docs/ai-agent/cases/deepseek-paper-reading-and-reproduction-case.md`、`questions/ai-agent/cases/q-ai-case-0007.md` | 已完成首版 |

## 阶段 4 执行记录

| 仓库 | 输出 | 状态 |
| --- | --- | --- |
| `llm-cookbook` | `docs/llm-foundations/llm-application-development-path-api-prompt-rag-eval.md`、`questions/llm-foundations/q-llm-foundation-0005.md` | 已完成首版 |
| `llm-universe` | `docs/llm-foundations/llm-application-development-path-api-prompt-rag-eval.md`、`docs/llm-foundations/rag-embedding-knowledge-base-and-retrieval-foundations.md`、`questions/llm-foundations/q-llm-foundation-0005.md`、`questions/llm-foundations/q-llm-foundation-0006.md` | 已完成首版 |
| `happy-llm` | `docs/llm-foundations/from-nlp-to-llm-training-practice-and-small-model.md`、`questions/llm-foundations/q-llm-foundation-0007.md` | 已完成首版 |
| `base-llm` | `docs/llm-foundations/llm-full-stack-theory-data-training-inference-eval.md`、`questions/llm-foundations/q-llm-foundation-0008.md` | 已完成首版 |
| `so-large-lm` | `docs/llm-foundations/llm-full-stack-theory-data-training-inference-eval.md`、`questions/llm-foundations/q-llm-foundation-0008.md` | 已完成首版 |
| `code-your-own-llm` | `docs/llm-foundations/llm-full-stack-theory-data-training-inference-eval.md`、`questions/llm-foundations/q-llm-foundation-0008.md` | 已完成首版 |
| `diy-llm` | `docs/llm-foundations/llm-full-stack-theory-data-training-inference-eval.md`、`questions/llm-foundations/q-llm-foundation-0008.md` | 已完成首版 |
| `tiny-universe` | `docs/llm-foundations/llm-full-stack-theory-data-training-inference-eval.md`、`questions/llm-foundations/q-llm-foundation-0008.md` | 已完成首版 |
| `self-llm` | `docs/llm-foundations/open-source-llm-deployment-finetuning-and-local-runtime.md`、`questions/llm-foundations/q-llm-foundation-0009.md` | 已完成首版 |
| `smart-prompt` | `docs/llm-foundations/prompt-engineering-semantics-few-shot-cot-meta-prompt.md`、`questions/llm-foundations/q-llm-foundation-0010.md` | 已完成首版 |
| `post-training-of-llms` | `docs/llm-foundations/post-training-online-rl-dpo-sft-and-regression-risk.md`、`questions/llm-foundations/q-llm-foundation-0015.md` | 已完成首版 |
| `fun-ir` | `docs/llm-foundations/information-retrieval-bm25-dense-hybrid-and-rag-eval.md`、`questions/llm-foundations/q-llm-foundation-0016.md` | 已完成首版；仓库 README 仍偏模板，事实内容以 IR 官方/论文来源为准 |
| `unlock-hf` | `docs/llm-foundations/huggingface-ecosystem-transformers-datasets-peft-evaluate.md`、`questions/llm-foundations/q-llm-foundation-0017.md` | 已完成首版 |
| `reasoning-kingdom` | `docs/llm-foundations/llm-reasoning-cot-react-search-and-verification-boundaries.md`、`questions/llm-foundations/q-llm-foundation-0018.md` | 已完成首版 |
| `open-ai-general-course` | `docs/llm-foundations/llm-practice-bootcamp-api-local-vllm-lora-learning-path.md`、`questions/llm-foundations/q-llm-foundation-0019.md` | 已完成首版 |
| `llm-preview` | `docs/llm-foundations/llm-practice-bootcamp-api-local-vllm-lora-learning-path.md`、`questions/llm-foundations/q-llm-foundation-0019.md` | 已完成首版 |
| `hands-on-llm` | 无独立主文；已在来源与 claim 中登记 | README 快照仅包含标题，不用于实质知识点 |
